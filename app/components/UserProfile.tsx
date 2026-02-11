// components/UserProfile.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { User as UserIcon, Settings, LogOut, LogIn } from "lucide-react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

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
        className={`flex justify-center items-center rounded-full ring-2 ring-transparent hover:ring-cyan-500/50 w-9 h-9 transition-all active:scale-95 ${
          currentUser
            ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20"
            : "bg-slate-700"
        }`}
      >
        <UserIcon className="w-4 h-4 text-white" />
      </button>

      {isOpen && (
        <div className="right-0 z-50 absolute bg-[#0f172a]/95 backdrop-blur-xl shadow-2xl mt-4 border border-slate-700/50 rounded-2xl w-64 overflow-hidden origin-top-right animate-in duration-200 fade-in zoom-in-95 slide-in-from-top-2">
          <div className="bg-slate-800/40 p-4 border-slate-700/50 border-b">
            <p className="font-semibold text-white text-sm truncate">{displayName}</p>
            <p className="mt-0.5 text-slate-500 text-xs truncate">
              {displayEmail}
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center bg-cyan-500/10 px-2 py-0.5 border border-cyan-500/20 rounded-md font-bold text-[10px] text-cyan-400 uppercase tracking-wider">
                {displayRole}
              </span>
            </div>
          </div>
          <div className="p-1.5">
            {currentUser ? (
              <>
                <Link 
                  href="/settings?tab=account"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 hover:bg-white/5 px-3 py-2 rounded-xl w-full text-slate-300 hover:text-white text-sm transition-all group"
                >
                  <Settings className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" /> 
                  <span>Account Settings</span>
                </Link>
                <div className="my-1.5 border-slate-700/30 border-t mx-2"></div>
                <button
                  onClick={() => {
                    onSignOutClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 hover:bg-rose-500/10 px-3 py-2 rounded-xl w-full text-rose-400 text-sm transition-all group"
                >
                  <LogOut className="w-4 h-4 text-rose-400/70 group-hover:text-rose-400 transition-colors" /> 
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onSignInClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 hover:bg-emerald-500/10 px-3 py-2 rounded-xl w-full text-emerald-400 text-sm transition-all group"
              >
                <LogIn className="w-4 h-4 text-emerald-400/70 group-hover:text-emerald-400 transition-colors" /> 
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;