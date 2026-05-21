import { CircleDot, X } from 'lucide-react'

export function Field({ label, children, required = false, className = '' }) {
  return (
    <label className={className}>
      <span className="label">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </span>
      {children}
    </label>
  )
}

export function Select({ value, values, onChange, placeholder, required = false, disabled = false }) {
  return (
    <select className="field" value={value} onChange={(event) => onChange(event.target.value)} required={required} disabled={disabled}>
      {placeholder && <option value="">{placeholder}</option>}
      {values.map((item) => (
        <option key={item} value={item}>{item}</option>
      ))}
    </select>
  )
}

export function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      className={`flex items-center justify-center gap-1.5 border-r border-slate-200 px-2 py-3 transition duration-200 last:border-r-0 ${
        active ? 'bg-emerald-50 text-emerald-800 shadow-[inset_0_-2px_0_#047857]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon size={15} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

export function Toast({ error, notice, onDismiss }) {
  if (!error && !notice) return null
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2">
      <div className={`motion-rise flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-bold shadow-xl ${error ? 'bg-rose-600 text-white shadow-rose-900/20' : 'bg-slate-900 text-white shadow-slate-900/20'}`}>
        <span>{error || notice}</span>
        <button
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-white/80 transition hover:bg-white/10 hover:text-white"
          type="button"
          onClick={onDismiss}
          title="Dismiss message"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}

export function EmptyState({ label }) {
  return (
    <div className="flex min-h-28 items-center justify-center gap-2 rounded-md bg-white/60 text-sm font-medium text-slate-500">
      <CircleDot size={16} className="text-emerald-600" />
      {label}
    </div>
  )
}

export function MetricCard({ icon: Icon, label, value, color }) {
  const classes = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    sky: 'border-sky-200 bg-sky-50 text-sky-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
    slate: 'border-slate-200 bg-white text-slate-900',
  }
  return (
    <div className={`interactive-card flex items-center justify-between rounded-lg border px-4 py-4 shadow-sm ${classes[color] || classes.emerald}`}>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</div>
        <div className="text-3xl font-semibold">{value}</div>
      </div>
      <div className="rounded-md bg-white/75 p-2 shadow-sm">
        <Icon size={22} />
      </div>
    </div>
  )
}

export function RoleBadge({ value }) {
  const classes = {
    ADMIN: 'bg-slate-100 text-slate-700 ring-slate-200',
    DEVELOPER: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  }
  return <span className={`badge ring-1 ${classes[value] || classes.DEVELOPER}`}>{value}</span>
}

export function StatusBadge({ value }) {
  const classes = {
    TODO: 'bg-slate-100 text-slate-700 ring-slate-200',
    IN_PROGRESS: 'bg-sky-50 text-sky-700 ring-sky-200',
    IN_REVIEW: 'bg-amber-50 text-amber-700 ring-amber-200',
    DONE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  }
  return <span className={`badge ring-1 ${classes[value] || classes.TODO}`}>{value}</span>
}

export function TypeBadge({ value }) {
  const classes = {
    BUG: 'bg-rose-50 text-rose-700 ring-rose-200',
    FEATURE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    TECHNICAL: 'bg-slate-100 text-slate-700 ring-slate-200',
  }
  return <span className={`badge ring-1 ${classes[value] || classes.TECHNICAL}`}>{value}</span>
}

export function PriorityBadge({ value, overdue }) {
  const classes = {
    LOW: 'bg-slate-100 text-slate-700 ring-slate-200',
    MEDIUM: 'bg-sky-50 text-sky-700 ring-sky-200',
    HIGH: 'bg-amber-50 text-amber-700 ring-amber-200',
    CRITICAL: 'bg-rose-50 text-rose-700 ring-rose-200',
  }
  return <span className={`badge ring-1 ${classes[value] || classes.LOW}`}>{overdue ? `${value} OVERDUE` : value}</span>
}
