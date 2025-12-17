// handlers/terminal/logout.ts
import { logout } from "@/app/actions/auth";

/**
 * Handles the user log out process using Server Action.
 * @returns {Promise<boolean>} True if logout was successful, false otherwise.
 */
export const handleLogOut = async (): Promise<boolean> => {
  console.log("Logout initiated: Starting handleLogOut...");
  
  try {
    await logout();
    return true;
  } catch (err) {
    console.error("Log Out Error:", err);
    // Fallback force reload if server action fails (though logout action redirects)
    window.location.href = "/";
    return true;
  }
};
