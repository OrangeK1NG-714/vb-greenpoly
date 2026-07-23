import type { PrismaClient } from "@/generated/prisma/client";

export const MARKETING_STATS_SCHEMA_VERSION = "greenpoly.marketing.aggregate.v1";
export const MARKETING_STATS_MINIMUM_BUCKET_COUNT = 5;
export const MARKETING_STATS_MAX_DIMENSION_BUCKETS = 10;

const LOCALES = new Set(["en", "vi", "id", "th", "ms", "zh"]);
const LOCALE_PREFIXES = new Set(LOCALES);
const SEARCH_HOSTS = ["google.", "bing.com", "duckduckgo.com", "baidu.com", "yahoo.", "yandex."];
const SOCIAL_HOSTS = ["facebook.com", "linkedin.com", "instagram.com", "youtube.com", "tiktok.com", "x.com", "twitter.com"];

export type MarketingDimensionBucket = {
  key: string;
  visitors?: number;
  views?: number;
};

export type MarketingStats = {
  ok: true;
  schemaVersion: typeof MARKETING_STATS_SCHEMA_VERSION;
  generatedAt: string;
  rangeDays: number;
  window: {
    start: string;
    end: string;
    timezone: "UTC";
    semantics: "[start,end)";
    kind: "rolling";
  };
  activity: {
    activeVisitors: number;
    pageViews: number;
    productVisitors: number;
    ctaVisitors: number;
    inquiryVisitors: number;
  };
  acquisition: {
    newVisitors: number;
  };
  funnel: Array<{
    step: "active" | "product_view" | "cta_click" | "form_submit";
    visitors: number;
  }>;
  dimensions: {
    country: MarketingDimensionBucket[];
    locale: MarketingDimensionBucket[];
    source: MarketingDimensionBucket[];
    pageGroup: MarketingDimensionBucket[];
  };
  privacy: {
    minimumBucketCount: typeof MARKETING_STATS_MINIMUM_BUCKET_COUNT;
    smallBuckets: "merged_into_other";
    containsIdentifiers: false;
  };
};

type MarketingEvent = {
  eventName: string;
  page: string;
  sessionId: string;
  properties: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  locale: string | null;
  createdAt: Date;
};

type MarketingSession = {
  firstSeen: Date;
  countryCode: string | null;
  locale: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
};

type MarketingStatsStore = Pick<PrismaClient, "event" | "session">;

