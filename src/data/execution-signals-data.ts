export type ExecutionSignal = {
  id: string;
  jobId: string;
  timestamp: string;
  action: string;
  datacenter: string;
  gpuType: "A100" | "H100" | "H200" | "GB200";
  gpuCount: number;
  duration: string;
  status: "Pending" | "Running" | "Completed" | "Failed" | "Cancelled";
};

export const executionSignalsData: ExecutionSignal[] = [
  {
    id: "EXE001",
    jobId: "GPU-DEPLOY-2024-0718-001",
    timestamp: "2024-07-18 15:20:00",
    action: "Deploy GPU Cluster",
    datacenter: "Virginia Prime",
    gpuType: "H100",
    gpuCount: 128,
    duration: "18m 32s",
    status: "Completed",
  },
  {
    id: "EXE002",
    jobId: "GPU-DEPLOY-2024-0718-002",
    timestamp: "2024-07-18 15:15:00",
    action: "Scale GPU Allocation",
    datacenter: "Singapore Gamma",
    gpuType: "GB200",
    gpuCount: 64,
    duration: "12m 45s",
    status: "Running",
  },
  {
    id: "EXE003",
    jobId: "GPU-DEPLOY-2024-0718-003",
    timestamp: "2024-07-18 15:10:00",
    action: "GPU Health Validation",
    datacenter: "Frankfurt Beta",
    gpuType: "H200",
    gpuCount: 256,
    duration: "2m 15s",
    status: "Failed",
  },
  {
    id: "EXE004",
    jobId: "GPU-DEPLOY-2024-0718-004",
    timestamp: "2024-07-18 14:55:00",
    action: "Firmware Update",
    datacenter: "Oregon Alpha",
    gpuType: "A100",
    gpuCount: 96,
    duration: "45m 20s",
    status: "Completed",
  },
  {
    id: "EXE005",
    jobId: "GPU-DEPLOY-2024-0718-005",
    timestamp: "2024-07-18 14:30:00",
    action: "Power Configuration",
    datacenter: "Tokyo Zeta",
    gpuType: "H200",
    gpuCount: 32,
    duration: "8m 10s",
    status: "Completed",
  },
  {
    id: "EXE006",
    jobId: "GPU-DEPLOY-2024-0718-006",
    timestamp: "2024-07-18 14:15:00",
    action: "Network Fabric Setup",
    datacenter: "Chicago Delta",
    gpuType: "H100",
    gpuCount: 192,
    duration: "25m 30s",
    status: "Running",
  },
  {
    id: "EXE007",
    jobId: "GPU-DEPLOY-2024-0718-007",
    timestamp: "2024-07-18 14:00:00",
    action: "Decommission GPUs",
    datacenter: "California Eta",
    gpuType: "A100",
    gpuCount: 48,
    duration: "15m 45s",
    status: "Cancelled",
  },
  {
    id: "EXE008",
    jobId: "GPU-DEPLOY-2024-0718-008",
    timestamp: "2024-07-18 13:45:00",
    action: "Cooling System Test",
    datacenter: "Ireland Epsilon",
    gpuType: "GB200",
    gpuCount: 16,
    duration: "6m 22s",
    status: "Pending",
  },
];

export const demandReferences = [
  { id: "DEM001", signalIDLookup: "EXE001", customerName: "OpenAI" },
  { id: "DEM002", signalIDLookup: "EXE002", customerName: "Anthropic" },
  { id: "DEM003", signalIDLookup: "EXE003", customerName: "Meta AI" },
  { id: "DEM004", signalIDLookup: "EXE004", customerName: "Google DeepMind" },
  { id: "DEM005", signalIDLookup: "EXE006", customerName: "Microsoft Research" },
  { id: "DEM008", signalIDLookup: "EXE008", customerName: "Stanford AI Lab" },
];

export const getLinkedDemands = (signalId: string) => {
  return demandReferences.filter(demand => demand.signalIDLookup === signalId);
};

export const executionSignalGpuTypeOptions = [
  { value: "A100", label: "A100", variant: "destructive" as const },
  { value: "H100", label: "H100", variant: "outline" as const },
  { value: "H200", label: "H200", variant: "secondary" as const },
  { value: "GB200", label: "GB200", variant: "default" as const },
];

export const executionSignalStatusOptions = [
  { value: "Pending", label: "Pending", variant: "secondary" as const },
  { value: "Running", label: "Running", variant: "outline" as const },
  { value: "Completed", label: "Completed", variant: "default" as const },
  { value: "Failed", label: "Failed", variant: "destructive" as const },
  { value: "Cancelled", label: "Cancelled", variant: "destructive" as const },
];