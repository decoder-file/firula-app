import React from "react";

import { GlobalSearchScreen, useGlobalSearchRouteProps } from "@/features/global-search";

export default function SearchRoute() {
  const props = useGlobalSearchRouteProps();
  return <GlobalSearchScreen {...props} />;
}
