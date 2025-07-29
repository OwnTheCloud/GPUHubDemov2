import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { EditableCell } from "@/components/ui/editable-cell";
import { useAutoSave } from "@/hooks/use-auto-save";

type ExecutionSignal = {
  id: string;
  jobId: string;
  action: string;
  datacenter: string;
  status: "Pending" | "Running" | "Completed" | "Failed" | "Cancelled";
};

const executionSignals: ExecutionSignal[] = [
  { id: "EXE001", jobId: "GPU-DEPLOY-2024-0718-001", action: "Deploy GPU Cluster", datacenter: "Virginia Prime", status: "Completed" },
  { id: "EXE002", jobId: "GPU-DEPLOY-2024-0718-002", action: "Scale GPU Allocation", datacenter: "Singapore Gamma", status: "Running" },
  { id: "EXE003", jobId: "GPU-DEPLOY-2024-0718-003", action: "GPU Health Validation", datacenter: "Frankfurt Beta", status: "Failed" },
  { id: "EXE004", jobId: "GPU-DEPLOY-2024-0718-004", action: "Firmware Update", datacenter: "Oregon Alpha", status: "Completed" },
  { id: "EXE005", jobId: "GPU-DEPLOY-2024-0718-005", action: "Power Configuration", datacenter: "Tokyo Zeta", status: "Completed" },
  { id: "EXE006", jobId: "GPU-DEPLOY-2024-0718-006", action: "Network Fabric Setup", datacenter: "Chicago Delta", status: "Running" },
  { id: "EXE007", jobId: "GPU-DEPLOY-2024-0718-007", action: "Decommission GPUs", datacenter: "California Eta", status: "Cancelled" },
  { id: "EXE008", jobId: "GPU-DEPLOY-2024-0718-008", action: "Cooling System Test", datacenter: "Ireland Epsilon", status: "Pending" },
];

const getExecutionSignalOptions = () => {
  const options = executionSignals.map(signal => ({
    value: signal.id,
    label: `${signal.id} - ${signal.action} (${signal.datacenter})`,
    variant: "outline" as const,
  }));
  
  // Add "None" option for clearing the relationship
  return [
    { value: "", label: "Not Linked", variant: "secondary" as const },
    ...options,
  ];
};

type GPUDemandID = {
  id: string;
  requestId: string;
  customerId: string;
  customerName: string;
  gpuType: "A100" | "H100" | "H200" | "GB200";
  quantity: number;
  preferredRegion: string;
  workloadType: "Training" | "Inference" | "Research" | "Development";
  duration: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  requestedDate: string;
  targetDate: string;
  status: "Pending" | "Approved" | "Fulfilled" | "Rejected" | "Provisioning";
  signalIDLookup?: string;
};

const data: GPUDemandID[] = [
  {
    id: "DEM001",
    requestId: "REQ-GPU-2024-0718-001",
    customerId: "CUST-OPENAI-001",
    customerName: "OpenAI",
    gpuType: "H100",
    quantity: 512,
    preferredRegion: "US-East-1",
    workloadType: "Training",
    duration: "6 months",
    priority: "Critical",
    requestedDate: "2024-07-15",
    targetDate: "2024-08-01",
    status: "Approved",
    signalIDLookup: "EXE001",
  },
  {
    id: "DEM002",
    requestId: "REQ-GPU-2024-0718-002",
    customerId: "CUST-ANTHROPIC-001",
    customerName: "Anthropic",
    gpuType: "GB200",
    quantity: 128,
    preferredRegion: "US-West-2",
    workloadType: "Research",
    duration: "12 months",
    priority: "Critical",
    requestedDate: "2024-07-16",
    targetDate: "2024-09-01",
    status: "Pending",
    signalIDLookup: "EXE002",
  },
  {
    id: "DEM003",
    requestId: "REQ-GPU-2024-0718-003",
    customerId: "CUST-META-001",
    customerName: "Meta AI",
    gpuType: "H200",
    quantity: 256,
    preferredRegion: "EU-Central-1",
    workloadType: "Training",
    duration: "3 months",
    priority: "High",
    requestedDate: "2024-07-14",
    targetDate: "2024-08-15",
    status: "Fulfilled",
    signalIDLookup: "EXE003",
  },
  {
    id: "DEM004",
    requestId: "REQ-GPU-2024-0718-004",
    customerId: "CUST-GOOGLE-001",
    customerName: "Google DeepMind",
    gpuType: "GB200",
    quantity: 64,
    preferredRegion: "APAC-Southeast-1",
    workloadType: "Research",
    duration: "9 months",
    priority: "High",
    requestedDate: "2024-07-17",
    targetDate: "2024-08-30",
    status: "Provisioning",
    signalIDLookup: "EXE004",
  },
  {
    id: "DEM005",
    requestId: "REQ-GPU-2024-0718-005",
    customerId: "CUST-MICROSOFT-001",
    customerName: "Microsoft Research",
    gpuType: "H100",
    quantity: 192,
    preferredRegion: "US-Central-1",
    workloadType: "Development",
    duration: "4 months",
    priority: "Medium",
    requestedDate: "2024-07-13",
    targetDate: "2024-08-20",
    status: "Approved",
    signalIDLookup: "EXE006",
  },
  {
    id: "DEM006",
    requestId: "REQ-GPU-2024-0718-006",
    customerId: "CUST-NVIDIA-001",
    customerName: "NVIDIA Research",
    gpuType: "GB200",
    quantity: 32,
    preferredRegion: "US-West-1",
    workloadType: "Research",
    duration: "2 months",
    priority: "Medium",
    requestedDate: "2024-07-12",
    targetDate: "2024-08-10",
    status: "Fulfilled",
  },
  {
    id: "DEM007",
    requestId: "REQ-GPU-2024-0718-007",
    customerId: "CUST-STARTUP-001",
    customerName: "AI Startup Co",
    gpuType: "A100",
    quantity: 16,
    preferredRegion: "US-East-1",
    workloadType: "Inference",
    duration: "1 month",
    priority: "Low",
    requestedDate: "2024-07-11",
    targetDate: "2024-07-25",
    status: "Rejected",
  },
  {
    id: "DEM008",
    requestId: "REQ-GPU-2024-0718-008",
    customerId: "CUST-UNIVERSITY-001",
    customerName: "Stanford AI Lab",
    gpuType: "H200",
    quantity: 48,
    preferredRegion: "US-West-2",
    workloadType: "Research",
    duration: "6 months",
    priority: "Medium",
    requestedDate: "2024-07-10",
    targetDate: "2024-09-01",
    status: "Pending",
    signalIDLookup: "EXE008",
  },
];

