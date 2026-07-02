import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  className?: string;
  width?: number | `${number}%`;
  height?: number;
}

export const Skeleton = ({ className = "", width, height }: SkeletonProps) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.35, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[animatedStyle, width !== undefined ? { width } : undefined, height !== undefined ? { height } : undefined]}
      className={`bg-secondary ${className}`}
    />
  );
};
