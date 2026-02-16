"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { DollarSign, Filter } from 'lucide-react';
import CashOutTable from './components/cashout-table/CashOutTable';
import { columns } from './components/cashout-table/columns';
import { useExpensesInfinite, useExpensesSummary, DateRange } from './hooks/useExpenses';
import { DateRangeFilter } from '@/components/reusables/DateRangeFilter';
import dynamic_next from 'next/dynamic';

const CashOutModal = dynamic_next(() => import('./components/cashout-modal/CashOutModal'), {
    ssr: false
});

function CashoutContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Initialize with empty strings or fixed value to avoid hydration mismatch
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '',
    end: ''
  });

  // Handle client-side mounting and date initialization
  useEffect(() => {
    setIsMounted(true);
    const today = new Date().toISOString().split('T')[0];
    setDateRange({
      start: today,
      end: today
    });
  }, []);

  const { 
      expenses, 
      isLoading, 
      fetchNextPage, 
      hasNextPage, 
      isFetchingNextPage 
  } = useExpensesInfinite(20, dateRange);

  const { summary } = useExpensesSummary(dateRange);

  if (!isMounted) {
    return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Initializing...</div>
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-white">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Cash Management</h1>
            <p className="text-muted-foreground mt-1">Track and categorize all cash outflows from the register.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 font-bold"
          >
            <DollarSign size={20} />
            Record Cash Out
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100/50 text-red-600 rounded-lg"><DollarSign size={20}/></div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Cash Out</h3>
                </div>
                <p className="text-3xl font-bold text-foreground">₱{summary.totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg"><Filter size={20}/></div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Transactions</h3>
                </div>
                <p className="text-3xl font-bold text-foreground">{summary.totalCount}</p>
            </div>
            <div className="bg-primary p-6 rounded-2xl shadow-lg text-primary-foreground min-w-[200px]">
                 <h3 className="text-primary-foreground/80 text-sm font-medium mb-1">Session Status</h3>
                 <p className="text-2xl font-bold">Open</p>
                 <div className="mt-4 flex items-center gap-2 text-xs text-primary-foreground/90 bg-white/10 w-fit px-2 py-1 rounded">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Syncing Live
                 </div>
            </div>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-end">
            <DateRangeFilter 
                startDate={dateRange.start}
                endDate={dateRange.end}
                onStartDateChange={(d) => setDateRange(prev => ({ ...prev, start: d }))}
                onEndDateChange={(d) => setDateRange(prev => ({ ...prev, end: d }))}
                onClear={() => setDateRange({ start: '', end: '' })}
            />
        </div>

        {/* Table Section */}
        {isLoading && dateRange.start ? (
             <div className="p-12 text-center text-muted-foreground">Loading expenses...</div>
        ) : (
            <CashOutTable 
                columns={columns} 
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
