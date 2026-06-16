export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    preorder: 'bg-amber-100 text-amber-800',
    limited: 'bg-indigo-100 text-indigo-800',
    sold_out: 'bg-red-100 text-red-700',
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-orange-100 text-orange-800',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
