"use client";

import React, { useState, useMemo } from "react";
import {
  Coffee,
  UtensilsCrossed,
  Flame,
  Pizza,
  Cake,
  Wine,
  Sparkles,
  SlidersHorizontal,
  ChefHat,
  Check,
  Users,
  Clock,
  ArrowRight,
  Package,
} from "lucide-react";
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";
import { CourseType, RestaurantTable, TableStatus } from "@/lib/types/restaurant";
import { useRestaurantStore } from "@/app/restaurant/stores/useRestaurantStore";
import { useInventory } from "@/app/dashboard/hooks/useInventory";
import { useCategories } from "@/app/inventory/hooks/useCategories";

interface RestaurantMenuCatalogProps {
  items: Item[];
  searchQuery: string;
  viewMode: "menu" | "floor";
  setViewMode: (mode: "menu" | "floor") => void;
  activeCourse: CourseType;
  setActiveCourse: (course: CourseType) => void;
  onAddItem: (item: Item, course: CourseType) => void;
  onOpenModifierForItem: (item: Item) => void;
  onSelectTable: (table: RestaurantTable) => void;
}

const COURSES: { id: CourseType; label: string; icon: string }[] = [
  { id: "beverage", label: "Beverages", icon: "🍹" },
  { id: "appetizer", label: "Appetizers", icon: "🥗" },
  { id: "main", label: "Mains", icon: "🥩" },
  { id: "dessert", label: "Desserts", icon: "🍰" },
  { id: "side", label: "Sides", icon: "🍟" },
];

