import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  delta?: string;
  positive?: boolean;
  className?: string;
}

export function StatsCard({ label, value, delta, positive, className }: StatsCardProps) {
  return (
    <div className={cn("rounded-lg border border-zinc-800 bg-zinc-900 p-5", className)}>
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {delta && (
        <p className={cn("mt-1 text-xs", positive ? "text-green-400" : "text-red-400")}>
          {delta}
        </p>
      )}
    </div>
  );
}
