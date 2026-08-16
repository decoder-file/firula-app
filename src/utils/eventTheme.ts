/**
 * Deriva a paleta de destaque de um evento a partir de uma única cor hex escolhida
 * pelo dono da plataforma (`EventSettings.ticketPageAccentColor`, mesma origem usada
 * pelo b2c em `pages/evento-detalhes/utils/eventTheme.ts`). Ao contrário da versão
 * web (que só sobrescreve CSS custom properties e assume texto branco por cima),
 * aqui calculamos cores finais de verdade — e escolhemos `onPrimary` por contraste
 * real (ver regra crítica documentada em `design-system/foundation/colors.ts`),
 * já que a cor do organizador pode ser clara ou escura.
 */

import type { Palette } from "@/design-system/foundation/colors";

const HEX_REGEX = /^#([0-9a-f]{6})$/i;

const DARK_TEXT = "#0A2E1A";
const LIGHT_TEXT = "#FFFFFF";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  h *= 60;

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const S = s / 100;
  const L = l / 100;
  const C = (1 - Math.abs(2 * L - 1)) * S;
  const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = L - C / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = C; g = X; b = 0;
  } else if (h < 120) {
    r = X; g = C; b = 0;
  } else if (h < 180) {
    r = 0; g = C; b = X;
  } else if (h < 240) {
    r = 0; g = X; b = C;
  } else if (h < 300) {
    r = X; g = 0; b = C;
  } else {
    r = C; g = 0; b = X;
  }

  const toHex = (v: number) => clamp(Math.round((v + m) * 255), 0, 255).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function relativeLuminance(hex: string): number {
  const toLinear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const r = toLinear(parseInt(hex.slice(1, 3), 16));
  const g = toLinear(parseInt(hex.slice(3, 5), 16));
  const b = toLinear(parseInt(hex.slice(5, 7), 16));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hexA: string, hexB: string): number {
  const lighter = Math.max(relativeLuminance(hexA), relativeLuminance(hexB));
  const darker = Math.min(relativeLuminance(hexA), relativeLuminance(hexB));

  return (lighter + 0.05) / (darker + 0.05);
}

export type EventAccentColors = Pick<Palette, "primary" | "onPrimary" | "primaryText" | "primarySoft">;

/**
 * Retorna `undefined` quando não há cor customizada (ou o hex é inválido) — quem
 * chama deve nesse caso não sobrescrever nada e manter a paleta padrão do app.
 */
export function getEventAccentColors(hexColor?: string | null): EventAccentColors | undefined {
  if (!hexColor || !HEX_REGEX.test(hexColor)) return undefined;

  const { h, s, l } = hexToHsl(hexColor);
  const primary = hslToHex(h, s, l);

  // onPrimary: texto/ícone sobre um fundo `primary` — escolhe entre um verde bem
  // escuro (mesmo tom usado como onPrimary padrão) e branco, o que der mais contraste.
  const onPrimary =
    contrastRatio(primary, DARK_TEXT) >= contrastRatio(primary, LIGHT_TEXT) ? DARK_TEXT : LIGHT_TEXT;

  // primaryText: mesmo matiz do organizador, mas com lightness fixada numa faixa
  // escura o bastante para manter contraste AA sobre fundos claros (superfície/branco).
  const primaryText = hslToHex(h, Math.max(s, 40), clamp(l, 22, 32));

  // primarySoft: tinta bem clara do mesmo matiz, usada só como fundo (texto por cima
  // sempre usa primaryText, então não precisa de contraste próprio).
  const primarySoft = hslToHex(h, Math.min(s, 45), 95);

  return { primary, onPrimary, primaryText, primarySoft };
}
