import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { EditableCell } from "@/components/ui/editable-cell";
import { useAutoSave } from "@/hooks/use-auto-save";

type InvestigationSignal = {
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

const initialData: InvestigationSignal[] = [
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

const severityOptions = [
  { value: "Low", label: "Low", variant: "secondary" as const },
  { value: "Medium", label: "Medium", variant: "default" as const },
  { value: "High", label: "High", variant: "destructive" as const },
  { value: "Critical", label: "Critical", variant: "destructive" as const },
];

const statusOptions = [
  { value: "Open", label: "Open", variant: "secondary" as const },
  { value: "Investigating", label: "Investigating", variant: "outline" as const },
  { value: "Resolved", label: "Resolved", variant: "default" as const },
  { value: "Escalated", label: "Escalated", variant: "destructive" as const },
];

const gpuTypeOptions = [
  { value: "A100", label: "A100", variant: "destructive" as const },
  { value: "H100", label: "H100", variant: "outline" as const },
  { value: "H200", label: "H200", variant: "secondary" as const },
  { value: "GB200", label: "GB200", variant: "default" as const },
];

const createColumns = (
  onSave: (rowId: string, field: string, value: unknown) => void,
  isLoading: boolean
): ColumnDef<InvestigationSignal>[] => [
  {
    accessorKey: "id",
    header: "Signal ID",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const id = row.getValue("id") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={id}
            type="text"
            onSave={cellOnSave}
            isLoading={cellIsLoading}
            placeholder="Enter signal ID..."
          />
        );
      }
      
      return <span className="font-mono">{id}</span>;
    },
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const timestamp = row.getValue("timestamp") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={timestamp}
            type="text"
            onSave={cellOnSave}
            isLoading={cellIsLoading}
            placeholder="Enter timestamp..."
          />
        );
      }
      
      return <span className="font-mono">{timestamp}</span>;
    },
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const severity = row.getValue("severity") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={severity}
            type="select"
            options={severityOptions}
            onSave={cellOnSave}
            isLoading={cellIsLoading}
          />
        );
      }
      
      return (
        <Badge
          variant={
            severity === "Critical"
              ? "destructive"
              : severity === "High"
              ? "destructive"
              : severity === "Medium"
              ? "default"
              : "secondary"
          }
        >
          {severity}
        </Badge>
      );
    },
  },
  {
    accessorKey: "datacenter",
    header: "Datacenter",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const datacenter = row.getValue("datacenter") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={datacenter}
            type="text"
            onSave={cellOnSave}
            isLoading={cellIsLoading}
            placeholder="Enter datacenter..."
          />
        );
      }
      
      return <span>{datacenter}</span>;
    },
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
    accessorKey: "source",
    header: "Source",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const source = row.getValue("source") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={source}
            type="text"
            onSave={cellOnSave}
            isLoading={cellIsLoading}
            placeholder="Enter source..."
          />
        );
      }
      
      return <span>{source}</span>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const description = row.getValue("description") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={description}
            type="text"
            onSave={cellOnSave}
            isLoading={cellIsLoading}
            placeholder="Enter description..."
          />
        );
      }
      
      return <span>{description}</span>;
    },
  },
  {
    accessorKey: "affectedGPUs",
    header: "Affected GPUs",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const affectedGPUs = row.getValue("affectedGPUs") as number;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={affectedGPUs}
            type="number"
            onSave={cellOnSave}
            isLoading={cellIsLoading}
            validation={(value) => {
              const num = typeof value === 'string' ? parseInt(value) : value;
              if (isNaN(num) || num < 0) return "Must be a positive number";
              return null;
            }}
          />
        );
      }
      
      return <span>{affectedGPUs}</span>;
    },
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
            status === "Resolved"
              ? "default"
              : status === "Investigating"
              ? "outline"
              : status === "Escalated"
              ? "destructive"
              : "secondary"
          }
        >
          {status}
        </Badge>
      );
    },
  },
];

export default function InvestigationSignals() {
  const [data, setData] = useState<InvestigationSignal[]>(initialData);

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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GPU Investigation Signals</h2>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        editable={true}
        onCellUpdate={save}
        isUpdating={isLoading}
      />
    </div>
  );
}