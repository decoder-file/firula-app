import React from "react";
import { Stack } from "expo-router";

import { useScreenLog } from "@/hooks/useScreenLog";
import { OrganizerProfileScreen, useOrganizerProfileRouteProps } from "@/features/organizer-profile";

export default function OrganizerProfileRoute() {
  useScreenLog();
  const props = useOrganizerProfileRouteProps();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <OrganizerProfileScreen {...props} />
    </>
  );
}
