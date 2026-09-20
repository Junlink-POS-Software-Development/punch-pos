"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  ChefHat,
  Plus,
  Check,
  Flame,
  Coffee,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { CartItem } from "@/components/sales-terminnal/components/terminal-cart/types";
import {
  SelectedModifier,
  CourseType,
} from "@/lib/types/restaurant";

interface ModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem | null;
  onApplyModifiers: (
    itemId: string,
    modifiers: SelectedModifier[],
    course?: CourseType,
    notes?: string
  ) => void;
}

// Preset option groups for restaurant dining
const COOKING_TEMPERATURES = [
  { id: "rare", name: "Rare", price: 0 },
  { id: "med_rare", name: "Medium Rare", price: 0 },
  { id: "medium", name: "Medium", price: 0 },
  { id: "med_well", name: "Medium Well", price: 0 },
  { id: "well_done", name: "Well Done", price: 0 },
];

const SUGAR_LEVELS = [
  { id: "sugar_0", name: "0% Unsweetened", price: 0 },
  { id: "sugar_25", name: "25% Low Sugar", price: 0 },
  { id: "sugar_50", name: "50% Half Sugar", price: 0 },
  { id: "sugar_100", name: "100% Regular Sugar", price: 0 },
];

const ICE_LEVELS = [
  { id: "ice_none", name: "No Ice", price: 0 },
  { id: "ice_less", name: "Less Ice", price: 0 },
  { id: "ice_reg", name: "Regular Ice", price: 0 },
  { id: "ice_extra", name: "Extra Ice", price: 0 },
];

const COMMON_ADDONS = [
  { id: "extra_cheese", name: "Extra Cheese", price: 30 },
  { id: "crispy_bacon", name: "Crispy Bacon", price: 50 },
  { id: "fried_egg", name: "Sunny-Side Egg", price: 25 },
  { id: "mushroom_gravy", name: "Mushroom Gravy", price: 35 },
  { id: "side_salad", name: "Side House Salad", price: 60 },
  { id: "extra_rice", name: "Extra Garlic Rice", price: 25 },
  { id: "oat_milk", name: "Oat Milk Upgrade", price: 30 },
  { id: "extra_shot", name: "Extra Espresso Shot", price: 40 },
];

const COURSES: { id: CourseType; label: string }[] = [
  { id: "beverage", label: "Beverage" },
  { id: "appetizer", label: "Appetizer" },
  { id: "main", label: "Main Course" },
  { id: "dessert", label: "Dessert" },
  { id: "side", label: "Side Dish" },
];

