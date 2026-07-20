"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track, trackCtaClick } from "@/lib/tracking";

const HEARTBEAT_MS = 15_000;
const SCROLL_DEPTHS = [25, 50, 75, 100];

export default function Tracker({ locale }: { locale: string }) {
  const pathname = usePathname();
  const dwellStartRef = useRef<number>(Date.now());
  const seenDepthsRef = useRef<Set<number>>(new Set());

  // Page view + reset dwell on path change
  useEffect(() => {
    dwellStartRef.current = Date.now();
    seenDepthsRef.current = new Set();
    track({ eventName: "page_view", page: pathname, locale });
  }, [pathname, locale]);

  // Dwell heartbeat + scroll depth + cta delegation
  useEffect(() => {
    const heartbeat = setInterval(() => {
      const dwellMs = Date.now() - dwellStartRef.current;
      track({
        eventName: "dwell",
        page: pathname,
        properties: { dwellMs },
        locale,
      });
    }, HEARTBEAT_MS);

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      for (const d of SCROLL_DEPTHS) {
        if (pct >= d && !seenDepthsRef.current.has(d)) {
          seenDepthsRef.current.add(d);
          track({
            eventName: "scroll_depth",
            page: pathname,
            properties: { depth: d },
            locale,
          });
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-track]") as HTMLElement | null;
      if (target) {
        const ctaId = target.getAttribute("data-track") || "unknown";
        const href = (target as HTMLAnchorElement).href;
        trackCtaClick(ctaId, { href });
      }
      // Outbound link tracking
      const link = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
      if (link && link.href) {
        const url = new URL(link.href, window.location.origin);
        if (url.host && url.host !== window.location.host) {
          let eventName = "outbound_click";
          if (link.href.startsWith("https://wa.me/") || link.href.includes("whatsapp.com")) {
            eventName = "whatsapp_click";
          } else if (link.href.startsWith("mailto:")) {
            eventName = "email_click";
          }
          track({
            eventName,
            page: pathname,
            properties: { href: link.href },
            locale,
          });
        }
      }
    };

    const onUnload = () => {
      const dwellMs = Date.now() - dwellStartRef.current;
      track({
        eventName: "page_exit",
        page: pathname,
        properties: { dwellMs },
        locale,
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    window.addEventListener("beforeunload", onUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [pathname, locale]);

  return null;
}
