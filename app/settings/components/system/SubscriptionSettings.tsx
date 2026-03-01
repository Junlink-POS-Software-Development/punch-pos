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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-2">
        <div className="flex items-center gap-4">
            <div className="flex justify-center items-center bg-primary/10 rounded-xl w-12 h-12 text-primary border border-primary/20 shadow-inner">
                <CreditCard className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                    Subscription Plan
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                    Manage your store&apos;s billing cycle and payment records.
                </p>
            </div>
        </div>
        {!isActive && (
            <button
                onClick={handleSubscribe}
                className="bg-primary hover:bg-primary/90 px-8 py-3 rounded-xl font-bold text-primary-foreground transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
            >
                Subscribe Now (₱500.00)
            </button>
        )}
      </div>

      <div className="gap-8 grid md:grid-cols-2">
        {/* Status Card */}
        <div
          className={`p-6 rounded-2xl border transition-all duration-300 ${
            isActive
              ? "bg-emerald-500/5 border-emerald-500/30 shadow-sm"
              : "bg-muted/20 border-border/50"
          }`}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1 mb-1">Current Status</p>
              <h3
                className={`text-3xl font-bold tracking-tighter ${
                  isActive ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                {isActive ? "ACTIVE" : "INACTIVE"}
              </h3>
            </div>
            {isActive ? (
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center border border-border/50">
                <AlertCircle className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-border/30">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Monthly Plan Cost</span>
              <span className="font-bold text-foreground">₱500.00</span>
            </div>
            {isActive && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Next Billing Cycle</span>
                <span className="font-bold text-foreground">
                  {formattedEndDate}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4 ml-1">
            <History className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Payment History</h3>
          </div>

          <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center bg-muted/30 p-4 border border-border/50 rounded-xl transition-all hover:border-primary/30 group"
                >
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-lg border border-border/30 group-hover:border-primary/20 transition-colors">
                        <CreditCard className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                     </div>
                     <div>
                        <p className="font-bold text-foreground text-sm tracking-tight leading-none mb-1">
                          Subscription Order
                        </p>
                        <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-tighter">
                          {dayjs(payment.created_at).format("MMM D, YYYY · h:mm A")}
                        </p>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-500 text-sm">
                      ₱{Number(payment.amount).toFixed(2)}
                    </p>
                    <p className={`text-[10px] font-black tracking-widest uppercase ${payment.status === 'PAID' ? 'text-emerald-500/70' : 'text-amber-500/70'}`}>
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-muted/10 border border-dashed border-border/50 rounded-xl">
                 <p className="text-muted-foreground text-xs font-medium italic">
                   No transactions recorded yet.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
