import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const data: InvestigationSignal[] = [
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

const columns: ColumnDef<InvestigationSignal>[] = [
  {
    accessorKey: "id",
    header: "Signal ID",
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const severity = row.getValue("severity") as string;
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
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "affectedGPUs",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Affected GPUs
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
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
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GPU Investigation Signals</h2>
      </div>
      <DataTable columns={columns} data={data} searchKey="datacenter" />
    </div>
  );
}