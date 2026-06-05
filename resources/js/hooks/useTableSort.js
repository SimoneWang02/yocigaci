import { useState, useMemo } from 'react'

export function useTableSort(items, defaultColumn = null, defaultDir = 'asc') {
  const [sort, setSort] = useState({ column: defaultColumn, dir: defaultDir })

  const sorted = useMemo(() => {
    if (!sort.column) return items
    return [...items].sort((a, b) => {
      const av = resolve(a, sort.column)
      const bv = resolve(b, sort.column)
      const cmp = compare(av, bv)
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [items, sort])

  const onSort = (column) =>
    setSort((prev) => ({
      column,
      dir: prev.column === column && prev.dir === 'asc' ? 'desc' : 'asc',
    }))

  return { sort, sorted, onSort }
}

function resolve(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

function compare(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, 'it')
  return a < b ? -1 : a > b ? 1 : 0
}
