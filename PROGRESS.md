# POS-Next: Universal Multi-Mode Business POS Progress Tracker

This document tracks the phased implementation of making `pos-next` a universal Point of Sale system supporting multiple business verticals (**Pharmacy**, **Grocery / Supermarket**, **Restaurant / Cafe**, **Malls / Multi-Vendor**, **Services / Salons**, and **Retail**).

---

## 🗺️ Roadmap & Milestone Overview

| Phase | Milestone / Task | Status | Completion Date |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Core Foundation, Types & DB Schema** | 🟢 Completed | 2026-09-20 |
| 1.1 | TypeScript types & module contracts (`lib/types/businessMode.ts`) | 🟢 Completed | 2026-09-20 |
| 1.2 | Database migration (`20260920000000_add_business_modes_and_modules.sql`) | 🟢 Completed | 2026-09-20 |
| 1.3 | Server actions update (`app/actions/store.ts`) | 🟢 Completed | 2026-09-20 |
| 1.4 | Client hook & cache (`app/hooks/useBusinessMode.ts`) | 🟢 Completed | 2026-09-20 |
| **Phase 2** | **Settings: Business Mode & Module Manager** | 🟢 Completed | 2026-09-20 |
| 2.1 | Mode card selector & switch confirmation modal | 🟢 Completed | 2026-09-20 |
| 2.2 | Modular feature toggles grid with sub-settings | 🟢 Completed | 2026-09-20 |
| 2.3 | Integration into `StoreTab` and permissions guard | 🟢 Completed | 2026-09-20 |
| **Phase 3** | **Enhanced Multi-Step Onboarding Wizard** | 🟢 Completed | 2026-09-20 |
| 3.1 | Visual Industry Mode selection step | 🟢 Completed | 2026-09-20 |
| 3.2 | Smart presets auto-configuration | 🟢 Completed | 2026-09-20 |
| 3.3 | Optional starter category seed action | 🟢 Completed | 2026-09-20 |
| **Phase 4** | **Vertical Feature Modules & Terminal Integration** | 🟢 Completed | 2026-09-20 |
| 4.1 | Grocery & Retail: Fast Cash Tender Buttons (`PaymentPopup.tsx`) | 🟢 Completed | 2026-09-20 |
| 4.2 | Pharmacy: Senior/PWD Statutory Discount Chips (`DiscountModal.tsx`) | 🟢 Completed | 2026-09-20 |
| 4.3 | Terminal Header: Live Industry Mode Badge (`CashierInfo.tsx`) | 🟢 Completed | 2026-09-20 |
| **Phase 5** | **Pharmacy & Healthcare Vertical Pack** | 🟢 Completed | 2026-09-20 |
| 5.1 | DB Migration: generic_name, dosage, formulation, is_rx, `item_batches`, `prescriptions_log` | 🟢 Completed | 2026-09-20 |
| 5.2 | Item schema, API layer & FEFO batch library (`itemTypes.ts`, `item.api.ts`, `batch.api.ts`) | 🟢 Completed | 2026-09-20 |
| 5.3 | Item Form: Drug Formulation & Regulatory section in `SingleItemForm.tsx` | 🟢 Completed | 2026-09-20 |
| 5.4 | POS Terminal Dual Search: Brand + Generic molecule matching in `ItemAutoComplete.tsx` | 🟢 Completed | 2026-09-20 |
| 5.5 | Cart FEFO & Rx badges: Lot #, expiry, generic name subtitle in `TerminalCart.tsx` | 🟢 Completed | 2026-09-20 |
| 5.6 | Prescription (Rx) Verification Modal & audit logging (`RxValidationModal.tsx`, `prescription.ts`) | 🟢 Completed | 2026-09-20 |
| 5.7 | PostgREST search parser fix & safe query fallback in `inventory.api.ts` | 🟢 Completed | 2026-09-20 |
| 5.8 | Branded vs Generic medicine classification (`brandType: 'branded' \| 'generic'`) in Item Registration & Terminal | 🟢 Completed | 2026-09-20 |
| 5.9 | Pharmacy Medication Display Card: Brand, Molecule, Dosage, Form, Rx/OTC, Batch/Expiry in `ProductDisplay.tsx` | 🟢 Completed | 2026-09-20 |
| 5.10 | Generic Equivalents & Alternatives Hub: Generics Act compliance, price substitution, 1-click switch in `DesktopSalesTerminal.tsx` | 🟢 Completed | 2026-09-20 |
| 5.11 | Inventory Registration & Stocks Monitor Table Transformation: Dynamic Generic Molecule column, Branded/Generic badge, Lot/Expiry details, and inline molecule edits (`ItemTable.tsx`, `ItemTableRow.tsx`, `TableToolbar.tsx`, `StocksDataGrid.tsx`) | 🟢 Completed | 2026-09-20 |
| 5.12 | Terminal Search & Free Item Modals: Dosage & Formulation Badges, Form Query Matching (`ItemAutoComplete.tsx`, `FreeItemModal.tsx`) | 🟢 Completed | 2026-09-20 |
| 5.13 | Pharmacy Mode List-Based Item Search & Inline Selector: Suppressed floating barcode dropdown, added dedicated search results list with explicit `[✓ Select]` and `[+ Add]` actions, filter tabs, and keyboard navigation (`ItemAutoComplete.tsx`, `FormFields.tsx`, `PharmacyEquivalentsHub.tsx`, `DesktopSalesTerminal.tsx`) | 🟢 Completed | 2026-09-20 |
| 5.14 | Universal Dosage Display in Search Results & Inventory Tables: Dedicated Dosage column in Item Registration table, sortable dosage key, enhanced dosage regex extraction, and persistent dosage badges in terminal search and stocks data grid (`ItemTable.tsx`, `ItemTableRow.tsx`, `useItemRegStore.ts`, `useItemTable.ts`, `StocksDataGrid.tsx`, `pharmacyMeta.ts`, `PharmacyEquivalentsHub.tsx`) | 🟢 Completed | 2026-09-20 |
| 5.15 | Streamlined Idle Medicine Directory: Removed quick molecule exploration chips section to give 100% vertical viewport to direct medicine selection (`PharmacyEquivalentsHub.tsx`) | 🟢 Completed | 2026-09-20 |
| **Phase 6** | **Restaurant, Cafe & Dining Vertical Pack** | 🟢 Completed | 2026-09-20 |
| 6.1 | Restaurant: Table / Floor Selection & Order Course Management (`TableSelectorModal.tsx`, `useRestaurantStore.ts`, `TerminalHeader.tsx`) | 🟢 Completed | 2026-09-20 |
| 6.2 | Kitchen Display System (KDS) & Chit / Ticket routing (`/kitchen`, `KitchenTicketModal.tsx`, `Navigation.tsx`) | 🟢 Completed | 2026-09-20 |
| 6.3 | Menu Modifiers & Split Check dialog (`ModifierModal.tsx`, `SplitCheckModal.tsx`, `TerminalCart.tsx`, `ActionButtons.tsx`) | 🟢 Completed | 2026-09-20 |
| 6.4 | Touch-First Dining Terminal Layout: Menu Catalog, Course Grouped Guest Check, Embedded Floor Plan & Control Header (`RestaurantDiningLayout.tsx`, `RestaurantDiningHeader.tsx`, `RestaurantMenuCatalog.tsx`, `RestaurantGuestCheck.tsx`, `DesktopSalesTerminal.tsx`) | 🟢 Completed | 2026-09-20 |
| 6.5 | Dynamic Mode-Guarded Kitchen KDS Visibility: Automatically hide Kitchen KDS navigation links, mobile drawer items, cart modifier buttons, and display a disabled-guard page in non-restaurant/non-kitchen modes (`Navigation.tsx`, `MobileBottomNav.tsx`, `TerminalCart.tsx`, `app/kitchen/page.tsx`) | 🟢 Completed | 2026-09-20 |
| **Phase 7** | **Grocery & Supermarket Vertical Pack** | 🟢 Completed | 2026-09-21 |
| 7.1 | Scale Barcode Parser & Weighed Item PLU Entry (`scaleBarcode.ts`, `ScaleProduceModal.tsx`, `addToCart.ts`, `TerminalCart.tsx`) | 🟢 Completed | 2026-09-21 |
| 7.2 | High-Speed Continuous Laser Scanning & Multi-Pack Barcodes (`scanSounds.ts`, `addToCart.ts`, `groceryMeta.ts`, `SingleItemForm.tsx`) | 🟢 Completed | 2026-09-21 |
| 7.3 | Bulk Low-Stock Alerts & Perishable Expiry Tracking (`DiscountModal.tsx`, `SingleItemForm.tsx`, `20260921000000_add_grocery_fields.sql`) | 🟢 Completed | 2026-09-21 |
| **Phase 8** | **Malls, Department Stores & Concessionaires Vertical Pack** | ⚪ Next | - |
| 8.1 | Concessionaire / Vendor Assignment & Tenant Revenue Split | ⚪ Next | - |
| 8.2 | Serial Number / IMEI Tracking at Checkout for Electronics & Appliances | ⚪ Next | - |
| 8.3 | Product Variants Matrix (Size / Color) for Apparel | ⚪ Next | - |

