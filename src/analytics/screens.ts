/**
 * Nome da tela para o PostHog a partir dos segmentos do expo-router: agrupa por rota
 * ("event/[slug]"), não pelo valor ("event/copa-firula"), e tira os grupos "(tabs)".
 */
export function screenNameFromSegments(segments: readonly string[]): string {
  const visible = segments.filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")));
  const name = visible.filter((segment) => segment !== "index").join("/");
  return name || "home";
}
