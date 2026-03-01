import React from 'react';

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T, rowIndex: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyField: keyof T;
  title?: string;
  showPagination?: boolean;
  currentPage?: number;
  totalRecords?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  footer?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
  selectedRowKey?: string | number;
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  title,
  showPagination = false,
  currentPage = 1,
  totalRecords = 0,
  pageSize = 10,
  onPageChange,
  footer,
  emptyMessage = 'No data available',
  className = '',
  onRowClick,
  selectedRowKey,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const getNestedValue = (obj: T, key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = obj;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }
    return value;
  };

  return (
    <div className={`border border-[var(--erp-border)] rounded overflow-hidden ${className}`}>
      {/* Header */}
      {(title || showPagination) && (
        <div className="px-5 py-3 bg-slate-50 border-b border-[var(--erp-border)] flex justify-between items-center">
          {title && (
            <span className="text-sm font-bold text-[var(--erp-text-muted)] uppercase tracking-widest">{title}</span>
          )}
          {showPagination && totalRecords > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[var(--erp-text-muted)] italic">
                Showing {startRecord}-{endRecord} of {totalRecords} records
              </span>
              <div className="flex border rounded overflow-hidden border-[var(--erp-border)]">
                <button 
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-[13px] border-r border-[var(--erp-border)] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === 1}
                  onClick={() => onPageChange?.(currentPage - 1)}
                >
                  Prev
                </button>
                <button 
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange?.(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-100 border-b-2 border-[var(--erp-border)]">
          <tr className="text-[var(--erp-text-muted)]">
            {columns.map((col, idx) => (
              <th 
                key={String(col.key) + idx}
                className={`px-3 py-2 font-bold uppercase text-[13px] tracking-widest ${col.headerClassName || ''}`}
                style={{ 
                  width: col.width,
                  textAlign: col.align || 'left'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-slate-400 italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const rowKey = row[keyField];
              const isSelected = selectedRowKey !== undefined && rowKey === selectedRowKey;
              return (
                <tr 
                  key={String(rowKey)} 
                  className={`hover:bg-slate-50 ${onRowClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, colIdx) => {
                    const value = getNestedValue(row, String(col.key));
                    return (
                      <td 
                        key={String(col.key) + colIdx}
                        className={`px-3 py-2 ${col.cellClassName || ''}`}
                        style={{ textAlign: col.align || 'left' }}
                      >
                        {col.render 
                          ? col.render(value as T[keyof T], row, rowIndex)
                          : String(value ?? '')}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
        {footer && (
          <tfoot className="bg-slate-50 font-bold border-t-2 border-[var(--erp-border)]">
            {footer}
          </tfoot>
        )}
      </table>
    </div>
  );
}

export default DataTable;