---

## 📝 Activity Log & Progress Notes

### [2026-09-23] - General Retail Live Product Search Hub in Keyboard Shortcuts Area
- **Retail Product Search & Quick Catalog Hub** (`RetailProductSearchHub.tsx`):
  - Created dedicated retail search hub occupying the keyboard shortcuts area below `TerminalHeader` in General Retail mode (mirroring Pharmacy & Healthcare layout).
  - Streams real-time search results as the cashier scans or types in the barcode input, displaying product name, SKU, price, stock level, category badge, and action buttons (`[✓ Select]` and `[+ Add]`).
  - Seamless keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`) with auto-scroll and selection.
  - Idle state provides dual-mode view: category filter tabs to browse available store inventory, and `QuickPickGrid` touch tiles.
  - Added header toggle button to switch between Product Search Directory and Keyboard Shortcuts Guide at any time, with auto-switch back to search upon typing.
- **Terminal Input Streamlining** (`FormFields.tsx`, `ItemAutoComplete.tsx`):
  - Set `disableDropdown={true}` on sales terminal barcode input to prevent floating popovers from occluding the form fields.
  - Dispatches `retail-search-nav` and `terminal-search-nav` events on arrow keys and Enter.

### [2026-09-21] - Stock Management & Item Autocomplete Dropdown Refinement
- **Decoupled Autocomplete Dropdown Suppression** (`ItemAutoComplete.tsx`):
  - Fixed hardcoded `disableDropdown || isPharmacy` that inadvertently silenced the autocomplete dropdown in `StockForm.tsx` (Manage Stocks) and `CogsForm.tsx` (Cashout) when in Pharmacy mode.
  - Restricted dropdown suppression strictly to components explicitly passing `disableDropdown={true}` (Sales Terminal barcode inputs).
- **Empty-Query Inventory Browsing & Chevron Toggle** (`ItemAutoComplete.tsx`, `StockForm.tsx`, `CogsForm.tsx`):
  - Displays top available inventory items when focusing or clicking an empty Item Name input, allowing cashiers to select items directly without typing.
  - Added a tactile `<ChevronDown />` button to toggle the dropdown list open and closed.
  - Added `relative z-30` stacking context and removed inner form `overflow-y-auto` to prevent popup clipping.

### [2026-09-21] - Phase 7 Grocery & Supermarket Vertical Pack Complete
- **Database Schema & Domain Types** (`20260921000000_add_grocery_fields.sql` & `lib/types/grocery.ts`):
  - Added `is_weighed`, `unit_of_measure`, `plu_code`, `tare_weight`, `pack_barcode`, `pack_quantity`, `pack_selling_price`, and `is_perishable` columns to `public.items`.
  - Added indexes for fast PLU, pack barcode, and weighed item querying.
  - Defined TypeScript contracts for `ScaleBarcodeResult`, `TareOption`, and `ProduceItemPreset` with pre-seeded standard produce items (Bananas 4011, Avocado 4046, Tomatoes 4087, Onions 4082, Garlic 4608, etc.).
- **GS1 Scale Barcode Parser** (`lib/utils/scaleBarcode.ts`):
  - Created zero-dependency parser for supermarket price-embedded and weight-embedded barcodes (GS1 prefix `20` or `02`, 12/13 digits).
  - Automatically unpacks 5-digit PLU code and computes line total or fractional kilograms.
- **Zero-Latency Web Audio Scanner Feedback** (`lib/utils/scanSounds.ts`):
  - Synthesized cashier audio chimes via native Web Audio API (`playScanSuccess()` 1400Hz sine beep, `playScanError()` 220Hz double buzz, and `playWeightCaptured()` ascending chime) with zero external asset loading.
- **Weighing Scale & Produce PLU Keypad Modal** (`ScaleProduceModal.tsx`):
  - Interactive digital LED scale readout, simulated gross weight controls, tare deduction selector (No Tare, Plastic Bag 5g, Kraft Bag 15g, Deli Tub 25g).
  - Fast numeric PLU keypad (0–9, ⌫, Clear) and produce search catalog.
  - Live Net Weight and total computation: `Net Weight = Gross - Tare`.
  - Global `F4` shortcut and terminal buttons for 1-click access.
- **High-Speed Scanning & Multi-Pack Barcode Resolution** (`addToCart.ts`):
  - Automatically identifies GS1 scale barcodes, matches item by PLU, and computes line items with fractional weight.
  - Detects secondary `pack_barcode` (e.g. 6-pack or case barcode), sets unit price and pack quantity, and decrements bundled stock.
  - Multiplier shortcut parsing: supports `5*<barcode>` and `12x<barcode>` directly in the barcode input.
  - Distinct audio feedback triggers on every scan.
- **Cart & Item Display Enhancements** (`TerminalCart.tsx`, `SingleItemForm.tsx`, `item.api.ts`):
  - Quantity column formats weighed goods with 3 decimal places and unit (e.g. `1.250 kg`).
  - Added `Scale (kg)`, `Pack of N`, and `Fresh` badges on line items.
  - Added dedicated **Produce, Scale & Multi-Pack Configuration** section in Item Registration form.
- **Perishable Food Clearance Markdown** (`DiscountModal.tsx`):
  - Added 1-click `Fresh Markdown (20%)` and `Evening Clearance (50%)` discount chips for fresh produce, bakery, and deli goods.


### [2026-09-20] - Phase 6 Restaurant, Cafe & Dining Vertical Pack Complete
- **Core Domain Types & State Management** (`lib/types/restaurant.ts` & `app/restaurant/stores/useRestaurantStore.ts`):
  - Defined TypeScript contracts for `RestaurantTable`, `DiningSession`, `CourseType`, `ModifierGroup`, `ModifierOption`, `SelectedModifier`, `KitchenTicket`, and `KitchenTicketItem`.
  - Extended `CartItem` in `types.ts` with restaurant metadata: `modifiers`, `course`, `kitchenStatus`, and `notes`.
  - Created persistent Zustand store `useRestaurantStore` supporting floor plan tables, active table dining sessions, KDS ticket queue, and KOT sequence tracking (`#KOT-101`).
  - Pre-seeded starter tables across four zones: Main Dining (T-1 to T-8), Patio (P-1 to P-4), Bar Lounge (B-1 to B-4), and Takeout (TO-1).
