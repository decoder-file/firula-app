/**
 * Firula Design System — ScreenContainer (template)
 * Padding lateral consistente + safe-area + adaptação a tablet (conteúdo máx. 640dp
 * centralizado). Base de toda tela. Aplica a cor de fundo do tema.
 *
 *   <ScreenContainer>
 *     <TopBar … />
 *     …conteúdo…
 *   </ScreenContainer>
 *
 *   <ScreenContainer scroll edges={['top']}>…</ScreenContainer>
 */

import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '../foundation/ThemeProvider';

export interface ScreenContainerProps {
  children: React.ReactNode;
  /** Envolve o conteúdo num ScrollView. Default: false. */
  scroll?: boolean;
  /** Aplica o padding lateral padrão (16/24dp). Default: true. */
  padded?: boolean;
  edges?: Edge[];
  style?: ViewStyle;
}

export function ScreenContainer({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'bottom'],
  style,
}: ScreenContainerProps) {
  const { colors, layout } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= layout.tabletBreakpoint;

  const paddingH = padded ? (isTablet ? layout.screenPaddingTablet : layout.screenPadding) : 0;

  const inner: ViewStyle = {
    flex: scroll ? undefined : 1,
    width: '100%',
    maxWidth: isTablet ? layout.contentMaxWidth : undefined,
    alignSelf: 'center',
    paddingHorizontal: paddingH,
  };

  const content = <View style={[inner, style]}>{children}</View>;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={edges}>
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center' },
});
