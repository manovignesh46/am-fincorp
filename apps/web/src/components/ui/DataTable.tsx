import React from 'react';
import { cn } from '../../utils/cn';

export interface Column<T = Record<string, unknown>> {
  header: string;
  accessor: ((row: T) => React.ReactNode) | string;
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (row: T) => void;
}

const DataTable = <T = Record<string, unknown>>({
  columns,
  data,
  className,
  onRowClick,
}: DataTableProps<T>) => {
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm', className)}>
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="px-6 py-4">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  'hover:bg-slate-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : (row as Record<string, unknown>)[column.accessor] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-400">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