- **Interactive Floor Plan & Table Management** (`TableSelectorModal.tsx` & `TerminalHeader.tsx`):
  - Created `TableSelectorModal.tsx` with zone filter tabs (`All`, `Main Dining`, `Patio`, `Bar`, `Takeout`) and live status counters (`Vacant`, `Occupied`, `Billing`, `Reserved`).
  - Table cards display seating capacity, party size, elapsed dining timer (`35m ago`), active check total, server name, and status switcher.
  - Integrated active table indicator into `TerminalHeader.tsx` (`🍽️ Table: T-4 (Dine-In • 4 Guests • Occupied)`) with 1-click modal opener.
  - Connected POS terminal cart to auto-sync with active table sessions, ensuring cashiers can switch tables without losing cart items.
- **Dedicated Kitchen Display System (KDS)** (`app/kitchen/page.tsx` & `Navigation.tsx`):
  - Built full-screen live kitchen order dispatcher at `/kitchen` with real-time clock, audio alert toggle, and station filters (`All Stations`, `Kitchen / Grill`, `Bar`).
  - Implemented color-coded urgency tracking: Green (< 10 mins), Amber (10-20 mins), and Red (> 20 mins critical alert).
  - Added interactive items checklist with strike-through completion, ticket bump progression (`Pending` $\rightarrow$ `Preparing` $\rightarrow$ `Ready` $\rightarrow$ `Bump / Complete`), and 80mm thermal kitchen slip printing.
  - Added "Kitchen KDS" direct link with `ChefHat` icon into the main app `Navigation.tsx`.
