import assert from "node:assert/strict";
import test from "node:test";
import { getVisitorInfo } from "../src/lib/geo";

test("visitor geolocation uses the trusted edge headers without an external lookup", () => {
  const visitor = getVisitorInfo(new Headers({
    "cf-connecting-ip": "203.0.113.9",
    "cf-ipcountry": "VN",
    "x-vercel-ip-city": "Ho%20Chi%20Minh%20City",
    "x-vercel-ip-country-region": "Ho%20Chi%20Minh",
    "x-vercel-ip-latitude": "10.8231",
    "x-vercel-ip-longitude": "106.6297",
    "user-agent": "test-agent",
  }));

  assert.deepEqual(visitor, {
    ip: "203.0.113.9",
    country: "Vietnam",
    countryCode: "VN",
    region: "Ho Chi Minh",
    city: "Ho Chi Minh City",
    latitude: 10.8231,
    longitude: 106.6297,
    timezone: null,
    userAgent: "test-agent",
    referrer: null,
  });
});

test("visitor geolocation ignores unknown countries and malformed proxy IPs", () => {
  const visitor = getVisitorInfo(new Headers({
    "cf-ipcountry": "XX",
    "x-forwarded-for": "not-an-ip",
  }));

  assert.equal(visitor.ip, null);
  assert.equal(visitor.country, null);
  assert.equal(visitor.countryCode, null);
});
