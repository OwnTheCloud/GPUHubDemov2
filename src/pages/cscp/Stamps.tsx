import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Stamp = {
  id: string;
  name: string;
  datacenter: string;
  type: string;
  capacity: number;
  available: number;
  lastUpdated: string;
  status: "Active" | "Inactive" | "Provisioning";
};

const data: Stamp[] = [
  {
    id: "STAMP001",
    name: "GPU-Stamp-A1",
    datacenter: "West US 2 Primary",
    type: "GPU Compute",
    capacity: 128,
    available: 32,
    lastUpdated: "2024-01-15 15:30:00",
    status: "Active",
  },
  {
    id: "STAMP002",
    name: "GPU-Stamp-B2",
    datacenter: "East US Primary",
    type: "GPU Compute",
    capacity: 256,
    available: 0,
    lastUpdated: "2024-01-15 15:28:00",
    status: "Active",
  },
  {
    id: "STAMP003",
    name: "CPU-Stamp-C1",
    datacenter: "Central US Secondary",
    type: "CPU Compute",
    capacity: 512,
    available: 256,
    lastUpdated: "2024-01-15 15:25:00",
    status: "Provisioning",
  },
];

const columns: ColumnDef<Stamp>[] = [
  {
    accessorKey: "id",
    header: "Stamp ID",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "datacenter",
    header: "Datacenter",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
  },
  {
    accessorKey: "available",
    header: "Available",
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "Active"
              ? "default"
              : status === "Provisioning"
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

export default function Stamps() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Stamps</h2>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}