import React, { useState } from 'react';
import { View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { PressScale, Text } from '@/design-system';

const COLLAPSED_LINES = 6;

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
      <Text
        token="body"
        color="muted"
        style={{ lineHeight: 22 }}
        numberOfLines={expanded ? undefined : COLLAPSED_LINES}
      >
        {description}
      </Text>
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
