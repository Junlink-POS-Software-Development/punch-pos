"use client";

import React from "react";
import { User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export function ProfilePictureSection() {
  const { user } = useAuthStore();

  // Mock handler for profile picture upload
  const handleUpload = () => {
    alert("Profile picture upload feature coming soon!");
  };

  return (
    <div className="bg-card/50 p-6 border border-border rounded-xl shadow-sm backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 overflow-hidden transition-all duration-300 group-hover:border-primary/50">
            {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
                <div className="flex flex-col items-center">
                    <User className="w-8 h-8 opacity-50 mb-1" />
                    <span className="text-xs font-bold uppercase tracking-tighter">{user?.email?.[0] || "A"}</span>
                </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={handleUpload}>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Update</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div>
              <h3 className="text-lg font-semibold text-foreground">Profile Picture</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Your profile picture will be visible to other members in the dashboard and transaction logs.
              </p>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <button 
                  onClick={handleUpload}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
              >
                  Upload New Avatar
              </button>
              <button className="px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:bg-muted/80 hover:text-foreground transition-all active:scale-95">
                  Remove
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
