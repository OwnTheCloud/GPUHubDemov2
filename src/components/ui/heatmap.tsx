import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapCell {
  x: string;
  y: string;
  value: number;
  label?: string;
}

interface HeatmapProps {
  data: HeatmapCell[];
  xLabels: string[];
  yLabels: string[];
  colorScale?: {
    min: string;
    mid?: string;
    max: string;
  };
  showValues?: boolean;
  cellSize?: number;
  gap?: number;
  title?: string;
  className?: string;
}

export function Heatmap({
  data,
  xLabels,
  yLabels,
  colorScale = {
    min: "hsl(var(--primary) / 0.1)",
    mid: "hsl(var(--primary) / 0.5)",
    max: "hsl(var(--primary))",
  },
  showValues = false,
  cellSize = 40,
  gap = 2,
  title,
  className,
}: HeatmapProps) {
  const { dataMap, minValue, maxValue } = useMemo(() => {
    const map = new Map<string, HeatmapCell>();
    let min = Infinity;
    let max = -Infinity;
    
    data.forEach((cell) => {
      const key = `${cell.x}-${cell.y}`;
      map.set(key, cell);
      min = Math.min(min, cell.value);
      max = Math.max(max, cell.value);
    });
    
    return { dataMap: map, minValue: min, maxValue: max };
  }, [data]);

  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    
    if (!colorScale.mid) {
      // Linear interpolation between min and max
      return `rgba(var(--primary-rgb), ${0.1 + normalized * 0.9})`;
    }
    
    // Use provided color scale
    if (normalized < 0.5) {
      return colorScale.min;
    } else if (normalized < 0.8) {
      return colorScale.mid;
    } else {
      return colorScale.max;
    }
  };

  const width = xLabels.length * (cellSize + gap) + 100;
  const height = yLabels.length * (cellSize + gap) + 80;

  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      )}
      <svg width={width} height={height} className="overflow-visible">
        {/* X-axis labels */}
        {xLabels.map((label, i) => (
          <text
            key={`x-${i}`}
            x={100 + i * (cellSize + gap) + cellSize / 2}
            y={25}
            textAnchor="middle"
            className="text-xs fill-muted-foreground"
          >
            {label}
          </text>
        ))}
        
        {/* Y-axis labels */}
        {yLabels.map((label, i) => (
          <text
            key={`y-${i}`}
            x={90}
            y={40 + i * (cellSize + gap) + cellSize / 2}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-xs fill-muted-foreground"
          >
            {label}
          </text>
        ))}
        
        {/* Heatmap cells */}
        <TooltipProvider>
          {yLabels.map((yLabel, yIndex) =>
            xLabels.map((xLabel, xIndex) => {
              const key = `${xLabel}-${yLabel}`;
              const cell = dataMap.get(key);
              const value = cell?.value || 0;
              const x = 100 + xIndex * (cellSize + gap);
              const y = 40 + yIndex * (cellSize + gap);
              
              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <motion.g
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: (xIndex + yIndex) * 0.01,
                        duration: 0.3,
                      }}
                    >
                      <rect
                        x={x}
                        y={y}
                        width={cellSize}
                        height={cellSize}
                        rx={4}
                        fill={getColor(value)}
                        className="cursor-pointer hover:stroke-primary hover:stroke-2 transition-all"
                      />
                      {showValues && (
                        <text
                          x={x + cellSize / 2}
                          y={y + cellSize / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs fill-foreground font-medium pointer-events-none"
                        >
                          {value}
                        </text>
                      )}
                    </motion.g>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {xLabel} / {yLabel}
                      </p>
                      <p className="text-sm">
                        Value: <span className="font-bold">{value}</span>
                      </p>
                      {cell?.label && (
                        <p className="text-xs text-muted-foreground">
                          {cell.label}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })
          )}
        </TooltipProvider>
        
        {/* Legend */}
        <g transform={`translate(${width - 150}, ${height - 40})`}>
          <defs>
            <linearGradient id="legendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorScale.min} />
              {colorScale.mid && <stop offset="50%" stopColor={colorScale.mid} />}
              <stop offset="100%" stopColor={colorScale.max} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="10" fill="url(#legendGradient)" rx="2" />
          <text x="0" y="25" className="text-xs fill-muted-foreground">
            {minValue}
          </text>
          <text x="100" y="25" textAnchor="end" className="text-xs fill-muted-foreground">
            {maxValue}
          </text>
          <text x="50" y="25" textAnchor="middle" className="text-xs fill-muted-foreground">
            Utilization %
          </text>
        </g>
      </svg>
    </div>
  );
}