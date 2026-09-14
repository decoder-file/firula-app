import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, ZoomIn, ZoomOut } from "react-native-reanimated";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { Plus } from "lucide-react-native";

import { Avatar, Text, useTheme } from "@/design-system";
import type { VotingPlayer, VotingPosition } from "@/services/voting.service";
import { firstName } from "@/utils/votingBallot";

export interface PitchSlot {
  position: VotingPosition & { id: string };
  player: VotingPlayer | null;
}

interface PitchProps {
  slots: PitchSlot[];
  activePositionId?: string | null;
  onSlotPress?: (positionId: string) => void;
  readOnly?: boolean;
  /** Avatares/nomes menores — card compartilhável e previews. */
  compact?: boolean;
  /** Proporção largura/altura. Default 2/3 (retrato). */
  aspectRatio?: number;
}

const SLOT_WIDTH = 84;
const SLOT_WIDTH_COMPACT = 64;

/** Gramado com as linhas — origem do gol da equipe embaixo (pitchY = 100). */
function FieldLines() {
  return (
    <Svg viewBox="0 0 100 150" preserveAspectRatio="none" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#157A3C" />
          <Stop offset="1" stopColor="#0E5A2B" />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="150" fill="url(#grass)" />
      {Array.from({ length: 6 }, (_, index) => (
        <Rect key={index} x="0" y={index * 25} width="100" height="12.5" fill="#ffffff" opacity={0.035} />
      ))}
      <Rect x="4" y="4" width="92" height="142" rx="1" fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.6} />
      <Line x1="4" y1="75" x2="96" y2="75" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.6} />
      <Circle cx="50" cy="75" r="12" fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.6} />
      <Rect x="24" y="4" width="52" height="22" fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.6} />
      <Rect x="38" y="4" width="24" height="8" fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.6} />
      <Rect x="24" y="124" width="52" height="22" fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.6} />
      <Rect x="38" y="138" width="24" height="8" fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.6} />
      <Path d="M 38 26 A 12 12 0 0 0 62 26" fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.6} />
      <Path d="M 38 124 A 12 12 0 0 1 62 124" fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.6} />
      <Circle cx="50" cy="75" r="0.9" fill="#ffffff" fillOpacity={0.7} />
    </Svg>
  );
}

export function Pitch({ slots, activePositionId, onSlotPress, readOnly = false, compact = false, aspectRatio = 2 / 3 }: PitchProps) {
  const { colors } = useTheme();
  const interactive = !readOnly && Boolean(onSlotPress);
  const slotWidth = compact ? SLOT_WIDTH_COMPACT : SLOT_WIDTH;
  const avatarSize = compact ? 40 : 56;

  return (
    <View style={[styles.pitch, { aspectRatio }]} accessibilityRole="none">
      <FieldLines />
      {slots.map(({ position, player }) => {
        const isActive = activePositionId === position.id;
        return (
          <View
            key={position.id}
            style={[styles.slotAnchor, { left: `${position.pitchX}%`, top: `${position.pitchY}%`, width: slotWidth, marginLeft: -slotWidth / 2, marginTop: -(avatarSize / 2 + 4) }]}
          >
            <Pressable
              disabled={!interactive}
              onPress={() => onSlotPress?.(position.id)}
              accessibilityRole="button"
              accessibilityLabel={player ? `${position.label}: ${player.name}. Trocar jogador` : `${position.label}: adicionar jogador`}
              style={({ pressed }) => [styles.slot, pressed && interactive && { transform: [{ scale: 0.94 }] }]}
            >
              {player ? (
                <Animated.View key={player.id} entering={ZoomIn.springify().damping(18)} exiting={ZoomOut} style={[styles.avatarRing, isActive && { borderColor: colors.primary }]}>
                  <Avatar name={player.name} source={player.photoUrl ? { uri: player.photoUrl } : null} size={compact ? "sm" : "md"} />
                </Animated.View>
              ) : (
                <Animated.View
                  key="empty"
                  entering={FadeIn}
                  style={[
                    styles.empty,
                    { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
                    isActive && { borderColor: colors.primary, backgroundColor: "rgba(31,189,99,0.35)" },
                  ]}
                >
                  <Plus size={compact ? 16 : 22} color="#FFFFFF" />
                </Animated.View>
              )}
              <View style={[styles.labelPill, player ? styles.labelPillFilled : null]}>
                <Text token="caption" color="onPrimary" numberOfLines={1} style={[styles.labelText, compact && styles.labelTextCompact]}>
                  {player ? firstName(player.name) : position.shortLabel}
                </Text>
              </View>
              {player && !compact && (
                <Text token="caption" numberOfLines={1} style={styles.subLabel}>
                  {position.shortLabel}
                  {player.school.shortName ? ` · ${player.school.shortName}` : ""}
                </Text>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pitch: { width: "100%", borderRadius: 24, overflow: "hidden", backgroundColor: "#0E5A2B" },
  slotAnchor: { position: "absolute", alignItems: "center" },
  slot: { alignItems: "center", gap: 3 },
  avatarRing: { borderRadius: 999, borderWidth: 2, borderColor: "rgba(255,255,255,0.9)", shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  empty: { alignItems: "center", justifyContent: "center", borderWidth: 2, borderStyle: "dashed", borderColor: "rgba(255,255,255,0.7)", backgroundColor: "rgba(255,255,255,0.12)" },
  labelPill: { maxWidth: "100%", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  labelPillFilled: { backgroundColor: "rgba(11,11,11,0.7)" },
  labelText: { color: "#FFFFFF", letterSpacing: 0.2, textTransform: "none" },
  labelTextCompact: { fontSize: 9, lineHeight: 12 },
  subLabel: { color: "rgba(255,255,255,0.75)", fontSize: 9, lineHeight: 12 },
});
