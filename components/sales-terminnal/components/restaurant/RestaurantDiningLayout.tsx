"use client";

import React, { useState } from "react";
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";
import { CartItem, DiscountType } from "@/components/sales-terminnal/components/terminal-cart/types";
import { CourseType, RestaurantTable, SelectedModifier } from "@/lib/types/restaurant";
import { RestaurantDiningHeader } from "./RestaurantDiningHeader";
import { RestaurantMenuCatalog } from "./RestaurantMenuCatalog";
import { RestaurantGuestCheck } from "./RestaurantGuestCheck";
import { useRestaurantStore } from "@/app/restaurant/stores/useRestaurantStore";

interface RestaurantDiningLayoutProps {
  items: Item[];
  cartItems: CartItem[];
  onAddItemDirect: (item: Item, course?: CourseType) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<CartItem>) => void;
  onOpenTableModal: () => void;
  onSelectTable: (table: RestaurantTable) => void;
  onOpenModifier: (item: CartItem) => void;
  onSendKitchen: () => void;
  onPrintBill: () => void;
  onSplitCheck: () => void;
  onSettleBill: (totalWithServiceCharge?: number) => void;
  onDiscountClick: () => void;
  cashierName: string;
}

export const RestaurantDiningLayout: React.FC<RestaurantDiningLayoutProps> = ({
  items,
  cartItems,
  onAddItemDirect,
  onRemoveItem,
  onUpdateItem,
  onOpenTableModal,
  onSelectTable,
  onOpenModifier,
  onSendKitchen,
  onPrintBill,
  onSplitCheck,
  onSettleBill,
  onDiscountClick,
  cashierName,
}) => {
  const { tables, activeTableId } = useRestaurantStore();
  const activeTable = tables.find((t) => t.id === activeTableId);

  const [orderMode, setOrderMode] = useState<"dine_in" | "takeout" | "delivery" | "bar">("dine_in");
  const [guestCount, setGuestCount] = useState<number>(
    activeTable?.currentSession?.guestCount || activeTable?.seatingCapacity || 4
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"menu" | "floor">("menu");
  const [activeCourse, setActiveCourse] = useState<CourseType>("main");
  const [serviceChargeRate, setServiceChargeRate] = useState<number>(0.1); // 10% default for PH dining

  const handleOpenModifierForItem = (item: Item) => {
    // Create temporary cart item representation to open modifier modal
    const tempCartItem: CartItem = {
      id: item.id || item.sku,
      sku: item.sku,
      itemName: item.itemName,
      unitPrice: item.sellingPrice ?? item.salesPrice ?? 0,
      quantity: 1,
      discountType: "flat",
      discountValue: 0,
      discount: 0,
      total: item.sellingPrice ?? item.salesPrice ?? 0,
      course: activeCourse,
    };
    onOpenModifier(tempCartItem);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* 1. Dining Control Header Bar */}
      <RestaurantDiningHeader
        onOpenTableModal={onOpenTableModal}
        orderMode={orderMode}
        setOrderMode={setOrderMode}
        guestCount={guestCount}
        setGuestCount={setGuestCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        cashierName={cashierName}
      />

      {/* 2. Main Split Area: Menu Catalog (Left) & Guest Check (Right) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Left Column (Menu Catalog / Floor Map) */}
        <div className="lg:col-span-7 xl:col-span-8 h-full min-h-0 overflow-hidden">
          <RestaurantMenuCatalog
            items={items}
            searchQuery={searchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            activeCourse={activeCourse}
            setActiveCourse={setActiveCourse}
            onAddItem={onAddItemDirect}
            onOpenModifierForItem={handleOpenModifierForItem}
            onSelectTable={onSelectTable}
          />
        </div>

        {/* Right Column (Guest Check / Dining Ticket) */}
        <div className="lg:col-span-5 xl:col-span-4 h-full min-h-0 overflow-hidden">
          <RestaurantGuestCheck
            cartItems={cartItems}
            onRemoveItem={onRemoveItem}
            onUpdateItem={onUpdateItem}
            onOpenModifier={onOpenModifier}
            onSendKitchen={onSendKitchen}
            onPrintBill={onPrintBill}
            onSplitCheck={onSplitCheck}
            onSettleBill={onSettleBill}
            onDiscountClick={onDiscountClick}
            serviceChargeRate={serviceChargeRate}
            setServiceChargeRate={setServiceChargeRate}
            guestCount={guestCount}
          />
        </div>
      </div>
    </div>
  );
};
