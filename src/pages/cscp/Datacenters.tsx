import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { EditableCell } from "@/components/ui/editable-cell";
import { useAutoSave } from "@/hooks/use-auto-save";
import { datacentersData, datacenterTypeOptions, datacenterStatusOptions, type Datacenter } from "@/data/datacenters-data";
import { useDatacenters } from "@/contexts/data-context";


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
            options={datacenterTypeOptions}
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
            options={datacenterStatusOptions}
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
  // Use data from context, but maintain local state for editing
  const { datacenters: contextDatacenters } = useDatacenters();
  const [data, setData] = useState<Datacenter[]>(contextDatacenters.length > 0 ? contextDatacenters : datacentersData);
  
  // Update local state when context data changes
  useState(() => {
    if (contextDatacenters.length > 0) {
      setData(contextDatacenters);
    }
  });

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