import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Sparkline } from "@/components/ui/sparkline";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change?: number;
  changeLabel?: string;
  sparklineData?: number[];
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
  className?: string;
}

export function KPICard({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  change,
  changeLabel,
  sparklineData,
  icon: Icon,
  trend,
  onClick,
  className,
}: KPICardProps) {
  // Determine trend if not provided
  const actualTrend = trend || (change ? (change > 0 ? "up" : change < 0 ? "down" : "neutral") : "neutral");
  
  const TrendIcon = actualTrend === "up" ? TrendingUp : actualTrend === "down" ? TrendingDown : Minus;
  
  const trendColor = actualTrend === "up" 
    ? "text-green-500" 
    : actualTrend === "down" 
    ? "text-red-500" 
    : "text-muted-foreground";

  const cardContent = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Icon className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              className="text-2xl font-bold"
              duration={1.5}
            />
            {sparklineData && sparklineData.length > 0 && (
              <div className="ml-4">
                <Sparkline
                  data={sparklineData}
                  width={80}
                  height={30}
                  strokeColor="hsl(var(--primary))"
                />
              </div>
            )}
          </div>
          
          {(change !== undefined || changeLabel) && (
            <motion.div 
              className="flex items-center space-x-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <TrendIcon className={cn("h-3 w-3", trendColor)} />
              {change !== undefined && (
                <span className={cn("text-xs font-medium", trendColor)}>
                  {change > 0 ? "+" : ""}{change}%
                </span>
              )}
              {changeLabel && (
                <span className="text-xs text-muted-foreground">
                  {changeLabel}
                </span>
              )}
            </motion.div>
          )}
        </div>
      </CardContent>
    </>
  );

  if (onClick) {
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
          className
        )}
        onClick={onClick}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <Card className={className}>
      {cardContent}
    </Card>
  );
}