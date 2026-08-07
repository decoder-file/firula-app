import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { Star } from "lucide-react-native";

import { Avatar, BottomSheet, Button, EmptyState, PressScale, TextField, Text, useTheme } from "@/design-system";
import type { OrganizerReviewItem } from "@/features/organizer-profile/types";

interface ReviewsSheetProps {
  visible: boolean;
  onClose: () => void;
  rating: string;
  reviews: OrganizerReviewItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (stars: number, comment?: string) => Promise<void>;
}

const STAR_VALUES = [1, 2, 3, 4, 5];

function StarRow({ stars, size, color, mutedColor }: { stars: number; size: number; color: string; mutedColor: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 1 }}>
      {STAR_VALUES.map((value) => (
        <Star key={value} size={size} color={value <= stars ? color : mutedColor} fill={value <= stars ? color : "transparent"} />
      ))}
    </View>
  );
}

export function ReviewsSheet({ visible, onClose, rating, reviews, isLoading, isSubmitting, onSubmit }: ReviewsSheetProps) {
  const { colors, radius } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");

  useEffect(() => {
    if (visible) {
      setMyRating(0);
      setMyComment("");
    }
  }, [visible]);

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
      counts[review.stars - 1] += 1;
    });
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      pct: Math.round((counts[star - 1] / total) * 100),
    }));
  }, [reviews]);

  const handleSubmit = async () => {
    if (myRating === 0) return;
    try {
      await onSubmit(myRating, myComment.trim() || undefined);
      setMyRating(0);
      setMyComment("");
    } catch {
      // feedback de erro já é mostrado pelo chamador (snackbar) — mantém o
      // sheet aberto pra permitir tentar de novo.
    }
  };

  return (
    <BottomSheet visible={visible} title="Avaliações" onClose={onClose}>
      <ScrollView style={{ maxHeight: Math.round(windowHeight * 0.7) }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <View style={[styles.summary, { backgroundColor: colors.background, borderRadius: radius.lg }]}>
          <View style={{ alignItems: "center" }}>
            <Text token="titleLg">{rating}</Text>
            <StarRow stars={Math.round(Number(rating.replace(",", ".")))} size={11} color={colors.warning} mutedColor={colors.warning} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            {distribution.map((row) => (
              <View key={row.star} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text token="caption" color="muted" style={{ width: 10, textTransform: "none", letterSpacing: 0 }}>
                  {row.star}
                </Text>
                <View style={[styles.barTrack, { backgroundColor: colors.surfaceAlt }]}>
                  <View style={[styles.barFill, { width: `${row.pct}%`, backgroundColor: colors.warning }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.addReview, { borderColor: colors.border }]}>
          <Text token="label" style={{ marginBottom: 8 }}>
            Sua avaliação
          </Text>
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
            {STAR_VALUES.map((value) => (
              <PressScale
                key={value}
                onPress={() => setMyRating(value)}
                accessibilityRole="button"
                accessibilityLabel={`${value} estrelas`}
                hitSlop={4}
              >
                <Star size={26} color={colors.warning} fill={value <= myRating ? colors.warning : "transparent"} />
              </PressScale>
            ))}
          </View>
          <TextField
            label="Comentário (opcional)"
            placeholder="Conte como foi sua experiência"
            value={myComment}
            onChangeText={setMyComment}
            multiline
            numberOfLines={3}
          />
          <Button
            label="Enviar avaliação"
            onPress={handleSubmit}
            disabled={myRating === 0}
            loading={isSubmitting}
            fullWidth
            testID="submit-organizer-review"
          />
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : reviews.length === 0 ? (
          <EmptyState icon={Star} variant="empty" title="Nenhuma avaliação ainda" description="Seja a primeira pessoa a avaliar esta organização." />
        ) : (
          reviews.map((review, index) => (
            <View
              key={`${review.id ?? "review"}-${index}`}
              style={[styles.reviewRow, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Avatar name={review.name} size="sm" />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text token="bodySm" style={{ fontWeight: "700" }} numberOfLines={1}>
                    {review.name}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 }}>
                    <StarRow stars={review.stars} size={10} color={colors.warning} mutedColor={colors.border} />
                    {review.timeLabel ? (
                      <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0 }}>
                        · {review.timeLabel}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
              {review.comment ? (
                <Text token="bodySm" color="muted" style={{ marginTop: 8 }}>
                  {review.comment}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, marginTop: 6, marginBottom: 16 },
  barTrack: { flex: 1, height: 5, borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999 },
  addReview: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, gap: 10 },
  reviewRow: { paddingVertical: 12 },
});
