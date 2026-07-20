import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/visitors", label: "Visitors", icon: "👥" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "📬" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/traffic", label: "Traffic", icon: "🌍" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 bg-slate-900 text-slate-300 min-h-screen flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">G</div>
            <span className="text-white font-bold">GreenPoly</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{admin.email}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white text-sm transition"
            >
              <span>{it.icon}</span>
              <span>{it.label}</span>
            </Link>
          ))}
        </nav>

        <form action="/api/admin/logout" method="POST" className="p-3 border-t border-slate-800">
          <button type="submit" className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white text-sm transition flex items-center gap-3">
            <span>🚪</span> Sign out
          </button>
        </form>
      </aside>

      <div className="flex-1 min-w-0">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
