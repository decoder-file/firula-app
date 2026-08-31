import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";

import { useReducedMotion } from "@/design-system";
import type { Sponsor, Supporter } from "@/features/event-detail/types";

const DEFAULT_BACKGROUND_COLOR = "#141821";
const ANIMATION_DURATION_MS = 16_000;

type SponsorsCarouselProps = {
  sponsors: Array<Sponsor | Supporter>;
  backgroundColor?: string | null;
  accessibilityLabel?: string;
};

export function SponsorsCarousel({
  sponsors,
  backgroundColor,
  accessibilityLabel = "Logos de patrocinadores do evento",
}: SponsorsCarouselProps) {
  const reducedMotion = useReducedMotion();
  const translateX = useRef(new Animated.Value(0)).current;
  const [groupWidth, setGroupWidth] = useState(0);
  const logoCycle = useMemo(() => [...sponsors, ...sponsors, ...sponsors], [sponsors]);

  useEffect(() => {
    translateX.setValue(0);

    if (reducedMotion || groupWidth === 0) return;

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -groupWidth,
        duration: ANIMATION_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();
    return () => animation.stop();
  }, [groupWidth, reducedMotion, translateX]);

  const handleGroupLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setGroupWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
  };

  if (sponsors.length === 0) return null;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="summary"
      style={[styles.container, { backgroundColor: backgroundColor || DEFAULT_BACKGROUND_COLOR }]}
    >
      <Animated.View style={[styles.track, { transform: [{ translateX }] }]}>
        {[0, 1].map((groupIndex) => (
          <View
            key={groupIndex}
            accessible={false}
            importantForAccessibility={groupIndex === 0 ? "auto" : "no-hide-descendants"}
            onLayout={groupIndex === 0 ? handleGroupLayout : undefined}
            style={styles.group}
          >
            {logoCycle.map((sponsor, index) => {
              const isAccessibleLogo = groupIndex === 0 && index < sponsors.length;

              return (
                <View key={`${groupIndex}-${sponsor.id}-${index}`} style={styles.logoContainer}>
                  <Image
                    accessibilityLabel={isAccessibleLogo ? sponsor.name : undefined}
                    accessible={isAccessibleLogo}
                    source={{ uri: sponsor.logoUrl }}
                    resizeMode="contain"
                    style={styles.logo}
                  />
                </View>
              );
            })}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    paddingVertical: 4,
  },
  track: {
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "flex-start",
  },
  group: {
    alignItems: "center",
    flexDirection: "row",
    gap: 24,
    paddingRight: 24,
  },
  logoContainer: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 144,
  },
  logo: {
    height: "100%",
    width: "100%",
  },
});
