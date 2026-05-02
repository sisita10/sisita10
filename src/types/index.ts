export type {
  Company,
  Contact,
  Shipment,
  Activity,
  Tag,
  CompanyTag,
  CompanyType,
  LeadStatus,
  LeadSource,
  ActivityType,
} from "@prisma/client";

export interface CompanyWithRelations {
  id: string;
  name: string;
  website: string | null;
  country: string;
  city: string | null;
  type: import("@prisma/client").CompanyType;
  status: import("@prisma/client").LeadStatus;
  source: import("@prisma/client").LeadSource;
  hsCodes: string[];
  annualVolumeUsd: number | null;
  employeeCount: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  contacts: import("@prisma/client").Contact[];
  shipments: import("@prisma/client").Shipment[];
  tags: Array<{ tag: import("@prisma/client").Tag }>;
  _count: { shipments: number; activities: number };
}

export interface DashboardStats {
  totalLeads: number;
  newThisWeek: number;
  qualified: number;
  byCountry: Array<{ country: string; _count: { id: number } }>;
  bySource: Array<{ source: string; _count: { id: number } }>;
  byStatus: Array<{ status: string; _count: { id: number } }>;
}

export interface LeadFilters {
  search?: string;
  country?: string;
  type?: string;
  status?: string;
  source?: string;
  hsCode?: string;
  page?: number;
  limit?: number;
}
