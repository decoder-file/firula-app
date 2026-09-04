import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

/**
 * Estratégia do prompt de avaliação (mesma usada por apps grandes — Uber,
 * Duolingo — pra maximizar avaliações boas e nunca empurrar gente insatisfeita
 * pra loja):
 *
 * 1. Só pergunta depois de um sinal real de satisfação: uma "tarefa
 *    importante" concluída (hoje: compra de ingresso bem-sucedida — ver
 *    SuccessStep do checkout) OU um tempo mínimo de uso do app (3+ dias desde
 *    a primeira abertura, gate independente da tarefa).
 * 2. Nunca no primeiro uso do dia nem logo após instalar — dá tempo da
 *    pessoa formar opinião de verdade.
 * 3. Pergunta "gate" antes de qualquer coisa: "Está gostando?" — só quem
 *    responde positivamente é levado pra avaliação nativa/loja. Quem responde
 *    negativamente nunca vê a tela de avaliação (evita nota baixa pública) e
 *    a pergunta não volta a aparecer pra essa pessoa.
 * 4. Quem faz a avaliação (positiva) ou nega, nunca mais vê o prompt. Quem só
 *    dispensa ("Agora não") pode ver de novo depois de um cooldown, até um
 *    limite total de vezes.
 */

const STORAGE_KEY = "firula_app_rating_state_v1";

const MIN_DAYS_SINCE_FIRST_LAUNCH = 3;
const MIN_MEANINGFUL_ACTIONS = 1;
const COOLDOWN_DAYS_BETWEEN_PROMPTS = 21;
const MAX_PROMPTS_TOTAL = 3;

interface RatingState {
  firstLaunchAt: number;
  meaningfulActionCount: number;
  promptShownCount: number;
  lastPromptAt: number | null;
  /** true assim que a pessoa avalia (positivo) ou diz que não está gostando (negativo) — nunca mais perguntamos. */
  completed: boolean;
}

function defaultState(): RatingState {
  return {
    firstLaunchAt: Date.now(),
    meaningfulActionCount: 0,
    promptShownCount: 0,
    lastPromptAt: null,
    completed: false,
  };
}

let cached: RatingState | null = null;

async function readState(): Promise<RatingState> {
  if (cached) return cached;

  let result: RatingState;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    result = raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
  } catch {
    result = defaultState();
  }

  cached = result;
  return result;
}

async function writeState(patch: Partial<RatingState>): Promise<RatingState> {
  const current = await readState();
  const next = { ...current, ...patch };
  cached = next;
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  return next;
}

/** Chamar uma vez por cold start do app — só grava a primeira abertura. */
export async function ensureFirstLaunchRecorded(): Promise<void> {
  const state = await readState();
  if (!state.firstLaunchAt) {
    await writeState({ firstLaunchAt: Date.now() });
  }
}

/** Chamar após uma ação que sinaliza satisfação real (ex.: compra de ingresso concluída). */
export async function recordMeaningfulAction(): Promise<void> {
  const state = await readState();
  await writeState({ meaningfulActionCount: state.meaningfulActionCount + 1 });
}

/** Decide se o gate de avaliação deve aparecer agora. Sem efeitos colaterais. */
export async function shouldShowRatingPrompt(): Promise<boolean> {
  const state = await readState();
  if (state.completed) return false;
  if (state.promptShownCount >= MAX_PROMPTS_TOTAL) return false;

  const daysSinceFirstLaunch = (Date.now() - state.firstLaunchAt) / (24 * 60 * 60 * 1000);
  const meetsUsageBar =
    daysSinceFirstLaunch >= MIN_DAYS_SINCE_FIRST_LAUNCH ||
    state.meaningfulActionCount >= MIN_MEANINGFUL_ACTIONS;
  if (!meetsUsageBar) return false;

  if (state.lastPromptAt) {
    const daysSinceLastPrompt = (Date.now() - state.lastPromptAt) / (24 * 60 * 60 * 1000);
    if (daysSinceLastPrompt < COOLDOWN_DAYS_BETWEEN_PROMPTS) return false;
  }

  return true;
}

/** Marca que o gate foi exibido agora (chamado ao abrir o modal). */
export async function recordPromptShown(): Promise<void> {
  const state = await readState();
  await writeState({ promptShownCount: state.promptShownCount + 1, lastPromptAt: Date.now() });
}

/** Resposta positiva ao gate — dispara a avaliação nativa e encerra o fluxo pra sempre. */
export async function recordPositiveAndRequestReview(): Promise<void> {
  await writeState({ completed: true });
  try {
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
      return;
    }
  } catch {
    // segue pro fallback abaixo
  }
  await openStoreListing();
}

/** Resposta negativa ao gate — nunca manda pra loja, só encerra o fluxo. */
export async function recordNegative(): Promise<void> {
  await writeState({ completed: true });
}

/** Abre a ficha da loja diretamente — usado como fallback quando a avaliação nativa não está disponível. */
export async function openStoreListing(): Promise<void> {
  const url = StoreReview.storeUrl();
  if (!url) return;
  await Linking.openURL(url).catch(() => undefined);
}
