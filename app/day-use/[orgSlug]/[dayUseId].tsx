import { Stack } from "expo-router";

import { DayUseCheckoutScreen } from "@/features/day-use";
import { useScreenLog } from "@/hooks/useScreenLog";

export default function DayUseCheckoutRoute() {
  useScreenLog();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <DayUseCheckoutScreen />
    </>
  );
}
