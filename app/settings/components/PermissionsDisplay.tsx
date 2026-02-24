"use client";

import React from "react";
import {
  usePermissions,
  PERMISSION_LABELS,
  PERMISSION_DESCRIPTIONS,
  type UserPermissions,
} from "@/app/hooks/usePermissions";
import {
  ShieldCheck,
  ShieldX,
  Shield,
  CalendarClock,
  DollarSign,
  Pencil,
  Trash2,
  Package,
  Tags,
  Users,
  Receipt,
} from "lucide-react";

/** Map each permission key to a matching icon */
const PERMISSION_ICONS: Record<keyof UserPermissions, React.ReactNode> = {
  can_backdate: <CalendarClock className="w-4 h-4" />,
  can_edit_price: <DollarSign className="w-4 h-4" />,
  can_edit_transaction: <Pencil className="w-4 h-4" />,
  can_delete_transaction: <Trash2 className="w-4 h-4" />,
  can_manage_items: <Package className="w-4 h-4" />,
  can_manage_categories: <Tags className="w-4 h-4" />,
  can_manage_customers: <Users className="w-4 h-4" />,
  can_manage_expenses: <Receipt className="w-4 h-4" />,
};

const PermissionsDisplay = () => {
  const permissions = usePermissions();
  const keys = Object.keys(permissions) as (keyof UserPermissions)[];

  const grantedCount = keys.filter((k) => permissions[k]).length;

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Your Permissions
            </h3>
            <p className="text-sm text-muted-foreground">
              {grantedCount} of {keys.length} permissions active
            </p>
          </div>
        </div>

        {/* Summary Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            grantedCount === keys.length
              ? "bg-emerald-500/15 text-emerald-500"
              : grantedCount === 0
                ? "bg-muted text-muted-foreground"
                : "bg-amber-500/15 text-amber-500"
          }`}
        >
          {grantedCount === keys.length
            ? "Full Access"
            : grantedCount === 0
              ? "Restricted"
              : "Limited Access"}
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {keys.map((key) => {
          const granted = permissions[key];
          return (
            <div
              key={key}
              title={PERMISSION_DESCRIPTIONS[key]}
              className={`
                flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200
                ${
                  granted
                    ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                    : "bg-muted/30 border-border/50 hover:border-border opacity-60 hover:opacity-80"
                }
              `}
            >
              {/* Icon */}
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  granted
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {PERMISSION_ICONS[key]}
              </div>

              {/* Label & Description */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    granted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {PERMISSION_LABELS[key]}
                </p>
                <p className="text-[11px] text-muted-foreground/70 truncate">
                  {PERMISSION_DESCRIPTIONS[key]}
                </p>
              </div>

              {/* Status Icon */}
              <div className="shrink-0">
                {granted ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ShieldX className="w-5 h-5 text-muted-foreground/40" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <p className="text-xs text-muted-foreground/60 text-center pt-1">
        Permissions are managed by your administrator and synced from your
        session.
      </p>
    </div>
  );
};

export default PermissionsDisplay;
