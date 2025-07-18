import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DemandID = {
  id: string;
  requestId: string;
  customerId: string;
  resourceType: string;
  quantity: number;
  priority: "Low" | "Medium" | "High" | "Critical";
  requestedDate: string;
  status: "Pending" | "Approved" | "Fulfilled" | "Rejected";
};

const data: DemandID[] = [
  {
    id: "DEM001",
    requestId: "REQ-2024-001",
    customerId: "CUST-001",
    resourceType: "GPU A100",
    quantity: 8,
    priority: "High",
    requestedDate: "2024-01-15",
    status: "Approved",
  },
  {
    id: "DEM002",
    requestId: "REQ-2024-002",
    customerId: "CUST-002",
    resourceType: "GPU H100",
    quantity: 16,
    priority: "Critical",
    requestedDate: "2024-01-15",
    status: "Pending",
  },
  {
    id: "DEM003",
    requestId: "REQ-2024-003",
    customerId: "CUST-003",
    resourceType: "CPU Cores",
    quantity: 256,
    priority: "Medium",
    requestedDate: "2024-01-14",
    status: "Fulfilled",
  },
];

const columns: ColumnDef<DemandID>[] = [
  {
    accessorKey: "id",
    header: "Demand ID",
  },
  {
    accessorKey: "requestId",
    header: "Request ID",
  },
  {
    accessorKey: "customerId",
    header: "Customer ID",
  },
  {
    accessorKey: "resourceType",
    header: "Resource Type",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
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
    accessorKey: "requestedDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Requested Date
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
            status === "Fulfilled"
              ? "default"
              : status === "Approved"
              ? "outline"
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
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Demand IDs</h2>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}