// handlers/terminal/logout.ts
// (This is the content you provided, placed in the correct directory)

import { supabase } from "@/lib/supabaseClient";

/**
 * Handles the user log out process using Supabase.
 * @returns {Promise<boolean>} True if logout was successful, false otherwise.
 */
export const handleLogOut = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Supabase Log Out Error:", error.message);
      // In a real app, you might want to throw or return the error message
      return false;
    }

    console.log("Logged out successfully.");
    return true;
  } catch (err) {
    console.error("Unknown Log Out Error:", err);
    return false;
  }
};
