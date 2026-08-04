"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getOrCreateSession, trackFormSubmit } from "@/lib/tracking";
import { MVP_PRODUCT_NAME } from "@/domain/mvp/validation";

export default function MvpInterestForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const storeUrl = String(formData.get("storeUrl") ?? "").trim();
    const useCase = String(formData.get("message") ?? "").trim();
    const url = new URL(window.location.href);

    const payload = {
      name: String(formData.get("name") ?? ""),
      company: String(formData.get("company") ?? ""),
      email: String(formData.get("email") ?? ""),
      country: String(formData.get("country") ?? ""),
      product: MVP_PRODUCT_NAME,
      volume: String(formData.get("volume") ?? ""),
      message: [`Store / company URL: ${storeUrl || "Not supplied"}`, useCase].filter(Boolean).join("\n\n"),
      sessionId: getOrCreateSession(),
      utmSource: url.searchParams.get("utm_source") ?? "",
      utmMedium: url.searchParams.get("utm_medium") ?? "",
      utmCampaign: url.searchParams.get("utm_campaign") ?? "",
      website: String(formData.get("website") ?? ""),
    };

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("submit_failed");
      trackFormSubmit("mvp_interest", { product: MVP_PRODUCT_NAME, volume: payload.volume });
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Alert className="border-emerald-300 bg-emerald-950/80 text-emerald-50">
        <CheckCircle2 className="text-emerald-300" aria-hidden="true" />
        <AlertTitle>Interest recorded</AlertTitle>
        <AlertDescription className="text-emerald-100">
          This is not a production commitment. We will confirm requirements before making a physical sample.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" aria-label="Request a product validation brief">
      <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        Website
        <Input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Your name" required autoComplete="name" />
        <Field name="company" label="Company / store" required autoComplete="organization" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="email" type="email" label="Work email" required autoComplete="email" />
        <Field name="country" label="Market" placeholder="US, UK, Germany…" autoComplete="country-name" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="storeUrl" type="url" label="Store URL" placeholder="https://" />
        <div className="space-y-1.5">
          <Label htmlFor="mvp-volume" className="text-emerald-50">Potential first order</Label>
          <select id="mvp-volume" name="volume" className="h-11 w-full rounded-lg border border-white/20 bg-emerald-950 px-3 text-sm text-white">
            <option value="Need one physical sample">Need one physical sample</option>
            <option value="30–99 sets">30–99 sets</option>
            <option value="100–299 sets">100–299 sets</option>
            <option value="300+ sets">300+ sets</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mvp-message" className="text-emerald-50">What must the sample prove?</Label>
        <Textarea
          id="mvp-message"
          name="message"
          className="min-h-28 border-white/20 bg-emerald-950 text-white placeholder:text-emerald-300/60"
          placeholder="Target price, wall mounting, disc capacity, packaging or material requirements…"
        />
      </div>
      <Button type="submit" disabled={status === "submitting"} className="h-12 bg-amber-400 font-bold text-emerald-950 hover:bg-amber-300">
        {status === "submitting" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
        {status === "submitting" ? "Recording…" : "Request validation brief"}
      </Button>
      <p className="text-xs leading-5 text-emerald-200/70">
        Development-stage product. No payment is collected here; final material, fit, capacity, price and lead time require a physical sample and written quote.
      </p>
      {status === "error" && (
        <Alert variant="destructive" className="border-red-300 bg-red-950/80 text-red-50">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Could not record your request</AlertTitle>
          <AlertDescription>Please try again or contact us by email.</AlertDescription>
        </Alert>
      )}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
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
      <Label htmlFor={`mvp-${name}`} className="text-emerald-50">{label}{required ? " *" : ""}</Label>
      <Input
        id={`mvp-${name}`}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 border-white/20 bg-emerald-950 text-white placeholder:text-emerald-300/60"
      />
    </div>
  );
}
