import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  Clock,
  Heart,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Share2,
  Smartphone,
  Star,
  Zap,
} from 'lucide-react-native';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { PressScale, Text, useTheme } from '@/design-system';
import { FactItem } from '@/features/event-detail/components/FactItem';
import { LotCard } from '@/features/event-detail/components/LotCard';
import { RoundButton } from '@/features/event-detail/components/RoundButton';
import { TrustItem } from '@/features/event-detail/components/TrustItem';
import type { EventDetailScreenProps } from '@/features/event-detail/types';

const SCARCITY_THRESHOLD = 10;

function formatBRL(cents: number) {
  return 'R$ ' + (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function EventDetailScreen({
  event,
  isLoading,
  isError,
  favorite = false,
  onToggleFavorite,
  onBack,
  onShare,
  onOpenMap,
  onAddToCalendar,
  onFollowOrganizer,
  onCheckout,
}: EventDetailScreenProps) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [qty, setQty] = useState<Record<string, number>>({});

  const add = useCallback((id: string) => setQty((q) => ({ ...q, [id]: (q[id] ?? 0) + 1 })), []);
  const remove = useCallback((id: string) => setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) - 1) })), []);
  const clearAll = useCallback(() => setQty({}), []);

  const { total, count } = useMemo(() => {
    if (!event) {
      return { total: 0, count: 0 };
    }

    let sum = 0;
    let selected = 0;
    for (const lot of event.lots) {
      const n = qty[lot.id] ?? 0;
      sum += lot.priceCents * n;
      selected += n;
    }
    return { total: sum, count: selected };
  }, [qty, event]);

  const hasItems = count > 0;

  if (isLoading) {
    return (
      <Screen edges={['left', 'right']}>
        <View className="flex-1">
          <Skeleton className="h-80 w-full" />
          <View className="gap-3 px-4 pt-4">
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-5 w-1/3 rounded-xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </View>
        </View>
      </Screen>
    );
  }

  if (isError || !event) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-muted-foreground">Evento não encontrado.</Text>
          <AnimatedPressable className="mt-4" onPress={onBack}>
            <Text className="font-medium text-sm text-primary">Voltar</Text>
          </AnimatedPressable>
        </View>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 132 }}>
        <View style={{ height: 340 }}>
          <Image source={event.image} style={StyleSheet.absoluteFillObject as any} resizeMode="cover" />
          <View style={[StyleSheet.absoluteFillObject, styles.heroScrim]} />

          <View style={{ position: 'absolute', top: insets.top + 8, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
            <RoundButton label="Voltar" onPress={onBack}><ChevronLeft size={22} color="#141821" strokeWidth={2} /></RoundButton>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <RoundButton label="Compartilhar" onPress={onShare}><Share2 size={20} color="#141821" strokeWidth={1.75} /></RoundButton>
              <RoundButton label={favorite ? 'Remover dos favoritos' : 'Favoritar'} onPress={onToggleFavorite}>
                <Heart size={20} color={favorite ? '#E5484D' : '#141821'} fill={favorite ? '#E5484D' : 'none'} strokeWidth={1.75} />
              </RoundButton>
            </View>
          </View>

          <View style={{ position: 'absolute', left: 20, right: 20, bottom: 18 }}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {event.hot ? (
                <View style={[styles.pill, { backgroundColor: colors.primary }]}>
                  <Zap size={13} color={colors.onPrimary} strokeWidth={2.5} />
                  <Text token="caption" color="onPrimary" style={styles.pillTxt}>Alta procura</Text>
                </View>
              ) : null}
              <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                <Text token="caption" style={[styles.pillTxt, { color: '#141821' }]}>{event.category}</Text>
              </View>
            </View>
            <Text token="titleLg" style={{ color: '#fff', fontSize: 25 }}>{event.title}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          {event.social ? (
            <View style={[styles.socialRow, { borderBottomColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                {event.social.avatars?.length ? (
                  <View style={{ flexDirection: 'row' }}>
                    {event.social.avatars.map((a, i) => (
                      <View key={i} style={[styles.avatar, { backgroundColor: a.bg, borderColor: colors.surface, marginLeft: i === 0 ? 0 : -8 }]}>
                        <Text token="caption" style={{ color: a.fg, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>{a.initials}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text token="bodySm" style={{ fontWeight: '700' }}>+{event.social.count.toLocaleString('pt-BR')} confirmados</Text>
                  {event.social.friendsText ? <Text token="caption" color="muted" style={{ textTransform: 'none', letterSpacing: 0 }}>{event.social.friendsText}</Text> : null}
                </View>
              </View>
              {event.social.rating != null ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Star size={14} color="#F5A524" fill="#F5A524" />
                    <Text token="bodySm" style={{ fontWeight: '800' }}>{event.social.rating.toLocaleString('pt-BR')}</Text>
                  </View>
                  {event.social.reviews != null ? <Text token="caption" color="muted" style={{ textTransform: 'none', letterSpacing: 0 }}>{event.social.reviews} avaliações</Text> : null}
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={{ gap: 10, paddingVertical: 16 }}>
            <FactItem icon={<CalendarDays size={19} color={colors.primaryText} strokeWidth={1.75} />} title={event.dateLabel} subtitle={event.timeLabel}
              actionLabel="Lembrar" onAction={onAddToCalendar} colors={colors} />
            <FactItem icon={<MapPin size={19} color={colors.primaryText} strokeWidth={1.75} />} title={event.venueName} subtitle={event.address}
              actionLabel="Mapa" onAction={onOpenMap} colors={colors} />
          </View>

          {event.organizer ? (
            <View style={[styles.orgCard, { backgroundColor: colors.background }]}>
              <View style={[styles.orgAvatar, { backgroundColor: colors.text }]}>
                <Text token="subtitle" style={{ color: '#3ED97F', fontWeight: '800' }}>{event.organizer.initials}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text token="body" style={{ fontWeight: '700' }}>{event.organizer.name}</Text>
                  {event.organizer.verified ? <BadgeCheck size={15} color={colors.primary} fill={colors.primarySoft} /> : null}
                </View>
                <Text token="caption" color="muted" style={{ textTransform: 'none', letterSpacing: 0 }}>
                  Organizador{event.organizer.eventsCount != null ? ` · ${event.organizer.eventsCount} eventos realizados` : ''}
                </Text>
              </View>
              <PressScale onPress={onFollowOrganizer ?? (() => {})} accessibilityRole="button" accessibilityLabel="Seguir organizador"
                style={[styles.followBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text token="label" style={{ fontSize: 12.5 }}>Seguir</Text>
              </PressScale>
            </View>
          ) : null}

          <View style={{ marginBottom: 22 }}>
            <Text token="subtitle" style={{ fontWeight: '800', marginBottom: 8 }}>Sobre o evento</Text>
            <Text token="body" color="muted" style={{ lineHeight: 22 }}>{event.about}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text token="subtitle" style={{ fontWeight: '800' }}>Escolha seu ingresso</Text>
            {event.lotDeadlineText ? (
              <View style={[styles.deadline, { backgroundColor: colors.warningSoft }]}>
                <Clock size={13} color={colors.warning} strokeWidth={2} />
                <Text token="caption" style={{ color: colors.warning, textTransform: 'none', letterSpacing: 0, fontSize: 11.5 }}>{event.lotDeadlineText}</Text>
              </View>
            ) : null}
          </View>

          <View style={{ gap: 12, marginTop: 12 }}>
            {event.lots.map((lot) => (
              <LotCard key={lot.id} lot={lot} qty={qty[lot.id] ?? 0} onAdd={() => add(lot.id)} onRemove={() => remove(lot.id)} colors={colors} radius={radius} />
            ))}
          </View>

          <View style={styles.trustRow}>
            <TrustItem icon={<ShieldCheck size={16} color={colors.primaryText} strokeWidth={1.75} />} label="Compra 100% segura" />
            <TrustItem icon={<RotateCcw size={16} color={colors.primaryText} strokeWidth={1.75} />} label="Reembolso até 7 dias" />
            <TrustItem icon={<Smartphone size={16} color={colors.primaryText} strokeWidth={1.75} />} label="Ingresso no app" />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.ctaBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + 14 }]}>
        {hasItems ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text token="caption" color="muted" style={{ textTransform: 'none', letterSpacing: 0 }}>
              {count} {count === 1 ? 'ingresso selecionado' : 'ingressos selecionados'}
            </Text>
            <Pressable onPress={clearAll} hitSlop={8}><Text token="caption" color="muted" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: '700' }}>Limpar</Text></Pressable>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View>
            <Text token="caption" color="muted" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: '600' }}>Total</Text>
            <Text token="titleLg" style={{ fontSize: 22 }}>{formatBRL(total)}</Text>
          </View>
          <PressScale
            onPress={() => hasItems && onCheckout?.(qty, total)}
            disabled={!hasItems}
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasItems }}
            accessibilityLabel={hasItems ? 'Continuar para o checkout' : 'Selecione um ingresso'}
            style={[styles.cta, { backgroundColor: hasItems ? colors.primary : colors.surfaceAlt }]}
          >
            <Text token="label" style={{ fontSize: 15, color: hasItems ? colors.onPrimary : colors.textMuted }}>
              {hasItems ? 'Continuar' : 'Selecione um ingresso'}
            </Text>
            {hasItems ? <ArrowRight size={19} color={colors.onPrimary} strokeWidth={2.5} /> : null}
          </PressScale>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroScrim: { backgroundColor: 'transparent' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pillTxt: { textTransform: 'none', letterSpacing: 0, fontSize: 12, fontWeight: '700' },
  socialRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1 },
  avatar: { width: 30, height: 30, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  orgCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 12, marginBottom: 20 },
  orgAvatar: { width: 42, height: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  followBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, height: 36, alignItems: 'center', justifyContent: 'center' },
  deadline: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 22, marginBottom: 8 },
  ctaBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 12 },
  cta: { flex: 1, height: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
