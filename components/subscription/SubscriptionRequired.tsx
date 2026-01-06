"use client";

import React from "react";
import { CreditCard, ShieldAlert, ArrowRight, LifeBuoy } from "lucide-react";
import Link from "next/link";

const SubscriptionRequired = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-blue-500" />
        </div>
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-white mb-4 font-lexend">
        Subscription Required
      </h1>
      
      <p className="text-zinc-400 max-w-md text-lg mb-10 leading-relaxed">
        To access this feature and continue using JunLink POS, you need an active subscription. 
        Choose a plan that fits your business needs.
      </p>

      <div className="grid gap-4 w-full max-w-sm">
        <Link 
          href="/settings" 
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
        >
          <CreditCard className="w-5 h-5" />
          Go to Subscription Settings
          <ArrowRight className="w-5 h-5" />
        </Link>
        
        <Link 
          href="mailto:support@junlink.com" 
          className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold py-4 px-6 rounded-xl transition-all active:scale-[0.98]"
        >
          <LifeBuoy className="w-5 h-5" />
          Contact Support
        </Link>
      </div>

      <div className="mt-12 pt-8 border-t border-zinc-800/50 w-full max-w-xs">
        <p className="text-zinc-500 text-sm">
          Already have a subscription? <br />
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-500 hover:underline font-medium"
          >
            Refresh page
          </button>
        </p>
      </div>
    </div>
  );
};

export default SubscriptionRequired;
