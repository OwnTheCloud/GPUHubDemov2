export type InvestigationSignal = {
  id: string;
  timestamp: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  datacenter: string;
  gpuType: "A100" | "H100" | "H200" | "GB200";
  source: string;
  description: string;
  affectedGPUs: number;
  status: "Open" | "Investigating" | "Resolved" | "Escalated";
};

export const investigationSignalsData: InvestigationSignal[] = [
  {
    id: "INV001",
    timestamp: "2024-07-18 14:30:00",
    severity: "Critical",
    datacenter: "Virginia Prime",
    gpuType: "H100",
    source: "Temperature Monitor",
    description: "Thermal throttling detected on 64 H100 GPUs in Rack 12-A",
    affectedGPUs: 64,
    status: "Investigating",
  },
  {
    id: "INV002",
    timestamp: "2024-07-18 13:45:00",
    severity: "High",
    datacenter: "Singapore Gamma",
    gpuType: "GB200",
    source: "Power Distribution",
    description: "Power supply instability affecting GPU cluster performance",
    affectedGPUs: 32,
    status: "Open",
  },
  {
    id: "INV003",
    timestamp: "2024-07-18 12:15:00",
    severity: "Medium",
    datacenter: "Frankfurt Beta",
    gpuType: "H200",
    source: "Memory Health",
    description: "ECC memory errors increasing on HBM3 modules",
    affectedGPUs: 16,
    status: "Resolved",
  },
  {
    id: "INV004",
    timestamp: "2024-07-18 11:22:00",
    severity: "High",
    datacenter: "Oregon Alpha",
    gpuType: "A100",
    source: "Network Fabric",
    description: "InfiniBand link degradation affecting multi-GPU workloads",
    affectedGPUs: 128,
    status: "Escalated",
  },
  {
    id: "INV005",
    timestamp: "2024-07-18 10:30:00",
    severity: "Low",
    datacenter: "Tokyo Zeta",
    gpuType: "H200",
    source: "Firmware Monitor",
    description: "GPU firmware version mismatch in cluster deployment",
    affectedGPUs: 8,
    status: "Resolved",
  },
  {
    id: "INV006",
    timestamp: "2024-07-18 09:15:00",
    severity: "Critical",
    datacenter: "Chicago Delta",
    gpuType: "H100",
    source: "Cooling System",
    description: "HVAC failure in Zone 3 causing GPU temperature spikes",
    affectedGPUs: 256,
    status: "Investigating",
  },
  {
    id: "INV007",
    timestamp: "2024-07-18 08:45:00",
    severity: "Medium",
    datacenter: "California Eta",
    gpuType: "GB200",
    source: "Deployment Automation",
    description: "Container orchestration failing to allocate GPU resources",
    affectedGPUs: 24,
    status: "Open",
  },
];

export const investigationSeverityOptions = [
  { value: "Low", label: "Low", variant: "secondary" as const },
  { value: "Medium", label: "Medium", variant: "default" as const },
  { value: "High", label: "High", variant: "destructive" as const },
  { value: "Critical", label: "Critical", variant: "destructive" as const },
];

export const investigationStatusOptions = [
  { value: "Open", label: "Open", variant: "secondary" as const },
  { value: "Investigating", label: "Investigating", variant: "outline" as const },
  { value: "Resolved", label: "Resolved", variant: "default" as const },
  { value: "Escalated", label: "Escalated", variant: "destructive" as const },
];

export const investigationGpuTypeOptions = [
  { value: "A100", label: "A100", variant: "destructive" as const },
  { value: "H100", label: "H100", variant: "outline" as const },
  { value: "H200", label: "H200", variant: "secondary" as const },
  { value: "GB200", label: "GB200", variant: "default" as const },
];