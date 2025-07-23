import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { EditableCell } from "@/components/ui/editable-cell";
import { useAutoSave } from "@/hooks/use-auto-save";

type Datacenter = {
  id: string;
  name: string;
  region: string;
  type: "Owned" | "Colocation" | "Edge";
  gpuCapacity: number;
  deployedGPUs: number;
  utilization: string;
  powerUsage: string;
  temperature: string;
  liveDate: string;
  status: "Online" | "Maintenance" | "Offline" | "Commissioning";
};

const initialData: Datacenter[] = [
  {
    id: "DC001",
    name: "Virginia Prime",
    region: "US-East-1",
    type: "Owned",
    gpuCapacity: 2048,
    deployedGPUs: 2048,
    utilization: "87.5%",
    powerUsage: "18.4 MW",
    temperature: "22°C",
    liveDate: "2024-01-15",
    status: "Online",
  },
  {
    id: "DC002",
    name: "Oregon Alpha",
    region: "US-West-2",
    type: "Owned",
    gpuCapacity: 1536,
    deployedGPUs: 1536,
    utilization: "75.0%",
    powerUsage: "12.2 MW",
    temperature: "21°C",
    liveDate: "2023-11-20",
    status: "Online",
  },
  {
    id: "DC003",
    name: "Frankfurt Beta",
    region: "EU-Central-1",
    type: "Colocation",
    gpuCapacity: 1024,
    deployedGPUs: 896,
    utilization: "87.5%",
    powerUsage: "16.8 MW",
    temperature: "23°C",
    liveDate: "2024-03-10",
    status: "Online",
  },
  {
    id: "DC004",
    name: "Singapore Gamma",
    region: "APAC-Southeast-1",
    type: "Colocation",
    gpuCapacity: 768,
    deployedGPUs: 576,
    utilization: "75.0%",
    powerUsage: "22.4 MW",
    temperature: "24°C",
    liveDate: "2024-05-01",
    status: "Online",
  },
  {
    id: "DC005",
    name: "Chicago Delta",
    region: "US-Central-1",
    type: "Owned",
    gpuCapacity: 1792,
    deployedGPUs: 1792,
    utilization: "100.0%",
    powerUsage: "15.6 MW",
    temperature: "22°C",
    liveDate: "2024-02-28",
    status: "Online",
  },
  {
    id: "DC006",
    name: "Tokyo Zeta",
    region: "APAC-Northeast-1",
    type: "Colocation",
    gpuCapacity: 768,
    deployedGPUs: 576,
    utilization: "75.0%",
    powerUsage: "18.2 MW",
    temperature: "23°C",
    liveDate: "2024-04-12",
    status: "Online",
  },
  {
    id: "DC007",
    name: "California Eta",
    region: "US-West-1",
    type: "Edge",
    gpuCapacity: 256,
    deployedGPUs: 224,
    utilization: "87.5%",
    powerUsage: "8.4 MW",
    temperature: "25°C",
    liveDate: "2024-06-15",
    status: "Maintenance",
  },
  {
    id: "DC008",
    name: "Ireland Epsilon",
    region: "EU-West-1",
    type: "Owned",
    gpuCapacity: 896,
    deployedGPUs: 0,
    utilization: "0.0%",
    powerUsage: "0.2 MW",
    temperature: "20°C",
    liveDate: "2024-07-20",
    status: "Commissioning",
  },
  {
    id: "DC009",
    name: "Sydney Theta",
    region: "APAC-Southeast-2",
    type: "Colocation",
    gpuCapacity: 512,
    deployedGPUs: 384,
    utilization: "75.0%",
    powerUsage: "14.6 MW",
    temperature: "22°C",
    liveDate: "2024-06-01",
    status: "Online",
  },
];

const typeOptions = [
  { value: "Owned", label: "Owned", variant: "default" as const },
  { value: "Colocation", label: "Colocation", variant: "secondary" as const },
  { value: "Edge", label: "Edge", variant: "outline" as const },
];

const statusOptions = [
  { value: "Online", label: "Online", variant: "default" as const },
  { value: "Maintenance", label: "Maintenance", variant: "outline" as const },
  { value: "Commissioning", label: "Commissioning", variant: "secondary" as const },
  { value: "Offline", label: "Offline", variant: "destructive" as const },
];

const createColumns = (
  onSave: (rowId: string, field: string, value: unknown) => void,
  isLoading: boolean
): ColumnDef<Datacenter>[] => [
  {
    accessorKey: "id",
    header: "DC ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const type = row.getValue("type") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={type}
            type="select"
            options={typeOptions}
            onSave={cellOnSave}
            isLoading={cellIsLoading}
          />
        );
      }
      
      return (
        <Badge
          variant={
            type === "Owned"
              ? "default"
              : type === "Colocation"
              ? "secondary"
              : "outline"
          }
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "gpuCapacity",
    header: "GPU Capacity",
  },
  {
    accessorKey: "deployedGPUs",
    header: "Deployed GPUs",
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
    accessorKey: "liveDate",
    header: "Live Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const status = row.getValue("status") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={status}
            type="select"
            options={statusOptions}
            onSave={cellOnSave}
            isLoading={cellIsLoading}
          />
        );
      }
      
      return (
        <Badge
          variant={
            status === "Online"
              ? "default"
              : status === "Maintenance"
              ? "outline"
              : status === "Commissioning"
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

export default function Datacenters() {
  const [data, setData] = useState<Datacenter[]>(initialData);

  const mockSaveFunction = async (rowId: string, field: string, value: unknown) => {
    console.log(`Saving ${field} = ${value} for row ${rowId}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setData(prevData => 
      prevData.map(item => 
        item.id === rowId 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const { save, isLoading } = useAutoSave({
    onSave: mockSaveFunction,
    delay: 500,
  });

  const columns = createColumns(save, isLoading);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GPU Datacenters</h2>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        editable={true}
        onCellUpdate={save}
        isUpdating={isLoading}
      />
    </div>
  );
}