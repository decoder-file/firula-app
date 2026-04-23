import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { useScreenLog } from "@/hooks/useScreenLog";

export default function FacialIdScreen() {
  useScreenLog();
  return <PlaceholderScreen title="Facial ID Firula" description="O fluxo obrigatório para eventos já foi portado no detalhe do evento. Aqui ficará a tela dedicada de gestão biométrica." />;
}