import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const data: ExecutionSignal[] = [
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

const columns: ColumnDef<ExecutionSignal>[] = [
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
    accessorKey: "gpuCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GPU Count
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
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
];

export default function ExecutionSignals() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GPU Execution Signals</h2>
      </div>
      <DataTable columns={columns} data={data} searchKey="datacenter" />
    </div>
  );
}