"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getOrCreateSession, track, trackFormSubmit } from "@/lib/tracking";
import { PRODUCTS, findGrade } from "@/lib/products-data";

export default function ContactForm() {
  const t = useTranslations("contact.form");
  const search = useSearchParams();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const focusedFields = useRef<Set<string>>(new Set());
  const intentTracked = useRef(false);

  // Prefill from ?product=abs and ?grade=ABS-BK-IN
  const initialProductSlug = search?.get("product") ?? "";
  const initialGradeCode = search?.get("grade") ?? "";
  const initialSample = search?.get("sample") ?? "";

  const initialProductLabel = (() => {
    if (initialGradeCode) {
      const hit = findGrade(initialGradeCode);
      if (hit) return `${hit.product.category} — ${hit.grade.code} (${hit.grade.process})`;
    }
    if (initialProductSlug) {
      const p = PRODUCTS.find((p) => p.slug === initialProductSlug);
      if (p) return `${p.category} — General`;
    }
    return "";
  })();

  const initialMessage = (() => {
    if (initialGradeCode) {
      const hit = findGrade(initialGradeCode);
      if (hit) {
        return `Interested in grade ${hit.grade.code} — MFI ${hit.grade.mfi}, ${hit.grade.color}, for ${hit.grade.application}. Please send TDS / COA and current FOB Ningbo price.`;
      }
    }
    if (initialSample) {
      return `Please send a free sample (1–3 kg) of ${initialSample.toUpperCase()} so we can test on our line.`;
    }
    return "";
  })();

  // Track inquiry intent (someone landed on form with a product / grade preselected)
  useEffect(() => {
    if (intentTracked.current) return;
    if (initialProductSlug || initialGradeCode || initialSample) {
      intentTracked.current = true;
      track({
        eventName: "inquiry_intent",
        page: window.location.pathname,
        properties: {
          product: initialProductSlug || undefined,
          grade: initialGradeCode || undefined,
          sample: initialSample || undefined,
        },
      });
    }
  }, [initialProductSlug, initialGradeCode, initialSample]);

  function onFieldFocus(e: React.FocusEvent<HTMLFormElement>) {
    const target = e.target as unknown as { name?: string };
    const name = target.name;
    if (!name || focusedFields.current.has(name)) return;
    focusedFields.current.add(name);
    track({
      eventName: "form_field_focus",
      page: window.location.pathname,
      properties: { field: name, order: focusedFields.current.size },
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = Object.fromEntries(
      Array.from(formData.entries()).map(([k, v]) => [k, String(v)])
    );
    data.sessionId = getOrCreateSession();

    const url = new URL(window.location.href);
    data.utmSource = url.searchParams.get("utm_source") || "";
    data.utmMedium = url.searchParams.get("utm_medium") || "";
    data.utmCampaign = url.searchParams.get("utm_campaign") || "";
    if (initialGradeCode) data.grade = initialGradeCode;

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("submit_failed");
      trackFormSubmit("inquiry", {
        product: data.product,
        volume: data.volume,
        grade: initialGradeCode || undefined,
      });
      setStatus("success");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-xl font-bold text-emerald-900 mb-2">{t("successTitle")}</h3>
        <p className="text-emerald-800">{t("successBody")}</p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} onFocus={onFieldFocus} ref={formRef}>
      <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {initialGradeCode && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-800">
          <strong>{t("prefillNotice")}</strong> {initialGradeCode}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field name="name" label={t("name")} required />
        <Field name="company" label={t("company")} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field name="email" type="email" label={t("email")} required />
        <Field name="phone" type="tel" label={t("phone")} placeholder="+84 / +62 / +66 / +60 · WhatsApp" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field name="country" label={t("country")} required />
        <Field name="port" label={t("port")} placeholder="Cat Lai, Tanjung Priok, Laem Chabang" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">{t("product")} *</label>
        <select
          name="product"
          required
          defaultValue={initialProductLabel}
          className="input-field"
        >
          <option value="">{t("productPlaceholder")}</option>
          {initialProductLabel && (
            <option value={initialProductLabel}>{initialProductLabel}</option>
          )}
          <optgroup label="ABS">
            <option>ABS — Black Injection</option>
            <option>ABS — Natural / Off-white</option>
            <option>ABS — White (appliance)</option>
            <option>ABS — Grey (auto interior)</option>
            <option>ABS — Flame Retardant V-0</option>
          </optgroup>
          <optgroup label="HIPS">
            <option>HIPS — White (refrigerator liner)</option>
            <option>HIPS — Natural (thermoforming)</option>
            <option>HIPS — Black (E&E housings)</option>
            <option>HIPS — Mixed color regrind</option>
          </optgroup>
          <optgroup label="PP">
            <option>PP — Black Injection</option>
            <option>PP — Natural Raffia</option>
            <option>PP — Copolymer for Crates</option>
            <option>PP — Talc 20% Filled</option>
            <option>PP — Fiber Spinning</option>
          </optgroup>
          <optgroup label="GPPS">
            <option>GPPS — Crystal Clear Injection</option>
            <option>GPPS — Sheet Extrusion</option>
            <option>GPPS — Audio / CD Case Grade</option>
            <option>GPPS — Mixed color regrind</option>
          </optgroup>
          <option>Other / Custom Compound</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">{t("volume")} *</label>
          <select name="volume" required className="input-field">
            <option value="">{t("volumePlaceholder")}</option>
            <option>{t("volumeOpts.sample")}</option>
            <option>{t("volumeOpts.small")}</option>
            <option>{t("volumeOpts.medium")}</option>
            <option>{t("volumeOpts.large")}</option>
            <option>{t("volumeOpts.monthly")}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">{t("incoterms")}</label>
          <select name="incoterms" className="input-field">
            <option>FOB Ningbo</option>
            <option>CIF</option>
            <option>CFR</option>
            <option>EXW</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">{t("message")}</label>
        <textarea
          name="message"
          rows={4}
          placeholder={t("messagePh")}
          defaultValue={initialMessage}
          className="input-field"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold py-3.5 rounded-lg transition-colors"
        data-track="cta_form_submit"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
      </button>

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          <strong>{t("errorTitle")}</strong> {t("errorBody")}
        </div>
      )}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
}
