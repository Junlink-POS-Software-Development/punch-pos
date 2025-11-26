"use client";

import { AlertTriangle, Package, TrendingUp } from "lucide-react";

interface LowStockItem {
  id: string;
  item_name: string;
  stock: number;
}

interface TopProduct {
  item_name: string;
  quantity: number;
}

export function LowStockWidget({ items }: { items: LowStockItem[] }) {
  return (
    <div className="bg-slate-900/50 p-6 border border-slate-800 rounded-2xl glass-effect">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold text-slate-200">Low Stock Alerts</h3>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-slate-500 text-sm">No items low on stock.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg">
              <span className="font-medium text-slate-300 text-sm truncate max-w-[70%]">
                {item.item_name}
              </span>
              <span className="bg-amber-500/10 px-2 py-1 rounded text-amber-500 text-xs font-bold">
                {item.stock} left
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function TopProductsWidget({ products }: { products: TopProduct[] }) {
  return (
    <div className="bg-slate-900/50 p-6 border border-slate-800 rounded-2xl glass-effect">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-slate-200">Top Selling Products</h3>
      </div>
      <div className="space-y-3">
        {products.length === 0 ? (
          <p className="text-slate-500 text-sm">No sales data yet.</p>
        ) : (
          products.map((product, index) => (
            <div key={index} className="flex justify-between items-center border-slate-800 pb-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <span className="flex justify-center items-center bg-slate-800 rounded-full w-6 h-6 font-bold text-slate-400 text-xs">
                  {index + 1}
                </span>
                <span className="font-medium text-slate-300 text-sm truncate max-w-[150px]">
                  {product.item_name}
                </span>
              </div>
              <span className="text-slate-400 text-xs">
                {product.quantity} sold
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
