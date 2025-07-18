import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Datacenter = {
  id: string;
  name: string;
  region: string;
  capacity: number;
  utilization: string;
  powerUsage: string;
  temperature: string;
  status: "Online" | "Maintenance" | "Offline";
};

const data: Datacenter[] = [
  {
    id: "DC001",
    name: "West US 2 Primary",
    region: "West US 2",
    capacity: 5000,
    utilization: "78%",
    powerUsage: "2.4 MW",
    temperature: "22°C",
    status: "Online",
  },
  {
    id: "DC002",
    name: "East US Primary",
    region: "East US",
    capacity: 4200,
    utilization: "85%",
    powerUsage: "2.1 MW",
    temperature: "24°C",
    status: "Online",
  },
  {
    id: "DC003",
    name: "Central US Secondary",
    region: "Central US",
    capacity: 3800,
    utilization: "45%",
    powerUsage: "1.8 MW",
    temperature: "21°C",
    status: "Maintenance",
  },
];

const columns: ColumnDef<Datacenter>[] = [
  {
    accessorKey: "id",
    header: "DC ID",
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
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
  },
  {
    accessorKey: "utilization",
    header: "Utilization",
  },
  {
    accessorKey: "powerUsage",
    header: "Power Usage",
  },
  {
    accessorKey: "temperature",
    header: "Temperature",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "Online"
              ? "default"
              : status === "Maintenance"
              ? "outline"
              : "destructive"
          }
        >
          {status}
        </Badge>
      );
    },
  },
];

export default function Datacenters() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Datacenters</h2>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}