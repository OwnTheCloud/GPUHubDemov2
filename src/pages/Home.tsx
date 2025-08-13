import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { KPICard } from "@/components/ui/kpi-card";
import { Cpu, Database, Zap, Activity, TrendingUp, Calendar, Server } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PageWrapper } from "@/components/page-wrapper";

const gpuDeploymentData = [
  { date: "2023-07-15", h100: 1200, a100: 800, h200: 150, gb200: 50 },
  { date: "2023-08-01", h100: 1350, a100: 850, h200: 180, gb200: 60 },
  { date: "2023-08-15", h100: 1480, a100: 920, h200: 220, gb200: 70 },
  { date: "2023-09-01", h100: 1620, a100: 980, h200: 250, gb200: 80 },
  { date: "2023-09-15", h100: 1750, a100: 1050, h200: 280, gb200: 85 },
  { date: "2023-10-01", h100: 1890, a100: 1120, h200: 320, gb200: 90 },
  { date: "2023-10-15", h100: 2020, a100: 1180, h200: 350, gb200: 95 },
  { date: "2023-11-01", h100: 2180, a100: 1250, h200: 380, gb200: 100 },
  { date: "2023-11-15", h100: 2320, a100: 1320, h200: 410, gb200: 105 },
  { date: "2023-12-01", h100: 2480, a100: 1380, h200: 430, gb200: 110 },
  { date: "2023-12-15", h100: 2620, a100: 1450, h200: 440, gb200: 115 },
  { date: "2024-01-01", h100: 2840, a100: 1520, h200: 450, gb200: 120 },
  { date: "2024-01-15", h100: 2920, a100: 1580, h200: 480, gb200: 140 },
  { date: "2024-02-01", h100: 3200, a100: 1680, h200: 580, gb200: 240 },
  { date: "2024-02-15", h100: 3380, a100: 1720, h200: 620, gb200: 280 },
  { date: "2024-03-01", h100: 3850, a100: 1820, h200: 720, gb200: 380 },
  { date: "2024-03-15", h100: 3950, a100: 1880, h200: 780, gb200: 420 },
  { date: "2024-04-01", h100: 4200, a100: 1950, h200: 890, gb200: 520 },
  { date: "2024-04-15", h100: 4350, a100: 2020, h200: 950, gb200: 580 },
  { date: "2024-05-01", h100: 4750, a100: 2100, h200: 1100, gb200: 680 },
  { date: "2024-05-15", h100: 4920, a100: 2150, h200: 1180, gb200: 750 },
  { date: "2024-06-01", h100: 5200, a100: 2250, h200: 1280, gb200: 850 },
  { date: "2024-06-15", h100: 5380, a100: 2320, h200: 1350, gb200: 920 },
  { date: "2024-07-01", h100: 5580, a100: 2420, h200: 1450, gb200: 1020 },
  { date: "2024-07-15", h100: 5750, a100: 2480, h200: 1520, gb200: 1080 },
];

