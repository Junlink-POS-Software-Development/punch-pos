"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Volume2,
  VolumeX,
  Printer,
  Sparkles,
  Filter,
  Check,
  Flame,
  Coffee,
  RotateCcw,
  Settings,
} from "lucide-react";
import { useRestaurantStore } from "@/app/restaurant/stores/useRestaurantStore";
import { KitchenTicket, KitchenStatus } from "@/lib/types/restaurant";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";

export default function KitchenDisplayPage() {
  const { isRestaurant, modules, isLoading: isModeLoading, businessMode } = useBusinessMode();
  const showKitchenKds = isRestaurant || modules.kitchen_display;

  const {
    kitchenTickets,
    updateTicketStatus,
    toggleTicketItemCompleted,
    bumpTicket,
    clearCompletedTickets,
  } = useRestaurantStore();

  const [selectedStation, setSelectedStation] = useState<
    "all" | "kitchen" | "bar" | "grill"
  >("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Live clock refresh
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeTickets = useMemo(() => {
    return kitchenTickets.filter((ticket) => {
      const matchesStation =
        selectedStation === "all" ||
        ticket.station === "all" ||
        ticket.station === selectedStation;
      const isNotDone = ticket.status !== "completed";
      return matchesStation && isNotDone;
    });
  }, [kitchenTickets, selectedStation]);

  const completedTickets = useMemo(() => {
    return kitchenTickets.filter((t) => t.status === "completed");
  }, [kitchenTickets]);

  const getUrgencyLevel = (createdAt: string) => {
    const elapsedMinutes = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / 60000
    );
    if (elapsedMinutes >= 20) return "critical"; // > 20 mins
    if (elapsedMinutes >= 10) return "warning"; // 10-20 mins
    return "normal"; // < 10 mins
  };

  const formatElapsed = (createdAt: string) => {
    const elapsedMinutes = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / 60000
    );
    if (elapsedMinutes < 1) return "Just now";
    if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
    const hours = Math.floor(elapsedMinutes / 60);
    const mins = elapsedMinutes % 60;
    return `${hours}h ${mins}m ago`;
  };

  const handlePrintChit = (ticket: KitchenTicket) => {
    window.print();
  };

  if (!isModeLoading && !showKitchenKds) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background text-foreground p-6">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-lg text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Kitchen KDS Disabled</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Kitchen Display System (KDS) is not active for the current business mode ({businessMode.toUpperCase()}). You can switch to Restaurant & Dining mode or enable the Kitchen Display module in Store Settings.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl border border-border bg-muted/60 hover:bg-muted text-foreground text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to POS
            </Link>
            <Link
              href="/settings"
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Store Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      {/* KDS Header Bar */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-card shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-bold transition-colors text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to POS
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-black text-foreground flex items-center gap-2 leading-none">
                Kitchen Display System (KDS)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary">
                  LIVE
                </span>
              </h1>
              <span className="text-xs text-muted-foreground">
                Kitchen & Bar Order Ticket (KOT) Dispatcher
              </span>
            </div>
          </div>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/60 text-xs">
          <button
            type="button"
            onClick={() => setSelectedStation("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedStation === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Stations ({activeTickets.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStation("kitchen")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedStation === "kitchen"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
            Kitchen
          </button>
          <button
            type="button"
            onClick={() => setSelectedStation("bar")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedStation === "bar"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Coffee className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
            Bar
          </button>
        </div>

        {/* Right Tools: Clock, Sound Toggle, Clear */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl border border-border bg-muted/30 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={soundEnabled ? "Mute audio cues" : "Unmute audio cues"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {completedTickets.length > 0 && (
            <button
              type="button"
              onClick={clearCompletedTickets}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear Completed ({completedTickets.length})
            </button>
          )}

          <div className="px-3.5 py-1.5 rounded-xl bg-muted/50 border border-border font-mono text-sm font-bold text-foreground">
            {currentTime || "--:--:--"}
          </div>
        </div>
      </header>

      {/* Main KDS Workspace */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-muted/15">
        {activeTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="p-4 rounded-3xl bg-primary/10 text-primary">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              All Orders Complete!
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm">
              There are currently no active kitchen tickets in the queue. New
              tickets sent from the sales terminal will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="flex gap-5 h-full items-start">
            {activeTickets.map((ticket) => {
              const urgency = getUrgencyLevel(ticket.createdAt);
              const elapsedStr = formatElapsed(ticket.createdAt);

              const headerBg =
                urgency === "critical"
                  ? "bg-red-500 text-white"
                  : urgency === "warning"
                  ? "bg-amber-500 text-slate-950"
                  : ticket.status === "ready"
                  ? "bg-emerald-600 text-white"
                  : ticket.status === "preparing"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-white dark:bg-slate-700";

              return (
                <div
                  key={ticket.id}
                  className="flex flex-col w-[340px] max-h-full rounded-2xl border border-border bg-card shadow-lg shrink-0 overflow-hidden"
                >
                  {/* Ticket Header */}
                  <div className={`p-3.5 flex flex-col gap-1 ${headerBg}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm tracking-wider">
                        {ticket.ticketNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/20 text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {elapsedStr}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-base tracking-tight">
                        {ticket.tableName}
                      </span>
                      <span className="text-xs opacity-90">
                        {ticket.guestCount} Guests • {ticket.serverName}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Items List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {ticket.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          toggleTicketItemCompleted(ticket.id, item.id)
                        }
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                          item.isCompleted
                            ? "bg-muted/40 border-border/40 opacity-40 line-through"
                            : "bg-muted/20 border-border/70 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="px-1.5 py-0.5 rounded-md text-xs font-black bg-primary/15 text-primary shrink-0">
                              {item.quantity}x
                            </span>
                            <div>
                              <span className="font-bold text-xs text-foreground block">
                                {item.itemName}
                              </span>

                              {item.course && (
                                <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-muted text-muted-foreground mt-0.5">
                                  {item.course}
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              item.isCompleted
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-border"
                            }`}
                          >
                            {item.isCompleted && <Check className="w-3 h-3" />}
                          </div>
                        </div>

                        {/* Modifiers List */}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="pl-6 mt-1.5 space-y-0.5">
                            {item.modifiers.map((mod, idx) => (
                              <span
                                key={idx}
                                className="block text-[10px] font-medium text-amber-700 dark:text-amber-400"
                              >
                                • {mod.optionName}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Special Kitchen Notes */}
                        {item.notes && (
                          <div className="pl-6 mt-1 text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>{item.notes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Ticket Footer Action Buttons */}
                  <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePrintChit(ticket)}
                      className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                      title="Print 80mm Kitchen Slip"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {ticket.status === "pending" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateTicketStatus(ticket.id, "preparing")
                        }
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Start Preparing
                      </button>
                    )}

                    {ticket.status === "preparing" && (
                      <button
                        type="button"
                        onClick={() => updateTicketStatus(ticket.id, "ready")}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Mark Ready
                      </button>
                    )}

                    {ticket.status === "ready" && (
                      <button
                        type="button"
                        onClick={() => bumpTicket(ticket.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Bump Ticket
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
