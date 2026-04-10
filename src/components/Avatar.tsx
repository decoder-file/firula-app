import { Image, Text, View } from "react-native";

import { getInitials } from "@/utils/format";

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
}

export const Avatar = ({ uri, name, size = 48 }: AvatarProps) => {
  if (uri && !uri.endsWith(".svg")) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center bg-secondary"
    >
      <Text className="font-bold text-foreground" style={{ fontSize: Math.max(size / 3, 12) }}>
        {getInitials(name)}
      </Text>
    </View>
  );
};