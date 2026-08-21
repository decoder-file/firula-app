import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Ponte de Universal/App Link: firula.com.br/pagina-produtor/:slug usa esse
 * nome de segmento no site, mas a rota interna do app é /organizer/:id
 * (app/organizer/[id]) — apesar do nome do arquivo, esse param já é tratado
 * como slug (useOrganizerProfileRouteProps chama GET /public/organizations/:slug,
 * sem nenhum lookup de id), então dá pra repassar direto.
 */
export default function PaginaProdutorLinkBridge() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  return <Redirect href={`/organizer/${slug}`} />;
}