function normalizedPath(rawPage: string): string[] {
  const path = rawPage.split(/[?#]/, 1)[0] || "/";
  const segments = path.split("/").filter(Boolean).map((segment) => segment.toLowerCase());
  if (segments.length && LOCALE_PREFIXES.has(segments[0])) segments.shift();
  return segments;
}

export function classifyPageGroup(rawPage: string): string {
  const segments = normalizedPath(rawPage);
  if (segments.length === 0) return "home";
  if (segments[0] === "products") return segments.length === 1 ? "products" : "product_detail";
  if (["contact", "about", "quality"].includes(segments[0])) return segments[0];
  return "other";
}

function normalizedHost(rawReferrer: string | null): string {
  if (!rawReferrer) return "";
  try {
    return new URL(rawReferrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function classifySource(event: Pick<MarketingEvent, "referrer" | "utmSource" | "utmMedium">): string {
  const medium = event.utmMedium?.trim().toLowerCase() || "";
  const source = event.utmSource?.trim().toLowerCase() || "";
  const host = normalizedHost(event.referrer);

  if (["cpc", "ppc", "paid", "paid_search", "display"].includes(medium)) return "paid";
  if (["email", "newsletter"].includes(medium)) return "email";
  if (["social", "social-media"].includes(medium)) return "social";
  if (SEARCH_HOSTS.some((candidate) => host.includes(candidate)) || SEARCH_HOSTS.some((candidate) => source.includes(candidate))) return "search";
  if (SOCIAL_HOSTS.some((candidate) => host.endsWith(candidate)) || SOCIAL_HOSTS.some((candidate) => source.includes(candidate.split(".")[0]))) return "social";
  if (!host && !source && !medium) return "direct";
  if (host) return "referral";
  return "other";
}

function countBy<T>(items: T[], keyFor: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFor(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function suppressSmallBuckets(counts: Map<string, number>, valueKey: "visitors" | "views"): MarketingDimensionBucket[] {
  let other = 0;
  const visible: Array<[string, number]> = [];

  for (const [key, count] of counts) {
    if (count < MARKETING_STATS_MINIMUM_BUCKET_COUNT || key === "other" || key === "unknown") {
      other += count;
    } else {
      visible.push([key, count]);
    }
  }

  visible.sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  const limited = visible.slice(0, MARKETING_STATS_MAX_DIMENSION_BUCKETS);
  for (const [, count] of visible.slice(MARKETING_STATS_MAX_DIMENSION_BUCKETS)) other += count;

  const buckets = limited.map(([key, count]) => ({ key, [valueKey]: count }));
  if (other > 0) buckets.push({ key: "other", [valueKey]: other });
  return buckets;
}

function eventSequence(event: MarketingEvent): number | null {
  if (!event.properties) return null;
  try {
    const value = JSON.parse(event.properties)._eventSequence;
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function orderedFunnelVisitors(events: MarketingEvent[]) {
  const eventsBySession = new Map<string, MarketingEvent[]>();
  for (const event of events) {
    const sessionEvents = eventsBySession.get(event.sessionId) ?? [];
    sessionEvents.push(event);
    eventsBySession.set(event.sessionId, sessionEvents);
  }

  const stagesBySession = new Map<string, number>();
  for (const [sessionId, sessionEvents] of eventsBySession) {
    const sorted = [...sessionEvents].sort((left, right) => {
      const leftSequence = eventSequence(left);
      const rightSequence = eventSequence(right);
      if (leftSequence != null && rightSequence != null && leftSequence !== rightSequence) {
        return leftSequence - rightSequence;
      }
      const createdDifference = left.createdAt.getTime() - right.createdAt.getTime();
      return createdDifference || left.eventName.localeCompare(right.eventName);
    });

    let stage = 1;
    for (const event of sorted) {
      const pageGroup = event.eventName === "page_view"
        ? classifyPageGroup(event.page)
        : "other";
      if (stage === 1 && (pageGroup === "products" || pageGroup === "product_detail")) {
        stage = 2;
      } else if (stage === 2 && event.eventName === "cta_click") {
        stage = 3;
      } else if (stage === 3 && event.eventName === "form_submit") {
        stage = 4;
      }
    }
    stagesBySession.set(sessionId, stage);
  }

  const reached = (stage: number) =>
    [...stagesBySession.values()].filter((value) => value >= stage).length;
  return {
    activeVisitors: reached(1),
    productVisitors: reached(2),
    ctaVisitors: reached(3),
    inquiryVisitors: reached(4),
  };
}

function localeKey(locale: string | null): string {
  const normalized = locale?.trim().toLowerCase() || "";
  return LOCALES.has(normalized) ? normalized : "unknown";
}

function countryKey(countryCode: string | null): string {
  const normalized = countryCode?.trim().toUpperCase() || "";
  return /^[A-Z]{2}$/.test(normalized) && normalized !== "XX" && normalized !== "T1" ? normalized : "unknown";
}

export async function buildMarketingStats(
  store: MarketingStatsStore,
  { days, now = new Date() }: { days: number; now?: Date },
): Promise<MarketingStats> {
  if (!Number.isSafeInteger(days) || days < 1 || days > 365) {
    throw new Error("days must be an integer between 1 and 365");
  }
  if (!Number.isFinite(now.getTime())) throw new Error("now must be a valid date");

  const end = new Date(now);
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const eventWhere = { createdAt: { gte: start, lt: end } };
  const sessionWhere = { firstSeen: { gte: start, lt: end } };

  const [events, newVisitors] = await Promise.all([
    store.event.findMany({
      where: eventWhere,
      select: {
        eventName: true,
        page: true,
        sessionId: true,
        properties: true,
        referrer: true,
        utmSource: true,
        utmMedium: true,
        locale: true,
        createdAt: true,
      },
    }),
    store.session.findMany({
      where: sessionWhere,
      select: {
        firstSeen: true,
        countryCode: true,
        locale: true,
        referrer: true,
        utmSource: true,
        utmMedium: true,
      },
    }),
  ]) as [MarketingEvent[], MarketingSession[]];

  const pageViews = events.filter((event) => event.eventName === "page_view");
  const {
    activeVisitors,
    productVisitors,
    ctaVisitors,
    inquiryVisitors,
  } = orderedFunnelVisitors(events);

  const countryVisitors = countBy(newVisitors, (visitor) => countryKey(visitor.countryCode));
  const localeVisitors = countBy(newVisitors, (visitor) => localeKey(visitor.locale));
  const sourceVisitors = countBy(newVisitors, classifySource);

  return {
    ok: true,
    schemaVersion: MARKETING_STATS_SCHEMA_VERSION,
    generatedAt: end.toISOString(),
    rangeDays: days,
    window: {
      start: start.toISOString(),
      end: end.toISOString(),
      timezone: "UTC",
      semantics: "[start,end)",
      kind: "rolling",
    },
    activity: {
      activeVisitors,
      pageViews: pageViews.length,
      productVisitors,
      ctaVisitors,
      inquiryVisitors,
    },
    acquisition: { newVisitors: newVisitors.length },
    funnel: [
      { step: "active", visitors: activeVisitors },
      { step: "product_view", visitors: productVisitors },
      { step: "cta_click", visitors: ctaVisitors },
      { step: "form_submit", visitors: inquiryVisitors },
    ],
    dimensions: {
      country: suppressSmallBuckets(countryVisitors, "visitors"),
      locale: suppressSmallBuckets(localeVisitors, "visitors"),
      source: suppressSmallBuckets(sourceVisitors, "visitors"),
      pageGroup: suppressSmallBuckets(countBy(pageViews, (event) => classifyPageGroup(event.page)), "views"),
    },
    privacy: {
      minimumBucketCount: MARKETING_STATS_MINIMUM_BUCKET_COUNT,
      smallBuckets: "merged_into_other",
      containsIdentifiers: false,
    },
  };
}
