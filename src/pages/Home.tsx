import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GPU Deployment Dashboard</h2>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GPUs Deployed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9,580</div>
            <p className="text-xs text-muted-foreground">+12.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Datacenters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+3 new this quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Power Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127.5 MW</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.4%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>
      </div>
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
    </div>
  );
}