import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { handleLocaleProxy } from "../src/proxy";

test("default-locale URLs rewrite once without redirecting back to themselves", () => {
  const response = handleLocaleProxy(new NextRequest("https://green.example/products"));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  assert.equal(response.headers.get("x-middleware-rewrite"), "https://green.example/en/products");
  assert.equal(
    response.headers.get("x-middleware-request-x-greenpoly-default-locale-rewrite"),
    "1",
  );
  assert.match(response.headers.get("set-cookie") ?? "", /NEXT_LOCALE=en/);
});

test("the internal default-locale rewrite bypasses a second locale normalization", () => {
  const response = handleLocaleProxy(
    new NextRequest("https://green.example/en/products", {
      headers: { "x-greenpoly-default-locale-rewrite": "1" },
    }),
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-middleware-next"), "1");
  assert.equal(response.headers.get("location"), null);
  assert.equal(response.headers.get("x-middleware-rewrite"), null);
});

test("country detection still redirects first-time visitors to a prefixed locale", () => {
  const response = handleLocaleProxy(
    new NextRequest("https://green.example/", {
      headers: { "cf-ipcountry": "VN" },
    }),
  );

  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "https://green.example/vi");
  assert.match(response.headers.get("set-cookie") ?? "", /NEXT_LOCALE=vi/);
});
