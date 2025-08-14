import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataTableSkeletonProps {
  columns?: number;
  rows?: number;
  showFilters?: boolean;
  showPagination?: boolean;
}

export function DataTableSkeleton({ 
  columns = 5, 
  rows = 10, 
  showFilters = true, 
  showPagination = true 
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      {/* Header controls skeleton */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-[250px]" />
          {showFilters && <Skeleton className="h-8 w-32" />}
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      {/* Filters skeleton */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 py-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      )}

      {/* Table skeleton */}
      <div className="rounded-md border overflow-auto max-h-[calc(100vh-16rem)]">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i} className="h-12">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columns }).map((_, j) => (
                  <TableCell key={j} className="h-12">
                    {j === 0 ? (
                      <Skeleton className="h-4 w-4" /> // Checkbox column
                    ) : j === columns - 1 ? (
                      <Skeleton className="h-6 w-16 rounded-full" /> // Badge column
                    ) : (
                      <Skeleton className="h-4 w-16" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination skeleton */}
      {showPagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center space-x-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Card grid skeleton for dashboard views
export function CardGridSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton({ height = "h-[200px]" }: { height?: string }) {
  return (
    <div className={`w-full ${height} rounded-lg border p-4`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="h-full flex items-end space-x-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Page skeleton
export function PageSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <DataTableSkeleton />
    </div>
  );
}