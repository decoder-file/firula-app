import React from "react";

import { ProfileScreen, useProfileRouteProps } from "@/features/profile";

export default function ProfileRoute() {
  const props = useProfileRouteProps();
  return <ProfileScreen {...props} />;
}
