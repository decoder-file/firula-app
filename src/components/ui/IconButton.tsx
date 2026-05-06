import type { ReactNode } from "react";

import { AnimatedPressable } from "@/components/AnimatedPressable";

type IconButtonProps = {
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  className?: string;
  disabled?: boolean;
  testID?: string;
};

export const IconButton = ({
  icon,
  onPress,
  accessibilityLabel,
  className,
  disabled = false,
  testID,
}: IconButtonProps) => {
  const buttonClasses = [
    "h-11 w-11 items-center justify-center rounded-full bg-card",
    disabled ? "opacity-60" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={buttonClasses}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
    >
      {icon}
    </AnimatedPressable>
  );
};