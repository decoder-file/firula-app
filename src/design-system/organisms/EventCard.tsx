/**
 * Firula Design System — EventCard
 * Componente-coração do app. 3 variantes: featured (carrossel), default (grid),
 * compact (lista). Altura fixa por variante → virtualização. React.memo.
 * Sem imagem cai em fundo sólido (não quebra layout).
 *
 *   <EventCard event={e} variant="featured" onPress={() => open(e)} />
 */

import React from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { CalendarDays, MapPin } from 'lucide-react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { PressScale } from '../atoms/PressScale';
import { Text } from '../atoms/Text';

export interface EventCardItem {
  id: string;
  slug?: string;
  title: string;
  /** Data já formatada (ex.: "Sáb, 14 dez") — formatação fica no consumidor. */
  dateLabel: string;
  city: string;
  eventType: string;
  image?: ImageSourcePropType | null;
}

export type EventCardVariant = 'featured' | 'default' | 'compact';

export interface EventCardProps {
  event: EventCardItem;
  variant?: EventCardVariant;
  onPress?: () => void;
}

function Meta({ dateLabel, city, muted }: { dateLabel: string; city: string; muted: string }) {
  return (
    <View style={styles.meta}>
      <CalendarDays size={13} color={muted} strokeWidth={1.5} />
      <Text token="bodySm" color="muted">{dateLabel}</Text>
      <Text token="bodySm" color="muted">·</Text>
      <MapPin size={13} color={muted} strokeWidth={1.5} />
      <Text token="bodySm" color="muted" numberOfLines={1} style={{ flex: 1 }}>{city}</Text>
    </View>
  );
}

function EventCardBase({ event, variant = 'default', onPress }: EventCardProps) {
  const { colors, radius, elevation } = useTheme();
  const a11y = `Evento ${event.title}, ${event.dateLabel}, ${event.city}`;
  const fallback = colors.text; // fundo sólido quando não há imagem

  if (variant === 'compact') {
    return (
      <PressScale onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y}
        style={[styles.compact, { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }]}>
        {event.image
          ? <Image source={event.image} style={styles.thumb} />
          : <View style={[styles.thumb, { backgroundColor: fallback }]} />}
        <View style={{ flex: 1, minWidth: 0, justifyContent: 'space-between' }}>
          <View>
            <View style={[styles.tagOutline, { borderColor: colors.primary }]}>
              <Text token="caption" style={{ color: colors.primaryText, textTransform: 'none', letterSpacing: 0 }}>{event.eventType}</Text>
            </View>
            <Text token="subtitle" numberOfLines={2} style={{ marginTop: 4 }}>{event.title}</Text>
          </View>
          <Meta dateLabel={event.dateLabel} city={event.city} muted={colors.textMuted} />
        </View>
      </PressScale>
    );
  }

  const width = variant === 'featured' ? 280 : undefined;
  const imgHeight = variant === 'featured' ? 150 : 130;

  return (
    <PressScale onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y}
      style={[{ width, borderRadius: radius.xl, backgroundColor: colors.surface, overflow: 'hidden' }, variant === 'featured' ? elevation[1] : { borderWidth: 1, borderColor: colors.border }]}>
      <View style={{ height: imgHeight }}>
        {event.image
          ? <Image source={event.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
          : <View style={[StyleSheet.absoluteFill, { backgroundColor: fallback }]} />}
        <View style={[styles.tagOverlay]}>
          <Text token="caption" style={{ color: '#FFFFFF' }}>{event.eventType.toUpperCase()}</Text>
        </View>
        {variant === 'featured' ? (
          <View style={styles.overlayTitle}>
            <Text token="subtitle" numberOfLines={2} style={{ color: '#FFFFFF', fontWeight: '800' }}>{event.title}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ padding: 12 }}>
        {variant === 'default' ? (
          <Text token="subtitle" numberOfLines={2} style={{ fontWeight: '800', marginBottom: 8 }}>{event.title}</Text>
        ) : null}
        <Meta dateLabel={event.dateLabel} city={event.city} muted={colors.textMuted} />
      </View>
    </PressScale>
  );
}

export const EventCard = React.memo(EventCardBase);

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  compact: { flexDirection: 'row', gap: 12, padding: 12 },
  thumb: { width: 72, height: 72, borderRadius: 12 },
  tagOutline: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 },
  tagOverlay: {
    position: 'absolute', left: 12, top: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  overlayTitle: {
    position: 'absolute', left: 12, right: 12, bottom: 12,
  },
});
