import React from "react";

import { HomeScreen, useHomeRouteProps } from "@/features/home";

export default function HomeRoute() {
  const props = useHomeRouteProps();
  return <HomeScreen {...props} />;
}
