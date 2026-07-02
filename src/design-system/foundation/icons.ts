/**
 * Firula Design System — Icon tokens
 * Biblioteca: lucide-react-native (já no app). Stroke fixo 1.75.
 * Ícone nunca é o único portador de significado — sempre com label ou accessibilityLabel.
 */

export const iconSize = {
  sm: 16, // metadados inline
  md: 20, // padrão — botões, lists
  lg: 24, // navegação, TopBar
  xl: 28, // empty states, destaques
} as const;

export type IconSizeToken = keyof typeof iconSize;

export const iconStrokeWidth = 1.75;
