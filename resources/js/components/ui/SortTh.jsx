import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export function SortTh({ column, sort, onSort, align = 'left', compact = false, children, className = '' }) {
  const active = sort.column === column
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  const paddingClass = compact ? 'px-4 py-2' : 'px-4 py-3'

  return (
    <th
      onClick={() => onSort(column)}
      className={`cursor-pointer select-none ${paddingClass} text-xs text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors ${alignClass} ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {active ? (
          sort.dir === 'asc'
            ? <ChevronUp className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            : <ChevronDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        ) : (
          <ChevronsUpDown className="w-3.5 h-3.5 opacity-30 shrink-0" />
        )}
      </span>
    </th>
  )
}
