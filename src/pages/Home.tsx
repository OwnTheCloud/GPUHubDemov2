import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const gpuDeploymentData = [
  { month: "January", h100: 2840, a100: 1520, h200: 450, gb200: 120 },
  { month: "February", h100: 3200, a100: 1680, h200: 580, gb200: 240 },
  { month: "March", h100: 3850, a100: 1820, h200: 720, gb200: 380 },
  { month: "April", h100: 4200, a100: 1950, h200: 890, gb200: 520 },
  { month: "May", h100: 4750, a100: 2100, h200: 1100, gb200: 680 },
  { month: "June", h100: 5200, a100: 2250, h200: 1280, gb200: 850 },
];

const chartConfig = {
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
  return (
    <div className="w-full h-full space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GPU Deployment Dashboard</h2>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
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
      <div className="flex gap-4 w-full">
        <Card className="flex-[2] min-w-0">
          <CardHeader>
            <CardTitle>GPU Deployment Trends</CardTitle>
            <CardDescription>Monthly GPU deployments by model for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full">
              <AreaChart
                accessibilityLayer
                data={gpuDeploymentData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <defs>
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