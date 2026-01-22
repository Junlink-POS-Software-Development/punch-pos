"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle, AlertCircle } from "lucide-react";

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mockAlerts = [
    { id: 1, title: "New Order Received", time: "2 min ago", type: "success" },
    {
      id: 2,
      title: "Inventory Low: Keycaps",
      time: "1 hour ago",
      type: "alert",
    },
    {
      id: 3,
      title: "Server Update Completed",
      time: "3 hours ago",
      type: "info",
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-slate-800/60 p-2 rounded-xl text-slate-400 hover:text-cyan-400 transition-all active:scale-95"
      >
        <Bell className="w-5 h-5" />
        <span className="top-2 right-2 absolute bg-red-500 border-2 border-[#0B1120] rounded-full w-2 h-2"></span>
      </button>

      {isOpen && (
        <div className="right-0 z-50 absolute bg-[#0f172a]/95 backdrop-blur-xl shadow-2xl mt-4 border border-slate-700/50 rounded-2xl w-80 overflow-hidden origin-top-right animate-in duration-200 fade-in zoom-in-95 slide-in-from-top-2">
          <div className="flex justify-between items-center bg-slate-800/40 px-4 py-3 border-slate-700/50 border-b">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            <button className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors">
              Mark all read
            </button>
          </div>
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex gap-3 hover:bg-white/5 px-4 py-3 border-slate-800/50 border-b last:border-0 transition-colors cursor-pointer group"
              >
                <div className="mt-1 shrink-0">
                  {alert.type === "success" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : alert.type === "alert" ? (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Bell className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-200 text-sm group-hover:text-white transition-colors">
                    {alert.title}
                  </p>
                  <p className="mt-0.5 text-slate-500 text-xs">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-slate-800/20 p-2 border-slate-700/50 border-t text-center">
            <button className="w-full py-1.5 text-slate-400 hover:text-white text-xs transition-colors">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
