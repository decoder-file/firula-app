import { Stack } from "expo-router";

import { CourtBookingCheckoutScreen } from "@/features/court-booking";
import { useScreenLog } from "@/hooks/useScreenLog";

export default function CourtBookingCheckoutRoute() {
  useScreenLog();
  return <><Stack.Screen options={{ headerShown: false }} /><CourtBookingCheckoutScreen /></>;
}
