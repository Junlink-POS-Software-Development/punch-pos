import VoucherSettings from "./components/VoucherSettings";
import CurrencySelector from "./components/CurrencySelector";
import { Settings, CreditCard } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 font-bold text-3xl text-white">
          <Settings className="w-8 h-8 text-cyan-400" />
          Settings
        </h1>
        <p className="mt-2 text-slate-400">Manage your application preferences and configurations.</p>
      </div>
      
      <div className="space-y-8">
        {/* General Settings Section */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
            <div className="flex justify-center items-center bg-cyan-500/10 rounded-lg w-10 h-10 text-cyan-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-white">General Preferences</h2>
              <p className="text-slate-400 text-sm">Customize your viewing experience</p>
            </div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <CurrencySelector />
          </div>
        </section>

        {/* Voucher Settings Section - Assuming VoucherSettings needs styling updates too, but keeping it wrapped for now */}
        <section className="bg-slate-900/50 p-8 border border-slate-800 rounded-2xl glass-effect">
           <VoucherSettings />
        </section>
      </div>
    </div>
  );
}
