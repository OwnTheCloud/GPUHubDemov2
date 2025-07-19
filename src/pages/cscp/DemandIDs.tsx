import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

type GPUDemandID = {
  id: string;
  requestId: string;
  customerId: string;
  customerName: string;
  gpuType: "A100" | "H100" | "H200" | "GB200";
  quantity: number;
  preferredRegion: string;
  workloadType: "Training" | "Inference" | "Research" | "Development";
  duration: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  requestedDate: string;
  targetDate: string;
  status: "Pending" | "Approved" | "Fulfilled" | "Rejected" | "Provisioning";
};

const data: GPUDemandID[] = [
  {
    id: "DEM001",
    requestId: "REQ-GPU-2024-0718-001",
    customerId: "CUST-OPENAI-001",
    customerName: "OpenAI",
    gpuType: "H100",
    quantity: 512,
    preferredRegion: "US-East-1",
    workloadType: "Training",
    duration: "6 months",
    priority: "Critical",
    requestedDate: "2024-07-15",
    targetDate: "2024-08-01",
    status: "Approved",
  },
  {
    id: "DEM002",
    requestId: "REQ-GPU-2024-0718-002",
    customerId: "CUST-ANTHROPIC-001",
    customerName: "Anthropic",
    gpuType: "GB200",
    quantity: 128,
    preferredRegion: "US-West-2",
    workloadType: "Research",
    duration: "12 months",
    priority: "Critical",
    requestedDate: "2024-07-16",
    targetDate: "2024-09-01",
    status: "Pending",
  },
  {
    id: "DEM003",
    requestId: "REQ-GPU-2024-0718-003",
    customerId: "CUST-META-001",
    customerName: "Meta AI",
    gpuType: "H200",
    quantity: 256,
    preferredRegion: "EU-Central-1",
    workloadType: "Training",
    duration: "3 months",
    priority: "High",
    requestedDate: "2024-07-14",
    targetDate: "2024-08-15",
    status: "Fulfilled",
  },
  {
    id: "DEM004",
    requestId: "REQ-GPU-2024-0718-004",
    customerId: "CUST-GOOGLE-001",
    customerName: "Google DeepMind",
    gpuType: "GB200",
    quantity: 64,
    preferredRegion: "APAC-Southeast-1",
    workloadType: "Research",
    duration: "9 months",
    priority: "High",
    requestedDate: "2024-07-17",
    targetDate: "2024-08-30",
    status: "Provisioning",
  },
  {
    id: "DEM005",
    requestId: "REQ-GPU-2024-0718-005",
    customerId: "CUST-MICROSOFT-001",
    customerName: "Microsoft Research",
    gpuType: "H100",
    quantity: 192,
    preferredRegion: "US-Central-1",
    workloadType: "Development",
    duration: "4 months",
    priority: "Medium",
    requestedDate: "2024-07-13",
    targetDate: "2024-08-20",
    status: "Approved",
  },
  {
    id: "DEM006",
    requestId: "REQ-GPU-2024-0718-006",
    customerId: "CUST-NVIDIA-001",
    customerName: "NVIDIA Research",
    gpuType: "GB200",
    quantity: 32,
    preferredRegion: "US-West-1",
    workloadType: "Research",
    duration: "2 months",
    priority: "Medium",
    requestedDate: "2024-07-12",
    targetDate: "2024-08-10",
    status: "Fulfilled",
  },
  {
    id: "DEM007",
    requestId: "REQ-GPU-2024-0718-007",
    customerId: "CUST-STARTUP-001",
    customerName: "AI Startup Co",
    gpuType: "A100",
    quantity: 16,
    preferredRegion: "US-East-1",
    workloadType: "Inference",
    duration: "1 month",
    priority: "Low",
    requestedDate: "2024-07-11",
    targetDate: "2024-07-25",
    status: "Rejected",
  },
  {
    id: "DEM008",
    requestId: "REQ-GPU-2024-0718-008",
    customerId: "CUST-UNIVERSITY-001",
    customerName: "Stanford AI Lab",
    gpuType: "H200",
    quantity: 48,
    preferredRegion: "US-West-2",
    workloadType: "Research",
    duration: "6 months",
    priority: "Medium",
    requestedDate: "2024-07-10",
    targetDate: "2024-09-01",
    status: "Pending",
  },
];

const columns: ColumnDef<GPUDemandID>[] = [
  {
    accessorKey: "id",
    header: "Demand ID",
  },
  {
    accessorKey: "requestId",
    header: "Request ID",
  },
  {
    accessorKey: "customerName",
    header: "Customer",
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
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "preferredRegion",
    header: "Region",
  },
  {
    accessorKey: "workloadType",
    header: "Workload",
    cell: ({ row }) => {
      const workload = row.getValue("workloadType") as string;
      return (
        <Badge
          variant={
            workload === "Training"
              ? "default"
              : workload === "Research"
              ? "secondary"
              : "outline"
          }
        >
          {workload}
        </Badge>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
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
    accessorKey: "targetDate",
    header: "Target Date",
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
              : status === "Provisioning"
              ? "secondary"
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
        <h2 className="text-3xl font-bold tracking-tight">GPU Demand Requests</h2>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}