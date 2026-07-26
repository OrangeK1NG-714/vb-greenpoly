"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_SUBTLE, statusClass } from "@/components/ui/status";

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
      className={`text-xs font-semibold px-2 py-1 rounded border outline-none transition-colors focus:ring-2 focus:ring-brand-100 disabled:opacity-60 ${statusClass(STATUS_SUBTLE, value)}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
