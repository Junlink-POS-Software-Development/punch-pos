import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { Item } from '@/app/inventory/components/item-registration/utils/itemTypes';

export interface QuickPickItem {
  id: string;
  item_id: string;
  label: string;
  color: string;
  image_url?: string;
  position: number;
  item?: Item; // Joined item details
}

const fetchQuickPickItems = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('quick_pick_items')
    .select(`
      *,
      item:items (
        id,
        item_name,
        sku,
        sales_price,
        description,
        category_id,
        image_url
      )
    `)
    .order('position', { ascending: true });

  if (error) throw error;

  return data.map((qpi: any) => ({
    ...qpi,
    item: qpi.item ? {
       id: qpi.item.id,
       itemName: qpi.item.item_name,
       sku: qpi.item.sku,
       salesPrice: qpi.item.sales_price,
       description: qpi.item.description,
       category: qpi.item.category_id,
       imageUrl: qpi.item.image_url
    } : undefined,
    // Fallback: if quick_pick_items doesn't have an image_url, use the inventory item's image
    image_url: qpi.image_url || qpi.item?.image_url 
  }));
};

export const useQuickPickItems = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: quickPickItems = [], isLoading, error } = useQuery({
    queryKey: ['quick-pick-items'],
    queryFn: fetchQuickPickItems,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const saveQuickPickItems = async (items: Omit<QuickPickItem, 'id'>[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: storeData } = await supabase
        .from('users')
        .select('store_id')
        .eq('user_id', user.id)
        .single();
        
      const storeId = storeData?.store_id;
      if (!storeId) throw new Error("Store not found for user");

      const { error: deleteError } = await supabase
        .from('quick_pick_items')
        .delete()
        .eq('store_id', storeId);

      if (deleteError) throw deleteError;

      const itemsToInsert = items.map((item, index) => ({
        item_id: item.item_id,
        store_id: storeId,
        label: item.label,
        color: item.color,
        image_url: item.image_url,
        position: index
      }));

      if (itemsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('quick_pick_items')
          .insert(itemsToInsert);

        if (insertError) throw insertError;
      }

      // Invalidate query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['quick-pick-items'] });
    } catch (err: any) {
      console.error("Error saving quick pick items:", err);
      throw err;
    }
  };

  return {
    quickPickItems,
    isLoading,
    error: error ? (error as Error).message : null,
    saveQuickPickItems,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['quick-pick-items'] })
  };
};
