import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const BRAND_GREEN = '#00C853';

const FirulaLogo = ({ size = 90 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 90 90" fill="none">
    <Path
      d="M14 10 L76 10 L64 24 L30 24 L30 38 L62 38 L50 52 L30 52 L30 68 L14 68 Z"
      fill="white"
    />
  </Svg>
);

export default function FirulaSplashScreen() {
  // Logo entrance
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Tagline + dots
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const bottomTranslateY = useRef(new Animated.Value(8)).current;

  // Ripple rings
  const ring1Scale = useRef(new Animated.Value(0.4)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0.4)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring3Scale = useRef(new Animated.Value(0.4)).current;
  const ring3Opacity = useRef(new Animated.Value(0)).current;

  // Loading dots
  const dot1Scale = useRef(new Animated.Value(1)).current;
  const dot2Scale = useRef(new Animated.Value(1)).current;
  const dot3Scale = useRef(new Animated.Value(1)).current;
  const dot1Opacity = useRef(new Animated.Value(0.4)).current;
  const dot2Opacity = useRef(new Animated.Value(0.4)).current;
  const dot3Opacity = useRef(new Animated.Value(0.4)).current;

  // Logo pulse
  const logoPulseScale = useRef(new Animated.Value(1)).current;

  const animateRing = (scale: Animated.Value, opacity: Animated.Value, delay: number) => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(scale, {
            toValue: 1,
            duration: 2400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    scale.setValue(0.4);
    opacity.setValue(0);
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, { toValue: 1, duration: 480, useNativeDriver: true }),
    ]).start();
    loop.start();
  };

  const animateDot = (
    scale: Animated.Value,
    opacity: Animated.Value,
    delay: number
  ) => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.5, duration: 240, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.95, duration: 240, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 480, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4, duration: 480, useNativeDriver: true }),
        ]),
        Animated.delay(480),
      ])
    ).start();
  };

  useEffect(() => {
    // Logo entrance — spring
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo pulse after entrance
    Animated.loop(
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(logoPulseScale, { toValue: 1.06, duration: 1500, useNativeDriver: true }),
        Animated.timing(logoPulseScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Tagline + dots fade in
    Animated.parallel([
      Animated.timing(bottomOpacity, { toValue: 1, duration: 400, delay: 1100, useNativeDriver: true }),
      Animated.timing(bottomTranslateY, { toValue: 0, duration: 400, delay: 1100, useNativeDriver: true }),
    ]).start();

    // Ripple rings
    animateRing(ring1Scale, ring1Opacity, 500);
    animateRing(ring2Scale, ring2Opacity, 800);
    animateRing(ring3Scale, ring3Opacity, 1100);

    // Loading dots bounce
    animateDot(dot1Scale, dot1Opacity, 1200);
    animateDot(dot2Scale, dot2Opacity, 1400);
    animateDot(dot3Scale, dot3Opacity, 1600);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_GREEN} />

      {/* Ripple rings */}
      <Animated.View
        style={[
          styles.ring,
          { width: 130, height: 130, borderRadius: 65 },
          { transform: [{ scale: ring1Scale }], opacity: ring1Opacity },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          { width: 200, height: 200, borderRadius: 100 },
          { transform: [{ scale: ring2Scale }], opacity: ring2Opacity },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          { width: 280, height: 280, borderRadius: 140 },
          { transform: [{ scale: ring3Scale }], opacity: ring3Opacity },
        ]}
      />
 
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoOpacity,
            transform: [
              { scale: Animated.multiply(logoScale, logoPulseScale) },
            ],
          },
        ]}
      >
        <FirulaLogo size={90} />
      </Animated.View>

      {/* Tagline + loading dots */}
      <Animated.View
        style={[
          styles.bottomWrap,
          {
            opacity: bottomOpacity,
            transform: [{ translateY: bottomTranslateY }],
          },
        ]}
      >
        <Text style={styles.tagline}>
          Todo esporte começa com{' '}
          <Text style={styles.taglineBold}>Firula</Text>
        </Text>

        <View style={styles.dotsRow}>
          <Animated.View
            style={[
              styles.dot,
              { transform: [{ scale: dot1Scale }], opacity: dot1Opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { transform: [{ scale: dot2Scale }], opacity: dot2Opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { transform: [{ scale: dot3Scale }], opacity: dot3Opacity },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    backgroundColor: BRAND_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomWrap: {
    position: 'absolute',
    bottom: 72,
    alignItems: 'center',
    gap: 12,
  },
  tagline: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  taglineBold: {
    fontWeight: '700',
    color: '#ffffff',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 7,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
