/**
 * Shared admin page header: title on the left, optional meta on the right.
 * Keeps the h1 hierarchy identical to the previous inline markup.
 */
export default function PageHeader({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {meta && <span className="text-sm text-slate-500">{meta}</span>}
    </div>
  );
}
