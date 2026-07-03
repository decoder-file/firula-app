import {
  LayoutGrid,
  Goal,
  Volleyball,
  Grip,
  Footprints,
  Waves,
  Flower2,
  type LucideIcon,
} from "lucide-react-native";

export const CATEGORIES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "todos", label: "Todos", icon: LayoutGrid },
  { id: "futebol", label: "Futebol", icon: Goal },
  { id: "futevolei", label: "Futevôlei", icon: Volleyball },
  { id: "beach-tennis", label: "Beach", icon: Grip },
  { id: "corrida", label: "Corrida", icon: Footprints },
  { id: "surf", label: "Surf", icon: Waves },
  { id: "yoga", label: "Yoga", icon: Flower2 },
];
