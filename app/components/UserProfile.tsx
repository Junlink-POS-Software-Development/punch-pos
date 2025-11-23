// components/UserProfile.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { User as UserIcon, Settings, LogOut, LogIn } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface UserProfileProps {
  currentUser: User | null;
  onSignInClick: () => void;
  onSignOutClick: () => void;
}

const UserProfile = ({
  currentUser,
  onSignInClick,
  onSignOutClick,
}: UserProfileProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Use real user data or fallback
  const displayName = currentUser?.user_metadata?.first_name
    ? `${currentUser.user_metadata.first_name} ${currentUser.user_metadata.last_name}`
    : currentUser?.email || "Guest";

  const displayEmail = currentUser?.email || "No active session";
  const displayRole = currentUser ? "Authenticated" : "Visitor";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex justify-center items-center rounded-full hover:ring-2 hover:ring-cyan-500/50 w-10 h-10 transition-all ${
          currentUser
            ? "bg-gradient-to-br from-cyan-600 to-blue-700"
            : "bg-slate-700"
        }`}
      >
        <UserIcon className="w-5 h-5 text-slate-200" />
      </button>

      {isOpen && (
        <div className="right-0 z-50 absolute bg-[#0f172a] shadow-2xl mt-3 border border-slate-700 rounded-2xl w-64 overflow-hidden origin-top-right animate-in duration-100 fade-in zoom-in-95">
          <div className="bg-slate-800/30 p-5 border-slate-700 border-b">
            <p className="font-semibold text-white truncate">{displayName}</p>
            <p className="mt-1 text-slate-400 text-xs truncate">
              {displayEmail}
            </p>
            <span className="inline-block bg-cyan-500/20 mt-2 px-2 py-0.5 border border-cyan-500/30 rounded font-bold text-[10px] text-cyan-400 uppercase">
              {displayRole}
            </span>
          </div>
          <div className="space-y-1 p-2">
            {currentUser ? (
              <>
                <button className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg w-full text-slate-300 hover:text-white text-sm transition-colors">
                  <Settings className="w-4 h-4" /> Account Settings
                </button>
                <div className="my-1 border-slate-700/50 border-t"></div>
                <button
                  onClick={() => {
                    onSignOutClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 hover:bg-red-500/10 px-3 py-2 rounded-lg w-full text-red-400 text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onSignInClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 hover:bg-green-500/10 px-3 py-2 rounded-lg w-full text-green-400 text-sm transition-colors"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
