import React from "react";
import { StyleSheet, View } from "react-native";
import { Ban, Flag, Share2, UserX, type LucideIcon } from "lucide-react-native";

import { BottomSheet, PressScale, Text, useTheme } from "@/design-system";

interface ActionsMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isBlocked: boolean;
  hasReported: boolean;
  isAuthenticated: boolean;
  onShareProfile: () => void;
  onUnfollow: () => void;
  onRemoveFollower: () => void;
  onToggleBlock: () => void;
  onOpenReport: () => void;
}

interface MenuAction {
  icon: LucideIcon;
  label: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function ActionsMenuSheet({
  visible,
  onClose,
  isFollowing,
  isFollowedBy,
  isBlocked,
  hasReported,
  isAuthenticated,
  onShareProfile,
  onUnfollow,
  onRemoveFollower,
  onToggleBlock,
  onOpenReport,
}: ActionsMenuSheetProps) {
  const { colors } = useTheme();

  // Abrir outro Modal nativo (share sheet do sistema, ou o sheet de
  // denúncia) imediatamente depois de fechar este BottomSheet (também um
  // Modal) faz o iOS silenciosamente ignorar a nova apresentação, ainda no
  // meio da transição de dismiss. Esperar a animação terminar resolve.
  const closeThenRun = (action: () => void) => {
    onClose();
    setTimeout(action, 350);
  };

  const actions: MenuAction[] = [
    {
      icon: Share2,
      label: "Compartilhar perfil",
      onPress: () => closeThenRun(onShareProfile),
    },
    ...(isFollowing || isFollowedBy
      ? [
          {
            icon: UserX,
            label: isFollowing ? "Deixar de seguir" : "Remover seguidor",
            onPress: () => {
              onClose();
              if (isFollowing) onUnfollow();
              else onRemoveFollower();
            },
          },
        ]
      : []),
    ...(isAuthenticated
      ? [
          {
            icon: Ban,
            label: isBlocked ? "Desbloquear" : "Bloquear",
            destructive: true,
            onPress: () => {
              onClose();
              onToggleBlock();
            },
          },
        ]
      : []),
    {
      icon: Flag,
      label: hasReported ? "Perfil já denunciado" : "Denunciar perfil",
      destructive: true,
      disabled: hasReported,
      onPress: () => closeThenRun(onOpenReport),
    },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ paddingBottom: 4 }}>
        {actions.map((action, index) => (
          <PressScale
            key={index}
            onPress={action.onPress}
            disabled={action.disabled}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityState={{ disabled: action.disabled }}
            style={[
              styles.row,
              index > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
              action.disabled && { opacity: 0.45 },
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
