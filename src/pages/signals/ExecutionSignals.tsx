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
  resource: string;
  duration: string;
  status: "Pending" | "Running" | "Completed" | "Failed";
};

const data: ExecutionSignal[] = [
  {
    id: "EXE001",
    jobId: "JOB-2024-001",
    timestamp: "2024-01-15 15:20:00",
    action: "Scale Up GPU Cluster",
    resource: "GPU-Cluster-West",
    duration: "5m 32s",
    status: "Completed",
  },
  {
    id: "EXE002",
    jobId: "JOB-2024-002",
    timestamp: "2024-01-15 15:18:00",
    action: "Deploy Model",
    resource: "ML-Pipeline-01",
    duration: "12m 45s",
    status: "Running",
  },
  {
    id: "EXE003",
    jobId: "JOB-2024-003",
    timestamp: "2024-01-15 15:10:00",
    action: "Health Check",
    resource: "All Clusters",
    duration: "2m 15s",
    status: "Failed",
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
    accessorKey: "resource",
    header: "Resource",
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
        <h2 className="text-3xl font-bold tracking-tight">Execution Signals</h2>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}