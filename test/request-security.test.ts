import assert from "node:assert/strict";
import test from "node:test";
import {
  createRateLimiter,
  getClientIp,
  isSameOriginRequest,
  readJsonBody,
  RequestBodyError,
} from "../src/lib/request-security";

test("rate limiter enforces a fixed window and resets", () => {
  let now = 1_000;
  const limiter = createRateLimiter({ limit: 2, windowMs: 10_000, clock: () => now });
  assert.equal(limiter.check("client").allowed, true);
  assert.equal(limiter.check("client").allowed, true);
  assert.equal(limiter.check("client").allowed, false);
  now += 10_001;
  assert.equal(limiter.check("client").allowed, true);
});

test("rate limiter bounds attacker-controlled keys", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2, clock: () => 1_000 });
  assert.equal(limiter.check("one").allowed, true);
  assert.equal(limiter.check("two").allowed, true);
  assert.equal(limiter.check("three").allowed, false);
  assert.equal(limiter.size(), 2);
});

test("client IP uses trusted proxy headers in priority order", () => {
  const headers = new Headers({
    "cf-connecting-ip": "203.0.113.9",
    "x-real-ip": "203.0.113.10",
    "x-forwarded-for": "203.0.113.11, 10.0.0.1",
  });
  assert.equal(getClientIp({ headers }), "203.0.113.9");
  assert.equal(getClientIp({ headers: new Headers({ "x-forwarded-for": "not-an-ip" }) }), "unknown");
});

test("origin check fails closed for foreign production origins", () => {
  const request = {
    headers: new Headers({ origin: "https://attacker.example" }),
    url: "https://greenpoly.com/api/admin/login",
  };
  assert.equal(isSameOriginRequest(request, "https://greenpoly.com", "production"), false);
  request.headers.set("origin", "https://greenpoly.com");
  assert.equal(isSameOriginRequest(request, "https://greenpoly.com", "production"), true);
});

test("JSON reader rejects declared and actual oversized bodies", async () => {
  const declared = new Request("https://greenpoly.com/api", {
    method: "POST",
    headers: { "content-length": "100" },
    body: "{}",
  });
  await assert.rejects(() => readJsonBody(declared, 10), (error: unknown) => {
    return error instanceof RequestBodyError && error.status === 413;
  });

  const actual = new Request("https://greenpoly.com/api", { method: "POST", body: JSON.stringify({ x: "12345" }) });
  await assert.rejects(() => readJsonBody(actual, 8), /payload_too_large/);
});

test("JSON reader accepts bounded input and normalizes invalid JSON", async () => {
  const request = new Request("https://greenpoly.com/api", { method: "POST", body: '{"ok":true}' });
  assert.deepEqual(await readJsonBody(request, 64), { ok: true });

  const invalid = new Request("https://greenpoly.com/api", { method: "POST", body: "{" });
  await assert.rejects(() => readJsonBody(invalid, 64), (error: unknown) => {
    return error instanceof RequestBodyError && error.code === "invalid_json";
  });
});
