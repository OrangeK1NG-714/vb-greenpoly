"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { getOrCreateSession, track, trackFormSubmit } from "@/lib/tracking";
import { PRODUCTS, findGrade } from "@/lib/products-data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const PRODUCT_OPTIONS = [
  {
    group: "ABS",
    items: [
      "ABS — Black Injection",
      "ABS — Natural / Off-white",
      "ABS — White (appliance)",
      "ABS — Grey (auto interior)",
      "ABS — Flame Retardant V-0",
    ],
  },
  {
    group: "HIPS",
    items: [
      "HIPS — White (refrigerator liner)",
      "HIPS — Natural (thermoforming)",
      "HIPS — Black (E&E housings)",
      "HIPS — Mixed color regrind",
    ],
  },
  {
    group: "PP",
    items: [
      "PP — Black Injection",
      "PP — Natural Raffia",
      "PP — Copolymer for Crates",
      "PP — Talc 20% Filled",
      "PP — Fiber Spinning",
    ],
  },
  {
    group: "GPPS",
    items: [
      "GPPS — Crystal Clear Injection",
      "GPPS — Sheet Extrusion",
      "GPPS — Audio / CD Case Grade",
      "GPPS — Mixed color regrind",
    ],
  },
] as const;

export default function ContactForm() {
  const t = useTranslations("contact.form");
  const search = useSearchParams();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const focusedFields = useRef<Set<string>>(new Set());
  const intentTracked = useRef(false);

  const initialProductSlug = search?.get("product") ?? "";
  const initialGradeCode = search?.get("grade") ?? "";
  const initialSample = search?.get("sample") ?? "";

  const initialProductLabel = (() => {
    if (initialGradeCode) {
      const hit = findGrade(initialGradeCode);
      if (hit) return `${hit.product.category} — ${hit.grade.code} (${hit.grade.process})`;
    }
    if (initialProductSlug) {
      const product = PRODUCTS.find((item) => item.slug === initialProductSlug);
      if (product) return `${product.category} — General`;
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

  function onFieldFocus(event: React.FocusEvent<HTMLFormElement>) {
    const target = event.target as unknown as { name?: string };
    const name = target.name;
    if (!name || focusedFields.current.has(name)) return;
    focusedFields.current.add(name);
    track({
      eventName: "form_field_focus",
      page: window.location.pathname,
      properties: { field: name, order: focusedFields.current.size },
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const formData = new FormData(event.currentTarget);
    const data: Record<string, string> = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [key, String(value)])
    );
    data.sessionId = getOrCreateSession();

    const url = new URL(window.location.href);
    data.utmSource = url.searchParams.get("utm_source") || "";
    data.utmMedium = url.searchParams.get("utm_medium") || "";
    data.utmCampaign = url.searchParams.get("utm_campaign") || "";
    if (initialGradeCode) data.grade = initialGradeCode;

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("submit_failed");
      trackFormSubmit("inquiry", {
        product: data.product,
        volume: data.volume,
        grade: initialGradeCode || undefined,
      });
      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Alert className="border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
        <CheckCircle2 className="h-5 w-5 text-emerald-700" aria-hidden="true" />
        <AlertTitle className="text-base font-bold">{t("successTitle")}</AlertTitle>
        <AlertDescription className="text-emerald-800">{t("successBody")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit} onFocus={onFieldFocus} ref={formRef}>
      <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        Website
        <Input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      {initialGradeCode && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t("prefillNotice")}</AlertTitle>
          <AlertDescription className="font-mono text-emerald-800">{initialGradeCode}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label={t("name")} required autoComplete="name" />
        <Field name="company" label={t("company")} autoComplete="organization" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="email" type="email" label={t("email")} required autoComplete="email" />
        <Field
          name="phone"
          type="tel"
          label={t("phone")}
          placeholder="+84 / +62 / +66 / +60 · WhatsApp"
          autoComplete="tel"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="country" label={t("country")} required autoComplete="country-name" />
        <Field name="port" label={t("port")} placeholder="Cat Lai, Tanjung Priok, Laem Chabang" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-trigger">{t("product")} *</Label>
        <Select name="product" required defaultValue={initialProductLabel || undefined}>
          <SelectTrigger id="product-trigger" className="h-11 rounded-lg bg-white">
            <SelectValue placeholder={t("productPlaceholder")} />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {initialProductLabel && (
              <>
                <SelectGroup>
                  <SelectLabel>{t("prefillNotice")}</SelectLabel>
                  <SelectItem value={initialProductLabel}>{initialProductLabel}</SelectItem>
                </SelectGroup>
                <SelectSeparator />
              </>
            )}
            {PRODUCT_OPTIONS.map((group, groupIndex) => (
              <SelectGroup key={group.group}>
                {groupIndex > 0 && <SelectSeparator />}
                <SelectLabel>{group.group}</SelectLabel>
                {group.items.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
            <SelectSeparator />
            <SelectItem value="Other / Custom Compound">Other / Custom Compound</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="volume-trigger">{t("volume")} *</Label>
          <Select name="volume" required>
            <SelectTrigger id="volume-trigger" className="h-11 rounded-lg bg-white">
              <SelectValue placeholder={t("volumePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {(["sample", "small", "medium", "large", "monthly"] as const).map((option) => {
                const label = t(`volumeOpts.${option}`);
                return (
                  <SelectItem key={option} value={label}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="incoterms-trigger">{t("incoterms")}</Label>
          <Select name="incoterms" defaultValue="FOB Ningbo">
            <SelectTrigger id="incoterms-trigger" className="h-11 rounded-lg bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["FOB Ningbo", "CIF", "CFR", "EXW"].map((term) => (
                <SelectItem key={term} value={term}>
                  {term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">{t("message")}</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder={t("messagePh")}
          defaultValue={initialMessage}
          className="min-h-32 resize-y rounded-lg bg-white"
        />
      </div>

      <Button
        type="submit"
        disabled={status === "submitting"}
        className="h-12 w-full rounded-xl bg-brand-700 text-base font-semibold shadow-soft hover:bg-brand-800"
        data-track="cta_form_submit"
      >
        {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {status === "submitting" ? t("submitting") : t("submit")}
      </Button>

      {status === "error" && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <TriangleAlert className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t("errorTitle")}</AlertTitle>
          <AlertDescription>{t("errorBody")}</AlertDescription>
        </Alert>
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
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label} {required && "*"}
      </Label>
      <Input
        id={name}
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 rounded-lg bg-white"
      />
    </div>
  );
}
