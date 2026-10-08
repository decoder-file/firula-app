import { Redirect, useLocalSearchParams } from "expo-router";
import { normalizeLinkCoupon } from "@/utils/linkCoupon";

/**
 * Ponte de Universal/App Link: firula.com.br/eventos/:slug usa esse nome de
 * segmento no site, mas a rota interna do app é /event/:slug (app/event/[slug]).
 */
export default function EventosLinkBridge() {
  // `cupom` vem do "Compartilhar cupom" do painel; repassa para a tela do evento.
  const { slug, cupom, coupon } = useLocalSearchParams<{ slug: string; cupom?: string; coupon?: string }>();
  const code = normalizeLinkCoupon(cupom ?? coupon);

  return <Redirect href={{ pathname: "/event/[slug]", params: code ? { slug, cupom: code } : { slug } } as never} />;
}
