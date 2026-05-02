import { LeadStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<LeadStatus, { label: string; variant: "default" | "indigo" | "green" | "yellow" | "red" | "blue" }> = {
  NEW: { label: "Nuevo", variant: "indigo" },
  CONTACTED: { label: "Contactado", variant: "blue" },
  QUALIFIED: { label: "Cualificado", variant: "yellow" },
  PROPOSAL_SENT: { label: "Propuesta enviada", variant: "yellow" },
  NEGOTIATION: { label: "Negociación", variant: "yellow" },
  WON: { label: "Ganado", variant: "green" },
  LOST: { label: "Perdido", variant: "red" },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { label, variant } = statusConfig[status];
  return <Badge variant={variant}>{label}</Badge>;
}