- **"Send to Kitchen" (KOT) & Kitchen Slip Modal** (`KitchenTicketModal.tsx`, `ActionButtons.tsx`, `TerminalCart.tsx`):
  - Added **"Send Kitchen"** button directly to `TerminalCart` footer and `ActionButtons` grid.
  - Dispatches orders to KDS without collecting immediate payment, marking line items as `[Sent to Kitchen]`.
  - Created `KitchenTicketModal.tsx` with high-contrast 80mm thermal ticket preview and direct browser printing.
- **Item Customization & Cooking Modifiers Modal** (`ModifierModal.tsx`):
  - Customization dialog supporting:
    - Cooking Doneness: `Rare`, `Medium Rare`, `Medium`, `Medium Well`, `Well Done`.
    - Beverage Preferences: Sweetness (0% to 100%) and Ice Level (No Ice to Extra Ice).
    - Upgrades & Add-ons: Extra Cheese (+₱30), Crispy Bacon (+₱50), Fried Egg (+₱25), Mushroom Gravy (+₱35), Side Salad (+₱60), Extra Rice (+₱25), Oat Milk (+₱30), Extra Espresso (+₱40).
    - Course sequencing (`Beverage`, `Appetizer`, `Main`, `Dessert`, `Side`).
    - Freeform special prep notes & allergy instructions.
  - Dynamic unit price recalculation and modifier tags in `TerminalCart`.
