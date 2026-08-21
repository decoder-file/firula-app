import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Ponte de Universal/App Link: firula.com.br/pagina-perfil/:username usa esse
 * nome de segmento no site, mas a rota interna do app é /player/:username
 * (app/player/[username]).
 */
export default function PaginaPerfilLinkBridge() {
  const { username } = useLocalSearchParams<{ username: string }>();

  return <Redirect href={`/player/${username}`} />;
}
