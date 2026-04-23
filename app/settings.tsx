import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { useScreenLog } from "@/hooks/useScreenLog";

export default function SettingsScreen() {
  useScreenLog();
  return <PlaceholderScreen title="Configurações" description="A tela de configurações foi reservada e pode receber preferências, toggles e opções nativas na próxima etapa." />;
}