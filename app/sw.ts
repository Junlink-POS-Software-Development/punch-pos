/// <reference lib="webworker" />
import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate, ExpirationPlugin } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// ─── Manual Precaching ──────────────────────────────────────────────────────
const manualPrecache: PrecacheEntry[] = [
  { url: "/~offline", revision: "v1" },
];

// ─── Custom Runtime Caching ─────────────────────────────────────────────────
const customCache = [
  {
    matcher: ({ request }: { request: Request }) => request.mode === "navigate",
    handler: async ({ request, event, url }: { request: Request; event: ExtendableEvent; url: URL }) => {
      const strategy = new NetworkFirst({
        cacheName: "navigations",
        networkTimeoutSeconds: 3,
      });
      
      try {
        const response = await strategy.handle({ request, event, url });
        if (response && response.ok) return response;
        if (response && response.status >= 500) throw new Error("Server error");
        return response || fetch(request);
      } catch (err) {
        throw err;
      }
    },
  },
  {
    matcher: ({ request, url }: { request: Request; url: URL }) => {
      return url.searchParams.has("_rsc") || 
             request.headers.get("RSC") === "1" ||
             request.headers.get("Next-Router-State-Tree") !== null;
    },
    handler: new NetworkFirst({
      cacheName: "rsc-payloads",
      networkTimeoutSeconds: 5,
      matchOptions: { ignoreSearch: false },
    }),
  },
  {
    matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/_next/data/"),
    handler: new NetworkFirst({
      cacheName: "next-data",
      networkTimeoutSeconds: 5,
    }),
  },
  {
    matcher: ({ request }: { request: Request }) => request.destination === "image",
    handler: new CacheFirst({
      cacheName: "images",
      plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 })],
    }),
  },
  {
    matcher: ({ request }: { request: Request }) => request.destination === "font",
    handler: new CacheFirst({
      cacheName: "fonts",
      plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 })],
    }),
  },
  {
    matcher: ({ request }: { request: Request }) => request.destination === "script" || request.destination === "style",
    handler: new StaleWhileRevalidate({ cacheName: "static-resources" }),
  },
];

// ─── Service Worker Instance ────────────────────────────────────────────────
const serwist = new Serwist({
  precacheEntries: [...(self.__SW_MANIFEST || []), ...manualPrecache],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: customCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) { return request.destination === "document"; },
      },
    ],
  },
});

serwist.addEventListeners();
