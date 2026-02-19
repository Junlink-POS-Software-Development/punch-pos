"use client";

import React, { useRef, useEffect } from "react";

interface BarcodeItem {
  name: string;
  category: string;
  sku: string;
  price: number;
}

/**
 * Core drawing logic: draws a single barcode label onto a canvas context.
 */
export const drawBarcodeToContext = (
  ctx: CanvasRenderingContext2D,
  item: BarcodeItem,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x, y, width, height);

  // Border
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Item Name
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  const displayName =
    item.name.length > 25 ? item.name.substring(0, 22) + "..." : item.name;
  ctx.fillText(displayName, x + width / 2, y + 30);

  // Category
  ctx.fillStyle = "#64748b";
  ctx.font = "11px sans-serif";
  ctx.fillText((item.category || "General").toUpperCase(), x + width / 2, y + 48);

  // Barcode Lines (Mock Generation)
  const barcodeY = y + 60;
  const barcodeH = 65;
  const barcodeW = 220;
  const startX = x + (width - barcodeW) / 2;

  ctx.fillStyle = "#000000";

  // Deterministic random generator based on SKU string
  let hash = 0;
  for (let i = 0; i < item.sku.length; i++) {
    hash = (hash << 5) - hash + item.sku.charCodeAt(i);
    hash |= 0;
  }

  const bars = 55;
  for (let i = 0; i < bars; i++) {
    const val = Math.sin(hash * (i + 1) * 0.1);
    if (val > -0.2) {
      const isThick = Math.abs(val) > 0.6;
      const barWidth = isThick ? 3 : 1;
      const xPos = startX + i * (barcodeW / bars);
      ctx.fillRect(xPos, barcodeY, barWidth, barcodeH);
    }
  }

  // SKU Text
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 14px monospace";
  ctx.fillText(item.sku, x + width / 2, barcodeY + barcodeH + 18);

  // Price
  const price = item.price ?? 0;
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText(`₱${(price ?? 0).toFixed(2)}`, x + width / 2, y + height - 15);
};

/**
 * Single barcode label canvas component.
 */
export const BarcodeLabelCanvas: React.FC<{
  item: BarcodeItem;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}> = ({ item, onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !item) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 180;

    drawBarcodeToContext(ctx, item, 0, 0, 300, 180);

    if (onCanvasReady) onCanvasReady(canvas);
  }, [item, onCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      className="shadow-md rounded-lg max-w-full h-auto border border-border"
    />
  );
};

/**
 * Batch barcode sheet canvas component — draws a grid of labels.
 */
export const BarcodeSheetCanvas: React.FC<{
  items: BarcodeItem[];
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}> = ({ items, onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !items || items.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const labelW = 300;
    const labelH = 180;
    const gap = 20;
    const cols = 3;
    const padding = 40;

    const rows = Math.ceil(items.length / cols);
    const canvasWidth = labelW * cols + gap * (cols - 1) + padding * 2;
    const canvasHeight = labelH * rows + gap * (rows - 1) + padding * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Sheet background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    items.forEach((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = padding + col * (labelW + gap);
      const y = padding + row * (labelH + gap);

      drawBarcodeToContext(ctx, item, x, y, labelW, labelH);
    });

    if (onCanvasReady) onCanvasReady(canvas);
  }, [items, onCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      className="shadow-sm rounded max-w-full h-auto border border-border"
    />
  );
};
