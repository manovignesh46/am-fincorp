import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  className?: string;
}

const LIMIT_OPTIONS = [10, 20, 50, 100];

const Pagination = ({ page, limit, total, onPageChange, onLimitChange, className }: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const btnBase =
    'inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 px-1 py-3 text-sm text-slate-600', className)}>
      {/* Count + limit selector */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-xs font-medium">
          {total === 0 ? 'No records' : `Showing ${from}–${to} of ${total}`}
        </span>
        <span className="text-slate-200">|</span>
        <label className="text-xs text-slate-400 font-medium">Rows:</label>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all cursor-pointer"
        >
          {LIMIT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          className={cn(btnBase, 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300')}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page pills */}
        {getPagesToShow(page, totalPages).map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 text-center text-slate-400 text-xs select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                btnBase,
                p === page
                  ? 'bg-blue-600 text-white border border-blue-600 shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          className={cn(btnBase, 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300')}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

/** Returns an array of page numbers (and '...' ellipsis) to display */
function getPagesToShow(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}

export default Pagination;
