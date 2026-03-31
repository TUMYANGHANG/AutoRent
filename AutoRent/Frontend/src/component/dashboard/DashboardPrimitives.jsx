/**
 * Shared layout primitives for Admin + Owner dashboards (glass / bento style).
 */
export function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-600">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
            {subtitle}
          </p>
        )}
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}

export function GlassPanel({ children, className = "", padding = true }) {
  return (
    <div
      className={`dash-panel rounded-2xl ${padding ? "p-6 sm:p-8" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

const accentMap = {
  teal: "from-teal-500 to-emerald-600",
  sky: "from-sky-500 to-indigo-600",
  rose: "from-rose-500 to-amber-500",
  violet: "from-violet-500 to-fuchsia-600",
};

export function KpiCard({ label, value, icon, accent = "teal" }) {
  const grad = accentMap[accent] || accentMap.teal;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_8px_32px_rgba(15,23,42,0.07)] backdrop-blur-sm transition-all duration-300 hover:border-teal-300/40 hover:shadow-[0_16px_48px_rgba(15,23,42,0.12)]">
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${grad} opacity-[0.15] blur-2xl transition-opacity group-hover:opacity-25`}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white shadow-lg shadow-slate-900/15`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={`dash-panel rounded-2xl p-5 sm:p-6 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