- **Split Bill & Check Separation Engine** (`SplitCheckModal.tsx`):
  - **Split Equally (By Headcount)**: Divides total bill evenly across 2 to 6+ diners, showing per-person share with 1-click tender buttons.
  - **Split by Items (Separate Checks)**: Multi-column check segregation allowing items to be moved between Check 1, Check 2, etc., with independent subtotals and separate payments.
- **Touch-First Restaurant Dining Terminal Overhaul** (`RestaurantDiningLayout.tsx`, `RestaurantDiningHeader.tsx`, `RestaurantMenuCatalog.tsx`, `RestaurantGuestCheck.tsx`, `DesktopSalesTerminal.tsx`):
  - **Dining Control Header Bar**: Quick-switch active table pill with status badge, order mode switcher (`Dine-In`, `Takeout`, `Bar Tab`, `Delivery`), interactive guest count adjuster (`[-] 4 Pax [+]`), food & beverage search bar, live KDS status pill (`3 Active Orders`), and view switcher (`Menu Grid` vs `Floor Plan`).
  - **Touch-Friendly Visual Menu Catalog**: Responsive dish and beverage cards with high-contrast prices, category filtering tabs (`All`, `Appetizers`, `Mains`, `Beverages`, etc.), and quick modifier trigger (`Customize`).
  - **Course Sequencing Selector Bar**: Dedicated touch buttons for assigning dishes to courses (`Beverages 🍹`, `Appetizers 🥗`, `Main Courses 🥩`, `Desserts 🍰`, `Side Dishes 🍟`).
  - **Embedded Floor Plan View**: Toggle between menu grid and visual floor map right inside the catalog pane for 1-click table transfers and visual status inspections.
  - **Professional Course-Grouped Guest Check**: Grouped table bill segregated by dining courses, line item quantity adjusters, selected modifier pills, prep notes, kitchen transmission indicators (`Unsent` vs `Sent`), 10% Philippine dining service charge toggle, order discount trigger, and high-impact action buttons (`Send KOT`, `Print Bill`, `Split Check`, `Pay Bill`).
  - **Cross-Table Cart Isolation & Seamless Settle Flow**: Protected against cross-table cart contamination with active table tracking ref, auto-syncing table bills to Zustand store, and directly firing payment popup with service charge calculation upon checkout.
  - **Category ID to Human-Readable Name Resolution**: Integrated `useCategories` lookup dictionary in `RestaurantMenuCatalog.tsx` to automatically translate internal UUID `category_id` keys into clean, human-friendly category names on both filter tabs and dish card badges.
  - **Automatic Fullscreen on Sidebar Inactivity**: Added idle watcher in `useViewStore.ts` and `MainWindow.tsx` that automatically expands the terminal into fullscreen mode after a configurable period (default 2 minutes) of not accessing the sidebar navigation. Includes interaction reset listeners, exit button delay protection, floating entry toast, and duration settings in `PosLayoutSettings.tsx`.
