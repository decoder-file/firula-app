import React from "react";
import { Stack } from "expo-router";

import { PlayerProfileScreen, usePlayerProfileRouteProps } from "@/features/player-profile";

export default function PlayerProfileRoute() {
  const props = usePlayerProfileRouteProps();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PlayerProfileScreen {...props} />
    </>
  );
}
