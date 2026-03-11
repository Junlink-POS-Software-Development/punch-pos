import { create } from 'zustand';

interface CustomerState {
  // Filter State
  selectedGroupId: string | "all" | "ungrouped";
  searchTerm: string;
  setSelectedGroupId: (id: string | "all" | "ungrouped") => void;
  setSearchTerm: (term: string) => void;

  // Modal State
  isGroupModalOpen: boolean;
  isCustomerModalOpen: boolean;
  isManageGroupsOpen: boolean;
  activeCustomerId: string | null;

  // Selection & View
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  viewMode: 'list' | 'detail';
  setViewMode: (mode: 'list' | 'detail') => void;

  // Actions
  openGroupModal: () => void;
  closeGroupModal: () => void;
  openCustomerModal: () => void;
  closeCustomerModal: () => void;
  openEditCustomer: (id: string) => void;
  setManageGroupsOpen: (open: boolean) => void;
  // Header Collapse state
  isHeaderCollapsed: boolean;
  setHeaderCollapsed: (collapsed: boolean) => void;
  // Hydration state
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  // Initialization
  hasHydrated: false,
  setHasHydrated: (state) => set({ hasHydrated: state }),

  // Header Collapse
  isHeaderCollapsed: false,
  setHeaderCollapsed: (collapsed) => set({ isHeaderCollapsed: collapsed }),

  selectedGroupId: "all",
  searchTerm: "",
  isGroupModalOpen: false,
  isCustomerModalOpen: false,
  isManageGroupsOpen: false,
  activeCustomerId: null,

  selectedCustomerId: null,
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),

  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode, isHeaderCollapsed: false }),

  setSelectedGroupId: (id) => set({ selectedGroupId: id, isHeaderCollapsed: false }),
  setSearchTerm: (term) => set({ searchTerm: term }),

  openGroupModal: () => set({ isGroupModalOpen: true }),
  closeGroupModal: () => set({ isGroupModalOpen: false }),

  openCustomerModal: () => set({ isCustomerModalOpen: true, activeCustomerId: null }),
  closeCustomerModal: () => set({ isCustomerModalOpen: false, activeCustomerId: null }),

  openEditCustomer: (id) => set({ isCustomerModalOpen: true, activeCustomerId: id }),
  setManageGroupsOpen: (open) => set({ isManageGroupsOpen: open }),
}));