- **Type Check Verification**:
  - Verified `npm run type-check` (`tsc --noEmit`) passes with exit code 0 (zero errors).

### [2026-09-20] - Phase 5 Pharmacy & Healthcare Vertical Pack Complete
- **Database Migration** (`supabase/migrations/20260920010000_add_pharmacy_fields_and_item_batches.sql`):
  - Added `generic_name`, `dosage`, `formulation`, and `is_rx` columns to `public.items`.
  - Created `public.item_batches` table for FEFO (First-Expired, First-Out) batch management with store RLS policies and compound indexing.
  - Created `public.prescriptions_log` table for FDA / PDEA compliance audit logging (Doctor PRC, patient, date, dispensed items).
- **Domain Models & Resilient API**:
  - Extended `itemSchema` and `Item` in `itemTypes.ts` with generic molecule, dosage, formulation, and Rx flag.
  - Implemented resilient fallback retry in `item.api.ts` so retail items can always be registered smoothly even during migration rollout.
  - Built `batch.api.ts` with FEFO batch ordering and status calculations (`expired`, `critical`, `warning`, `good`).
  - Built `app/actions/prescription.ts` server action for logging physician PRC details during dispensing.
- **Drug Formulation & Regulatory Item Registration** (`SingleItemForm.tsx`):
  - Dynamic **"💊 Drug Formulation & Regulatory Info"** card shown when store is in Pharmacy mode or modules are active.
  - Form fields: Generic molecule name (RA 6675 Generics Act), Dosage/Strength, Dosage Form dropdown (`Tablet`, `Capsule`, `Syrup`, `Suspension`, etc.), Prescription Required (Rx) toggle, Initial Lot # & Expiration date.
- **POS Terminal Dual Search** (`ItemAutoComplete.tsx`):
  - Pharmacists can now search by either **Brand Name** (e.g. `Biogesic`) or **Generic Molecule** (e.g. `Paracetamol 500mg`) or SKU.
  - Suggestion items show brand title, generic molecule subtitle, stock count, and high-visibility red `[Rx]` badge.
- **Cart FEFO & Rx Badges** (`TerminalCart.tsx` & `addToCart.ts`):
  - Line items display generic name subtitle, red `[Rx]` compliance badge, and `Lot #` with expiry date.
  - Added quick `[⚡ Charge (F2)]` button right in the cart footer beside subtotal.
- **Prescription (Rx) Validation on Checkout** (`RxValidationModal.tsx` & `DesktopSalesTerminal.tsx`):
  - Automatically intercepts checkout if any cart item is flagged `is_rx: true`.
  - Captures mandatory compliance data: Prescribing Physician Name, PRC License No., Patient Name, Age, and optional PTR/S2.
  - Automatically records transaction in `prescriptions_log` and transitions directly to Payment.
- **PostgREST Query Resiliency & Error Fix** (`inventory.api.ts`):
  - Fixed `Inventory Fetch Error: {}` by sanitizing search terms to remove `,` and `()` that broke PostgREST `.or(...)` filter trees.
  - Added graceful empty result returns and `description.ilike` matching.
