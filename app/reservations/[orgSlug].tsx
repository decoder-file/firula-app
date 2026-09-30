import { Stack } from "expo-router";

import { ReservationsScreen } from "@/features/reservations";
import { useScreenLog } from "@/hooks/useScreenLog";

export default function ReservationsRoute() {
  useScreenLog();
  return <><Stack.Screen options={{ headerShown: false }} /><ReservationsScreen /></>;
}