export const RestaurantMenuCatalog: React.FC<RestaurantMenuCatalogProps> = ({
  items,
  searchQuery,
  viewMode,
  setViewMode,
  activeCourse,
  setActiveCourse,
  onAddItem,
  onOpenModifierForItem,
  onSelectTable,
}) => {
  const { tables, activeTableId, setActiveTable } = useRestaurantStore();
  const { inventory: inventoryData } = useInventory();
  const { categories: categoryList } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fast lookup map: categoryId (UUID) -> human-readable Category Name
  const categoryIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    categoryList.forEach((c) => {
      if (c.id && c.category) {
        map[c.id] = c.category;
      }
    });
    return map;
  }, [categoryList]);

  // Helper to get friendly, human-readable category name
  const getCategoryName = (item: Item): string => {
    // 1. If item already has a friendly categoryName
    if (item.categoryName && item.categoryName.trim() !== "") {
      return item.categoryName.trim();
    }
    // 2. If item.category is a UUID that maps to an entry in categories
    if (item.category && categoryIdToName[item.category]) {
      return categoryIdToName[item.category];
    }
    // 3. If item.category is already a plain text name (not a UUID)
    if (item.category && item.category.trim() !== "") {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        item.category.trim()
      );
      if (!isUuid) return item.category.trim();
    }
    return "General";
  };

  // Get stock quantity helper
  const getStock = (sku: string) => {
    if (!Array.isArray(inventoryData)) return 99;
    const inv = inventoryData.find((i) => i.sku === sku);
    return inv ? inv.current_stock : 99;
  };

  // Derive unique human-readable categories from items and categories table
  const categories = useMemo(() => {
    const set = new Set<string>();
    let hasGeneral = false;

    items.forEach((item) => {
      const name = getCategoryName(item);
      if (name === "General") {
        hasGeneral = true;
      } else if (name) {
        set.add(name);
      }
    });

    // Also include categories from database
    categoryList.forEach((c) => {
      if (c.category && c.category.trim() !== "") {
        set.add(c.category.trim());
      }
    });

    const sortedCats = Array.from(set).sort((a, b) => a.localeCompare(b));
    if (hasGeneral && sortedCats.length > 0) {
      sortedCats.push("General");
    }
    return ["all", ...sortedCats];
  }, [items, categoryList, categoryIdToName]);

  // Filter items by category and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemCatName = getCategoryName(item);
      const matchesCat =
        selectedCategory === "all" ||
        itemCatName.toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.itemName.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        itemCatName.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery, categoryIdToName]);

  // Map category to aesthetic accent color
  const getCategoryTheme = (cat?: string) => {
    const c = (cat || "").toLowerCase();
    if (c.includes("drink") || c.includes("beverage") || c.includes("coffee") || c.includes("tea") || c.includes("juice"))
      return "from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";
    if (c.includes("dessert") || c.includes("sweet") || c.includes("cake") || c.includes("pastry"))
      return "from-pink-500/10 to-rose-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400";
    if (c.includes("appetizer") || c.includes("salad") || c.includes("starter") || c.includes("soup"))
      return "from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
    if (c.includes("main") || c.includes("meat") || c.includes("beef") || c.includes("chicken") || c.includes("pork") || c.includes("rice"))
      return "from-red-500/10 to-amber-500/10 border-red-500/30 text-red-600 dark:text-red-400";
    return "from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400";
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
    <div className="flex flex-col h-full w-full bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
      {/* ─── 1. MENU VIEW ─── */}
      {viewMode === "menu" && (
        <>
          {/* Category Tabs Bar */}
          <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                {cat === "all" ? "All Menu" : cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
                <UtensilsCrossed className="w-10 h-10 text-muted-foreground opacity-40" />
                <span className="text-sm font-bold text-foreground">
                  No matching dishes or drinks
                </span>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Try adjusting your search query or register new menu items in
                  Inventory.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredItems.map((item) => {
                  const price = item.sellingPrice ?? item.salesPrice ?? 0;
                  const stock = getStock(item.sku);
                  const isOutOfStock = stock <= 0;
                  const itemCatName = getCategoryName(item);
                  const accentTheme = getCategoryTheme(itemCatName);

                  return (
                    <div
                      key={item.id || item.sku}
                      onClick={() => !isOutOfStock && onAddItem(item, activeCourse)}
                      className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all select-none cursor-pointer bg-gradient-to-br ${accentTheme} ${
                        isOutOfStock
                          ? "opacity-40 grayscale cursor-not-allowed border-border"
                          : "hover:shadow-md hover:scale-[1.01] active:scale-[0.99] border-border/80 hover:border-primary/50"
                      }`}
                    >
                      {/* Top Row: Category pill & Customize icon */}
                      <div className="flex items-start justify-between gap-1 mb-2">
                        {itemCatName && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-background/80 text-foreground/80 backdrop-blur-xs border border-border/40 truncate max-w-[120px]"
                            title={itemCatName}
                          >
                            {itemCatName}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModifierForItem(item);
                          }}
                          className="p-1 rounded-lg bg-background/60 hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-colors cursor-pointer"
                          title="Customize doneness / options"
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Name */}
                      <div className="mb-3">
                        <span className="font-extrabold text-xs text-foreground block line-clamp-2 leading-tight">
                          {item.itemName}
                        </span>
                        {item.description && (
                          <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                            {item.description}
                          </span>
                        )}
                      </div>

                      {/* Bottom Row: Price & Course Indicator */}
                      <div className="flex items-end justify-between pt-2 border-t border-border/40">
                        <span className="font-mono font-black text-sm text-foreground">
                          ₱{price.toFixed(2)}
                        </span>

                        <span className="text-[9px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                          + Tap to add
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Bar: Course Sequencing Selector */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/40 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:inline">
              Active Course For New Items:
            </span>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto justify-between sm:justify-start">
              {COURSES.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => setActiveCourse(course.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCourse === course.id
                      ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]"
                      : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  <span>{course.icon}</span>
                  <span>{course.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── 2. EMBEDDED FLOOR PLAN VIEW ─── */}
      {viewMode === "floor" && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-foreground flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              Dining Floor Map • Tap any table to open check & take orders
            </span>

            <button
              type="button"
              onClick={() => setViewMode("menu")}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Back to Menu
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {tables.map((table) => {
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
                    onClick={() => {
                      onSelectTable(table);
                      setViewMode("menu");
                    }}
                    className={`flex flex-col justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-md"
                        : table.status === "occupied"
                        ? "border-amber-500/50 bg-card hover:border-amber-500 hover:shadow-sm"
                        : table.status === "billing"
                        ? "border-purple-500/50 bg-card hover:border-purple-500 hover:shadow-sm"
                        : "border-border/80 bg-card hover:border-primary/40 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <div>
                        <span className="font-black text-sm text-foreground block">
                          {table.tableNumber}
                        </span>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {table.tableName || `${table.floorZone} Zone`}
                        </span>
                      </div>

                      <span
                        className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                          table.status === "occupied"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : table.status === "billing"
                            ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {table.status}
                      </span>
                    </div>

                    <div className="space-y-1 my-2">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {table.seatingCapacity > 0
                            ? `${table.seatingCapacity} Pax`
                            : "Counter"}
                        </span>

                        {table.currentSession?.startedAt && (
                          <span className="font-mono text-[10px]">
                            {formatElapsed(table.currentSession.startedAt)}
                          </span>
                        )}
                      </div>

                      {hasSession && (
                        <div className="p-2 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">
                            {itemCount} items
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            ₱{sessionTotal.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-primary font-bold">
                      <span>{isCurrent ? "Active Table" : "Switch Table"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
