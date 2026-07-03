import React from 'react';
import { Pressable, View } from 'react-native';
import { Minus, Plus, XCircle } from 'lucide-react-native';

import { PressScale, Text } from '@/design-system';
import type { TicketLot } from '@/features/event-detail/types';

const SCARCITY_THRESHOLD = 10;

function formatBRL(cents: number) {
  return 'R$ ' + (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface LotCardProps {
  lot: TicketLot;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  colors: any;
  radius: any;
}

export function LotCard({ lot, qty, onAdd, onRemove, colors, radius }: LotCardProps) {
  const selected = qty > 0;
  const soldPct = lot.total > 0 ? Math.round(((lot.total - lot.available) / lot.total) * 100) : 0;
  const scarce = lot.available <= SCARCITY_THRESHOLD;

  return (
    <View
      style={{
        borderWidth: 1.5,
        borderRadius: radius.xl,
        padding: 15,
        borderColor: lot.soldOut ? colors.border : selected ? colors.primary : colors.border,
        backgroundColor: lot.soldOut ? colors.background : selected ? colors.primarySoft : colors.surface,
        opacity: lot.soldOut ? 0.6 : 1,
      }}
      accessibilityLabel={`${lot.name}, ${lot.priceCents === 0 ? 'grátis' : formatBRL(lot.priceCents)}${lot.soldOut ? ', esgotado' : ''}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Text token="subtitle" style={{ fontWeight: '800' }}>{lot.name}</Text>
            {lot.popular ? (
              <View style={{ backgroundColor: '#3ED97F', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text token="caption" style={{ color: '#0A2E1A', fontSize: 10, letterSpacing: 0.3 }}>POPULAR</Text>
              </View>
            ) : null}
          </View>
          <Text token="bodySm" color="muted" style={{ marginTop: 3 }}>{lot.description}</Text>
        </View>
        <Text token="subtitle" style={{ fontWeight: '800' }}>
          {lot.priceCents === 0 ? 'Grátis' : formatBRL(lot.priceCents)}
        </Text>
      </View>

      {lot.soldOut ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <XCircle size={14} color={colors.textMuted} strokeWidth={2} />
          <Text token="bodySm" color="muted" style={{ fontWeight: '700' }}>Esgotado</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
          {/* <View style={{ flex: 1 }}>
            <View style={{ height: 6, borderRadius: 999, backgroundColor: colors.border, overflow: 'hidden' }}>
              <View
                style={{
                  height: 6,
                  borderRadius: 999,
                  width: `${soldPct}%`,
                  backgroundColor: scarce ? colors.warning : colors.primary,
                }}
              />
            </View>
            <Text
              token="caption"
              style={{
                marginTop: 5,
                textTransform: 'none',
                letterSpacing: 0,
                fontWeight: '600',
                color: scarce ? colors.warning : colors.textMuted,
              }}
            >
              {scarce ? `Últimas ${lot.available} unidades!` : `${lot.available} disponíveis`}
            </Text>
          </View> */}
          {qty === 0 ? (
            <PressScale
              onPress={onAdd}
              accessibilityRole="button"
              accessibilityLabel={`Adicionar ${lot.name}`}
              style={{
                height: 38,
                paddingHorizontal: 18,
                borderRadius: radius.md,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text token="label" color="onPrimary" style={{ fontSize: 13 }}>Adicionar</Text>
            </PressScale>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: 3,
              }}
            >
              <Pressable onPress={onRemove} hitSlop={6} accessibilityLabel="Remover um" style={{ width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                <Minus size={17} color={colors.primaryText} strokeWidth={2.5} />
              </Pressable>
              <Text token="subtitle" style={{ minWidth: 22, textAlign: 'center', fontWeight: '800' }}>{qty}</Text>
              <Pressable onPress={onAdd} hitSlop={6} accessibilityLabel="Adicionar um" style={{ width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={17} color={colors.primaryText} strokeWidth={2.5} />
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
