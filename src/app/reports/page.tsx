'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DailyCloseoutSummary } from '@/types';
import { reportService, MonthlyPLReport } from '@/services/reportService';
import { DailyReconciliationCard } from '@/components/features/DailyReconciliationCard';
import { ExpenseModal } from '@/components/features/ExpenseModal';
import { formatTugrik } from '@/utils/currencyFormatter';
import { getTodayDateString } from '@/utils/dateUtils';
import { Calendar, TrendingUp, Plus, Trash2, RefreshCw } from 'lucide-react';
import '@/app/globals.css';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  // Daily State
  const [dailySummary, setDailySummary] = useState<DailyCloseoutSummary | null>(
    null
  );
  const [selectedDate, setSelectedDate] =
    useState<string>(getTodayDateString());
  const [isDailyLoading, setIsDailyLoading] = useState<boolean>(true);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Monthly State
  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [monthlyPL, setMonthlyPL] = useState<MonthlyPLReport | null>(null);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState<boolean>(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);

  const fetchDailySummary = useCallback(async (date: string) => {
    setIsDailyLoading(true);
    try {
      const data = await reportService.getDailyCloseout(date);
      setDailySummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDailyLoading(false);
    }
  }, []);

  const fetchMonthlyPL = useCallback(async (month: string) => {
    setIsMonthlyLoading(true);
    try {
      const data = await reportService.getMonthlyPL(month);
      setMonthlyPL(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMonthlyLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailySummary(selectedDate);
  }, [selectedDate, fetchDailySummary]);

  useEffect(() => {
    fetchMonthlyPL(selectedMonth);
  }, [selectedMonth, fetchMonthlyPL]);

  const handleToggleCloseDay = async () => {
    if (!dailySummary) return;
    setIsClosing(true);
    try {
      await reportService.closeDailyRun(selectedDate);
      await fetchDailySummary(selectedDate);
    } catch (err) {
      alert('Өдөр хаахад алдаа гарлаа: ' + (err as Error).message);
    } finally {
      setIsClosing(false);
    }
  };

  const handleSaveExpense = async (expense: {
    date: string;
    category: string;
    amount: number;
    note?: string;
  }) => {
    await reportService.addExpense(expense);
    await fetchMonthlyPL(selectedMonth);
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Энэ зардлыг устгах уу?')) {
      await reportService.deleteExpense(id);
      await fetchMonthlyPL(selectedMonth);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Санхүү & Тайлан
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Өдрийн тооцоо ба сарын ашиг (P&L)
          </p>
        </div>

        <button
          onClick={() => {
            fetchDailySummary(selectedDate);
            fetchMonthlyPL(selectedMonth);
          }}
          className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-90 transition-all shadow-sm"
          aria-label="Шинэчлэх"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Segmented Switch: Daily Closeout vs Monthly P&L */}
      <div className="bg-slate-200/80 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'daily'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-600" />
          <span>Өдрийн Хаалт</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'monthly'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Сарын Ашиг (P&L)</span>
        </button>
      </div>

      {/* TAB 1: DAILY RECONCILIATION */}
      {activeTab === 'daily' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Date Picker */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Огноо сонгох:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-bold bg-transparent border-none text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {isDailyLoading ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-sm">
              Тооцоог бодож байна...
            </div>
          ) : dailySummary ? (
            <DailyReconciliationCard
              summary={dailySummary}
              onToggleClose={handleToggleCloseDay}
              isClosing={isClosing}
            />
          ) : null}
        </div>
      )}

      {/* TAB 2: MONTHLY P&L */}
      {activeTab === 'monthly' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Month Selector */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Сар сонгох:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-sm font-bold bg-transparent border-none text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {isMonthlyLoading ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-sm">
              Санхүүгийн тайланг бодож байна...
            </div>
          ) : monthlyPL ? (
            <>
              {/* Net Profit Hero Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-3xl p-5 shadow-xl shadow-emerald-600/20">
                <span className="text-xs text-emerald-100 font-extrabold uppercase tracking-wider block">
                  Энэ сарын ЦЭВЭР АШИГ (Net Profit)
                </span>
                <span className="text-4xl font-black mt-1 block">
                  {formatTugrik(monthlyPL.netProfit)}
                </span>
                <div className="mt-3 pt-3 border-t border-emerald-500/50 flex items-center justify-between text-xs text-emerald-100">
                  <span>
                    Хүргэсэн нийт талх: <b>{monthlyPL.totalBreadDelivered} ш</b>
                  </span>
                  <span>
                    Ашгийн хувь:{' '}
                    <b>
                      {monthlyPL.totalRevenue > 0
                        ? Math.round(
                            (monthlyPL.netProfit / monthlyPL.totalRevenue) * 100
                          )
                        : 0}
                      %
                    </b>
                  </span>
                </div>
              </div>

              {/* Financial Breakdown (Revenue, COGS, Expenses) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <h3 className="font-black text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 uppercase">
                  Санхүүгийн Бүтэц
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">
                      Нийт борлуулалт:
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {formatTugrik(monthlyPL.totalRevenue)}
                    </span>
                  </div>

                  <div className="flex justify-between text-rose-500">
                    <span>Талхны өртөг (COGS):</span>
                    <span className="font-bold">
                      -{formatTugrik(monthlyPL.totalCostOfGoods)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-800 dark:text-slate-200 font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>Бохир ашиг (Gross Profit):</span>
                    <span>{formatTugrik(monthlyPL.grossProfit)}</span>
                  </div>

                  <div className="flex justify-between text-rose-500">
                    <span>Үйл ажиллагааны зардал:</span>
                    <span className="font-bold">
                      -{formatTugrik(monthlyPL.totalExpenses)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white uppercase">
                      Сарын Зардлууд
                    </h3>
                    <span className="text-xs text-slate-400">
                      Нийт: {formatTugrik(monthlyPL.totalExpenses)}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-black active:scale-95 shadow"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Зардал нэмэх</span>
                  </button>
                </div>

                {monthlyPL.expenses.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Энэ сард зардал бүртгэгдээгүй байна.
                  </p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {monthlyPL.expenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {exp.category}
                          </span>
                          {exp.note && (
                            <p className="text-[11px] text-slate-400">
                              {exp.note}
                            </p>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {exp.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-black text-rose-600">
                            {formatTugrik(exp.amount)}
                          </span>
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 active:scale-90"
                            aria-label="Устгах"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}

          {/* Modal to add new expense */}
          <ExpenseModal
            isOpen={isExpenseModalOpen}
            onClose={() => setIsExpenseModalOpen(false)}
            onSaveExpense={handleSaveExpense}
          />
        </div>
      )}
    </div>
  );
}
