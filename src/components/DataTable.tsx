import { useMemo, useState, type ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Cell renderer. */
  render: (row: T) => ReactNode;
  /** Value used for sorting; when omitted the column is not sortable. */
  sortValue?: (row: T) => number | string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  headerTitle?: string;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  initialSort,
  initialDirection = 'desc',
  emptyMessage = 'Nothing to show.',
  onRowClick,
  dense = false,
  maxHeight,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T, index: number) => string;
  initialSort?: string;
  initialDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  dense?: boolean;
  maxHeight?: number;
}) {
  const [sortKey, setSortKey] = useState<string | undefined>(initialSort);
  const [direction, setDirection] = useState<'asc' | 'desc'>(initialDirection);

  const sorted = useMemo(() => {
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortValue) return rows;
    const factor = direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [rows, columns, sortKey, direction]);

  const toggle = (column: Column<T>) => {
    if (!column.sortValue) return;
    if (sortKey === column.key) {
      setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(column.key);
      setDirection('desc');
    }
  };

  return (
    <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-ink-900/95 backdrop-blur">
          <tr className="border-b border-ink-700">
            {columns.map((column) => {
              const isActive = sortKey === column.key;
              return (
                <th
                  key={column.key}
                  title={column.headerTitle}
                  onClick={() => toggle(column)}
                  className={`th ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''} ${
                    column.sortValue ? 'cursor-pointer select-none hover:text-slate-200' : ''
                  } ${isActive ? 'text-amber-400' : ''} ${column.className ?? ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {column.header}
                    {column.sortValue ? (
                      <span className={`text-[9px] ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                        {isActive && direction === 'asc' ? '▲' : '▼'}
                      </span>
                    ) : null}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td className="td text-center text-slate-500" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-ink-800/70 row-hover ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`td ${dense ? 'py-1.5' : ''} ${
                      column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''
                    } ${column.className ?? ''}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
