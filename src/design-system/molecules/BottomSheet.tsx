/**
 * Firula Design System — BottomSheet
 * Ações contextuais e seleções sem sair da tela (mantém a regra dos 3 toques).
 * Handle no topo, cantos 28dp, arrastar para baixo fecha. Base de Select/filtros/menus.
 *
 *   <BottomSheet visible={open} title="Escolher cidade" onClose={close}>
 *     …itens roláveis…
 *   </BottomSheet>
 */

import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../foundation/ThemeProvider';
import { Text } from '../atoms/Text';

export interface BottomSheetProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const { colors, duration, easing } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(600);

  useEffect(() => {
    translateY.value = visible
      ? withTiming(0, { duration: duration.enter, easing: easing.emphasized })
      : withTiming(600, { duration: duration.standard });
  }, [visible]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        translateY.value = withTiming(600, { duration: duration.standard });
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, { duration: duration.fast });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.scrim, { backgroundColor: colors.overlay }]} onPress={onClose} accessibilityLabel="Fechar" />
      <View style={styles.anchor} pointerEvents="box-none">
        <GestureDetector gesture={pan}>
          <Animated.View
            accessibilityViewIsModal
            style={[styles.sheet, sheetStyle, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 12 }]}
          >
            <View
              style={[styles.handle, { backgroundColor: colors.border }]}
              accessibilityLabel="Arraste para fechar"
            />
            {title ? <Text token="subtitle" style={{ paddingHorizontal: 20, paddingBottom: 8, fontWeight: '800' }}>{title}</Text> : null}
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject },
  anchor: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 8 },
  handle: { width: 40, height: 5, borderRadius: 999, alignSelf: 'center', marginVertical: 8 },
});
