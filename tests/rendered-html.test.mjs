import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the AIGC marketing platform landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<title>康高特 AIGC 数字营销平台<\/title>/);
  assert.match(html, /让产品资料/);
  assert.match(html, /一键变成营销内容/);
  assert.match(html, /进入工作台/);
  assert.doesNotMatch(html, /Your site is taking shape|Starter Project/);
});

test("keeps the three interview demo flows discoverable in source", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /本地资料匹配模式 · 不调用外部大模型/);
  assert.match(page, /function startQaVoiceInput/);
  assert.match(page, /async function exportPng/);
  assert.match(page, /function confirmBusinessAndArchive/);
  assert.match(page, /业务确认并自动归档/);
  assert.match(page, /团队空间业务确认后自动归档（演示）/);
});

test("ships the real product and leaflet preview assets used by the demo", async () => {
  const requiredAssets = [
    "../public/assets/products/pld-11/front.png",
    "../public/assets/products/nezha/main.png",
    "../public/assets/products/zhaolu/main.png",
    "../public/assets/templates/leaflet/preview-page-1.png",
    "../public/assets/templates/leaflet/preview-page-2.png",
    "../public/assets/brand/kiti.jpg",
  ];

  await Promise.all(requiredAssets.map((path) => access(new URL(path, import.meta.url))));
});
