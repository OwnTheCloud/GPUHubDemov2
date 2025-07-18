import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

type Supply = {
  id: string;
  region: string;
  datacenter: string;
  totalCapacity: number;
  availableCapacity: number;
  utilization: string;
  status: string;
};

const data: Supply[] = [
  {
    id: "SUP001",
    region: "West US 2",
    datacenter: "WUS2-DC01",
    totalCapacity: 1000,
    availableCapacity: 250,
    utilization: "75%",
    status: "Online",
  },
  {
    id: "SUP002",
    region: "East US",
    datacenter: "EUS-DC01",
    totalCapacity: 800,
    availableCapacity: 120,
    utilization: "85%",
    status: "Online",
  },
  {
    id: "SUP003",
    region: "Central US",
    datacenter: "CUS-DC01",
    totalCapacity: 1200,
    availableCapacity: 400,
    utilization: "67%",
    status: "Maintenance",
  },
];

const columns: ColumnDef<Supply>[] = [
  {
    accessorKey: "id",
    header: "Supply ID",
  },
  {
    accessorKey: "region",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Region
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
    accessorKey: "totalCapacity",
    header: "Total Capacity",
  },
  {
    accessorKey: "availableCapacity",
    header: "Available Capacity",
  },
  {
    accessorKey: "utilization",
    header: "Utilization",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

export default function UniversalSupply() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Universal Supply</h2>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}