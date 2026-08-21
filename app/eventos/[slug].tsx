import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Ponte de Universal/App Link: firula.com.br/eventos/:slug usa esse nome de
 * segmento no site, mas a rota interna do app é /event/:slug (app/event/[slug]).
 */
export default function EventosLinkBridge() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  return <Redirect href={`/event/${slug}`} />;
}
