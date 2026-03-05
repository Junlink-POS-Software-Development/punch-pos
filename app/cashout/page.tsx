"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { DollarSign, Filter, Wallet } from 'lucide-react';
import { CashOutTable } from "./components/cashout-table/CashOutTable";
import { getColumns } from './components/cashout-table/columns';
import { useExpensesInfinite, useExpensesSummary, useCurrentBalance } from './hooks/useExpenses';
import { usePermissions } from '@/app/hooks/usePermissions';
import { useFilterStore } from '@/store/useFilterStore';
import dynamic_next from 'next/dynamic';
import { CashoutRecord } from './lib/cashout.api';
import { formatCurrency } from '@/lib/utils/currency';
import { useQuery } from '@tanstack/react-query';
import { fetchDrawerMode, fetchLatestCategorySales } from '../dashboard/lib/dashboard.api';
import { DashboardHeader } from '../dashboard/components/pos-overview/DashboardHeader';

const CashOutModal = dynamic_next(() => import('./components/cashout-modal/CashOutModal').then(m => m.CashOutModal), {
    ssr: false
});

function CashoutContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CashoutRecord | null>(null);
  const { dateRange, setDateRange } = useFilterStore();

  const handleDateChange = useCallback((date: string) => {
    setDateRange({ start: date, end: date });
  }, [setDateRange]);

  const { data: drawerMode = "unified" } = useQuery({
    queryKey: ["drawer-mode"],
    queryFn: fetchDrawerMode,
    staleTime: 1000 * 60 * 30,
  });

  const isMultiDrawer = drawerMode === "multiple";

  // Fetch categorical cash flow breakdown only if multi-drawer is active
  const { data: categorySales = [], isFetching: isFetchingCategorySales } = useQuery({
    queryKey: ["daily-category-sales", dateRange.start],
    queryFn: () => fetchLatestCategorySales(dateRange.start),
    enabled: isMultiDrawer && !!dateRange.start,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { 
      expenses, 
      isLoading, 
      fetchNextPage, 
      hasNextPage, 
      isFetchingNextPage,
      removeExpense,
      editExpense,
      isSubmitting
  } = useExpensesInfinite(20, dateRange);

  const { can_manage_expenses } = usePermissions();
  const { summary } = useExpensesSummary(dateRange);
  const { balance } = useCurrentBalance();

  const handleEditExpense = useCallback((record: CashoutRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Add a small delay to prevent flickering before the modal closes
    setTimeout(() => setEditingRecord(null), 300);
  }, []);

  const handleInlineUpdate = useCallback(async (id: string, values: any) => {
    try {
      // Map table values back to API input
      const payload = {
        transaction_date: values.date,
        amount: values.amount,
        notes: values.notes,
        cashout_type: values.category,
        product: values.product,
        manufacturer: values.manufacturer,
        receipt_no: values.receipt_no,
        referenceNo: values.referenceNo,
      };
      await editExpense(id, payload as any);
      return true;
    } catch (error) {
      console.error("Failed to update expense:", error);
      return false;
    }
  }, [editExpense]);

  const tableColumns = useMemo(() => 
    getColumns(removeExpense, handleEditExpense, can_manage_expenses, isMultiDrawer), 
    [removeExpense, handleEditExpense, can_manage_expenses, isMultiDrawer]
  );

  if (!isMounted) {
    return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Initializing...</div>
    </div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        
        <DashboardHeader 
          selectedDate={dateRange.start} 
          onDateChange={handleDateChange} 
          today={new Date().toISOString().split('T')[0]} 
        />

        {/* Top Summary & Actions Area */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
              <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-red-100/50 text-red-600 rounded-lg"><DollarSign size={16}/></div>
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Cash Out</h3>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.totalAmount ?? 0, 'PHP')}</p>
              </div>
              <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-blue-100/50 text-blue-600 rounded-lg"><Filter size={16}/></div>
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Transactions</h3>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{summary.totalCount}</p>
              </div>
              <div className={`p-4 rounded-xl shadow-sm border flex flex-col justify-center transition-colors ${
                  balance < 0 
                  ? "bg-red-500/10 border-red-500/50 text-red-600 animate-pulse" 
                  : "bg-card border-border text-foreground"
              }`}>
                  <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded-lg ${balance < 0 ? "bg-red-100 text-red-600" : "bg-emerald-100/50 text-emerald-600"}`}>
                        <Wallet size={16}/>
                      </div>
                      <h3 className={`text-[10px] font-bold uppercase tracking-wider ${balance < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                        Total Cash Remaining
                      </h3>
                      {balance < 0 && (
                        <span className="ml-auto flex items-center gap-1 text-[10px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-sm animate-bounce">
                          NEGATIVE BALANCE
                        </span>
                      )}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <p className={`text-2xl font-bold ${balance < 0 ? "text-red-600" : "text-foreground"}`}>
                      {formatCurrency(balance, 'PHP')}
                    </p>
                    {isFetchingCategorySales && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2"></div>
                    )}
                  </div>

                  {isMultiDrawer && categorySales.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/60">
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Drawer Breakdown</h4>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {categorySales.map((entry) => (
                          <div
                            key={entry.category}
                            className="flex items-center justify-between text-[11px] bg-muted/30 px-2 py-1.5 rounded-md"
                          >
                            <span className="text-muted-foreground font-medium truncate mr-2">
                              {entry.category}
                            </span>
                            <span className="font-mono font-semibold text-foreground whitespace-nowrap">
                              ₱{entry.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
          </div>
          
          {can_manage_expenses && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="lg:w-48 bg-primary text-primary-foreground px-4 py-4 rounded-xl hover:opacity-90 transition-all flex flex-col items-center justify-center gap-1 shadow-lg hover:shadow-xl active:scale-95 font-bold border border-primary-foreground/10"
            >
              <DollarSign size={24} />
              <span className="text-xs uppercase tracking-tighter">Record Cash Out</span>
            </button>
          )}
        </div>


        {/* Table Section */}
        {isLoading && dateRange.start ? (
             <div className="p-12 text-center text-muted-foreground">Loading expenses...</div>
        ) : (
            <CashOutTable 
                columns={tableColumns} 
                data={expenses} 
                onLoadMore={() => fetchNextPage()}
                hasMore={hasNextPage}
                isLoadingMore={isFetchingNextPage}
                updateData={handleInlineUpdate}
                isUpdating={isSubmitting}
            />
        )}

        {/* Modal */}
        <CashOutModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          editData={editingRecord}
        />
      </div>
  );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-white">Loading...</div>}>
            <div className="p-6 pt-2">
                <CashoutContent />
            </div>
        </Suspense>
    );
}
