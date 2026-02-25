import React from "react";
import { useCustomerData } from "../../hooks/useCustomerData";
import { Calendar, User, FileText, Search } from "lucide-react";
import { DateColumnFilter } from "@/app/cashout/components/shared/DateColumnFilter";

export const GuestTransactionsTable = () => {
  const { guestTransactions, isLoading, startDate, endDate, handleDateChange } = useCustomerData();

  if (isLoading) {
    return (
      <div className="p-10 text-muted-foreground text-center">Loading records...</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter Toolbar - Always visible */}
      <div className="flex justify-between items-center bg-card/30 mb-4 p-4 border border-border rounded-lg">
        <DateColumnFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          align="start"
        />
        <div className="text-muted-foreground text-xs">
          {guestTransactions.length > 0 ? (
            <>Showing {guestTransactions.length} transaction{guestTransactions.length !== 1 ? 's' : ''}</>
          ) : (
            <>No transactions for selected date range</>
          )}
        </div>
      </div>

      {/* Empty State or Table */}
      {guestTransactions.length === 0 ? (
        <div className="flex flex-col flex-1 justify-center items-center bg-card/20 border-2 border-border/50 border-dashed rounded-xl">
          <div className="bg-accent mb-3 p-4 rounded-full">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <p className="font-medium text-muted-foreground text-lg">
            No Guest Transactions Found
          </p>
          <p className="text-muted-foreground/60 text-sm">
            Try adjusting the date filter above to view transactions from other dates.
          </p>
        </div>
      ) : (
        <div className="flex-1 bg-card shadow-xl border border-border rounded-xl overflow-hidden">
          <div className="h-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="top-0 z-10 sticky bg-background font-medium text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="bg-background px-6 py-4">Invoice #</th>
                  <th className="bg-background px-6 py-4">Customer Name</th>
                  <th className="bg-background px-6 py-4">Date & Time</th>
                  <th className="bg-background px-6 py-4 text-right">
                    Total Amount
                  </th>
                  <th className="bg-background px-6 py-4 text-center">Cashier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {guestTransactions.map((tx) => (
                  <tr
                    key={tx.invoice_no}
                    className="group hover:bg-accent/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-cyan-400">
                      {tx.invoice_no}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex justify-center items-center bg-amber-500/10 rounded-full w-8 h-8 text-amber-500 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <span>{tx.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="opacity-50 w-4 h-4 text-muted-foreground" />
                        <span className="whitespace-nowrap">
                          {new Date(tx.transaction_time).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-emerald-500/10 px-2 py-1 rounded font-mono font-medium text-emerald-400">
                        ₱
                        {Number(tx.grand_total).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs text-center">
                      <span
                        title={tx.cashier_id}
                        className="border-border border-b border-dotted cursor-help"
                      >
                        View ID
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
