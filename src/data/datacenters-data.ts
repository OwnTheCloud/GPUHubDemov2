export type Datacenter = {
  id: string;
  name: string;
  region: string;
  type: "Owned" | "Colocation" | "Edge";
  gpuCapacity: number;
  deployedGPUs: number;
  utilization: string;
  powerUsage: string;
  temperature: string;
  liveDate: string;
  status: "Online" | "Maintenance" | "Offline" | "Commissioning";
};

export const datacentersData: Datacenter[] = [
  {
    id: "DC001",
    name: "Virginia Prime",
    region: "US-East-1",
    type: "Owned",
    gpuCapacity: 2048,
    deployedGPUs: 2048,
    utilization: "87.5%",
    powerUsage: "18.4 MW",
    temperature: "22°C",
    liveDate: "2024-01-15",
    status: "Online",
  },
  {
    id: "DC002",
    name: "Oregon Alpha",
    region: "US-West-2",
    type: "Owned",
    gpuCapacity: 1536,
    deployedGPUs: 1536,
    utilization: "75.0%",
    powerUsage: "12.2 MW",
    temperature: "21°C",
    liveDate: "2023-11-20",
    status: "Online",
  },
  {
    id: "DC003",
    name: "Frankfurt Beta",
    region: "EU-Central-1",
    type: "Colocation",
    gpuCapacity: 1024,
    deployedGPUs: 896,
    utilization: "87.5%",
    powerUsage: "16.8 MW",
    temperature: "23°C",
    liveDate: "2024-03-10",
    status: "Online",
  },
  {
    id: "DC004",
    name: "Singapore Gamma",
    region: "APAC-Southeast-1",
    type: "Colocation",
    gpuCapacity: 768,
    deployedGPUs: 576,
    utilization: "75.0%",
    powerUsage: "22.4 MW",
    temperature: "24°C",
    liveDate: "2024-05-01",
    status: "Online",
  },
  {
    id: "DC005",
    name: "Chicago Delta",
    region: "US-Central-1",
    type: "Owned",
    gpuCapacity: 1792,
    deployedGPUs: 1792,
    utilization: "100.0%",
    powerUsage: "15.6 MW",
    temperature: "22°C",
    liveDate: "2024-02-28",
    status: "Online",
  },
  {
    id: "DC006",
    name: "Tokyo Zeta",
    region: "APAC-Northeast-1",
    type: "Colocation",
    gpuCapacity: 768,
    deployedGPUs: 576,
    utilization: "75.0%",
    powerUsage: "18.2 MW",
    temperature: "23°C",
    liveDate: "2024-04-12",
    status: "Online",
  },
  {
    id: "DC007",
    name: "California Eta",
    region: "US-West-1",
    type: "Edge",
    gpuCapacity: 256,
    deployedGPUs: 224,
    utilization: "87.5%",
    powerUsage: "8.4 MW",
    temperature: "25°C",
    liveDate: "2024-06-15",
    status: "Maintenance",
  },
  {
    id: "DC008",
    name: "Ireland Epsilon",
    region: "EU-West-1",
    type: "Owned",
    gpuCapacity: 896,
    deployedGPUs: 0,
    utilization: "0.0%",
    powerUsage: "0.2 MW",
    temperature: "20°C",
    liveDate: "2024-07-20",
    status: "Commissioning",
  },
  {
    id: "DC009",
    name: "Sydney Theta",
    region: "APAC-Southeast-2",
    type: "Colocation",
    gpuCapacity: 512,
    deployedGPUs: 384,
    utilization: "75.0%",
    powerUsage: "14.6 MW",
    temperature: "22°C",
    liveDate: "2024-06-01",
    status: "Online",
  },
];

export const datacenterTypeOptions = [
  { value: "Owned", label: "Owned", variant: "default" as const },
  { value: "Colocation", label: "Colocation", variant: "secondary" as const },
  { value: "Edge", label: "Edge", variant: "outline" as const },
];

export const datacenterStatusOptions = [
  { value: "Online", label: "Online", variant: "default" as const },
  { value: "Maintenance", label: "Maintenance", variant: "outline" as const },
  { value: "Commissioning", label: "Commissioning", variant: "secondary" as const },
  { value: "Offline", label: "Offline", variant: "destructive" as const },
];