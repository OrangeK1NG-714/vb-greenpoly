import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMarketingStats,
  classifyPageGroup,
  classifySource,
  MARKETING_STATS_SCHEMA_VERSION,
} from "../src/lib/marketing-stats";

type EventFixture = {
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

type SessionFixture = {
  firstSeen: Date;
  countryCode: string | null;
  locale: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
};

function makeStore(events: EventFixture[], sessions: SessionFixture[]) {
  return {
    event: {
      async findMany({ where }: { where: { createdAt: { gte: Date; lt: Date } } }) {
        return events.filter(
          (event) => event.createdAt >= where.createdAt.gte && event.createdAt < where.createdAt.lt,
        );
      },
    },
    session: {
      async findMany({ where }: { where: { firstSeen: { gte: Date; lt: Date } } }) {
        return sessions.filter(
          (session) => session.firstSeen >= where.firstSeen.gte && session.firstSeen < where.firstSeen.lt,
        );
      },
    },
  };
}

function event(
  sessionId: string,
  eventName: string,
  page: string,
  createdAt: string,
  overrides: Partial<EventFixture> = {},
): EventFixture {
  return {
    sessionId,
    eventName,
    page,
    createdAt: new Date(createdAt),
    properties: null,
    referrer: null,
    utmSource: null,
    utmMedium: null,
    locale: "en",
    ...overrides,
  };
}

test("page and source classifiers only return fixed buckets", () => {
  assert.equal(classifyPageGroup("/vi/products/hdpe-blue?email=hidden@example.com"), "product_detail");
  assert.equal(classifyPageGroup("/unknown/private-value"), "other");
  assert.equal(classifySource({ referrer: null, utmSource: null, utmMedium: null }), "direct");
  assert.equal(
    classifySource({ referrer: "https://www.google.com/search?q=secret", utmSource: null, utmMedium: null }),
    "search",
  );
  assert.equal(
    classifySource({ referrer: "https://partner.example/private", utmSource: null, utmMedium: null }),
    "referral",
  );
});

test("buildMarketingStats returns a rolling privacy-safe funnel", async () => {
  const now = new Date("2026-07-22T12:00:00.000Z");
  const events: EventFixture[] = [];
  const sessions: SessionFixture[] = [];

  for (let index = 0; index < 6; index += 1) {
    const sessionId = `visitor-${index}`;
    sessions.push({
      firstSeen: new Date("2026-07-20T10:00:00.000Z"),
      countryCode: index < 5 ? "VN" : "US",
      locale: index < 5 ? "vi" : "en",
      referrer: index < 5 ? "https://google.com/search?q=private" : "https://partner.example/private",
      utmSource: index < 5 ? "google" : "private-campaign-name",
      utmMedium: null,
    });
    events.push(event(sessionId, "page_view", "/products", "2026-07-21T10:00:00.000Z", {
      referrer: "https://event-only.example/ignored",
      utmSource: "event-only-source",
    }));
    if (index < 4) events.push(event(sessionId, "page_view", "/products/hdpe", "2026-07-21T10:01:00.000Z"));
    if (index < 3) events.push(event(sessionId, "cta_click", "/products/hdpe", "2026-07-21T10:02:00.000Z"));
    if (index < 2) events.push(event(sessionId, "form_submit", "/contact", "2026-07-21T10:03:00.000Z"));
  }
  events.push(event("old-visitor", "page_view", "/private/path", "2026-06-01T00:00:00.000Z"));

  const stats = await buildMarketingStats(makeStore(events, sessions) as never, { days: 7, now });
  assert.equal(stats.schemaVersion, MARKETING_STATS_SCHEMA_VERSION);
  assert.deepEqual(stats.window, {
    start: "2026-07-15T12:00:00.000Z",
    end: "2026-07-22T12:00:00.000Z",
    timezone: "UTC",
    semantics: "[start,end)",
    kind: "rolling",
  });
  assert.deepEqual(stats.activity, {
    activeVisitors: 6,
    pageViews: 10,
    productVisitors: 6,
    ctaVisitors: 3,
    inquiryVisitors: 2,
  });
  assert.equal(stats.acquisition.newVisitors, 6);
  assert.deepEqual(stats.dimensions.country, [
    { key: "VN", visitors: 5 },
    { key: "other", visitors: 1 },
  ]);
  assert.deepEqual(stats.dimensions.locale, [
    { key: "vi", visitors: 5 },
    { key: "other", visitors: 1 },
  ]);
  assert.deepEqual(stats.dimensions.source, [
    { key: "search", visitors: 5 },
    { key: "other", visitors: 1 },
  ]);
  assert.deepEqual(stats.dimensions.pageGroup, [
    { key: "products", views: 6 },
    { key: "other", views: 4 },
  ]);
  assert.deepEqual(stats.privacy, {
    minimumBucketCount: 5,
    smallBuckets: "merged_into_other",
    containsIdentifiers: false,
  });

  const serialized = JSON.stringify(stats);
  for (const forbidden of [
    "visitor-0",
    "google.com/search",
    "private-campaign-name",
    "partner.example",
    "sessionId",
    "ipAddress",
    "referrer",
    "utmSource",
    "properties",
  ]) {
    assert.equal(serialized.includes(forbidden), false, `response leaked ${forbidden}`);
  }
});

test("buildMarketingStats uses ordered nested visitor cohorts", async () => {
  const now = new Date("2026-07-22T12:00:00.000Z");
  const sessions: SessionFixture[] = ["ordered", "skips-product", "wrong-order"].map((id) => ({
    firstSeen: new Date("2026-07-22T10:00:00.000Z"),
    countryCode: "VN",
    locale: "vi",
    referrer: null,
    utmSource: id,
    utmMedium: null,
  }));
  const events = [
    event("ordered", "page_view", "/products", "2026-07-22T10:02:00.000Z", { properties: '{"_eventSequence":1}' }),
    event("ordered", "cta_click", "/products", "2026-07-22T10:00:00.000Z", { properties: '{"_eventSequence":2}' }),
    event("ordered", "form_submit", "/contact", "2026-07-22T10:01:00.000Z", { properties: '{"_eventSequence":3}' }),
    event("skips-product", "cta_click", "/contact", "2026-07-22T10:00:00.000Z"),
    event("skips-product", "form_submit", "/contact", "2026-07-22T10:01:00.000Z"),
    event("wrong-order", "cta_click", "/products", "2026-07-22T10:00:00.000Z"),
    event("wrong-order", "page_view", "/products", "2026-07-22T10:01:00.000Z"),
    event("wrong-order", "form_submit", "/contact", "2026-07-22T10:02:00.000Z"),
  ];

  const stats = await buildMarketingStats(makeStore(events, sessions) as never, { days: 1, now });
  assert.deepEqual(stats.activity, {
    activeVisitors: 3,
    pageViews: 2,
    productVisitors: 2,
    ctaVisitors: 1,
    inquiryVisitors: 1,
  });
  assert.deepEqual(stats.funnel.map((step) => step.visitors), [3, 2, 1, 1]);
});

test("buildMarketingStats rejects an invalid range", async () => {
  await assert.rejects(() => buildMarketingStats(makeStore([], []) as never, { days: 0 }), /between 1 and 365/);
  await assert.rejects(() => buildMarketingStats(makeStore([], []) as never, { days: 366 }), /between 1 and 365/);
});
