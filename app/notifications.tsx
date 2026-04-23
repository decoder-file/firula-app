import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { useScreenLog } from "@/hooks/useScreenLog";

export default function NotificationsScreen() {
  useScreenLog();
  return <PlaceholderScreen title="Notificações" description="A tela de notificações já está roteada e pronta para receber os dados reais e estados detalhados." />;
}