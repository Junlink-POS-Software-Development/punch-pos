"use client";

import React from "react";
import {
  TrendingUp,
  Wallet,
  ArrowDownLeft,
  AlertTriangle,
} from "lucide-react";
import { VitalCard } from "./VitalCard";
import type { DashboardStats } from "../../lib/dashboardMockData";
import type { FlipCardKey } from "../../hooks/useDashboard";

interface VitalsGridProps {
  stats: DashboardStats;
  flipped: Record<FlipCardKey, boolean>;
  toggleFlip: (card: FlipCardKey) => void;
  isHighRisk: boolean;
  isHistorical: boolean;
}

export function VitalsGrid({
  stats,
  flipped,
  toggleFlip,
  isHighRisk,
  isHistorical,
}: VitalsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
      {/* Card 1: Daily Total Net Sales */}
      <VitalCard
        flipped={flipped.sales}
        onFlip={() => toggleFlip("sales")}
        frontContent={
          <div className="w-full h-full backface-hidden bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                {isHistorical ? "Net Sales" : "Daily Net Sales"}
              </p>
              <div className="p-1.5 bg-emerald-500/10 rounded-md text-emerald-500">
                <TrendingUp size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              ₱{stats.netSales.toLocaleString()}
            </h3>
            <div className="mt-auto space-y-1 bg-muted/50 p-2 rounded-lg border border-border">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Gross Sales:</span>
                <span className="font-medium text-foreground">
                  ₱{stats.grossSales.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-red-500/90">
                <span>- Discounts:</span>
                <span>₱{stats.salesDiscount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] text-red-500/90">
                <span>- Returns:</span>
                <span>₱{stats.salesReturn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] text-red-500/90">
                <span>- Allowances:</span>
                <span>₱{stats.salesAllowance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        }
        backContent={
          <div className="absolute inset-0 w-full h-full backface-hidden transform-[rotateY(180deg)] bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-inner flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-slate-800 rounded-full mb-2 text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <h4 className="font-bold text-slate-100 text-sm mb-2">
              What is Net Sales?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed px-1">
              The true money you earned from selling items today, calculated
              after taking away any discounts given, item returns, or allowances.
            </p>
            <p className="text-[9px] text-slate-500 mt-auto font-medium tracking-wide uppercase">
              Click to flip back
            </p>
          </div>
        }
      />

      {/* Card 2: Net Profit */}
      <VitalCard
        flipped={flipped.profit}
        onFlip={() => toggleFlip("profit")}
        frontContent={
          <div className="w-full h-full backface-hidden bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                {isHistorical ? "Net Profit" : "Today's Net Profit"}
              </p>
              <div className="p-1.5 bg-blue-500/10 rounded-md text-blue-500">
                <TrendingUp size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              ₱{stats.netProfit.toLocaleString()}
            </h3>
            <div className="mt-auto space-y-1 bg-muted/50 p-2 rounded-lg border border-border">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Net Sales:</span>
                <span className="font-medium text-foreground">
                  ₱{stats.netSales.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-red-500/90">
                <span>- COGS:</span>
                <span>₱{stats.cashout.cogs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] text-red-500/90">
                <span>- OPEX:</span>
                <span>₱{stats.cashout.opex.toLocaleString()}</span>
              </div>
            </div>
          </div>
        }
        backContent={
          <div className="absolute inset-0 w-full h-full backface-hidden transform-[rotateY(180deg)] bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-inner flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-slate-800 rounded-full mb-2 text-blue-400">
              <TrendingUp size={20} />
            </div>
            <h4 className="font-bold text-slate-100 text-sm mb-2">
              What is Net Profit?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed px-1">
              The money the business gets to keep. It is your Net Sales minus
              the cost of the goods you sold (COGS) and daily operations (OPEX).
            </p>
            <p className="text-[9px] text-slate-500 mt-auto font-medium tracking-wide uppercase">
              Click to flip back
            </p>
          </div>
        }
      />

      {/* Card 3: Cash in Drawer */}
      <VitalCard
        flipped={flipped.cash}
        onFlip={() => toggleFlip("cash")}
        frontContent={
          <div
            className={`w-full h-full backface-hidden p-4 rounded-xl border shadow-sm transition-all duration-300 flex flex-col justify-between hover:shadow-md ${
              isHighRisk
                ? "bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/20"
                : "bg-card border-border hover:border-blue-500/50"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <p
                  className={`${
                    isHighRisk ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"
                  } text-xs font-semibold uppercase tracking-wider`}
                >
                  Cash in Drawer
                </p>
                {isHighRisk && (
                  <span className="text-[9px] font-bold text-amber-700 dark:text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded animate-pulse">
                    REMIT NOW
                  </span>
                )}
              </div>
              <div
                className={`p-1.5 rounded-md ${
                  isHighRisk
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-500"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isHighRisk ? (
                  <AlertTriangle size={16} />
                ) : (
                  <Wallet size={16} />
                )}
              </div>
            </div>
            <h3
              className={`text-2xl font-bold ${
                isHighRisk ? "text-amber-700 dark:text-amber-500" : "text-foreground"
              }`}
            >
              ₱{stats.cashInDrawer.toLocaleString()}
            </h3>
            <p
              className={`text-[10px] mt-auto ${
                isHighRisk ? "text-amber-600/80 dark:text-amber-500/80" : "text-muted-foreground"
              }`}
            >
              Physical cash currently at the register.
            </p>
          </div>
        }
        backContent={
          <div className="absolute inset-0 w-full h-full backface-hidden transform-[rotateY(180deg)] bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-inner flex flex-col justify-center items-center text-center">
            <div
              className={`p-2 bg-slate-800 rounded-full mb-2 ${
                isHighRisk ? "text-amber-400" : "text-slate-300"
              }`}
            >
              {isHighRisk ? (
                <AlertTriangle size={20} />
              ) : (
                <Wallet size={20} />
              )}
            </div>
            <h4 className="font-bold text-slate-100 text-sm mb-2">
              What is Cash in Drawer?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed px-1">
              The exact physical cash sitting in your register right now. If
              it&apos;s too high, it&apos;s safer to remit some to the manager or safe.
            </p>
            <p className="text-[9px] text-slate-500 mt-auto font-medium tracking-wide uppercase">
              Click to flip back
            </p>
          </div>
        }
      />

      {/* Card 4: Cashout (Breakdown) */}
      <VitalCard
        flipped={flipped.cashout}
        onFlip={() => toggleFlip("cashout")}
        frontContent={
          <div className="w-full h-full backface-hidden bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Total Cashout
              </p>
              <div className="p-1.5 bg-red-500/10 rounded-md text-red-500">
                <ArrowDownLeft size={16} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-red-500 mb-2">
              -₱{stats.cashout.total.toLocaleString()}
            </h3>
            <div className="mt-auto space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  COGS (Suppliers):
                </span>
                <span className="font-medium text-foreground">
                  ₱{stats.cashout.cogs.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  OPEX (Operations):
                </span>
                <span className="font-medium text-foreground">
                  ₱{stats.cashout.opex.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Remittance/Owner:
                </span>
                <span className="font-medium text-foreground">
                  ₱{stats.cashout.remittance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        }
        backContent={
          <div className="absolute inset-0 w-full h-full backface-hidden transform-[rotateY(180deg)] bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-inner flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-slate-800 rounded-full mb-2 text-red-400">
              <ArrowDownLeft size={20} />
            </div>
            <h4 className="font-bold text-slate-100 text-sm mb-2">
              What is Cashout?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed px-1">
              Money that left the cash drawer today. This includes paying
              suppliers, daily expenses (like ice), and money safely remitted.
            </p>
            <p className="text-[9px] text-slate-500 mt-auto font-medium tracking-wide uppercase">
              Click to flip back
            </p>
          </div>
        }
      />
    </div>
  );
}
