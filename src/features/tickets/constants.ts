import type { TicketStatus } from "@/features/tickets/types";

export type TabKey = "active" | "used" | "all";

export const TABS: { id: TabKey; label: string }[] = [
  { id: "active", label: "Ativos" },
  { id: "used", label: "Usados" },
  { id: "all", label: "Todos" },
];

export const STATUS_LABEL: Record<TicketStatus, string> = {
  active: "Válido",
  used: "Usado",
};
