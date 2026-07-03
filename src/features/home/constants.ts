import {
  LayoutGrid,
  Goal,
  Volleyball,
  Grip,
  Footprints,
  Waves,
  Flower2,
  Trophy,
  type LucideIcon,
} from "lucide-react-native";

export const HOME_DEFAULT_CATEGORIES: {
  id: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "todos", label: "Todos", icon: LayoutGrid },
  { id: "futebol", label: "Futebol", icon: Goal },
  { id: "futevolei", label: "Futevôlei", icon: Volleyball },
  { id: "volei", label: "Vôlei", icon: Volleyball },
  { id: "beach-tennis", label: "Beach", icon: Grip },
  { id: "corrida", label: "Corrida", icon: Footprints },
  { id: "surf", label: "Surf", icon: Waves },
  { id: "yoga", label: "Yoga", icon: Flower2 },
];

const SPORT_ICON_BY_SLUG: Record<string, LucideIcon> = {
  futebol: Goal,
  futevolei: Volleyball,
  volei: Volleyball,
  "beach-tennis": Grip,
  corrida: Footprints,
  surf: Waves,
  yoga: Flower2,
};

export const getSportIconBySlug = (slug: string): LucideIcon =>
  SPORT_ICON_BY_SLUG[slug] ?? Trophy;
