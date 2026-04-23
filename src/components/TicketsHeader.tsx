import { Text, View } from "react-native";
import { AnimatedPressable } from "@/components/AnimatedPressable";

interface TicketsHeaderProps {
  filter: "active" | "used" | "all";
  onFilterChange: (filter: "active" | "used" | "all") => void;
}

export function TicketsHeader({ filter, onFilterChange }: TicketsHeaderProps) {
  return (
    <View className="border-b border-border bg-card px-4 py-4">
      <Text className="font-bold text-lg text-foreground">Meus Ingressos</Text>
      <View className="mt-3 flex-row gap-2">
        {([
          { id: "active", label: "Ativos" },
          { id: "used", label: "Usados" },
          { id: "all", label: "Todos" },
        ] as const).map((item) => {
          const active = filter === item.id;

          return (
            <AnimatedPressable
              key={item.id}
              onPress={() => onFilterChange(item.id)}
              className={`rounded-full px-4 py-2 ${active ? "bg-primary" : "bg-secondary"}`}
            >
              <Text className={`font-medium text-xs ${active ? "text-primary-foreground" : "text-secondary-foreground"}`}>{item.label}</Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}