export const ModifierModal: React.FC<ModifierModalProps> = ({
  isOpen,
  onClose,
  item,
  onApplyModifiers,
}) => {
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [course, setCourse] = useState<CourseType>("main");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (item) {
      setSelectedModifiers(item.modifiers || []);
      setCourse(item.course || "main");
      setNotes(item.notes || "");
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleToggleSingleChoice = (
    groupId: string,
    groupName: string,
    optionId: string,
    optionName: string,
    priceAdjustment: number
  ) => {
    // Remove any existing option from this group, then add or toggle off
    const existing = selectedModifiers.find(
      (m) => m.groupId === groupId && m.optionId === optionId
    );
    if (existing) {
      setSelectedModifiers(selectedModifiers.filter((m) => m.groupId !== groupId));
    } else {
      const filtered = selectedModifiers.filter((m) => m.groupId !== groupId);
      setSelectedModifiers([
        ...filtered,
        { groupId, groupName, optionId, optionName, priceAdjustment },
      ]);
    }
  };

  const handleToggleAddon = (
    optionId: string,
    optionName: string,
    priceAdjustment: number
  ) => {
    const existing = selectedModifiers.find(
      (m) => m.groupId === "addons" && m.optionId === optionId
    );
    if (existing) {
      setSelectedModifiers(
        selectedModifiers.filter(
          (m) => !(m.groupId === "addons" && m.optionId === optionId)
        )
      );
    } else {
      setSelectedModifiers([
        ...selectedModifiers,
        {
          groupId: "addons",
          groupName: "Add-ons",
          optionId,
          optionName,
          priceAdjustment,
        },
      ]);
    }
  };

  const totalModifierPrice = selectedModifiers.reduce(
    (sum, m) => sum + m.priceAdjustment,
    0
  );
  const adjustedUnitPrice = item.unitPrice + totalModifierPrice;

  const handleSave = () => {
    onApplyModifiers(item.id, selectedModifiers, course, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-2xl max-h-[90vh] bg-card border border-border shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Item Customization & Modifiers
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure cooking temperature, drink sweetness, add-ons, and prep notes.
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

        {/* Item Banner */}
        <div className="px-6 py-3 bg-muted/20 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <span className="text-sm font-bold text-foreground block">
              {item.itemName}
            </span>
            <span className="text-xs text-muted-foreground">
              Base Price: ₱{item.unitPrice.toFixed(2)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted-foreground uppercase font-semibold block">
              Adjusted Price
            </span>
            <span className="text-base font-black text-primary">
              ₱{adjustedUnitPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Dining Course Assignment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Course Sequencing
            </label>
            <div className="flex flex-wrap gap-2">
              {COURSES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCourse(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    course === c.id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Cooking Temperature */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Cooking Doneness (Meat / Grill)</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {COOKING_TEMPERATURES.map((temp) => {
                const isSelected = selectedModifiers.some(
                  (m) => m.groupId === "doneness" && m.optionId === temp.id
                );
                return (
                  <button
                    key={temp.id}
                    type="button"
                    onClick={() =>
                      handleToggleSingleChoice(
                        "doneness",
                        "Doneness",
                        temp.id,
                        temp.name,
                        temp.price
                      )
                    }
                    className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500 font-bold ring-2 ring-amber-500/20"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {temp.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Drink Preferences: Sugar & Ice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sugar Level */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                <Coffee className="w-3.5 h-3.5 text-primary" />
                <span>Sweetness Level</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SUGAR_LEVELS.map((sugar) => {
                  const isSelected = selectedModifiers.some(
                    (m) => m.groupId === "sugar" && m.optionId === sugar.id
                  );
                  return (
                    <button
                      key={sugar.id}
                      type="button"
                      onClick={() =>
                        handleToggleSingleChoice(
                          "sugar",
                          "Sugar Level",
                          sugar.id,
                          sugar.name,
                          sugar.price
                        )
                      }
                      className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary/15 text-primary border-primary font-bold ring-2 ring-primary/20"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {sugar.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ice Level */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Ice Level</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ICE_LEVELS.map((ice) => {
                  const isSelected = selectedModifiers.some(
                    (m) => m.groupId === "ice" && m.optionId === ice.id
                  );
                  return (
                    <button
                      key={ice.id}
                      type="button"
                      onClick={() =>
                        handleToggleSingleChoice(
                          "ice",
                          "Ice Level",
                          ice.id,
                          ice.name,
                          ice.price
                        )
                      }
                      className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500 font-bold ring-2 ring-blue-500/20"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {ice.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Add-ons & Extra Sides */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Upgrades & Extra Add-ons
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMMON_ADDONS.map((addon) => {
                const isSelected = selectedModifiers.some(
                  (m) => m.groupId === "addons" && m.optionId === addon.id
                );
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() =>
                      handleToggleAddon(addon.id, addon.name, addon.price)
                    }
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500 text-foreground ring-2 ring-emerald-500/20"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        {addon.name}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">
                      +₱{addon.price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Special Kitchen Instructions & Prep Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Special Kitchen Notes / Allergy Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. No onions, dressing on the side, severe seafood allergy..."
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20 shrink-0">
          <div className="text-xs text-muted-foreground">
            {selectedModifiers.length > 0 ? (
              <span className="font-medium text-foreground">
                {selectedModifiers.length} custom options selected (+₱
                {totalModifierPrice.toFixed(2)})
              </span>
            ) : (
              <span>No extra modifiers selected.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Apply to Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
