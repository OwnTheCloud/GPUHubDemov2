import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

export interface TableContextData {
  tableName: string;
  columns: ColumnDef<any>[];
  data: any[];
  filteredData?: any[];
  totalRows: number;
  pageInfo?: {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  };
}

interface TableContextType {
  currentTable: TableContextData | null;
  setTableContext: (context: TableContextData | null) => void;
  isContextEnabled: boolean;
  toggleContext: () => void;
  getContextSummary: () => string;
  estimateTokens: () => number;
}

const TableContext = createContext<TableContextType | null>(null);

export function useTableContext() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableContextProvider');
  }
  return context;
}

export function TableContextProvider({ children }: { children: ReactNode }) {
  const [currentTable, setCurrentTable] = useState<TableContextData | null>(null);
  const [isContextEnabled, setIsContextEnabled] = useState(true);

  const setTableContext = useCallback((context: TableContextData | null) => {
    setCurrentTable(context);
  }, []);

  const toggleContext = useCallback(() => {
    setIsContextEnabled(prev => !prev);
  }, []);

  const getContextSummary = useCallback(() => {
    if (!currentTable) return 'No table data available';
    
    const displayData = currentTable.filteredData || currentTable.data;
    return `${currentTable.tableName}: ${displayData.length} rows, ${currentTable.columns.length} columns`;
  }, [currentTable]);

  const estimateTokens = useCallback(() => {
    if (!currentTable || !isContextEnabled) return 0;
    
    const displayData = currentTable.filteredData || currentTable.data;
    // Rough estimation: ~4 chars per token, JSON overhead
    const dataJson = JSON.stringify(displayData);
    const schemaJson = JSON.stringify(currentTable.columns.map(col => ({
      key: typeof col.accessorKey === 'string' ? col.accessorKey : col.id,
      header: typeof col.header === 'string' ? col.header : 'Column'
    })));
    
    return Math.ceil((dataJson.length + schemaJson.length + 500) / 4);
  }, [currentTable, isContextEnabled]);

  const formatTableContextForAI = useMemo(() => {
    return () => {
      if (!currentTable || !isContextEnabled) return null;

      const displayData = currentTable.filteredData || currentTable.data;
      
      // Extract column information
      const columnInfo = currentTable.columns.map(col => {
        const key = typeof col.accessorKey === 'string' ? col.accessorKey : col.id;
        const header = typeof col.header === 'string' ? col.header : 
                      typeof col.header === 'function' ? key : 'Column';
        return { key, header };
      }).filter(col => col.key); // Only include columns with keys

      return {
        tableName: currentTable.tableName,
        totalRows: currentTable.totalRows,
        displayedRows: displayData.length,
        columns: columnInfo,
        data: displayData.slice(0, 100), // Limit to first 100 rows to manage context size
        pageInfo: currentTable.pageInfo,
        note: displayData.length > 100 ? `Showing first 100 of ${displayData.length} rows` : undefined
      };
    };
  }, [currentTable, isContextEnabled]);

  const value: TableContextType = useMemo(() => {
    const contextValue = {
      currentTable: isContextEnabled ? currentTable : null,
      setTableContext,
      isContextEnabled,
      toggleContext,
      getContextSummary,
      estimateTokens,
    };

    // Expose formatTableContextForAI for external use
    (contextValue as any).formatTableContextForAI = formatTableContextForAI;
    
    return contextValue;
  }, [currentTable, isContextEnabled]);

  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
}