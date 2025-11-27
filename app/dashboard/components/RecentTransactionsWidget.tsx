import { Transaction } from "../hooks/useDashboardData";


interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactionsWidget({ transactions }: RecentTransactionsProps) {
  return (
    <div className="lg:col-span-1 bg-slate-900/50 p-6 border border-slate-800 rounded-2xl glass-effect">
      <h3 className="mb-4 font-semibold text-lg">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-slate-700 border-b text-slate-400">
              <th className="py-2">Invoice</th>
              <th className="py-2">Customer</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <tr key={t.invoice_no}>
                  <td className="py-3 text-xs">{t.invoice_no}</td>
                  <td className="py-3 text-xs truncate max-w-[100px]">
                    {t.customer_name || "N/A"}
                  </td>
                  <td className="py-3 text-right text-xs">
                    ${Number(t.grand_total).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-4 text-center text-slate-500">
                  No recent transactions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}