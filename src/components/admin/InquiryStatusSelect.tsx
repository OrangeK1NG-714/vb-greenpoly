"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATING", "WON", "LOST"];

export default function InquiryStatusSelect({ id, current }: { id: string; current: string }) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setValue(next);
    setSaving(true);
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } catch {
      setValue(current);
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={saving}
      className={`text-xs font-semibold px-2 py-1 rounded border ${statusClass(value)}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    NEW: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CONTACTED: "bg-blue-50 text-blue-700 border-blue-200",
    QUOTED: "bg-purple-50 text-purple-700 border-purple-200",
    NEGOTIATING: "bg-amber-50 text-amber-700 border-amber-200",
    WON: "bg-green-50 text-green-700 border-green-200",
    LOST: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return map[status] ?? map.NEW;
}
