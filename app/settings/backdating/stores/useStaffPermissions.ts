// src/hooks/useStaffPermissions.ts
import { useAuthStore } from "@/store/useAuthStore"; // Assuming you have this
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useStaffPermissions() {
  const { user } = useAuthStore();
  const supabase = createClient();

  const { data, isLoading } = useQuery({
    queryKey: ["permissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("staff_permissions")
        .select("can_backdate")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    canBackdate: data?.can_backdate ?? false,
    isLoading,
  };
}
