import { useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { EditableCell } from "@/components/ui/editable-cell";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useInvestigationSignals, useUpdateInvestigationSignal } from "@/hooks/use-duckdb";
import { Loader2 } from "lucide-react";

type InvestigationSignal = {
  signal_id: string;
  signal_name: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "investigating" | "resolved" | "false_positive";
  triggered_at: string;
  resolved_at?: string;
  description?: string;
  asset_id?: string;
  asset_name?: string;
  assigned_to?: string;
  assigned_to_name?: string;
};

const severityOptions = [
  { value: "low", label: "Low", variant: "secondary" as const },
  { value: "medium", label: "Medium", variant: "default" as const },
  { value: "high", label: "High", variant: "destructive" as const },
  { value: "critical", label: "Critical", variant: "destructive" as const },
];

const statusOptions = [
  { value: "active", label: "Active", variant: "secondary" as const },
  { value: "investigating", label: "Investigating", variant: "outline" as const },
  { value: "resolved", label: "Resolved", variant: "default" as const },
  { value: "false_positive", label: "False Positive", variant: "secondary" as const },
];

const createColumns = (
  onSave: (rowId: string, field: string, value: unknown) => void,
  isLoading: boolean
): ColumnDef<InvestigationSignal>[] => [
  {
    accessorKey: "signal_id",
    header: "Signal ID",
    cell: ({ row }) => {
      const id = row.getValue("signal_id") as string;
      return <span className="font-mono">{id}</span>;
    },
  },
  {
    accessorKey: "signal_name",
    header: "Signal Name",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const name = row.getValue("signal_name") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={name}
            type="text"
            onSave={cellOnSave}
            isLoading={cellIsLoading}
            placeholder="Enter signal name..."
          />
        );
      }
      
      return <span className="font-medium">{name}</span>;
    },
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row, editable, onSave: cellOnSave, isLoading: cellIsLoading }) => {
      const severity = row.getValue("severity") as string;
      
      if (editable && cellOnSave) {
        return (
          <EditableCell
            value={severity}
            type="select"
            options={severityOptions}
            onSave={cellOnSave}
            isLoading={cellIsLoading}
          />
        );
      }
      
      return (
        <Badge
          variant={
            severity === "critical" || severity === "high"
              ? "destructive"
              : severity === "medium"
              ? "default"
              : "secondary"
          }
        >
          {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </Badge>
      );
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
      
      const displayStatus = status.replace('_', ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return (
        <Badge
          variant={
            status === "resolved"
              ? "default"
              : status === "investigating"
              ? "outline"
              : status === "false_positive"
              ? "secondary"
              : "secondary"
          }
        >
          {displayStatus}
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
    accessorKey: "asset_name",
    header: "Asset",
    cell: ({ row }) => {
      const assetName = row.getValue("asset_name") as string;
      const assetId = row.original.asset_id;
      
      if (!assetName && !assetId) return <span className="text-muted-foreground">-</span>;
      
      return (
        <div>
          <span className="font-medium">{assetName || assetId}</span>
        </div>
      );
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
  {
    accessorKey: "assigned_to_name",
    header: "Assigned To",
    cell: ({ row }) => {
      const assignedTo = row.getValue("assigned_to_name") as string;
      
      if (!assignedTo) return <span className="text-muted-foreground">Unassigned</span>;
      
      return <span>{assignedTo}</span>;
    },
  },
  {
    accessorKey: "resolved_at",
    header: "Resolved At",
    cell: ({ row }) => {
      const timestamp = row.getValue("resolved_at") as string;
      
      if (!timestamp) return <span className="text-muted-foreground">-</span>;
      
      const date = new Date(timestamp);
      return <span className="font-mono text-sm">{date.toLocaleString()}</span>;
    },
  },
];

export default function InvestigationSignals() {
  // Fetch data from DuckDB
  const { data: signals, loading, error, refetch } = useInvestigationSignals();
  const { mutate: updateSignal } = useUpdateInvestigationSignal();

  // Transform data for display
  const data = useMemo(() => {
    if (!signals) return [];
    return signals as InvestigationSignal[];
  }, [signals]);

  // Save function that updates DuckDB
  const handleSave = async (rowId: string, field: string, value: unknown) => {
    console.log(`Saving ${field} = ${value} for signal ${rowId}`);
    
    await updateSignal(
      { 
        id: rowId, 
        updates: { [field]: value } 
      },
      {
        onSuccess: () => {
          refetch(); // Refresh data after successful update
        },
        successMessage: "Signal updated successfully",
        errorMessage: "Failed to update signal"
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
          <p className="text-sm text-muted-foreground">Loading investigation signals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Failed to load investigation signals: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GPU Investigation Signals</h2>
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