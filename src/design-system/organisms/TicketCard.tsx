/**
 * Firula Design System — TicketCard
 * O ingresso em si — formato "bilhete" com recorte perfurado + QR para entrada.
 * Status por cor de topo + ícone + texto (nunca só cor). QR a ≤2 toques do início.
 *
 * O QR em si deve vir do consumidor (ex.: react-native-qrcode-svg) via prop `qr`.
 *
 *   <TicketCard ticket={t} status="valid" qr={<QRCode value={t.qrValue} size={132} />} />
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { Text } from '../atoms/Text';

export type TicketStatus = 'valid' | 'used' | 'expired' | 'transferred';

export interface TicketCardData {
  eventTitle: string;
  tier: string;
  /** Linha de data/local já formatada. */
  dateLabel: string;
  code: string;
}

export interface TicketCardProps {
  ticket: TicketCardData;
  status?: TicketStatus;
  /** Nó do QR Code (ex.: <QRCode …/>). Só renderiza quando status === 'valid'. */
  qr?: React.ReactNode;
}

const STATUS_LABEL: Record<TicketStatus, string> = {
  valid: 'Válido',
  used: 'Já utilizado',
  expired: 'Expirado',
  transferred: 'Transferido',
};

export function TicketCard({ ticket, status = 'valid', qr }: TicketCardProps) {
  const { colors, radius, elevation } = useTheme();
  const active = status === 'valid';
  const headerBg = active ? colors.text : colors.textMuted;
  const accent = active ? colors.primary : '#E7EAEE';

  return (
    <View
      style={[{ borderRadius: radius.xl, backgroundColor: colors.surface, overflow: 'hidden' }, elevation[1]]}
      accessibilityLabel={`Ingresso ${ticket.tier} para ${ticket.eventTitle}. ${ticket.dateLabel}. ${STATUS_LABEL[status]}.`}
    >
      {/* Cabeçalho escuro */}
      <View style={{ backgroundColor: headerBg, paddingHorizontal: 20, paddingVertical: 18 }}>
        <Text token="caption" style={{ color: active ? colors.primaryText : '#E7EAEE' }}>
          {ticket.tier.toUpperCase()}
        </Text>
        <Text token="title" style={{ color: '#FFFFFF', marginTop: 4 }}>{ticket.eventTitle}</Text>
        <Text token="bodySm" style={{ color: '#A6AEBB', marginTop: 4 }}>
          {ticket.dateLabel}{active ? '' : ` · ${STATUS_LABEL[status]}`}
        </Text>
      </View>

      {/* Recorte perfurado */}
      <View style={styles.notchRow}>
        <View style={[styles.notch, { backgroundColor: colors.background, left: -10 }]} />
        <View style={[styles.notch, { backgroundColor: colors.background, right: -10 }]} />
      </View>

      {/* Corpo: QR ou estado */}
      <View style={[styles.body, { borderTopColor: colors.border }]}>
        {active ? (
          <>
            {qr ?? <View style={{ width: 132, height: 132, borderRadius: 12, backgroundColor: colors.text }} />}
            <Text token="bodySm" style={{ marginTop: 14, letterSpacing: 2, color: colors.textMuted, fontVariant: ['tabular-nums'] }}>
              {ticket.code}
            </Text>
          </>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <View style={[styles.usedIcon, { backgroundColor: colors.surfaceAlt }]}>
              <Check size={28} color={colors.textMuted} strokeWidth={2.5} />
            </View>
            <Text token="label" color="muted" style={{ marginTop: 12 }}>{STATUS_LABEL[status]}</Text>
          </View>
        )}
      </View>
      {/* faixa de acento no topo p/ reforço de status */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: accent }} />
    </View>
  );
}

const styles = StyleSheet.create({
  notchRow: { height: 0, position: 'relative' },
  notch: { position: 'absolute', top: -10, width: 20, height: 20, borderRadius: 999 },
  body: { padding: 24, alignItems: 'center', borderTopWidth: 2, borderStyle: 'dashed' },
  usedIcon: { width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
