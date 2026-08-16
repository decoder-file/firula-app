import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  CheckCheck,
  CheckCircle2,
  Info,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from "lucide-react-native";
import { FlatList, StyleSheet, View } from "react-native";

import { Screen } from "@/components/Screen";
import {
  Button,
  BottomSheet,
  EmptyState,
  PressScale,
  Skeleton,
  Surface,
  Text,
  TopBar,
  useTheme,
} from "@/design-system";
import type { Palette } from "@/design-system";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { useMarkAllRead, useMarkRead, useNotifications } from "@/hooks/useNotifications";
import { useScreenLog } from "@/hooks/useScreenLog";
import type { AppNotification } from "@/services/notifications.service";

type NotificationAppearance = {
  icon: React.ElementType;
  color: string;
  backgroundColor: string;
};

function getNotificationAppearance(type: AppNotification["type"], colors: Palette): NotificationAppearance {
  switch (type) {
    case "ORDER_PAID":
      return { icon: ShoppingBag, color: colors.success, backgroundColor: colors.successSoft };
    case "REFUND_COMPLETED":
      return { icon: RefreshCw, color: colors.success, backgroundColor: colors.successSoft };
    case "ORDER_CANCELED":
      return { icon: XCircle, color: colors.error, backgroundColor: colors.errorSoft };
    case "REFUND_FAILED":
      return { icon: AlertCircle, color: colors.error, backgroundColor: colors.errorSoft };
    case "TICKET_TRANSFERRED_IN":
      return { icon: ArrowDownToLine, color: colors.info, backgroundColor: colors.infoSoft };
    case "TICKET_TRANSFERRED_OUT":
      return { icon: ArrowUpFromLine, color: colors.warning, backgroundColor: colors.warningSoft };
    case "EVENT_UPDATE":
      return { icon: Info, color: colors.warning, backgroundColor: colors.warningSoft };
    default:
      return { icon: Bell, color: colors.textMuted, backgroundColor: colors.surfaceAlt };
  }
}

function formatTimeAgo(createdAt: string) {
  const diff = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;

  const days = Math.floor(hours / 24);
  return `há ${days} d`;
}

function formatNotificationDate(createdAt: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(createdAt));
}

function getNotificationAction(notification: AppNotification) {
  switch (notification.type) {
    case "ORDER_PAID":
    case "ORDER_CANCELED":
    case "REFUND_COMPLETED":
    case "REFUND_FAILED":
    case "TICKET_TRANSFERRED_IN":
    case "TICKET_TRANSFERRED_OUT":
      return { label: "Ver meus ingressos", route: "/(tabs)/tickets" as const };
    case "EVENT_UPDATE":
      return notification.metadata?.eventId
        ? { label: "Ver evento", route: `/event/${notification.metadata.eventId}` as const }
        : null;
    default:
      return null;
  }
}

