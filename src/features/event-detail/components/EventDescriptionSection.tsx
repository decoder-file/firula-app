import React, { useState } from 'react';
import { View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { PressScale, Text } from '@/design-system';
import { RichText } from '@/components/RichText';

// RN não tem um equivalente confiável de "line-clamp" pra conteúdo rico (parágrafos,
// listas, títulos misturados) — a aproximação prática é limitar a altura do container
// renderizado. ~6 linhas de texto corrido (lineHeight 22) quando recolhido.
const COLLAPSED_HEIGHT = 136;

interface EventDescriptionSectionProps {
  description: string;
  colors: any;
  radius: any;
}

export function EventDescriptionSection({ description, colors, radius }: EventDescriptionSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.xl,
        backgroundColor: colors.surface,
        padding: 18,
        marginBottom: 22,
      }}
    >
      <Text token="subtitle" style={{ fontWeight: '800', marginBottom: 10 }}>
        Descrição do evento
      </Text>
      <View style={!expanded ? { maxHeight: COLLAPSED_HEIGHT, overflow: 'hidden' } : undefined}>
        <RichText html={description} />
      </View>
      <PressScale
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Ver menos' : 'Ver mais'}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}
      >
        <ChevronDown
          size={18}
          color={colors.text}
          strokeWidth={2}
          style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
        />
        <Text token="label" style={{ fontWeight: '700' }}>
          {expanded ? 'Ver menos' : 'Ver mais'}
        </Text>
      </PressScale>
    </View>
  );
}
