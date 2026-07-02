/**
 * Firula Design System — Avatar + AvatarGroup
 * Foto ou iniciais sobre fundo tonal derivado do nome (determinístico).
 * Sem foto NUNCA vira ícone genérico — iniciais têm mais identidade.
 *
 *   <Avatar name="Ana Firula" size="lg" status="online" />
 *   <Avatar name="Rafael Moraes" source={{ uri }} />
 *   <AvatarGroup names={['Ana','Bruno','Caio','Dora']} max={3} />
 */

import React from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { useTheme } from '../foundation/ThemeProvider';
import type { Palette } from '../foundation/colors';
import { Text } from './Text';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const DIM: Record<AvatarSize, number> = { sm: 32, md: 44, lg: 56, xl: 72 };
const FONT: Record<AvatarSize, number> = { sm: 13, md: 16, lg: 20, xl: 26 };

/** Paleta tonal estável por nome (mesma pessoa → mesma cor). */
function toneFor(name: string, c: Palette): { bg: string; fg: string } {
  const tones = [
    { bg: c.primarySoft, fg: c.primaryText },
    { bg: c.infoSoft, fg: c.info },
    { bg: c.warningSoft, fg: c.warning },
    { bg: c.errorSoft, fg: c.error },
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return tones[h % tones.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase();
}

export interface AvatarProps {
  name: string;
  source?: ImageSourcePropType | null;
  size?: AvatarSize;
  status?: 'online' | 'offline';
}

export function Avatar({ name, source, size = 'md', status }: AvatarProps) {
  const { colors } = useTheme();
  const dim = DIM[size];
  const tone = toneFor(name, colors);

  return (
    <View style={{ width: dim, height: dim }} accessibilityLabel={`Foto de ${name}`}>
      {source ? (
        <Image source={source} style={{ width: dim, height: dim, borderRadius: 999 }} />
      ) : (
        <View style={[styles.fallback, { width: dim, height: dim, backgroundColor: tone.bg }]}>
          <Text token="label" style={{ color: tone.fg, fontSize: FONT[size] }}>
            {initials(name)}
          </Text>
        </View>
      )}
      {status ? (
        <View
          style={[
            styles.status,
            {
              backgroundColor: status === 'online' ? colors.primary : colors.textMuted,
              borderColor: colors.surface,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

export interface AvatarGroupProps {
  names: string[];
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ names, max = 3, size = 'md' }: AvatarGroupProps) {
  const { colors } = useTheme();
  const dim = DIM[size];
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;

  return (
    <View style={styles.groupRow} accessibilityLabel={`${names.length} pessoas`}>
      {shown.map((n, i) => (
        <View key={n + i} style={{ marginLeft: i === 0 ? 0 : -14, borderRadius: 999, borderWidth: 2.5, borderColor: colors.surface }}>
          <Avatar name={n} size={size} />
        </View>
      ))}
      {extra > 0 ? (
        <View
          style={[
            styles.fallback,
            { width: dim, height: dim, marginLeft: -14, backgroundColor: colors.surfaceAlt, borderWidth: 2.5, borderColor: colors.surface },
          ]}
        >
          <Text token="label" style={{ color: colors.textMuted, fontSize: 13 }}>
            +{extra}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  status: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 2.5,
  },
  groupRow: { flexDirection: 'row', alignItems: 'center' },
});
