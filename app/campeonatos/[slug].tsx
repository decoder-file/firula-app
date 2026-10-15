import { Stack, useLocalSearchParams } from "expo-router";

import { ChampionshipScreen } from "@/features/championship";

/** firula.com.br/campeonatos/:slug?categoria=&aba= abre aqui pelo Universal/App Link. */
export default function CampeonatoRoute() {
  const { slug, categoria, aba } = useLocalSearchParams<{ slug: string; categoria?: string; aba?: string }>();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChampionshipScreen slug={slug} initialCategoryId={categoria} initialTab={aba} />
    </>
  );
}
