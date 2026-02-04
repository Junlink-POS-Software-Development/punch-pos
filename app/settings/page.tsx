"use client";

import VoucherSettings from "./components/VoucherSettings";
import SubscriptionSettings from "./components/SubscriptionSettings";
import CurrencySelector from "./components/CurrencySelector";
import LowStockSettings from "./components/LowStockSettings";
import PriceEditingSettings from "./components/PriceEditingSettings";
import AccountSettings from "./components/AccountSettings";
import { Settings, CreditCard, ArrowLeft, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import BackdateSettings from "./backdating/BackdatingSettings";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

function SettingsContent() {
  const searchParams = useSearchParams();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (searchParams.get("reason") === "store_deleted") {
      setShowBanner(true);
    }
  }, [searchParams]);

  return (
    <div className="p-8 min-h-screen pt-2">
      <div className="mb-0 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="mt-2 text-slate-400">
            Manage your application preferences and configurations.
          </p>
        </div>
      </div>

      {showBanner && (
        <div className="mt-8 p-6 bg-red-400/10 border border-red-400/20 rounded-2xl flex items-center justify-between glass-effect animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 text-red-400">
            <div className="bg-red-400/20 p-2 rounded-xl">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Store Access Removed</h3>
              <p className="text-sm text-slate-300">
                The store you were previously accessing has been closed by an administrator. You have been redirected to settings to join a different store or manage your account.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowBanner(false)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="space-y-8 mt-10">
        {/* Account Settings Section - Wrapped to match others */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
          <AccountSettings />
        </section>

        {/* General Settings Section - Simplified structure to match others */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
          <div className="flex items-center gap-3 mb-6 pb-6 border-slate-800 border-b">
            <div className="flex justify-center items-center bg-cyan-500/10 rounded-lg w-10 h-10 text-cyan-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg">
                General Preferences
              </h2>
              <p className="text-slate-400 text-sm">
                Customize your viewing experience
              </p>
            </div>
          </div>

          <div className="gap-8 grid md:grid-cols-2">
            <CurrencySelector />
          </div>
        </section>

        {/* Backdating Settings Section */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
          <BackdateSettings />
        </section>

        {/* Subscription Settings Section */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
          <SubscriptionSettings />
        </section>

        {/* Voucher Settings Section */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
          <VoucherSettings />
        </section>

        {/* Low Stock Settings Section */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
          <LowStockSettings />
        </section>

        {/* Price Editing Settings Section */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
          <PriceEditingSettings />
        </section>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
