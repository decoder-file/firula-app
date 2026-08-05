import React from "react";
import { StyleSheet, View } from "react-native";
import { Ban, Flag, Share2, UserX, type LucideIcon } from "lucide-react-native";

import { BottomSheet, PressScale, Text, useTheme } from "@/design-system";

interface ActionsMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  isFollowing: boolean;
  isBlocked: boolean;
  onShareProfile: () => void;
  onUnfollow: () => void;
  onToggleBlock: () => void;
  onReport: () => void;
}

interface MenuAction {
  icon: LucideIcon;
  label: string;
  destructive?: boolean;
  onPress: () => void;
}

export function ActionsMenuSheet({
  visible,
  onClose,
  isFollowing,
  isBlocked,
  onShareProfile,
  onUnfollow,
  onToggleBlock,
  onReport,
}: ActionsMenuSheetProps) {
  const { colors } = useTheme();

  const actions: MenuAction[] = [
    {
      icon: Share2,
      label: "Compartilhar perfil",
      onPress: () => {
        onClose();
        onShareProfile();
      },
    },
    {
      icon: UserX,
      label: isFollowing ? "Deixar de seguir" : "Remover seguidor",
      onPress: () => {
        onClose();
        onUnfollow();
      },
    },
    {
      icon: Ban,
      label: isBlocked ? "Desbloquear" : "Bloquear",
      destructive: true,
      onPress: () => {
        onClose();
        onToggleBlock();
      },
    },
    {
      icon: Flag,
      label: "Denunciar perfil",
      destructive: true,
      onPress: () => {
        onClose();
        onReport();
      },
    },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ paddingBottom: 4 }}>
        {actions.map((action, index) => (
          <PressScale
            key={action.label}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={[
              styles.row,
              index > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
          >
            <action.icon
              size={17}
              color={action.destructive ? colors.error : colors.text}
              strokeWidth={1.75}
            />
            <Text
              token="bodySm"
              style={{
                fontWeight: "600",
                textTransform: "none",
                letterSpacing: 0,
                color: action.destructive ? colors.error : colors.text,
              }}
            >
              {action.label}
            </Text>
          </PressScale>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 20, paddingVertical: 15 },
});
