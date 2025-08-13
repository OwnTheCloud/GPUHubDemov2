import { useMemo } from "react";
import { motion } from "framer-motion";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  showDots?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  strokeColor = "hsl(var(--primary))",
  strokeWidth = 2,
  fillColor = "hsl(var(--primary) / 0.1)",
  showDots = false,
  className = "",
}: SparklineProps) {
  const { pathD, fillPathD, dots } = useMemo(() => {
    if (!data || data.length === 0) {
      return { pathD: "", fillPathD: "", dots: [] };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y, value };
    });

    const pathPoints = points
      .map((point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        
        // Create smooth curves using cubic bezier
        const prevPoint = points[index - 1];
        const controlX1 = prevPoint.x + (point.x - prevPoint.x) / 3;
        const controlY1 = prevPoint.y;
        const controlX2 = prevPoint.x - (point.x - prevPoint.x) / 3;
        const controlY2 = point.y;
        
        return `C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${point.x} ${point.y}`;
      })
      .join(" ");

    const fillPath = `${pathPoints} L ${width} ${height} L 0 ${height} Z`;

    return {
      pathD: pathPoints,
      fillPathD: fillPath,
      dots: points,
    };
  }, [data, width, height]);

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-xs text-muted-foreground">No data</span>
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <motion.path
        d={fillPathD}
        fill="url(#sparklineGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* Dots */}
      {showDots && dots.map((dot, index) => (
        <motion.circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r={3}
          fill={strokeColor}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        />
      ))}

      {/* Hover area for last point */}
      {dots.length > 0 && (
        <g>
          <circle
            cx={dots[dots.length - 1].x}
            cy={dots[dots.length - 1].y}
            r={4}
            fill={strokeColor}
            className="opacity-0 hover:opacity-100 transition-opacity"
          />
          <title>{`Current: ${dots[dots.length - 1].value}`}</title>
        </g>
      )}
    </svg>
  );
}