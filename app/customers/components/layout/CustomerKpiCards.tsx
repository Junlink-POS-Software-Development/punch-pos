"use client";

import React from "react";
import { Users, TrendingUp, DollarSign, Award } from "lucide-react";
import { useCustomerData } from "../../hooks/useCustomerData";

/**
 * ─── Customer KPI Cards ─────────────────────────────────────────────────────
 * Row of 4 stat cards for the customer dashboard.
 */
export function CustomerKpiCards() {
  const { rawCustomers } = useCustomerData();

  // ─── Compute KPIs ──────────────────────────────────────────────────────────
  const totalCustomers = rawCustomers.length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeCustomers = rawCustomers.filter(
    (c) => c.last_visit_at && new Date(c.last_visit_at) >= thirtyDaysAgo
  ).length;

  const totalValue = rawCustomers.reduce(
    (sum, c) => sum + (c.total_spent || 0),
    0
  );

  const avgVisits =
    totalCustomers > 0
      ? Math.round(
          rawCustomers.reduce((sum, c) => sum + (c.visit_count || 0), 0) /
            totalCustomers
        )
      : 0;

  // ─── Card Data ─────────────────────────────────────────────────────────────
  const cards = [
    {
      label: "Total Customers",
      value: totalCustomers.toLocaleString(),
      icon: Users,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      label: "Active (30 Days)",
      value: activeCustomers.toLocaleString(),
      icon: TrendingUp,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      label: "Total Customer Value",
      value: `₱${totalValue.toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      icon: DollarSign,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
    {
      label: "Avg. Visits",
      value: avgVisits.toLocaleString(),
      icon: Award,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}
          >
            <card.icon size={22} className={card.iconColor} />
          </div>
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs font-medium truncate">
              {card.label}
            </p>
            <p className="text-foreground text-xl lg:text-2xl font-bold tracking-tight leading-none mt-1">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