const chartConfig = {
  gpuDeployments: {
    label: "GPU Deployments",
  },
  h100: {
    label: "H100",
    color: "hsl(var(--chart-1))",
  },
  a100: {
    label: "A100",
    color: "hsl(var(--chart-2))",
  },
  h200: {
    label: "H200",
    color: "hsl(var(--chart-3))",
  },
  gb200: {
    label: "GB200",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function Home() {
  const [timeRange, setTimeRange] = React.useState("6m");
  const [selectedDataPoint, setSelectedDataPoint] = React.useState<typeof gpuDeploymentData[0] | null>(null);
  const [drillDownOpen, setDrillDownOpen] = React.useState(false);

  const filteredData = gpuDeploymentData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-07-15");
    let daysToSubtract = 180; // 6 months default
    if (timeRange === "1y") {
      daysToSubtract = 365;
    } else if (timeRange === "3m") {
      daysToSubtract = 90;
    } else if (timeRange === "1m") {
      daysToSubtract = 30;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  // Generate sparkline data for KPI cards
  const totalGPUsSparkline = gpuDeploymentData.slice(-10).map(d => d.h100 + d.a100 + d.h200 + d.gb200);
  const datacenterSparkline = [42, 43, 44, 44, 45, 45, 46, 47, 47, 47];
  const powerSparkline = [115.2, 117.8, 119.3, 121.5, 122.8, 124.1, 125.3, 126.2, 127.0, 127.5];
  const utilizationSparkline = [82.5, 83.1, 84.2, 85.0, 85.8, 86.3, 86.9, 87.1, 87.3, 87.4];

  const handleChartClick = (data: { activePayload?: Array<{ payload: typeof gpuDeploymentData[0] }> }) => {
    if (data && data.activePayload) {
      setSelectedDataPoint(data.activePayload[0].payload);
      setDrillDownOpen(true);
    }
  };

  return (
    <PageWrapper title="GPU Deployment Dashboard">
      <motion.div 
        className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <KPICard
            title="Total GPUs Deployed"
            value={9580}
            change={12.3}
            changeLabel="from last month"
            sparklineData={totalGPUsSparkline}
            icon={Cpu}
            trend="up"
            onClick={() => console.log("View GPU details")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <KPICard
            title="Active Datacenters"
            value={47}
            changeLabel="+3 new this quarter"
            sparklineData={datacenterSparkline}
            icon={Database}
            trend="up"
            onClick={() => console.log("View datacenter details")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <KPICard
            title="Power Consumption"
            value={127.5}
            suffix=" MW"
            decimals={1}
            change={8.2}
            changeLabel="from last month"
            sparklineData={powerSparkline}
            icon={Zap}
            trend="up"
            onClick={() => console.log("View power details")}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <KPICard
            title="Utilization Rate"
            value={87.4}
            suffix="%"
            decimals={1}
            change={2.1}
            changeLabel="from last week"
            sparklineData={utilizationSparkline}
            icon={Activity}
            trend="up"
            onClick={() => console.log("View utilization details")}
          />
        </motion.div>
      </motion.div>
      <div className="flex gap-4">
        <Card className="flex-[3] min-w-0">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>GPU Deployment Trends</CardTitle>
              <CardDescription>
                Showing GPU deployments for the selected time period
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[160px] rounded-lg sm:ml-auto"
                aria-label="Select a time range"
              >
                <SelectValue placeholder="Last 6 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="1y" className="rounded-lg">
                  Last 1 year
                </SelectItem>
                <SelectItem value="6m" className="rounded-lg">
                  Last 6 months
                </SelectItem>
                <SelectItem value="3m" className="rounded-lg">
                  Last 3 months
                </SelectItem>
                <SelectItem value="1m" className="rounded-lg">
                  Last month
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
              <AreaChart
                accessibilityLayer
                data={filteredData}
                margin={{
                  left: 12,
                  right: 12,
                }}
                onClick={handleChartClick}
                style={{ cursor: "pointer" }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                      indicator="dot"
                    />
                  }
                />
                <defs>
                  <linearGradient id="fillGB200" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-gb200)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-gb200)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillH200" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-h200)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-h200)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillA100" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-a100)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-a100)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillH100" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-h100)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-h100)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="gb200"
                  type="natural"
                  fill="url(#fillGB200)"
                  fillOpacity={0.4}
                  stroke="var(--color-gb200)"
                  stackId="a"
                />
                <Area
                  dataKey="h200"
                  type="natural"
                  fill="url(#fillH200)"
                  fillOpacity={0.4}
                  stroke="var(--color-h200)"
                  stackId="a"
                />
                <Area
                  dataKey="a100"
                  type="natural"
                  fill="url(#fillA100)"
                  fillOpacity={0.4}
                  stroke="var(--color-a100)"
                  stackId="a"
                />
                <Area
                  dataKey="h100"
                  type="natural"
                  fill="url(#fillH100)"
                  fillOpacity={0.4}
                  stroke="var(--color-h100)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-0">
          <CardHeader>
            <CardTitle>Recent Deployments</CardTitle>
            <CardDescription>Latest GPU deployments across regions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">US-East-1 Datacenter</p>
                <p className="text-xs text-muted-foreground">128x H100 deployed</p>
              </div>
              <div className="text-xs text-muted-foreground">2h ago</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">EU-Central-1 Datacenter</p>
                <p className="text-xs text-muted-foreground">64x GB200 deployed</p>
              </div>
              <div className="text-xs text-muted-foreground">4h ago</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">APAC-Southeast-1</p>
                <p className="text-xs text-muted-foreground">96x H200 deployed</p>
              </div>
              <div className="text-xs text-muted-foreground">6h ago</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">US-West-2 Datacenter</p>
                <p className="text-xs text-muted-foreground">192x A100 deployed</p>
              </div>
              <div className="text-xs text-muted-foreground">8h ago</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drill-down Dialog */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              GPU Deployment Details - {selectedDataPoint?.date && new Date(selectedDataPoint.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of GPU deployments for the selected date
            </DialogDescription>
          </DialogHeader>
          
          {selectedDataPoint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">H100</Badge>
                  </div>
                  <p className="text-2xl font-bold">{selectedDataPoint.h100}</p>
                  <p className="text-xs text-muted-foreground">Units deployed</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">A100</Badge>
                  </div>
                  <p className="text-2xl font-bold">{selectedDataPoint.a100}</p>
                  <p className="text-xs text-muted-foreground">Units deployed</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">H200</Badge>
                  </div>
                  <p className="text-2xl font-bold">{selectedDataPoint.h200}</p>
                  <p className="text-xs text-muted-foreground">Units deployed</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="default">GB200</Badge>
                  </div>
                  <p className="text-2xl font-bold">{selectedDataPoint.gb200}</p>
                  <p className="text-xs text-muted-foreground">Units deployed</p>
                </motion.div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total GPUs</span>
                  </div>
                  <span className="text-xl font-bold">
                    {selectedDataPoint.h100 + selectedDataPoint.a100 + selectedDataPoint.h200 + selectedDataPoint.gb200}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Deployment Insights</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• H100 GPUs represent {Math.round((selectedDataPoint.h100 / (selectedDataPoint.h100 + selectedDataPoint.a100 + selectedDataPoint.h200 + selectedDataPoint.gb200)) * 100)}% of total deployment</li>
                  <li>• GB200 adoption growing at {Math.round(selectedDataPoint.gb200 / 10)}% monthly rate</li>
                  <li>• Power efficiency improved by 15% with newer GPU models</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}