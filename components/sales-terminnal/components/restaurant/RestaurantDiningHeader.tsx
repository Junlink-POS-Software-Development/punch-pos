"use client";

import React from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Users,
  Search,
  ChefHat,
  LayoutGrid,
  MapPin,
  Clock,
  ShoppingBag,
  Wine,
  Plus,
  Minus,
  Sparkles,
  Maximize,
  Minimize,
} from "lucide-react";
import { useRestaurantStore } from "@/app/restaurant/stores/useRestaurantStore";
import { useViewStore } from "@/components/window-layouts/store/useViewStore";
import { RestaurantTable } from "@/lib/types/restaurant";

interface RestaurantDiningHeaderProps {
  onOpenTableModal: () => void;
  orderMode: "dine_in" | "takeout" | "delivery" | "bar";
  setOrderMode: (mode: "dine_in" | "takeout" | "delivery" | "bar") => void;
  guestCount: number;
  setGuestCount: (count: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "menu" | "floor";
  setViewMode: (mode: "menu" | "floor") => void;
  cashierName: string;
}

export const RestaurantDiningHeader: React.FC<RestaurantDiningHeaderProps> = ({
  onOpenTableModal,
  orderMode,
  setOrderMode,
  guestCount,
  setGuestCount,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  cashierName,
}) => {
  const { tables, activeTableId, kitchenTickets } = useRestaurantStore();
  const { isFullscreen, toggleFullscreen } = useViewStore();
  const activeTable = tables.find((t) => t.id === activeTableId);

  const activeKitchenTicketsCount = kitchenTickets.filter(
    (t) => t.status !== "completed"
  ).length;

  const handleIncrementGuests = () => {
    setGuestCount(Math.min(30, guestCount + 1));
  };

  const handleDecrementGuests = () => {
    setGuestCount(Math.max(1, guestCount - 1));
  };

  return (
    <header className="flex flex-col gap-2 p-3 bg-card border border-border rounded-2xl shadow-xs shrink-0 mb-3">
      {/* Top Row: Active Table, Dining Type, Guest Count, KDS, View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Table Badge / Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTableModal}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-left transition-all cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-foreground group-hover:text-primary transition-colors">
                  {activeTable
                    ? `${activeTable.tableNumber} • ${activeTable.tableName || activeTable.floorZone}`
                    : "Select Table"}
                </span>
                {activeTable?.status && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                      activeTable.status === "occupied"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : activeTable.status === "billing"
                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {activeTable.status}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground block">
                {activeTable?.seatingCapacity
                  ? `${activeTable.seatingCapacity} Pax Capacity`
                  : "Floor Plan"}
              </span>
            </div>
          </button>

          {/* Order Type Selector */}
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setOrderMode("dine_in")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                orderMode === "dine_in"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dine-In
            </button>
            <button
              type="button"
              onClick={() => setOrderMode("takeout")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                orderMode === "takeout"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Takeout
            </button>
            <button
              type="button"
              onClick={() => setOrderMode("bar")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                orderMode === "bar"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bar Tab
            </button>
          </div>

          {/* Guest Count (Covers) Adjuster */}
          {orderMode === "dine_in" && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded-xl border border-border text-xs">
              <Users className="w-3.5 h-3.5 text-muted-foreground ml-1" />
              <button
                type="button"
                onClick={handleDecrementGuests}
                className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-muted font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-bold font-mono px-1 text-foreground min-w-[20px] text-center">
                {guestCount}
              </span>
              <button
                type="button"
                onClick={handleIncrementGuests}
                className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-muted font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
              <span className="text-[10px] text-muted-foreground pr-1">Pax</span>
            </div>
          )}
        </div>

        {/* Right: Search, KDS Status Badge, View Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Menu Search Box */}
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food, drinks..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Kitchen Display Link & Active Count */}
          <Link
            href="/kitchen"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted text-xs font-bold text-foreground transition-colors cursor-pointer"
            title="Open Kitchen Display System (KDS)"
          >
            <ChefHat className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Kitchen</span>
            {activeKitchenTicketsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950">
                {activeKitchenTicketsCount}
              </span>
            )}
          </Link>

          {/* View Mode Switcher: Menu vs Floor Plan */}
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("menu")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "menu"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Menu
            </button>
            <button
              type="button"
              onClick={() => setViewMode("floor")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "floor"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Floor
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isFullscreen
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80"
            }`}
            title={isFullscreen ? "Exit Fullscreen (Tab)" : "Enter Fullscreen (Tab)"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
