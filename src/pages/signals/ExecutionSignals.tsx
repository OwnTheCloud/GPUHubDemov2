import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { EditableCell } from "@/components/ui/editable-cell";
import { useAutoSave } from "@/hooks/use-auto-save";
import { PageWrapper } from "@/components/page-wrapper";

// Mock demand data for cross-reference
const demandReferences = [
  { id: "DEM001", signalIDLookup: "EXE001", customerName: "OpenAI" },
  { id: "DEM002", signalIDLookup: "EXE002", customerName: "Anthropic" },
  { id: "DEM003", signalIDLookup: "EXE003", customerName: "Meta AI" },
  { id: "DEM004", signalIDLookup: "EXE004", customerName: "Google DeepMind" },
  { id: "DEM005", signalIDLookup: "EXE006", customerName: "Microsoft Research" },
  { id: "DEM008", signalIDLookup: "EXE008", customerName: "Stanford AI Lab" },
];

const getLinkedDemands = (signalId: string) => {
  return demandReferences.filter(demand => demand.signalIDLookup === signalId);
};

type ExecutionSignal = {
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

const initialData: ExecutionSignal[] = [
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

const gpuTypeOptions = [
  { value: "A100", label: "A100", variant: "destructive" as const },
  { value: "H100", label: "H100", variant: "outline" as const },
  { value: "H200", label: "H200", variant: "secondary" as const },
  { value: "GB200", label: "GB200", variant: "default" as const },
];

const statusOptions = [
  { value: "Pending", label: "Pending", variant: "secondary" as const },
  { value: "Running", label: "Running", variant: "outline" as const },
  { value: "Completed", label: "Completed", variant: "default" as const },
  { value: "Failed", label: "Failed", variant: "destructive" as const },
  { value: "Cancelled", label: "Cancelled", variant: "destructive" as const },
];

const createColumns = (
  onSave: (rowId: string, field: string, value: unknown) => void,
  isLoading: boolean
): ColumnDef<ExecutionSignal>[] => [
  {
    accessorKey: "id",
    header: "Signal ID",
  },
  {
    accessorKey: "jobId",
    header: "Job ID",
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
  },
  {
    accessorKey: "action",
    header: "Action",
  },
  {
    accessorKey: "datacenter",
    header: "Datacenter",
  },
  {
    accessorKey: "gpuType",
    header: "GPU Type",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const gpuType = row.getValue("gpuType") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={gpuType}
            type="select"
            options={gpuTypeOptions}
            onSave={cellOnSave}
            isLoading={cellIsLoading}
          />
        );
      }
      
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
    accessorKey: "gpuCount",
    header: "GPU Count",
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const status = row.getValue("status") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={status}
            type="select"
            options={statusOptions}
            onSave={cellOnSave}
            isLoading={cellIsLoading}
          />
        );
      }
      
      return (
        <Badge
          variant={
            status === "Completed"
              ? "default"
              : status === "Running"
              ? "outline"
              : status === "Failed"
              ? "destructive"
              : status === "Cancelled"
              ? "destructive"
              : "secondary"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "linkedDemands",
    header: "Linked Demands",
    cell: ({ row }) => {
      const signalId = row.getValue("id") as string;
      const linkedDemands = getLinkedDemands(signalId);
      
      if (linkedDemands.length === 0) {
        return <Badge variant="secondary">No Links</Badge>;
      }
      
      if (linkedDemands.length === 1) {
        const demand = linkedDemands[0];
        return (
          <Badge variant="outline">
            {demand.id} ({demand.customerName})
          </Badge>
        );
      }
      
      return (
        <div className="flex flex-wrap gap-1">
          {linkedDemands.map(demand => (
            <Badge key={demand.id} variant="outline" className="text-xs">
              {demand.id}
            </Badge>
          ))}
        </div>
      );
    },
  },
];

export default function ExecutionSignals() {
  const [data, setData] = useState<ExecutionSignal[]>(initialData);

  const mockSaveFunction = async (rowId: string, field: string, value: unknown) => {
    console.log(`Saving ${field} = ${value} for row ${rowId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update local state
    setData(prevData => 
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
    <PageWrapper title="GPU Execution Signals">
      <DataTable 
        columns={columns} 
        data={data} 
        editable={true}
        onCellUpdate={save}
        isUpdating={isLoading}
      />
    </PageWrapper>
  );
}