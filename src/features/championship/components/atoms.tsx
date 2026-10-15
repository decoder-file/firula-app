import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text as RNText, View, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import type { Entry } from "@/services/championship.service";

import { C, F, initials } from "../helpers";

/** Avatar escuro com iniciais, ou foto/escudo quando houver. */
export function Avatar({ entry, name, photoUrl, size = 30, fontSize, bg = C.ink, color = C.white, radius }: { entry?: Entry | null; name?: string; photoUrl?: string | null; size?: number; fontSize?: number; bg?: string; color?: string; radius?: number }) {
  const label = name ?? entry?.name ?? "?";
  const photo = photoUrl ?? entry?.logoUrl ?? entry?.members[0]?.photoUrl ?? null;
  const font = fontSize ?? Math.max(7.5, Math.round(size * 0.33));
  const style: ViewStyle = { width: size, height: size, borderRadius: radius ?? 999, backgroundColor: bg, alignItems: "center", justifyContent: "center", overflow: "hidden" };
  return (
    <View style={style} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {photo ? <Image source={{ uri: photo }} style={{ width: size, height: size }} resizeMode="cover" /> : <RNText style={{ fontFamily: F.extrabold, fontSize: font, color }}>{initials(label)}</RNText>}
    </View>
  );
}

/** Lado indefinido: círculo tracejado. */
export function PlaceholderAvatar({ size = 30 }: { size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: 999, borderWidth: 1.5, borderStyle: "dashed", borderColor: C.dash }} />;
}

/** Ponto verde com pulso (anel que cresce e some, 1.6 s). Sem animação com reduce motion. */
export function PulseDot({ size = 7, color = C.primary, dark = false }: { size?: number; color?: string; dark?: boolean }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    progress.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
  }, [progress, reduced]);
  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 2 }],
    opacity: 0.65 * (1 - progress.value),
  }));
  const dotColor = dark ? C.onPrimary : color;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {!reduced && !dark && <Animated.View style={[{ position: "absolute", width: size, height: size, borderRadius: 999, backgroundColor: color }, ring]} />}
      <View style={{ width: size, height: size, borderRadius: 999, backgroundColor: dotColor }} />
    </View>
  );
}

export function LiveBadge({ small }: { small?: boolean }) {
  return (
    <View style={styles.liveRow}>
      <PulseDot size={small ? 5 : 6} />
      <RNText style={{ fontFamily: F.extrabold, fontSize: small ? 9.5 : 10.5, letterSpacing: 0.4, color: C.primaryText }}>AO VIVO</RNText>
    </View>
  );
}

/** Pílula de filtro / categoria / rodada (Pressable em linha: ponto, check e rótulo). */
export function Pill({ label, active, onPress, live, done, height = 34, fontSize = 13, variant = "dark", icon }: { label: string; active: boolean; onPress: () => void; live?: boolean; done?: boolean; height?: number; fontSize?: number; variant?: "dark" | "soft"; icon?: React.ReactNode }) {
  const activeStyle = variant === "dark" ? { backgroundColor: C.ink, borderColor: C.ink } : { backgroundColor: C.primarySoft, borderColor: C.primarySoft };
  const inactiveStyle = variant === "dark" ? { backgroundColor: C.white, borderColor: C.controlBorder } : { backgroundColor: C.alt, borderColor: C.alt };
  const textColor = active ? (variant === "dark" ? C.white : C.primaryText) : done ? C.text5 : variant === "dark" ? C.text2 : C.text3;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label}${live ? ", jogo ao vivo" : ""}`}
      style={[styles.pill, { height, paddingHorizontal: variant === "dark" ? 14 : 12, borderRadius: variant === "dark" ? 999 : 9 }, active ? activeStyle : inactiveStyle]}
    >
      {live && <PulseDot />}
      {icon}
      <RNText style={{ fontFamily: F.bold, fontSize, color: textColor }}>{label}</RNText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  liveRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  pill: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1 },
});
