import React from 'react';
import { cn } from '../../utils/cn';

export interface Column<T = Record<string, unknown>> {
  header: string;
  accessor: ((row: T) => React.ReactNode) | string;
  /** Hide this column on mobile (< md). Use for secondary/detail columns. */
  hideOnMobile?: boolean;
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
    <div className={cn('w-full overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200 bg-white shadow-sm', className)}>
      <table className="min-w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  'px-3 py-3 md:px-6 md:py-4 whitespace-nowrap',
                  column.hideOnMobile && 'hidden md:table-cell'
                )}
              >
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
                  <td
                    key={colIndex}
                    className={cn(
                      'px-3 py-3 md:px-6 md:py-4',
                      column.hideOnMobile && 'hidden md:table-cell'
                    )}
                  >
                    {typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : (row as Record<string, unknown>)[column.accessor] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.filter(c => !c.hideOnMobile).length} className="px-3 py-10 text-center text-slate-400">
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
