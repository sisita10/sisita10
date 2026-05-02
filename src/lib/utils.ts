import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export const FMCG_HS_CODES: Record<string, string> = {
  "16": "Preparados de carne/pescado",
  "17": "Azúcares y confitería",
  "18": "Cacao y chocolate",
  "19": "Preparados de cereales",
  "20": "Conservas vegetales y frutas",
  "21": "Preparados alimenticios diversos",
  "22": "Bebidas",
  "23": "Residuos industria alimentaria",
  "33": "Perfumería y cosmética",
  "34": "Jabones y detergentes",
};
