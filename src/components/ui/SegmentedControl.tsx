import { Text, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";

type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
  optionTestIDPrefix?: string;
};

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  className,
  optionTestIDPrefix,
}: SegmentedControlProps<T>) => {
  const containerClasses = ["flex-row rounded-2xl bg-secondary p-1", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <View className={containerClasses}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <AnimatedPressable
            key={option.value}
            accessibilityRole="button"
            className={`flex-1 rounded-[18px] px-4 py-3 ${active ? "bg-card" : "bg-transparent"}`}
            onPress={() => onChange(option.value)}
            testID={optionTestIDPrefix ? `${optionTestIDPrefix}-${option.value}` : undefined}
          >
            <Text className={`text-center font-medium text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}>
              {option.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
};