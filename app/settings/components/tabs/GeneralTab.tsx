
import React from "react";
import CurrencySelector from "../CurrencySelector";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "lucide-react";

export const GeneralTab = () => {
    const { user } = useAuthStore();
    
    // Mock handler for profile picture upload
    const handleUpload = () => {
        alert("Profile picture upload feature coming soon!");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">General Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your personal and business preferences.</p>
            </div>

            {/* Profile Picture Section */}
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

            {/* Business Info Section */}
            <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Business Name</label>
                        <input 
                            type="text" 
                            defaultValue="JunLink POS"
                            className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50"
                        />
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Email Address</label>
                        <input 
                            type="email" 
                            defaultValue={user?.email || "admin@junlink.com"}
                            disabled
                            className="w-full bg-muted/40 border border-border/30 rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed italic"
                        />
                    </div>
                 </div>

                 <div className="space-y-2.5">
                     <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">System Timezone</label>
                     <div className="relative">
                        <select className="w-full appearance-none bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer">
                            <option>Asia/Manila (GMT+8)</option>
                            <option>America/New_York (GMT-5)</option>
                            <option>Europe/London (GMT+0)</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                     </div>
                 </div>

                 <div className="pt-4 border-t border-border/30">
                     <CurrencySelector />
                 </div>
            </div>

            <div className="flex justify-end pt-4">
                <button className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20">
                    Save All Changes
                </button>
            </div>
        </div>
    );
};
