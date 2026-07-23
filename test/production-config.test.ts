import assert from "node:assert/strict";
import test from "node:test";
import { getAuthSecret, getMarketingStatsToken, getSeedAdminCredentials } from "../src/lib/production-config";

test("development permits local defaults", () => {
  assert.equal(getAuthSecret({ NODE_ENV: "development" }), "local-development-only-not-for-production");
  assert.deepEqual(getSeedAdminCredentials({ NODE_ENV: "development" }), {
    email: "admin@greenpoly.com",
    password: "changeme123",
  });
});

test("production rejects missing, default, and short authentication secrets", () => {
  assert.throws(() => getAuthSecret({ NODE_ENV: "production" }), /AUTH_SECRET/);
  assert.throws(
    () => getAuthSecret({ NODE_ENV: "production", AUTH_SECRET: "local-development-only-not-for-production" }),
    /AUTH_SECRET/
  );
  assert.throws(() => getAuthSecret({ NODE_ENV: "production", AUTH_SECRET: "too-short" }), /AUTH_SECRET/);
});

test("production accepts a strong authentication secret", () => {
  const secret = "a-unique-production-auth-secret-that-is-long-enough";
  assert.equal(getAuthSecret({ NODE_ENV: "production", AUTH_SECRET: secret }), secret);
});

test("production requires a strong internal marketing stats token", () => {
  assert.throws(() => getMarketingStatsToken({ NODE_ENV: "production" }), /GREENPOLY_INTERNAL_STATS_TOKEN/);
  assert.throws(
    () => getMarketingStatsToken({ NODE_ENV: "production", GREENPOLY_INTERNAL_STATS_TOKEN: "too-short" }),
    /GREENPOLY_INTERNAL_STATS_TOKEN/
  );
  const token = "an-independent-greenpoly-token-with-32-plus-bytes";
  assert.equal(
    getMarketingStatsToken({ NODE_ENV: "production", GREENPOLY_INTERNAL_STATS_TOKEN: token }),
    token
  );
});

test("development permits an unconfigured internal marketing stats token", () => {
  assert.equal(getMarketingStatsToken({ NODE_ENV: "development" }), "");
});

test("production rejects a default or short seeded admin password", () => {
  assert.throws(() => getSeedAdminCredentials({ NODE_ENV: "production" }), /SEED_ADMIN_PASSWORD/);
  assert.throws(
    () => getSeedAdminCredentials({ NODE_ENV: "production", SEED_ADMIN_PASSWORD: "short" }),
    /SEED_ADMIN_PASSWORD/
  );
});

test("production accepts a strong seeded admin password", () => {
  assert.deepEqual(
    getSeedAdminCredentials({
      NODE_ENV: "production",
      SEED_ADMIN_EMAIL: "ops@example.com",
      SEED_ADMIN_PASSWORD: "a-unique-production-password",
    }),
    { email: "ops@example.com", password: "a-unique-production-password" }
  );
});
