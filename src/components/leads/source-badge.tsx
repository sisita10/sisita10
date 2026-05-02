import { LeadSource } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const sourceConfig: Record<LeadSource, string> = {
  CUSTOMS_DATA: "Aduanas",
  GOOGLE_MAPS: "Google Maps",
  LINKEDIN: "LinkedIn",
  MANUAL: "Manual",
  APOLLO: "Apollo.io",
  TRADE_ATLAS: "TradeAtlas",
  CSV_IMPORT: "CSV",
};

export function SourceBadge({ source }: { source: LeadSource }) {
  return <Badge variant="default">{sourceConfig[source]}</Badge>;
}
