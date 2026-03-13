const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

async function buildSW() {
  const swSrc = path.join(process.cwd(), "app", "sw.ts");
  const swDest = path.join(process.cwd(), "public", "sw.js");

  console.log("Building Service Worker...");

  try {
    // 1. Bundle the SW
    await esbuild.build({
      entryPoints: [swSrc],
      outfile: swDest,
      bundle: true,
      minify: process.env.NODE_ENV === "production",
      format: "iife",
      platform: "browser",
      define: {
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
      },
    });

    console.log(`Service Worker built successfully at ${swDest}`);
  } catch (error) {
    console.error("Service Worker build failed:", error);
    process.exit(1);
  }
}

buildSW();
