import { cn } from "@/lib/utils";

const variants = {
  default: "bg-zinc-700 text-zinc-200",
  indigo: "bg-indigo-500/20 text-indigo-300",
  green: "bg-green-500/20 text-green-300",
  yellow: "bg-yellow-500/20 text-yellow-300",
  red: "bg-red-500/20 text-red-300",
  blue: "bg-blue-500/20 text-blue-300",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
