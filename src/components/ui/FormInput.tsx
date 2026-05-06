import { forwardRef, type ReactNode } from "react";
import { Pressable, Text, TextInput, type TextInputProps, View } from "react-native";

type FormInputProps = TextInputProps & {
  label: string;
  error?: string;
  rightAdornment?: ReactNode;
  onRightAdornmentPress?: () => void;
  rightAdornmentAccessibilityLabel?: string;
  inputClassName?: string;
  containerClassName?: string;
  inputTestID?: string;
  errorTestID?: string;
  rightAdornmentTestID?: string;
};

export const FormInput = forwardRef<TextInput, FormInputProps>(
  (
    {
      label,
      error,
      rightAdornment,
      onRightAdornmentPress,
      rightAdornmentAccessibilityLabel,
      inputClassName,
      containerClassName,
      inputTestID,
      errorTestID,
      rightAdornmentTestID,
      ...inputProps
    },
    ref,
  ) => {
    const inputClasses = [
      "rounded-2xl border bg-background px-4 py-4 text-sm text-foreground",
      rightAdornment ? "pr-14" : "",
      error ? "border-red-500" : "border-border",
      inputClassName ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <View className={containerClassName}>
        <Text className="mb-2 font-medium text-sm text-foreground">{label}</Text>
        <View className="relative">
          <TextInput
            ref={ref}
            className={inputClasses}
            testID={inputTestID}
            {...inputProps}
          />

          {rightAdornment ? (
            onRightAdornmentPress ? (
              <Pressable
                accessibilityLabel={rightAdornmentAccessibilityLabel}
                accessibilityRole="button"
                className="absolute right-4 top-0 h-full items-center justify-center"
                hitSlop={10}
                onPress={onRightAdornmentPress}
                testID={rightAdornmentTestID}
              >
                {rightAdornment}
              </Pressable>
            ) : (
              <View className="absolute right-4 top-0 h-full items-center justify-center" pointerEvents="none">
                {rightAdornment}
              </View>
            )
          ) : null}
        </View>

        {error ? (
          <Text className="mt-2 text-xs text-destructive" testID={errorTestID}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);

FormInput.displayName = "FormInput";