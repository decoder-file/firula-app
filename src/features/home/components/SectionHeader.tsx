import React from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/design-system";

export function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginTop: 20,
      }}
    >
      <Text token="titleLg">{title}</Text>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text token="label" color="primary">
            Ver todos
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