- **Branded vs Generic Medicine Classification** (`itemTypes.ts`, `SingleItemForm.tsx`, `pharmacyMeta.ts`):
  - Added `brandType: 'branded' | 'generic'` with segmented toggle in Item Registration and badges in POS search.
- **Pharmacy Medication Display Header** (`ProductDisplay.tsx`):
  - Redesigned barcode search info display to show Brand Name, Active Molecule, Dosage, Formulation, Rx/OTC badges, Stock, and Batch/Expiry.
- **Philippine Generics Act (RA 6675) Equivalents Hub** (`PharmacyEquivalentsHub.tsx` & `DesktopSalesTerminal.tsx`):
  - Replaced the inline shortcuts guide in desktop sales terminal when in Pharmacy Mode with an interactive Generic Equivalents Hub.
  - Features: Automatic active molecule matching, cheaper generic alternative sorting with savings calculations, 1-click substitute, idle common molecule chips, and toggle back to shortcuts guide.
- **Inventory Item Registration & Stocks Monitor Table Transformation** (`ItemTable.tsx`, `ItemTableRow.tsx`, `TableToolbar.tsx`, `StocksDataGrid.tsx`):
  - Converted static tables into mode-adaptive data grids responding dynamically to the store's business mode.
  - In Pharmacy Mode:
    - Added dedicated **"Generic Molecule & Strength"** sortable column displaying active chemical molecule, dosage (e.g. `500mg`), and formulation (e.g. `Tablet`).
    - Added **`[💊 Generic]`** (emerald) vs **`[🏷️ Branded]`** (blue) visual pill badges and **`[Rx Required]`** compliance tags right under the medicine name.
    - Added **Lot # and Expiry Date** display in details column with clean description stripped of embedded technical tags.
    - Enabled inline editing of generic molecule, dosage, and brand type directly inside the table row.
    - Customized Table Toolbar: Search placeholder adjusts to *"Search brand, generic molecule, dosage, or SKU..."* and Add button switches to `"+ Add Medicine"`.
    - Enhanced `StocksDataGrid.tsx` in Stocks Monitor tab to render medicine thumbnails, branded/generic badges, Rx tags, and molecule subtitles.
- **Terminal Search & Free Item Modal Dosage/Form Display & Matching** (`ItemAutoComplete.tsx`, `FreeItemModal.tsx`):
  - Added dedicated high-contrast badges for **Dosage** (e.g. `500mg`, amber badge) and **Formulation** (e.g. `Tablet`, `Syrup`, purple badge) in item search dropdowns.
  - Added formulation search matching (`formulationMatch`) so cashiers can type forms (e.g. "syrup", "suspension", "drops", "tablet") directly to filter medicines.
  - Updated `FreeItemModal.tsx` to display branded/generic pills, Rx tags, generic molecule name, dosage, and form.
- **Pharmacy Mode List-Based Item Search & Inline Selector** (`ItemAutoComplete.tsx`, `FormFields.tsx`, `PharmacyEquivalentsHub.tsx`, `DesktopSalesTerminal.tsx`):
  - Completely suppressed the floating popover dropdown attached to the barcode input when in Pharmacy Mode (`disableDropdown={isPharmacy}`).
  - Transformed `PharmacyEquivalentsHub.tsx` into a real-time Search Results & Equivalents directory:
    - Real-time matching across Brand Name, Generic Molecule, Dosage, Formulation, and SKU.
    - Spacious list of matching medicines with brand names, molecules, dosages, forms, prices, and stock indicators.
    - Added explicit **`[✓ Select]`** button (populates barcode, updates Product Display, focuses quantity) and **`[+ Add]`** 1-click add-to-cart button.
    - Category filter tabs (`All`, `💊 Generic`, `🏷️ Branded`, `Rx Only`).
    - Full keyboard navigation (`ArrowDown` / `ArrowUp` to highlight, `Enter` to select).
    - Preserved RA 6675 Generic Equivalents when an item is selected, with 1-click `[Switch]` substitution.
  - Enabled the search list in tablet mode as well as desktop mode.