function NotificationItem({ notification, onPress }: { notification: AppNotification; onPress: () => void }) {
  const { colors, radius } = useTheme();
  const appearance = getNotificationAppearance(notification.type, colors);
  const Icon = appearance.icon;

  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${notification.read ? "" : "Nova notificação: "}${notification.title}. ${notification.body}`}
      style={styles.itemPressable}
    >
      <Surface
        radius="lg"
        style={[
          styles.item,
          !notification.read && { backgroundColor: colors.primarySoft, borderColor: colors.primary },
        ]}
      >
        <View
          style={[
            styles.iconBox,
            { backgroundColor: appearance.backgroundColor, borderRadius: radius.md },
          ]}
        >
          <Icon color={appearance.color} size={20} strokeWidth={1.75} />
        </View>

        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text token={notification.read ? "bodySm" : "label"} style={styles.itemTitle} numberOfLines={2}>
              {notification.title}
            </Text>
            {!notification.read ? (
              <View
                accessibilityLabel="Não lida"
                style={[styles.unreadDot, { backgroundColor: colors.primaryText }]}
              />
            ) : null}
          </View>
          <Text token="bodySm" color="muted" numberOfLines={3}>
            {notification.body}
          </Text>
          <Text token="caption" color="muted" style={styles.time}>
            {formatTimeAgo(notification.createdAt)}
          </Text>
        </View>
      </Surface>
    </PressScale>
  );
}

function NotificationSkeleton() {
  const { colors, radius } = useTheme();

  return (
    <View style={[styles.skeletonItem, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <Skeleton width={44} height={44} radius={radius.md} />
      <View style={styles.skeletonContent}>
        <Skeleton width="58%" height={14} />
        <Skeleton height={12} style={styles.skeletonLine} />
        <Skeleton width="76%" height={12} />
        <Skeleton width={48} height={10} style={styles.skeletonTime} />
      </View>
    </View>
  );
}

function NotificationDetails({ notification, onClose, onOpenAction }: {
  notification: AppNotification | null;
  onClose: () => void;
  onOpenAction: (notification: AppNotification) => void;
}) {
  const { colors, radius } = useTheme();

  if (!notification) return null;

  const appearance = getNotificationAppearance(notification.type, colors);
  const action = getNotificationAction(notification);
  const Icon = appearance.icon;

  return (
    <BottomSheet visible title="Detalhes da notificação" onClose={onClose}>
      <View style={styles.detailsContent}>
        <View
          style={[
            styles.detailsIcon,
            { backgroundColor: appearance.backgroundColor, borderRadius: radius.lg },
          ]}
        >
          <Icon color={appearance.color} size={28} strokeWidth={1.75} />
        </View>

        <Text token="title" accessibilityRole="header">
          {notification.title}
        </Text>
        <Text token="caption" color="muted" style={styles.detailsDate}>
          {formatNotificationDate(notification.createdAt)}
        </Text>

        <Surface alt radius="lg" style={styles.messageBox}>
          <Text token="body" style={styles.messageText}>
            {notification.body}
          </Text>
        </Surface>

        <View style={styles.detailsActions}>
          <Button label="Fechar" variant="secondary" fullWidth onPress={onClose} />
          {action ? (
            <Button
              label={action.label}
              fullWidth
              onPress={() => onOpenAction(notification)}
            />
          ) : null}
        </View>
      </View>
    </BottomSheet>
  );
}

export default function NotificationsScreen() {
  useScreenLog();
  const router = useRouter();
  const { colors } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const { data, isLoading, refetch, isRefetching } = useNotifications();
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllRead();
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handlePress = (notification: AppNotification) => {
    if (!notification.read) markRead(notification.id);

    setSelectedNotification(notification);
  };

  const handleOpenAction = (notification: AppNotification) => {
    const action = getNotificationAction(notification);
    if (!action) return;

    setSelectedNotification(null);
    router.push(action.route);
  };

  return (
    <Screen edges={["left", "right"]}>
      <StatusBar style="auto" />
      <TopBar
        title="Notificações"
        variant="detail"
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace("/(tabs)/profile");
        }}
        actions={isAuthenticated && unreadCount > 0 ? [{
          icon: CheckCheck,
          label: markingAll ? "Marcando notificações como lidas" : "Marcar todas como lidas",
          onPress: () => markAllRead(),
        }] : []}
      />

      {!isAuthenticated ? (
        <View style={styles.centeredState}>
          <EmptyState
            icon={Bell}
            title="Faça login para ver notificações"
            description="Suas notificações de eventos e compras aparecerão aqui."
          />
          <View style={styles.loginButton}>
            <Button label="Entrar" fullWidth onPress={() => router.push("/login-modal")} />
          </View>
        </View>
      ) : isLoading ? (
        <View accessibilityLabel="Carregando notificações" style={styles.skeletonList}>
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centeredState}>
          <EmptyState
            icon={CheckCircle2}
            title="Tudo em dia!"
            description="Você não tem notificações no momento."
          />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationItem notification={item} onPress={() => handlePress(item)} />}
          onRefresh={refetch}
          refreshing={isRefetching}
          progressViewOffset={8}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={{ backgroundColor: colors.background }}
        />
      )}

      <NotificationDetails
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onOpenAction={handleOpenAction}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 10 },
  itemPressable: { width: "100%" },
  item: { flexDirection: "row", gap: 12, padding: 14 },
  iconBox: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  itemContent: { flex: 1 },
  itemHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  itemTitle: { flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 999, marginTop: 6 },
  time: { marginTop: 8, letterSpacing: 0 },
  skeletonList: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  skeletonItem: { flexDirection: "row", gap: 12, padding: 14, borderWidth: 1 },
  skeletonContent: { flex: 1 },
  skeletonLine: { marginTop: 10, marginBottom: 7 },
  skeletonTime: { marginTop: 10 },
  centeredState: { flex: 1, justifyContent: "center", paddingBottom: 48 },
  loginButton: { paddingHorizontal: 24, marginTop: -20 },
  detailsContent: { paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  detailsIcon: { width: 56, height: 56, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  detailsDate: { letterSpacing: 0, textTransform: "none" },
  messageBox: { marginTop: 12, padding: 16 },
  messageText: { lineHeight: 24 },
  detailsActions: { gap: 10, marginTop: 16 },
});
