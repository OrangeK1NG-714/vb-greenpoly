// Root admin layout — minimal pass-through.
// Auth check + sidebar live in (dashboard)/layout.tsx so /admin/login renders cleanly.

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
