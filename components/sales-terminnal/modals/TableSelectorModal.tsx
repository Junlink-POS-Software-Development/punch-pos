"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Users,
  Clock,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import {
  useRestaurantStore,
  DEFAULT_STARTER_TABLES,
} from "@/app/restaurant/stores/useRestaurantStore";
import {
  FloorZone,
  TableStatus,
  RestaurantTable,
} from "@/lib/types/restaurant";

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTable: (table: RestaurantTable) => void;
}

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTable,
}) => {
  const {
    tables,
    activeTableId,
    setActiveTable,
    updateTableStatus,
    clearTable,
  } = useRestaurantStore();

  const [selectedZone, setSelectedZone] = useState<"all" | FloorZone>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const activeTable = useMemo(
    () => tables.find((t) => t.id === activeTableId),
    [tables, activeTableId]
  );

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesZone =
        selectedZone === "all" || table.floorZone === selectedZone;
      const matchesSearch =
        table.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (table.tableName &&
          table.tableName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesZone && matchesSearch;
    });
  }, [tables, selectedZone, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: tables.length,
      vacant: tables.filter((t) => t.status === "vacant").length,
      occupied: tables.filter((t) => t.status === "occupied").length,
      billing: tables.filter((t) => t.status === "billing").length,
      reserved: tables.filter((t) => t.status === "reserved").length,
    };
  }, [tables]);

  if (!isOpen) return null;

  const handleChooseTable = (table: RestaurantTable) => {
    setActiveTable(table.id);
    onSelectTable(table);
    onClose();
  };

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case "vacant":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Vacant
          </span>
        );
      case "occupied":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Occupied
          </span>
        );
      case "billing":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Billing
          </span>
        );
      case "reserved":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Reserved
          </span>
        );
    }
  };

  const formatElapsed = (isoTime?: string) => {
    if (!isoTime) return "";
    const start = new Date(isoTime).getTime();
    const diffMin = Math.max(0, Math.floor((Date.now() - start) / 60000));
    if (diffMin < 60) return `${diffMin}m`;
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-5xl max-h-[90vh] bg-card border border-border shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                Floor Plan & Table Management
                {activeTable && (
                  <span className="text-xs font-normal text-muted-foreground">
                    • Current: <b className="text-primary">{activeTable.tableNumber}</b>
                  </span>
                )}
              </h2>
              <p className="text-xs text-muted-foreground">
                Select a table to manage its dining order, send chits to the kitchen, or bill out.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar: Zones, Search, Status Counters */}
        <div className="px-6 py-3 border-b border-border bg-card/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Zone Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/50 text-xs">
            <button
              type="button"
              onClick={() => setSelectedZone("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedZone === "all"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Tables ({tables.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone("main")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedZone === "main"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Main Dining
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone("patio")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedZone === "patio"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Patio
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone("bar")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedZone === "bar"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bar Lounge
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone("takeout")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedZone === "takeout"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Takeout
            </button>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {stats.vacant} Vacant
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {stats.occupied} Occupied
            </span>
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              {stats.billing} Billing
            </span>
          </div>
        </div>

        {/* Table Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTables.map((table) => {
              const isCurrent = table.id === activeTableId;
              const hasSession = !!table.currentSession;
              const sessionTotal = table.currentSession?.total || 0;
              const itemCount =
                table.currentSession?.cartItems.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                ) || 0;

              return (
                <div
                  key={table.id}
                  onClick={() => handleChooseTable(table)}
                  className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
                    isCurrent
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                      : table.status === "occupied"
                      ? "border-amber-500/40 bg-card hover:border-amber-500 hover:shadow-md"
                      : table.status === "billing"
                      ? "border-purple-500/40 bg-card hover:border-purple-500 hover:shadow-md"
                      : "border-border/70 bg-card hover:border-primary/40 hover:shadow-sm"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                          {table.tableNumber}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary text-primary-foreground">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground capitalize block">
                        {table.tableName || `${table.floorZone} Zone`}
                      </span>
                    </div>

                    <div>{getStatusBadge(table.status)}</div>
                  </div>

                  {/* Card Body: Session Info or Capacity */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {table.seatingCapacity > 0
                          ? `${table.seatingCapacity} Pax Max`
                          : "Counter"}
                      </span>

                      {table.currentSession?.startedAt && (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-foreground/80">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {formatElapsed(table.currentSession.startedAt)}
                        </span>
                      )}
                    </div>

                    {hasSession ? (
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                            Current Bill ({itemCount} items)
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            ₱{sessionTotal.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {table.currentSession?.serverName || "Server"}
                        </span>
                      </div>
                    ) : (
                      <div className="py-2.5 px-3 rounded-xl bg-muted/20 border border-dashed border-border/60 text-center">
                        <span className="text-xs text-muted-foreground">
                          Ready for guests
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <span className="text-[11px] text-primary font-bold group-hover:underline flex items-center gap-1">
                      {isCurrent ? "View in Terminal" : "Switch Table"}
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>

                    {table.status === "occupied" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTableStatus(table.id, "billing");
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 transition-colors"
                      >
                        Present Bill
                      </button>
                    )}

                    {table.status === "billing" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTableStatus(table.id, "occupied");
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                      >
                        Back to Dining
                      </button>
                    )}

                    {table.status === "vacant" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTableStatus(table.id, "reserved");
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 transition-colors"
                      >
                        Reserve
                      </button>
                    )}

                    {table.status === "reserved" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTableStatus(table.id, "vacant");
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Table changes automatically preserve order items & KOT chits.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
