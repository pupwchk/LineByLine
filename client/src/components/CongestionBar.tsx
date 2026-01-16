import { getCongestionColor } from "@/lib/mock-data";

interface CongestionBarProps {
  level: number;
  size?: "small" | "medium" | "large";
}

export function CongestionBar({ level, size = "medium" }: CongestionBarProps) {
  const sizeClasses = {
    small: { bar: "w-1 h-4", gap: "gap-0.5" },
    medium: { bar: "w-1.5 h-6", gap: "gap-1" },
    large: { bar: "w-2 h-8", gap: "gap-1.5" },
  };

  const { bar, gap } = sizeClasses[size];
  const color = getCongestionColor(level);

  return (
    <div className={`flex ${gap}`} data-testid="congestion-bar">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`${bar} rounded-full transition-colors duration-300 ${
            i <= level ? color : "bg-muted dark:bg-muted"
          }`}
        />
      ))}
    </div>
  );
}
