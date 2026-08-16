import React from "react";
import { Image, View } from "react-native";

import { Text } from "@/design-system";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function InitialsAvatar({
  name,
  photoUrl,
  size,
}: {
  name: string;
  photoUrl?: string | null;
  size: number;
}) {
  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: "white" }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: "white",
        backgroundColor: "#27272A",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "white", fontWeight: "800", fontSize: size * 0.3 }}>
        {getInitials(name) || "?"}
      </Text>
    </View>
  );
}
