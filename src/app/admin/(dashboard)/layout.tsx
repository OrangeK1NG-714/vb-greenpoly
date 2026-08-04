import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/visitors", label: "Visitors", icon: "👥" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "📬" },
  { href: "/admin/sales", label: "Sales desk", icon: "◆" },
  { href: "/admin/mvp", label: "MVP lab", icon: "🧪" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/traffic", label: "Traffic", icon: "🌍" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <aside className="w-full bg-slate-950 text-slate-300 flex flex-col lg:w-60 lg:min-h-screen">
        <div className="px-4 py-3 border-b border-slate-800 sm:px-6 lg:py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">G</div>
            <span className="text-white font-bold">GreenPoly</span>
          </div>
          <p className="hidden text-xs text-slate-500 mt-1 lg:block">{admin.email}</p>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-1 lg:block lg:space-y-1 lg:overflow-visible lg:py-4">
          {NAV.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="flex flex-none items-center gap-2 whitespace-nowrap px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white text-sm transition-colors lg:gap-3"
            >
              <span>{it.icon}</span>
              <span>{it.label}</span>
            </Link>
          ))}
        </nav>

        <form action="/api/admin/logout" method="POST" className="hidden p-3 border-t border-slate-800 lg:block">
          <button type="submit" className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white text-sm transition-colors flex items-center gap-3">
            <span>🚪</span> Sign out
          </button>
        </form>
      </aside>

      <div className="flex-1 min-w-0">
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
