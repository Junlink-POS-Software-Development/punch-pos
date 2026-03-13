/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// ─── Custom Runtime Caching ─────────────────────────────────────────────────
// Extend the default cache with strategies optimized for offline-first POS usage.
const customCache = [
  // 1. RSC (React Server Component) payloads — cache-first with network fallback
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
  // 2. Static page data from Next.js — NetworkFirst with generous timeout
  {
    matcher: ({ url }: { url: URL }) => {
      return url.pathname.startsWith("/_next/data/");
    },
    handler: new NetworkFirst({
      cacheName: "next-data",
      networkTimeoutSeconds: 5,
    }),
  },
  // 3. Images — CacheFirst (images rarely change)
  {
    matcher: ({ request }: { request: Request }) => {
      return request.destination === "image";
    },
    handler: new CacheFirst({
      cacheName: "images",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    }),
  },
  // 4. Fonts — CacheFirst (fonts never change)
  {
    matcher: ({ request }: { request: Request }) => {
      return request.destination === "font";
    },
    handler: new CacheFirst({
      cacheName: "fonts",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        }),
      ],
    }),
  },
  // 5. JS/CSS bundles — StaleWhileRevalidate (serve cached, update in background)
  {
    matcher: ({ request }: { request: Request }) => {
      return request.destination === "script" || request.destination === "style";
    },
    handler: new StaleWhileRevalidate({
      cacheName: "static-resources",
    }),
  },
  // Merge with the Serwist defaults last (lower priority)
  ...defaultCache,
];

// ─── Service Worker Instance ────────────────────────────────────────────────
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: customCache,
  // Offline fallback: when navigation fails offline, serve this precached page
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
