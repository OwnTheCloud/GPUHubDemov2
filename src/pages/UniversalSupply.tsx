import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

type GPUSupply = {
  id: string;
  region: string;
  datacenter: string;
  gpuType: "A100" | "H100" | "H200" | "GB200";
  totalGPUs: number;
  availableGPUs: number;
  utilization: string;
  powerConsumption: string;
  liveDate: string;
  status: "Online" | "Maintenance" | "Offline" | "Provisioning";
};

const data: GPUSupply[] = [
  {
    id: "SUP001",
    region: "US-East-1",
    datacenter: "Virginia Prime",
    gpuType: "H100",
    totalGPUs: 2048,
    availableGPUs: 512,
    utilization: "75.0%",
    powerConsumption: "12.8 MW",
    liveDate: "2024-03-15",
    status: "Online",
  },
  {
    id: "SUP002",
    region: "US-West-2",
    datacenter: "Oregon Alpha",
    gpuType: "A100",
    totalGPUs: 1536,
    availableGPUs: 384,
    utilization: "75.0%",
    powerConsumption: "7.2 MW",
    liveDate: "2024-01-20",
    status: "Online",
  },
  {
    id: "SUP003",
    region: "EU-Central-1",
    datacenter: "Frankfurt Beta",
    gpuType: "H200",
    totalGPUs: 1024,
    availableGPUs: 128,
    utilization: "87.5%",
    powerConsumption: "18.4 MW",
    liveDate: "2024-05-10",
    status: "Online",
  },
  {
    id: "SUP004",
    region: "APAC-Southeast-1",
    datacenter: "Singapore Gamma",
    gpuType: "GB200",
    totalGPUs: 512,
    availableGPUs: 64,
    utilization: "87.5%",
    powerConsumption: "28.6 MW",
    liveDate: "2024-06-01",
    status: "Online",
  },
  {
    id: "SUP005",
    region: "US-Central-1",
    datacenter: "Chicago Delta",
    gpuType: "H100",
    totalGPUs: 1792,
    availableGPUs: 0,
    utilization: "100.0%",
    powerConsumption: "11.2 MW",
    liveDate: "2024-02-28",
    status: "Online",
  },
  {
    id: "SUP006",
    region: "EU-West-1",
    datacenter: "Ireland Epsilon",
    gpuType: "A100",
    totalGPUs: 896,
    availableGPUs: 896,
    utilization: "0.0%",
    powerConsumption: "0.0 MW",
    liveDate: "2024-07-20",
    status: "Provisioning",
  },
  {
    id: "SUP007",
    region: "APAC-Northeast-1",
    datacenter: "Tokyo Zeta",
    gpuType: "H200",
    totalGPUs: 768,
    availableGPUs: 192,
    utilization: "75.0%",
    powerConsumption: "13.8 MW",
    liveDate: "2024-04-12",
    status: "Online",
  },
  {
    id: "SUP008",
    region: "US-West-1",
    datacenter: "California Eta",
    gpuType: "GB200",
    totalGPUs: 256,
    availableGPUs: 32,
    utilization: "87.5%",
    powerConsumption: "14.3 MW",
    liveDate: "2024-06-15",
    status: "Maintenance",
  },
];

const columns: ColumnDef<GPUSupply>[] = [
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
    accessorKey: "totalGPUs",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total GPUs
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "availableGPUs",
    header: "Available",
  },
  {
    accessorKey: "utilization",
    header: "Utilization",
  },
  {
    accessorKey: "powerConsumption",
    header: "Power",
  },
  {
    accessorKey: "liveDate",
    header: "Live Date",
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
              : status === "Provisioning"
              ? "outline"
              : status === "Maintenance"
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

export default function UniversalSupply() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GPU Universal Supply</h2>
      </div>
      <DataTable columns={columns} data={data} searchKey="datacenter" />
    </div>
  );
}