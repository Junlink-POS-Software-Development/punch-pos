import { User } from "@supabase/supabase-js";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";
import {
  Store,
  Pill,
  Apple,
  UtensilsCrossed,
  Building2,
  Scissors,
  SlidersHorizontal,
} from "lucide-react";

interface CashierInfoProps {
  user: User | null;
  statusColor: string;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Store,
  Pill,
  Apple,
  UtensilsCrossed,
  Building2,
  Scissors,
  SlidersHorizontal,
};

export const CashierInfo = ({ user, statusColor }: CashierInfoProps) => {
  const { currentPreset } = useBusinessMode();
  const Icon = ICONS[currentPreset?.iconName] || Store;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
          Current Cashier
        </span>
        {currentPreset && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold shrink-0">
            <Icon className="w-3 h-3" />
            <span className="truncate max-w-[110px]">{currentPreset.badge}</span>
          </span>
        )}
      </div>
      <span
        className={`font-(family-name:--font-lexend) font-medium text-sm truncate ${statusColor}`}
      >
        {user
          ? `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() || user.email || "Cashier"
          : "Initializing..."}
      </span>
    </div>
  );
};
