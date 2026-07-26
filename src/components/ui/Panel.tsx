/**
 * Shared admin panel card. Used by the Dashboard, Analytics and Traffic
 * pages, which previously each declared their own near-identical Panel.
 */
export default function Panel({
  title,
  subtitle,
  wide,
  children,
}: {
  title: string;
  subtitle?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`admin-card p-5 ${wide ? "lg:col-span-2" : ""}`}>
      <h3 className="font-bold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}
