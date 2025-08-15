import { useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { EditableCell } from "@/components/ui/editable-cell";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useExecutionSignals, useUpdateExecutionSignal } from "@/hooks/use-duckdb";
import { Loader2 } from "lucide-react";

type ExecutionSignal = {
  mdmid: string;
  status: "active" | "inactive" | "pending" | "failure";
  triggered_at: string;
  signal_type?: string;
  threshold_value?: number;
  current_value?: number;
  description?: string;
  customer?: string;
  requested_gpus?: number;
  demand_priority?: string;
};

const statusOptions = [
  { value: "active", label: "Active", variant: "default" as const },
  { value: "inactive", label: "Inactive", variant: "secondary" as const },
  { value: "pending", label: "Pending", variant: "outline" as const },
  { value: "failure", label: "Failure", variant: "destructive" as const },
];

const createColumns = (
  onSave: (rowId: string, field: string, value: unknown) => void,
  isLoading: boolean
): ColumnDef<ExecutionSignal>[] => [
  {
    accessorKey: "mdmid",
    header: "MDM ID",
    cell: ({ row }) => {
      const id = row.getValue("mdmid") as string;
      return <span className="font-mono">{id}</span>;
    },
  },
  {
    accessorKey: "signal_type",
    header: "Signal Type",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const type = row.getValue("signal_type") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={type || ""}
            type="text"
            onSave={cellOnSave}
            isLoading={cellIsLoading}
            placeholder="Enter signal type..."
          />
        );
      }
      
      if (!type) return <span className="text-muted-foreground">-</span>;
      
      const displayType = type.replace(/_/g, ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return <span className="font-medium">{displayType}</span>;
    },
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
            status === "active"
              ? "default"
              : status === "failure"
              ? "destructive"
              : status === "pending"
              ? "outline"
              : "secondary"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "triggered_at",
    header: "Triggered At",
    cell: ({ row }) => {
      const timestamp = row.getValue("triggered_at") as string;
      if (!timestamp) return <span>-</span>;
      
      const date = new Date(timestamp);
      return <span className="font-mono text-sm">{date.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: "threshold_value",
    header: "Threshold",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const value = row.getValue("threshold_value") as number;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={value || 0}
            type="number"
            onSave={cellOnSave}
            isLoading={cellIsLoading}
            placeholder="0"
            validation={(val) => {
              const num = typeof val === 'string' ? parseFloat(val) : val;
              if (isNaN(num) || num < 0) return "Must be a positive number";
              return null;
            }}
          />
        );
      }
      
      if (value === undefined || value === null) return <span className="text-muted-foreground">-</span>;
      
      return <span className="font-mono">{value}</span>;
    },
  },
  {
    accessorKey: "current_value",
    header: "Current Value",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const value = row.getValue("current_value") as number;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={value || 0}
            type="number"
            onSave={cellOnSave}
            isLoading={cellIsLoading}
            placeholder="0"
            validation={(val) => {
              const num = typeof val === 'string' ? parseFloat(val) : val;
              if (isNaN(num) || num < 0) return "Must be a positive number";
              return null;
            }}
          />
        );
      }
      
      if (value === undefined || value === null) return <span className="text-muted-foreground">-</span>;
      
      const threshold = row.getValue("threshold_value") as number;
      const isOverThreshold = threshold && value > threshold;
      
      return (
        <span className={`font-mono ${isOverThreshold ? 'text-destructive' : ''}`}>
          {value}
        </span>
      );
    },
  },
  {
    accessorKey: "customer",
    header: "Related Customer",
    cell: ({ row }) => {
      const customer = row.getValue("customer") as string;
      
      if (!customer) return <span className="text-muted-foreground">-</span>;
      
      return <span>{customer}</span>;
    },
  },
  {
    accessorKey: "requested_gpus",
    header: "Requested GPUs",
    cell: ({ row }) => {
      const gpus = row.getValue("requested_gpus") as number;
      
      if (!gpus) return <span className="text-muted-foreground">-</span>;
      
      return <span className="font-mono">{gpus}</span>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const description = row.getValue("description") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={description || ""}
            type="text"
            onSave={cellOnSave}
            isLoading={cellIsLoading}
            placeholder="Enter description..."
          />
        );
      }
      
      return (
        <span className="max-w-[400px] truncate" title={description}>
          {description || <span className="text-muted-foreground">No description</span>}
        </span>
      );
    },
  },
];

export default function ExecutionSignals() {
  // Fetch data from DuckDB
  const { data: signals, loading, error, refetch } = useExecutionSignals();
  const { mutate: updateSignal } = useUpdateExecutionSignal();

  // Transform data for display
  const data = useMemo(() => {
    if (!signals) return [];
    return signals as ExecutionSignal[];
  }, [signals]);

  // Save function that updates DuckDB
  const handleSave = async (rowId: string, field: string, value: unknown) => {
    console.log(`Saving ${field} = ${value} for signal ${rowId}`);
    
    await updateSignal(
      { 
        mdmid: rowId, 
        updates: { [field]: value } 
      },
      {
        onSuccess: () => {
          refetch(); // Refresh data after successful update
        },
        successMessage: "Execution signal updated successfully",
        errorMessage: "Failed to update execution signal"
      }
    );
  };

  const { save, isLoading } = useAutoSave({
    onSave: handleSave,
    delay: 500,
  });

  const columns = createColumns(save, isLoading);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading execution signals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Failed to load execution signals: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GPU Execution Signals</h2>
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