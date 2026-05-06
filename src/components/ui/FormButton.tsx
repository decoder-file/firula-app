import { Text } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";

type FormButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  className?: string;
  textClassName?: string;
  testID?: string;
};

export const FormButton = ({
  label,
  onPress,
  disabled = false,
  isLoading = false,
  loadingLabel = "Carregando...",
  className,
  textClassName,
  testID,
}: FormButtonProps) => {
  const isDisabled = disabled || isLoading;
  const buttonClasses = [
    "items-center rounded-2xl bg-primary px-4 py-4",
    isDisabled ? "opacity-60" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const labelClasses = [
    "font-bold text-base text-primary-foreground",
    textClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AnimatedPressable className={buttonClasses} disabled={isDisabled} onPress={onPress} testID={testID}>
      <Text className={labelClasses}>{isLoading ? loadingLabel : label}</Text>
    </AnimatedPressable>
  );
};