"use server";

import { createClient } from "@/utils/supabase/server";
import { BusinessMode, BUSINESS_MODE_PRESETS } from "@/lib/types/businessMode";

/**
 * Seeds starter product categories based on the chosen business mode for the current user's store.
 * Automatically skips categories that already exist.
 */
export async function seedIndustryCategories(businessMode: BusinessMode) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("store_id")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData?.store_id) {
      return { success: false, error: "Store not found for user" };
    }

    const preset = BUSINESS_MODE_PRESETS[businessMode];
    if (!preset || !preset.starterCategories || preset.starterCategories.length === 0) {
      return { success: true, count: 0 };
    }

    // Check existing categories to avoid duplicates
    const { data: existing, error: fetchError } = await supabase
      .from("product_category")
      .select("category")
      .eq("store_id", userData.store_id);

    if (fetchError) {
      console.warn("Could not query existing categories:", fetchError.message);
    }

    const existingNames = new Set(
      (existing || []).map((c) => c.category.toLowerCase().trim())
    );

    const categoriesToInsert = preset.starterCategories
      .filter((cat) => !existingNames.has(cat.toLowerCase().trim()))
      .map((cat) => ({
        store_id: userData.store_id,
        category: cat,
      }));

    if (categoriesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("product_category")
        .insert(categoriesToInsert);

      if (insertError) {
        console.error("Failed to seed categories:", insertError);
        return { success: false, error: insertError.message };
      }
    }

    return { success: true, count: categoriesToInsert.length };
  } catch (error: any) {
    console.error("Error in seedIndustryCategories:", error);
    return { success: false, error: error.message };
  }
}
