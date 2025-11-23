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
        className="relative hover:bg-white/10 p-2.5 rounded-xl text-slate-300 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="top-2.5 right-2.5 absolute bg-red-500 border-2 border-slate-900 rounded-full w-2 h-2"></span>
      </button>

      {isOpen && (
        <div className="right-0 z-50 absolute bg-[#0f172a] shadow-2xl mt-3 border border-slate-700 rounded-2xl w-80 overflow-hidden origin-top-right animate-in duration-100 fade-in zoom-in-95">
          <div className="flex justify-between items-center bg-slate-800/30 px-4 py-3 border-slate-700 border-b">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            <span className="text-cyan-400 text-xs hover:underline cursor-pointer">
              Mark all read
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex gap-3 hover:bg-white/5 px-4 py-3 border-slate-800/50 border-b transition-colors cursor-pointer"
              >
                <div className="mt-1">
                  {alert.type === "success" ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : alert.type === "alert" ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Bell className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div>
                  <p className="text-slate-200 text-sm">{alert.title}</p>
                  <p className="mt-0.5 text-slate-500 text-xs">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
