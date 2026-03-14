import React from 'react';
import { cn } from '../../utils/cn';

/**
 * A generic, reusable data table component.
 * @param {Array} columns - Array of column objects { header: string, accessor: string | function }
 * @param {Array} data - Array of data objects to display
 * @param {string} className - Additional CSS classes for the table container
 * @param {function} onRowClick - Optional click handler for rows
 */
const DataTable = ({ columns, data, className, onRowClick }) => {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm", className)}>
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
                  "hover:bg-slate-50 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {typeof column.accessor === 'function' 
                      ? column.accessor(row) 
                      : row[column.accessor]}
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
