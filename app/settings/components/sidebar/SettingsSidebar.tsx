
import React from "react";
import { Settings, User, Server, FileText } from "lucide-react";

type TabId = "general" | "account" | "system" | "audit";

interface SettingsSidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const SettingsSidebar = ({ activeTab, setActiveTab }: SettingsSidebarProps) => {
  const menuItems = [
    { id: "general", label: "General", icon: Settings },
    { id: "account", label: "Account Settings", icon: User },
    { id: "system", label: "System Config", icon: Server },
    { id: "audit", label: "Audit Logs", icon: FileText },
  ] as const;

  return (
    <div className="w-full space-y-2">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id as TabId)}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
            ${
              activeTab === item.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }
          `}
        >
          <item.icon className="w-5 h-5" />
          <span className="font-medium text-sm">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
