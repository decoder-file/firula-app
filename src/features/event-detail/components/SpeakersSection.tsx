import React, { useState } from 'react';
import { Linking, ScrollView, useWindowDimensions, View } from 'react-native';
import { AtSign, ChevronRight } from 'lucide-react-native';

import { BottomSheet, PressScale, Text, useTheme } from '@/design-system';
import { InitialsAvatar } from '@/components/InitialsAvatar';
import { RichText } from '@/components/RichText';
import { stripHtml } from '@/utils/stripHtml';
import type { FeaturedPerson } from '@/features/event-detail/types';

const CARD_WIDTH = 168;

function normalizeInstagram(value?: string | null) {
  if (!value) return null;
  const handle = value.trim().replace(/^@/, '');
  if (!handle) return null;
  return { label: `@${handle}`, href: `https://instagram.com/${handle}` };
}

function hasRichContent(html?: string | null) {
  return Boolean(html && stripHtml(html).trim().length > 0);
}

interface SpeakersSectionProps {
  speakers: FeaturedPerson[];
  colors: any;
  radius: any;
}

export function SpeakersSection({ speakers, colors, radius }: SpeakersSectionProps) {
  const [selected, setSelected] = useState<FeaturedPerson | null>(null);

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
      <Text token="subtitle" style={{ fontWeight: '800', marginBottom: 14 }}>
        Palestrantes e convidados
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {speakers.map((speaker) => (
          <SpeakerCard
            key={speaker.id}
            speaker={speaker}
            colors={colors}
            radius={radius}
            onPress={() => hasRichContent(speaker.description) && setSelected(speaker)}
          />
        ))}
      </ScrollView>

      <SpeakerDetailsSheet speaker={selected} onClose={() => setSelected(null)} colors={colors} />
    </View>
  );
}

function SpeakerCard({
  speaker,
  onPress,
  colors,
  radius,
}: {
  speaker: FeaturedPerson;
  onPress: () => void;
  colors: any;
  radius: any;
}) {
  const instagram = normalizeInstagram(speaker.instagram);
  const temMais = hasRichContent(speaker.description);

  return (
    <PressScale
      onPress={onPress}
      disabled={!temMais}
      accessibilityRole={temMais ? 'button' : undefined}
      accessibilityLabel={speaker.name}
      style={{
        width: CARD_WIDTH,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: 14,
        alignItems: 'center',
        gap: 6,
      }}
    >
      <InitialsAvatar name={speaker.name} photoUrl={speaker.photoUrl} size={72} />
      <Text token="bodySm" numberOfLines={2} style={{ fontWeight: '800', textAlign: 'center' }}>
        {speaker.name}
      </Text>
      {speaker.shortDescription ? (
        <Text
          token="caption"
          color="muted"
          numberOfLines={2}
          style={{ textAlign: 'center', textTransform: 'none', letterSpacing: 0 }}
        >
          {speaker.shortDescription}
        </Text>
      ) : null}

      <View style={{ marginTop: 'auto', alignItems: 'center', gap: 6, paddingTop: 6 }}>
        {instagram ? (
          <PressScale
            onPress={() => Linking.openURL(instagram.href)}
            accessibilityRole="link"
            accessibilityLabel={`Instagram de ${speaker.name}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <AtSign size={13} color={colors.primaryText} strokeWidth={2} />
            <Text token="caption" color="primary" style={{ textTransform: 'none', letterSpacing: 0 }}>
              {instagram.label}
            </Text>
          </PressScale>
        ) : null}
        {temMais ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Text token="caption" color="primary" style={{ fontWeight: '700', textTransform: 'none', letterSpacing: 0 }}>
              Ver mais
            </Text>
            <ChevronRight size={13} color={colors.primaryText} strokeWidth={2} />
          </View>
        ) : null}
      </View>
    </PressScale>
  );
}

function SpeakerDetailsSheet({
  speaker,
  onClose,
  colors,
}: {
  speaker: FeaturedPerson | null;
  onClose: () => void;
  colors: any;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const instagram = normalizeInstagram(speaker?.instagram);

  return (
    <BottomSheet visible={!!speaker} onClose={onClose}>
      {speaker ? (
        <ScrollView
          style={{ maxHeight: windowHeight * 0.7 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8, alignItems: 'center', gap: 10 }}
        >
          <InitialsAvatar name={speaker.name} photoUrl={speaker.photoUrl} size={80} />
          <Text token="title" style={{ textAlign: 'center' }}>
            {speaker.name}
          </Text>
          {speaker.shortDescription ? (
            <Text token="bodySm" color="muted" style={{ textAlign: 'center' }}>
              {speaker.shortDescription}
            </Text>
          ) : null}

          {hasRichContent(speaker.description) ? (
            <View style={{ width: '100%', marginTop: 4 }}>
              <RichText html={speaker.description!} />
            </View>
          ) : null}

          {instagram ? (
            <PressScale
              onPress={() => Linking.openURL(instagram.href)}
              accessibilityRole="link"
              accessibilityLabel={`Instagram de ${speaker.name}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}
            >
              <AtSign size={16} color={colors.primaryText} strokeWidth={2} />
              <Text token="label" color="primary">{instagram.label}</Text>
            </PressScale>
          ) : null}
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
}
