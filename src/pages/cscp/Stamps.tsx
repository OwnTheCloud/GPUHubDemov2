import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

type GPUStamp = {
  id: string;
  name: string;
  datacenter: string;
  gpuType: "A100" | "H100" | "H200" | "GB200";
  totalGPUs: number;
  allocatedGPUs: number;
  availableGPUs: number;
  powerCapacity: string;
  networkTier: "25G" | "50G" | "100G" | "400G";
  liveDate: string;
  lastUpdated: string;
  status: "Active" | "Inactive" | "Provisioning" | "Maintenance";
};

const data: GPUStamp[] = [
  {
    id: "STAMP001",
    name: "H100-Cluster-Alpha",
    datacenter: "Virginia Prime",
    gpuType: "H100",
    totalGPUs: 128,
    allocatedGPUs: 96,
    availableGPUs: 32,
    powerCapacity: "896 kW",
    networkTier: "400G",
    liveDate: "2024-03-15",
    lastUpdated: "2024-07-18 15:30:00",
    status: "Active",
  },
  {
    id: "STAMP002",
    name: "GB200-SuperPod-Beta",
    datacenter: "Singapore Gamma",
    gpuType: "GB200",
    totalGPUs: 64,
    allocatedGPUs: 64,
    availableGPUs: 0,
    powerCapacity: "3584 kW",
    networkTier: "400G",
    liveDate: "2024-06-01",
    lastUpdated: "2024-07-18 15:28:00",
    status: "Active",
  },
  {
    id: "STAMP003",
    name: "A100-Legacy-Gamma",
    datacenter: "Oregon Alpha",
    gpuType: "A100",
    totalGPUs: 256,
    allocatedGPUs: 192,
    availableGPUs: 64,
    powerCapacity: "1024 kW",
    networkTier: "100G",
    liveDate: "2023-11-20",
    lastUpdated: "2024-07-18 15:25:00",
    status: "Active",
  },
  {
    id: "STAMP004",
    name: "H200-Cluster-Delta",
    datacenter: "Frankfurt Beta",
    gpuType: "H200",
    totalGPUs: 96,
    allocatedGPUs: 80,
    availableGPUs: 16,
    powerCapacity: "1728 kW",
    networkTier: "400G",
    liveDate: "2024-05-10",
    lastUpdated: "2024-07-18 15:22:00",
    status: "Active",
  },
  {
    id: "STAMP005",
    name: "H100-Training-Epsilon",
    datacenter: "Chicago Delta",
    gpuType: "H100",
    totalGPUs: 192,
    allocatedGPUs: 192,
    availableGPUs: 0,
    powerCapacity: "1344 kW",
    networkTier: "400G",
    liveDate: "2024-02-28",
    lastUpdated: "2024-07-18 15:20:00",
    status: "Active",
  },
  {
    id: "STAMP006",
    name: "GB200-Research-Zeta",
    datacenter: "Tokyo Zeta",
    gpuType: "GB200",
    totalGPUs: 32,
    allocatedGPUs: 24,
    availableGPUs: 8,
    powerCapacity: "1792 kW",
    networkTier: "400G",
    liveDate: "2024-04-12",
    lastUpdated: "2024-07-18 15:18:00",
    status: "Active",
  },
  {
    id: "STAMP007",
    name: "H200-Edge-Eta",
    datacenter: "California Eta",
    gpuType: "H200",
    totalGPUs: 48,
    allocatedGPUs: 32,
    availableGPUs: 16,
    powerCapacity: "864 kW",
    networkTier: "100G",
    liveDate: "2024-06-15",
    lastUpdated: "2024-07-18 15:15:00",
    status: "Maintenance",
  },
  {
    id: "STAMP008",
    name: "A100-Inference-Theta",
    datacenter: "Sydney Theta",
    gpuType: "A100",
    totalGPUs: 64,
    allocatedGPUs: 48,
    availableGPUs: 16,
    powerCapacity: "256 kW",
    networkTier: "50G",
    liveDate: "2024-06-01",
    lastUpdated: "2024-07-18 15:12:00",
    status: "Active",
  },
  {
    id: "STAMP009",
    name: "H100-Future-Kappa",
    datacenter: "Ireland Epsilon",
    gpuType: "H100",
    totalGPUs: 256,
    allocatedGPUs: 0,
    availableGPUs: 256,
    powerCapacity: "1792 kW",
    networkTier: "400G",
    liveDate: "2024-07-20",
    lastUpdated: "2024-07-18 15:10:00",
    status: "Provisioning",
  },
];

const columns: ColumnDef<GPUStamp>[] = [
  {
    accessorKey: "id",
    header: "Stamp ID",
  },
  {
    accessorKey: "name",
    header: "Name",
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
    header: "Total GPUs",
  },
  {
    accessorKey: "allocatedGPUs",
    header: "Allocated",
  },
  {
    accessorKey: "availableGPUs",
    header: "Available",
  },
  {
    accessorKey: "powerCapacity",
    header: "Power Cap",
  },
  {
    accessorKey: "networkTier",
    header: "Network",
    cell: ({ row }) => {
      const tier = row.getValue("networkTier") as string;
      return (
        <Badge
          variant={
            tier === "400G"
              ? "default"
              : tier === "100G"
              ? "secondary"
              : "outline"
          }
        >
          {tier}
        </Badge>
      );
    },
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
            status === "Active"
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

export default function Stamps() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GPU Deployment Stamps</h2>
      </div>
      <DataTable columns={columns} data={data} editable={true} />
    </div>
  );
}