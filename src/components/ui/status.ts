/**
 * Shared inquiry-status color tokens for the admin UI.
 * Previously each page/component declared its own map with slightly
 * different hues (sky vs blue, violet vs purple); this unifies them.
 */

/** Soft badge — small labels on dashboards and lead rows. */
export const STATUS_BADGE: Record<string, string> = {
  NEW: "bg-emerald-100 text-emerald-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  QUOTED: "bg-purple-100 text-purple-700",
  NEGOTIATING: "bg-amber-100 text-amber-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-slate-100 text-slate-600",
};

/** Solid pill — active filter state. */
export const STATUS_SOLID: Record<string, string> = {
  NEW: "bg-emerald-600 text-white border-emerald-600",
  CONTACTED: "bg-blue-600 text-white border-blue-600",
  QUOTED: "bg-purple-600 text-white border-purple-600",
  NEGOTIATING: "bg-amber-600 text-white border-amber-600",
  WON: "bg-green-600 text-white border-green-600",
  LOST: "bg-slate-600 text-white border-slate-600",
};

/** Subtle tinted surface with border — selects and inline chips. */
export const STATUS_SUBTLE: Record<string, string> = {
  NEW: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONTACTED: "bg-blue-50 text-blue-700 border-blue-200",
  QUOTED: "bg-purple-50 text-purple-700 border-purple-200",
  NEGOTIATING: "bg-amber-50 text-amber-700 border-amber-200",
  WON: "bg-green-50 text-green-700 border-green-200",
  LOST: "bg-slate-50 text-slate-700 border-slate-200",
};

/** Solid bar color — pipeline distribution bars. */
export const STATUS_BAR: Record<string, string> = {
  NEW: "bg-emerald-500",
  CONTACTED: "bg-blue-500",
  QUOTED: "bg-purple-500",
  NEGOTIATING: "bg-amber-500",
  WON: "bg-green-600",
  LOST: "bg-slate-400",
};

export function statusClass(map: Record<string, string>, status: string): string {
  return map[status] ?? map.LOST;
}
