import { useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  CheckCircle2,
  Info,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from "lucide-react-native";
import { FlatList, Text, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { FormButton } from "@/components/ui/FormButton";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { useMarkAllRead, useMarkRead, useNotifications } from "@/hooks/useNotifications";
import { useScreenLog } from "@/hooks/useScreenLog";
import type { AppNotification } from "@/services/notifications.service";
import { colors } from "@/theme/colors";

const TYPE_CONFIG: Record<
  AppNotification["type"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  ORDER_PAID: { icon: ShoppingBag, color: "#16a34a", bg: "#dcfce7" },
  ORDER_CANCELED: { icon: XCircle, color: "#dc2626", bg: "#fee2e2" },
  REFUND_COMPLETED: { icon: RefreshCw, color: "#16a34a", bg: "#dcfce7" },
  REFUND_FAILED: { icon: AlertCircle, color: "#dc2626", bg: "#fee2e2" },
  TICKET_TRANSFERRED_IN: { icon: ArrowDownToLine, color: "#2563eb", bg: "#dbeafe" },
  TICKET_TRANSFERRED_OUT: { icon: ArrowUpFromLine, color: "#7c3aed", bg: "#ede9fe" },
  EVENT_UPDATE: { icon: Info, color: "#d97706", bg: "#fef3c7" },
};

function NotificationItem({ notification, onPress }: { notification: AppNotification; onPress: () => void }) {
  const config = TYPE_CONFIG[notification.type];
  const Icon = config?.icon ?? Bell;
  const iconColor = config?.color ?? colors.mutedForeground;
  const iconBg = config?.bg ?? "#f3f4f6";

  const timeAgo = (() => {
    const diff = Date.now() - new Date(notification.createdAt).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  })();

  return (
    <AnimatedPressable
      onPress={onPress}
      className={`flex-row gap-3 px-4 py-4 ${!notification.read ? "bg-accent/40" : ""}`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: iconBg }}>
        <Icon color={iconColor} size={18} strokeWidth={1.5} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text className={`flex-1 text-sm ${!notification.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text className="text-[11px] text-muted-foreground">{timeAgo}</Text>
        </View>
        <Text className="mt-0.5 text-xs leading-4 text-muted-foreground" numberOfLines={2}>
          {notification.body}
        </Text>
      </View>

      {!notification.read ? (
        <View className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      ) : null}
    </AnimatedPressable>
  );
}

function NotificationSkeleton() {
  return (
    <View className="flex-row gap-3 px-4 py-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-3.5 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-2/3 rounded-full" />
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  useScreenLog();
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  const { data, isLoading, refetch, isRefetching } = useNotifications();
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handlePress = (notification: AppNotification) => {
    if (!notification.read) {
      markRead(notification.id);
    }

    switch (notification.type) {
      case "ORDER_PAID":
      case "ORDER_CANCELED":
      case "REFUND_COMPLETED":
      case "REFUND_FAILED":
        router.push("/(tabs)/tickets");
        break;
      case "TICKET_TRANSFERRED_IN":
        router.push("/(tabs)/tickets");
        break;
      case "TICKET_TRANSFERRED_OUT":
        router.push("/(tabs)/tickets");
        break;
      case "EVENT_UPDATE":
        if (notification.metadata?.eventId) {
          router.push(`/event/${notification.metadata.eventId}`);
        }
        break;
    }
  };

  if (!isAuthenticated) {
    return (
      <Screen edges={["top", "left", "right"]}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Bell color={colors.mutedForeground} size={28} strokeWidth={1.5} />
          </View>
          <Text className="font-bold text-base text-foreground">Faça login para ver notificações</Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            Suas notificações de eventos e compras aparecerão aqui.
          </Text>
          <FormButton className="mt-6 w-full" label="Entrar" onPress={() => router.push("/login")} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-4">
        <View>
          <Text className="font-bold text-lg text-foreground">Notificações</Text>
          {unreadCount > 0 ? (
            <Text className="text-xs text-muted-foreground">{unreadCount} não lida{unreadCount > 1 ? "s" : ""}</Text>
          ) : null}
        </View>
        {unreadCount > 0 ? (
          <AnimatedPressable onPress={() => markAllRead()} disabled={markingAll}>
            <Text className="font-medium text-xs text-primary">Marcar todas como lidas</Text>
          </AnimatedPressable>
        ) : null}
      </View>

      {/* Divider */}
      <View className="h-px bg-border" />

      {isLoading ? (
        <View>
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <CheckCircle2 color={colors.mutedForeground} size={28} strokeWidth={1.5} />
          </View>
          <Text className="font-semibold text-sm text-foreground">Tudo em dia!</Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            Você não tem notificações no momento.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <>
              <NotificationItem notification={item} onPress={() => handlePress(item)} />
              {index < notifications.length - 1 ? <View className="mx-4 h-px bg-border/50" /> : null}
            </>
          )}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </Screen>
  );
}
