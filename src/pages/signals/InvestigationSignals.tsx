import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type InvestigationSignal = {
  id: string;
  timestamp: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  source: string;
  description: string;
  status: "Open" | "Investigating" | "Resolved";
};

const data: InvestigationSignal[] = [
  {
    id: "INV001",
    timestamp: "2024-01-15 14:30:00",
    severity: "High",
    source: "GPU Cluster A",
    description: "Unusual memory consumption pattern detected",
    status: "Investigating",
  },
  {
    id: "INV002",
    timestamp: "2024-01-15 13:45:00",
    severity: "Medium",
    source: "Network Monitor",
    description: "Intermittent connectivity issues",
    status: "Open",
  },
  {
    id: "INV003",
    timestamp: "2024-01-15 12:15:00",
    severity: "Critical",
    source: "Power Systems",
    description: "Power fluctuation in Rack 7",
    status: "Resolved",
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
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "description",
    header: "Description",
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
        <h2 className="text-3xl font-bold tracking-tight">Investigation Signals</h2>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}