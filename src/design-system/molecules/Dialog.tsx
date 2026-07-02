/**
 * Firula Design System — Dialog
 * Decisão que exige confirmação e interrompe o fluxo. Título curto, corpo 1–2 linhas,
 * máx. 2 ações. Ação destrutiva à direita, em vermelho. Foco preso (Modal nativo).
 *
 *   <Dialog visible={open} title="Cancelar ingresso?" message="Não pode ser desfeito."
 *     icon={AlertTriangle} destructive confirmLabel="Cancelar ingresso"
 *     onConfirm={cancel} cancelLabel="Voltar" onCancel={close} />
 */

import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';

export interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
  destructive?: boolean;
  /** Toque no scrim fecha (só quando não-destrutivo). Default: !destructive. */
  dismissable?: boolean;
}

export function Dialog({
  visible,
  title,
  message,
  icon: Icon,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel,
  destructive = false,
  dismissable,
}: DialogProps) {
  const { colors, radius } = useTheme();
  const canDismiss = dismissable ?? !destructive;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={canDismiss ? onCancel : undefined}>
      <View style={[styles.scrim, { backgroundColor: colors.overlay }]}>
        <View
          accessibilityViewIsModal
          style={[styles.card, { backgroundColor: colors.surface, borderRadius: radius.xl }]}
        >
          {Icon ? (
            <View style={[styles.iconBox, { backgroundColor: destructive ? colors.errorSoft : colors.primarySoft, borderRadius: radius.md }]}>
              <Icon size={24} color={destructive ? colors.error : colors.primaryText} strokeWidth={2} />
            </View>
          ) : null}
          <Text token="title" style={{ marginBottom: 6 }} accessibilityRole="header">{title}</Text>
          {message ? <Text token="body" color="muted" style={{ marginBottom: 20 }}>{message}</Text> : null}
          <View style={styles.actions}>
            {cancelLabel ? (
              <View style={{ flex: 1 }}>
                <Button label={cancelLabel} variant="secondary" fullWidth onPress={onCancel ?? (() => {})} />
              </View>
            ) : null}
            <View style={{ flex: 1 }}>
              <Button label={confirmLabel} variant={destructive ? 'destructive' : 'primary'} fullWidth onPress={onConfirm} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  card: { width: '100%', maxWidth: 360, padding: 24 },
  iconBox: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 10 },
});
