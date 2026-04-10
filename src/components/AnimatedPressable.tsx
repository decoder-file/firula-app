import { Pressable, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(Pressable);

export const AnimatedPressable = ({ style, onPressIn, onPressOut, ...props }: PressableProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedView
      {...props}
      style={[style, animatedStyle]}
      onPressIn={(event) => {
        scale.value = withSpring(0.98, { damping: 18, stiffness: 280 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, { damping: 18, stiffness: 280 });
        onPressOut?.(event);
      }}
    />
  );
};