import { User } from "@supabase/supabase-js";

interface CashierInfoProps {
  user: User | null;
  statusColor: string;
}

export const CashierInfo = ({ user, statusColor }: CashierInfoProps) => {
  return (
    <div className="flex flex-col">
      <span className="mb-1 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
        Current Cashier
      </span>
      <span
        className={`font-(family-name:--font-lexend) font-medium text-sm truncate ${statusColor}`}
      >
        {user
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
          : "Initializing..."}
      </span>
    </div>
  );
};
