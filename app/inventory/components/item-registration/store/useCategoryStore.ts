// app/inventory/store/useCategoryStore.ts
import { create } from 'zustand';
import { 
  Category, 
  fetchCategories, 
  createCategory, 
  updateCategory as apiUpdate, 
  deleteCategory as apiDelete 
} from '../lib/categories.api';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  loadCategories: async () => {
    // Cache check: If we already have categories, don't refetch
    if (get().categories.length > 0) return;

    set({ isLoading: true, error: null });
    try {
      const data = await fetchCategories();
      set({ categories: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addCategory: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await createCategory(name);
      if (newCategory) {
        set((state) => ({ 
          categories: [...state.categories, newCategory],
          isLoading: false 
        }));
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateCategory: async (id: string, name: string) => {
    // We don't set global isLoading here to avoid flickering the whole list
    try {
      await apiUpdate(id, name);
      // Optimistic update in memory
      set((state) => ({
        categories: state.categories.map((c) => 
          c.id === id ? { ...c, category: name } : c
        )
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteCategory: async (id: string) => {
    try {
      await apiDelete(id);
      // Optimistic delete in memory
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id)
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  }
}));