- **Universal Dosage Display in Search Results & Inventory Tables** (`ItemTable.tsx`, `ItemTableRow.tsx`, `useItemRegStore.ts`, `useItemTable.ts`, `StocksDataGrid.tsx`, `pharmacyMeta.ts`, `PharmacyEquivalentsHub.tsx`):
  - Added dedicated **"Dosage"** column to Item Registration table in Pharmacy mode with dedicated amber pill badge and inline editing.
  - Added `dosage` to `SortKey` and enabled sorting across direct database fields and extracted metadata.
  - Enhanced `extractPharmacyMeta` with expanded regex to capture diverse dosage units (`500mg`, `500 mg`, `250mg/5ml`, `125mg / 5ml`, `1000 IU`, `0.5%`, `10mg/ml`, `50mcg`, `1g`) from both item name and description.
  - Guaranteed dosage badge display in all terminal search result rows, equivalent alternative cards, and idle preview lists.
  - Added dosage badge to Stocks Data Grid in the Stocks Monitor tab.
- Verified TypeScript compilation: `npm run type-check` (`tsc --noEmit`) exited code 0 (Zero errors).

### [2026-09-20] - Phase 4 Terminal Integration & Quick Wins
- **Fast Cash Tender**: Added dynamic quick bills (`₱100`, `₱200`, `₱500`, `₱1,000`, `Exact Cash`) to `PaymentPopup.tsx` powered by `modules.fast_cash_tender`.
- **Senior / PWD Statutory 20% Discount**: Integrated statutory discount preset and quick chips in `DiscountModal.tsx` enabled when `modules.statutory_sc_pwd` is active.
- **Terminal Header Live Mode**: Updated `CashierInfo.tsx` to render the store's active business vertical badge and icon alongside cashier credentials.
- Verified compilation with `npx tsc --noEmit` (0 errors).

### [2026-09-20] - Phase 3 Onboarding Wizard Complete
- Implemented 2-step onboarding wizard for store owners (`app/onboarding/components/OnboardingForm.tsx`):
  - Step 1: User details and Store branding.
  - Step 2: Visual Industry Mode selector with responsive grid cards.
  - Automatic module presets saving on store onboarding completion.
  - Added `seedIndustryCategories.ts` server action to automatically seed starter product categories tailored to the merchant's business vertical.
  - Responsive container transition (`max-w-xl`) in `app/onboarding/page.tsx`.
- Type check verified with `npx tsc --noEmit` (0 errors).

### [2026-09-20] - Phase 2 Settings Manager Complete
- Created `BusinessModeSection.tsx` in `app/settings/components/store/`.
  - Mode cards for 7 verticals with descriptions, feature highlights, and icons.
  - Confirmation modal for safe switching with reassuring data integrity messaging.
  - 11 modular feature toggles grouped by vertical (Health, Grocery, Dining, Enterprise).
  - Integrated into `StoreTab.tsx` with role permissions check (`can_manage_store`).
- Type check verified with `npx tsc --noEmit` (0 errors).

### [2026-09-20] - Phase 1 Foundation Complete
- Completed deep-dive research into 5 major business verticals (Pharmacy, Grocery, Restaurants, Malls, Services).
- Created detailed research report: `universal_pos_business_modes_research.md`.
- Formulated the **"Extensible Core + Modular Vertical Packs"** architecture.
- Drafted the step-by-step implementation plan.
- Initialized `PROGRESS.md` tracker.
- **Phase 1 Execution**:
  - Implemented `lib/types/businessMode.ts` with business modes, module flags, and industry presets.
  - Created migration `supabase/migrations/20260920000000_add_business_modes_and_modules.sql`.
  - Updated `app/actions/store.ts` (`getStoreInfo`, `updateStoreInfo`, `updateStoreBusinessMode`).
  - Implemented `app/hooks/useBusinessMode.ts` for unified client-side state and caching.
  - Verified with `npx tsc --noEmit` (0 errors).

---

## 📌 Legend
- 🟢 **Completed**: Tested, verified, and merged.
- 🟡 **In Progress**: Currently under active development.
- ⏳ **Pending Review**: Waiting for user confirmation or review.
- ⚪ **Not Started**: Scheduled for subsequent steps.
