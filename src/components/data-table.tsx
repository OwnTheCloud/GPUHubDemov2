import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, Trash2, ArrowUpDown } from "lucide-react";
import { EditableCell } from "@/components/ui/editable-cell";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  enableRowSelection?: boolean;
  enableBulkActions?: boolean;
  onExport?: (selectedRows: TData[]) => void;
  onDelete?: (selectedRows: TData[]) => void;
  editable?: boolean;
  onCellUpdate?: (rowId: string, field: string, value: unknown) => Promise<void>;
  isUpdating?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  enableRowSelection = true,
  enableBulkActions = true,
  onExport,
  onDelete,
  editable = false,
  onCellUpdate,
  isUpdating = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [updatingCells, setUpdatingCells] = useState<Set<string>>(new Set());

  const handleCellUpdate = useCallback(
    async (rowId: string, field: string, value: unknown) => {
      if (!onCellUpdate) return;

      const cellKey = `${rowId}-${field}`;
      setUpdatingCells(prev => new Set(prev).add(cellKey));

      try {
        await onCellUpdate(rowId, field, value);
      } finally {
        setUpdatingCells(prev => {
          const newSet = new Set(prev);
          newSet.delete(cellKey);
          return newSet;
        });
      }
    },
    [onCellUpdate]
  );

  const isCellUpdating = useCallback(
    (rowId: string, field: string) => {
      const cellKey = `${rowId}-${field}`;
      return updatingCells.has(cellKey);
    },
    [updatingCells]
  );

  // Add selection column if row selection is enabled
  const selectionColumn: ColumnDef<TData, TValue> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const enhancedColumns = enableRowSelection
    ? [selectionColumn, ...columns]
    : columns;

  // Add sorting to all columns that don't already have it and wrap with editable logic
  const sortableColumns = enhancedColumns.map((column) => {
    // Check if column already has a custom header or is the select column
    if ('id' in column && column.id === "select") {
      return column;
    }
    
    const accessorKey = 'accessorKey' in column ? column.accessorKey as string : '';
    const headerText = typeof column.header === "string" ? column.header : accessorKey;
    
    // Create enhanced column with sorting and editable logic
    const enhancedColumn = {
      ...column,
      header: typeof column.header === "function" ? column.header : ({ column: sortCol }) => (
        <Button
          variant="ghost"
          onClick={() => sortCol.toggleSorting(sortCol.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          {headerText}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    };

    // If editable, wrap or create cell function with editable logic
    if (editable && column.id !== "select") {
      const originalCell = column.cell;
      enhancedColumn.cell = (cellContext) => {
        const rowId = (cellContext.row.original as Record<string, unknown>).id as string || cellContext.row.id;
        const fieldName = cellContext.column.id;
        const cellIsUpdating = isCellUpdating(rowId, fieldName);
        
        if (originalCell && typeof originalCell === 'function') {
          // Call the original cell function with enhanced context
          return originalCell({
            ...cellContext,
            editable: true,
            onSave: (value: unknown) => handleCellUpdate(rowId, fieldName, value),
            isLoading: cellIsUpdating,
          });
        } else {
          // Create a default editable cell for columns without custom cell functions
          const value = cellContext.getValue();
          return (
            <EditableCell
              value={value}
              type="text"
              onSave={(newValue: unknown) => handleCellUpdate(rowId, fieldName, newValue)}
              isLoading={cellIsUpdating}
              placeholder={`Enter ${fieldName}...`}
            />
          );
        }
      };
    }
    
    return enhancedColumn;
  }) as ColumnDef<TData, TValue>[];

  const table = useReactTable({
    data,
    columns: sortableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowId: (row, index) => (row as Record<string, unknown>).id as string || index.toString(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: enableRowSelection,
    enableMultiRowSelection: true,
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);

  const convertToCSV = (data: Record<string, unknown>[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        const stringValue = value === null || value === undefined ? '' : String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const handleExport = () => {
    if (onExport) {
      onExport(selectedRows);
    } else {
      // Default export functionality
      const csvData = convertToCSV(selectedRows as Record<string, unknown>[]);
      const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvData);
      const exportFileDefaultName = 'table-data.csv';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(selectedRows);
    }
    // Clear selection after delete
    setRowSelection({});
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Global search..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          {enableBulkActions && selectedRows.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="h-8"
              >
                <Download className="mr-2 h-4 w-4" />
                Export ({selectedRows.length})
              </Button>
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedRows.length})
                </Button>
              )}
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "select" ? "Selection" : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border overflow-auto max-h-[calc(100vh-16rem)]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={enableRowSelection ? columns.length + 1 : columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {enableRowSelection && (
            <span>
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </span>
          )}
          {!enableRowSelection && (
            <span>
              Showing {table.getRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s).
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}