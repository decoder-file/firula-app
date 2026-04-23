import { PlaceholderScreen } from "@/components/PlaceholderScreen";
import { useScreenLog } from "@/hooks/useScreenLog";

export default function FavoritesScreen() {
  useScreenLog();
  return <PlaceholderScreen title="Favoritos" description="A navegação para favoritos já existe. O próximo passo é portar a listagem de eventos salvos com persistência local ou backend." />;
}