import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = true,
  variant = "default",
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "danger":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getVariantByValue = () => {
    if (percentage >= 90) return "danger";
    if (percentage >= 75) return "warning";
    if (percentage >= 50) return "default";
    return "success";
  };

  const actualVariant = variant === "default" ? getVariantByValue() : variant;
  const barColorClass = getVariantStyles();

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "h-1";
      case "lg":
        return "h-4";
      default:
        return "h-2";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-muted-foreground">
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          getSizeStyles()
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out rounded-full",
            actualVariant === "success"
              ? "bg-green-500"
              : actualVariant === "warning"
              ? "bg-yellow-500"
              : actualVariant === "danger"
              ? "bg-red-500"
              : "bg-blue-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}