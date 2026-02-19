"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { DollarSign, Filter } from 'lucide-react';
import CashOutTable from './components/cashout-table/CashOutTable';
import { getColumns } from './components/cashout-table/columns';
import { useExpensesInfinite, useExpensesSummary, useCashoutPermissions } from './hooks/useExpenses';
import { useFilterStore } from '@/store/useFilterStore';
import dynamic_next from 'next/dynamic';

const CashOutModal = dynamic_next(() => import('./components/cashout-modal/CashOutModal'), {
    ssr: false
});

function CashoutContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { dateRange } = useFilterStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { 
      expenses, 
      isLoading, 
      fetchNextPage, 
      hasNextPage, 
      isFetchingNextPage,
      removeExpense
  } = useExpensesInfinite(20, dateRange);

  const { permissions } = useCashoutPermissions();
  const { summary } = useExpensesSummary(dateRange);

  const tableColumns = useMemo(() => 
    getColumns(removeExpense, permissions.can_manage_expenses), 
    [removeExpense, permissions.can_manage_expenses]
  );

  if (!isMounted) {
    return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Initializing...</div>
    </div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4 text-white">
        
        {/* Top Summary & Actions Area */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
              <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-red-100/50 text-red-600 rounded-lg"><DollarSign size={16}/></div>
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Cash Out</h3>
                  </div>
                  <p className="text-2xl font-bold text-foreground">₱{(summary.totalAmount ?? 0).toFixed(2)}</p>
              </div>
              <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-blue-100/50 text-blue-600 rounded-lg"><Filter size={16}/></div>
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Transactions</h3>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{summary.totalCount}</p>
              </div>
              <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 flex items-center justify-between">
                  <div>
                    <h3 className="text-primary text-[10px] font-bold uppercase tracking-wider mb-1">Session Status</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                       <p className="text-lg font-bold text-foreground">Open & Syncing</p>
                    </div>
                  </div>
              </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="lg:w-48 bg-primary text-primary-foreground px-4 py-4 rounded-xl hover:opacity-90 transition-all flex flex-col items-center justify-center gap-1 shadow-lg hover:shadow-xl active:scale-95 font-bold border border-primary-foreground/10"
          >
            <DollarSign size={24} />
            <span className="text-xs uppercase tracking-tighter">Record Cash Out</span>
          </button>
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
            />
        )}

        {/* Modal */}
        <CashOutModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
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
