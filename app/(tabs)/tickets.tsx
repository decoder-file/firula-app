import React from "react";

import { TicketsScreen, useTicketsRouteProps } from "@/features/tickets";

export default function TicketsRoute() {
  const props = useTicketsRouteProps();
  return <TicketsScreen {...props} />;
}
