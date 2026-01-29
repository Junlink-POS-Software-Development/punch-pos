import { useSubscription } from "@/app/hooks/useSubscription";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  History,
  Loader2,
} from "lucide-react";
import dayjs from "dayjs";

export default function SubscriptionSettings() {
  const { subscription, payments, loading, subscribe } = useSubscription();

  const handleSubscribe = async () => {
    // Xendit handles the UI, so we just need a simple confirmation or direct call
    const confirmed = window.confirm(
      "You will be redirected to Xendit to pay ₱500.00 via GCash/Card. Continue?"
    );
    if (confirmed) {
      await subscribe();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Check logic based on new Schema
  const now = new Date();
  const endDateObj = subscription?.end_date
    ? new Date(subscription.end_date)
    : null;
  const isActive =
    subscription?.status === "PAID" && endDateObj && endDateObj > now;

  const formattedEndDate = subscription?.end_date
    ? dayjs(subscription.end_date).format("MMM D, YYYY")
    : "-";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6 pb-6 border-slate-800 border-b">
        <div className="flex justify-center items-center bg-cyan-500/10 rounded-lg w-10 h-10 text-cyan-400">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-lg">
            Subscription Plan
          </h2>
          <p className="text-slate-400 text-sm">
            Manage your store&apos;s billing and payments
          </p>
        </div>
      </div>

      <div className="gap-6 grid md:grid-cols-2">
        {/* Status Card */}
        <div
          className={`p-6 rounded-xl border ${
            isActive
              ? "bg-emerald-500/10 border-emerald-500/50"
              : "bg-slate-800/50 border-slate-700"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-sm">Current Status</p>
              <h3
                className={`text-2xl font-bold ${
                  isActive ? "text-emerald-400" : "text-slate-200"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </h3>
            </div>
            {isActive ? (
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-slate-400" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Plan Cost</span>
              <span className="font-medium text-white">₱500.00 / month</span>
            </div>
            {isActive && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Next Billing</span>
                <span className="font-medium text-white">
                  {formattedEndDate}
                </span>
              </div>
            )}
          </div>

          {!isActive && (
            <button
              onClick={handleSubscribe}
              className="bg-cyan-500 hover:bg-cyan-600 mt-6 px-4 py-2 rounded-lg w-full font-medium text-white transition-colors"
            >
              Subscribe Now (₱500.00)
            </button>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-slate-800/30 p-6 border border-slate-700 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="font-medium text-white">Payment History</h3>
          </div>

          <div className="space-y-3 pr-2 max-h-[200px] overflow-y-auto custom-scrollbar">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center bg-slate-900/50 p-3 border border-slate-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-white text-sm">
                      Subscription Payment
                    </p>
                    <p className="text-slate-500 text-xs">
                      {dayjs(payment.created_at).format("MMM D, YYYY h:mm A")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-emerald-400 text-sm">
                      ₱{Number(payment.amount).toFixed(2)}
                    </p>
                    <p className="text-slate-500 text-xs uppercase">
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-slate-500 text-sm text-center">
                No payment history found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
