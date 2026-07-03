import React from "react";

import { ExploreScreen, useExploreRouteProps } from "@/features/explore";

export default function ExploreRoute() {
  const props = useExploreRouteProps();
  return <ExploreScreen {...props} />;
}
