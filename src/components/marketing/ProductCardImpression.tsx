"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/tracking";

// Fires a `product_card_impression` event the first time at least 50% of the card is on screen.
export default function ProductCardImpression({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef(false);

  useEffect(() => {
    if (!ref.current || seen.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5 && !seen.current) {
            seen.current = true;
            track({
              eventName: "product_card_impression",
              page: window.location.pathname,
              properties: { slug },
            });
            io.disconnect();
          }
        }
      },
      { threshold: [0, 0.5, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [slug]);

  return <div ref={ref}>{children}</div>;
}
