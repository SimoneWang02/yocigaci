import { forwardRef } from 'react'

export const Select = forwardRef(({ label, error, children, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <select
      ref={ref}
      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${
        error ? 'border-red-400' : 'border-gray-300'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
))
Select.displayName = 'Select'
