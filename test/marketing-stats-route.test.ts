import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { createMarketingStatsHandler } from "../src/app/api/internal/marketing-stats/route";

const TOKEN = "route-test-token-with-more-than-32-bytes";

function request(
  host: string,
  { token = TOKEN, days = "7", forwardedHost }: { token?: string; days?: string; forwardedHost?: string } = {},
) {
  const headers = new Headers({ host });
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (forwardedHost) headers.set("x-forwarded-host", forwardedHost);
  return new NextRequest(`http://${host}/api/internal/marketing-stats?days=${days}`, { headers });
}

function handler() {
  return createMarketingStatsHandler({
    getToken: () => TOKEN,
    buildStats: async (days) => ({ ok: true, rangeDays: days }),
  });
}

test("internal marketing stats rejects public hosts before token authentication", async () => {
  const direct = await handler()(request("green.richardq.tech"));
  assert.equal(direct.status, 404);
  assert.equal(direct.headers.get("cache-control"), "no-store");

  const forwarded = await handler()(request("127.0.0.1:3002", { forwardedHost: "green.richardq.tech" }));
  assert.equal(forwarded.status, 404);
});

test("internal marketing stats allows loopback and private hosts with the correct token", async () => {
  for (const host of ["127.0.0.1:3002", "localhost:3002", "10.0.0.8:3002", "172.16.2.3:3002", "192.168.1.8:3002", "[::1]:3002"]) {
    const response = await handler()(request(host, { days: "30" }));
    assert.equal(response.status, 200, host);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { ok: true, rangeDays: 30 });
  }
});

test("internal marketing stats fails closed for missing or invalid tokens", async () => {
  const missing = await handler()(request("127.0.0.1:3002", { token: "" }));
  assert.equal(missing.status, 401);
  assert.equal(missing.headers.get("cache-control"), "no-store");

  const invalid = await handler()(request("127.0.0.1:3002", { token: "wrong-token" }));
  assert.equal(invalid.status, 401);
});

test("internal marketing stats validates days and never caches errors", async () => {
  for (const days of ["0", "366", "1.5", "invalid"]) {
    const response = await handler()(request("127.0.0.1:3002", { days }));
    assert.equal(response.status, 400, days);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { ok: false, error: "invalid_range" });
  }
});

test("internal marketing stats converts configuration failures to no-store 503", async () => {
  const response = await createMarketingStatsHandler({
    getToken: () => { throw new Error("missing production token"); },
    buildStats: async () => ({ ok: true }),
  })(request("127.0.0.1:3002"));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { ok: false, error: "stats_unavailable" });
});
