// Client-side tracking SDK
// Sends events to /api/track. Designed for B2B funnel analysis.

import { nanoid } from "nanoid";

const SESSION_KEY = "gp_sid";
const SESSION_FIRST_SEEN_KEY = "gp_first_seen";

export function getOrCreateSession(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = nanoid();
    localStorage.setItem(SESSION_KEY, sid);
    localStorage.setItem(SESSION_FIRST_SEEN_KEY, String(Date.now()));
  }
  return sid;
}

function getUtmParams() {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  return {
    utmSource: url.searchParams.get("utm_source") ?? undefined,
    utmMedium: url.searchParams.get("utm_medium") ?? undefined,
    utmCampaign: url.searchParams.get("utm_campaign") ?? undefined,
  };
}

type TrackPayload = {
  eventName: string;
  page: string;
  properties?: Record<string, unknown>;
  locale?: string;
};

export async function track(payload: TrackPayload) {
  if (typeof window === "undefined") return;
  const sessionId = getOrCreateSession();
  const utm = getUtmParams();
  const data = {
    ...payload,
    sessionId,
    referrer: document.referrer || undefined,
    ...utm,
  };
  try {
    // Use sendBeacon when available (survives page unload)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
    } else {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        keepalive: true,
      });
    }
  } catch (e) {
    // Silently fail — tracking shouldn't break UX
    console.debug("track failed", e);
  }

  // Optional mirror to the unified vb-metrics dashboard. Only anonymous
  // aggregate signal (project + event + session id) — no PII. Skips entirely
  // when NEXT_PUBLIC_METRICS_ENDPOINT is unset.
  mirrorToMetrics(payload.eventName, sessionId);
}

function mirrorToMetrics(eventName: string, sessionId: string) {
  const endpoint = process.env.NEXT_PUBLIC_METRICS_ENDPOINT;
  if (!endpoint || !sessionId) return;
  const body = JSON.stringify({ project: "greenpoly", event: eventName, anonId: sessionId });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    } else {
      void fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        credentials: "omit",
      }).catch(() => {});
    }
  } catch {
    // metrics mirror must never break the page
  }
}

// Convenience helpers
export const trackPageView = (locale?: string) =>
  track({ eventName: "page_view", page: window.location.pathname, locale });

export const trackCtaClick = (ctaId: string, extra?: Record<string, unknown>) =>
  track({
    eventName: "cta_click",
    page: window.location.pathname,
    properties: { ctaId, ...extra },
  });

export const trackFormSubmit = (formName: string, extra?: Record<string, unknown>) =>
  track({
    eventName: "form_submit",
    page: window.location.pathname,
    properties: { formName, ...extra },
  });