const createColumns = (
  onSave: (rowId: string, field: string, value: unknown) => void,
  isLoading: boolean
): ColumnDef<GPUDemandID>[] => [
  {
    accessorKey: "id",
    header: "Demand ID",
  },
  {
    accessorKey: "requestId",
    header: "Request ID",
  },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "gpuType",
    header: "GPU Type",
    cell: ({ row }) => {
      const gpuType = row.getValue("gpuType") as string;
      return (
        <Badge
          variant={
            gpuType === "GB200"
              ? "default"
              : gpuType === "H200"
              ? "secondary"
              : gpuType === "H100"
              ? "outline"
              : "destructive"
          }
        >
          {gpuType}
        </Badge>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "preferredRegion",
    header: "Region",
  },
  {
    accessorKey: "workloadType",
    header: "Workload",
    cell: ({ row }) => {
      const workload = row.getValue("workloadType") as string;
      return (
        <Badge
          variant={
            workload === "Training"
              ? "default"
              : workload === "Research"
              ? "secondary"
              : "outline"
          }
        >
          {workload}
        </Badge>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      return (
        <Badge
          variant={
            priority === "Critical"
              ? "destructive"
              : priority === "High"
              ? "destructive"
              : priority === "Medium"
              ? "default"
              : "secondary"
          }
        >
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "targetDate",
    header: "Target Date",
  },
  {
    accessorKey: "signalIDLookup",
    header: "Execution Signal",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const signalID = row.getValue("signalIDLookup") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={signalID || ""}
            type="select"
            options={getExecutionSignalOptions()}
            onSave={cellOnSave}
            isLoading={cellIsLoading}
          />
        );
      }
      
      if (!signalID) {
        return <Badge variant="secondary">Not Linked</Badge>;
      }
      
      const linkedSignal = executionSignals.find(signal => signal.id === signalID);
      if (linkedSignal) {
        return (
          <Badge variant="outline">
            {linkedSignal.id} - {linkedSignal.action}
          </Badge>
        );
      }
      
      return <Badge variant="destructive">Invalid Link</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "Fulfilled"
              ? "default"
              : status === "Approved"
              ? "outline"
              : status === "Provisioning"
              ? "secondary"
              : status === "Pending"
              ? "secondary"
              : "destructive"
          }
        >
          {status}
        </Badge>
      );
    },
  },
];

export default function DemandIDs() {
  const [demandData, setDemandData] = useState<GPUDemandID[]>(data);

  const mockSaveFunction = async (rowId: string, field: string, value: unknown) => {
    console.log(`Saving ${field} = ${value} for row ${rowId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update local state
    setDemandData(prevData => 
      prevData.map(item => 
        item.id === rowId 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const { save, isLoading } = useAutoSave({
    onSave: mockSaveFunction,
    delay: 500,
  });

  const columns = createColumns(save, isLoading);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GPU Demand Requests</h2>
      </div>
      <DataTable 
        columns={columns} 
        data={demandData} 
        editable={true}
        onCellUpdate={save}
        isUpdating={isLoading}
      />
    </div>
  );
}