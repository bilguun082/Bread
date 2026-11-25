'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DailyCloseoutSummary } from '@/types';
import { reportService, MonthlyPLReport } from '@/services/reportService';
import { DailyReconciliationCard } from '@/components/features/DailyReconciliationCard';
import { ExpenseModal } from '@/components/features/ExpenseModal';
import { MonthSelector } from '@/components/features/MonthSelector';
import { formatTugrik } from '@/utils/currencyFormatter';
import { getTodayDateString } from '@/utils/dateUtils';
import {
  Calendar,
  TrendingUp,
  Plus,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Landmark,
  Store as StoreIcon,
  Package,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
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

  // State for collapsible tables in monthly view
  const [showDailyBreakdown, setShowDailyBreakdown] = useState<boolean>(true);
  const [showStoreBreakdown, setShowStoreBreakdown] = useState<boolean>(false);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(getTodayDateString());
  };

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
          <span>Өдрийн Тооцоо</span>
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
          <span>Сарын Тооцоо & Ашиг</span>
        </button>
      </div>

      {/* TAB 1: DAILY RECONCILIATION */}
      {activeTab === 'daily' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Day Navigator */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border-2 border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevDay}
              className="h-11 w-11 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-90 transition-all flex-shrink-0"
              title="Өмнөх өдөр"
            >
              <ChevronLeft className="w-5 h-5 stroke-[3]" />
            </button>

            <div className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/60 py-1.5 px-3 rounded-2xl border border-slate-200/60 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm font-black bg-transparent border-none text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="h-11 w-11 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-90 transition-all flex-shrink-0"
              title="Дараах өдөр"
            >
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {selectedDate !== getTodayDateString() && (
            <div className="flex justify-end pr-1">
              <button
                type="button"
                onClick={handleToday}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <span>📍 Өнөөдөр лүү очих</span>
              </button>
            </div>
          )}

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

      {/* TAB 2: MONTHLY P&L & CALCULATIONS */}
      {activeTab === 'monthly' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Month Selector Component with interactive arrows & 12-month modal */}
          <MonthSelector
            selectedMonth={selectedMonth}
            onChangeMonth={setSelectedMonth}
          />

          {isMonthlyLoading ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-sm">
              {selectedMonth} сарын санхүүгийн тооцоог бодож байна...
            </div>
          ) : monthlyPL ? (
            <>
              {/* Net Profit Hero Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-3xl p-5 shadow-xl shadow-emerald-600/20">
                <span className="text-xs text-emerald-100 font-extrabold uppercase tracking-wider block">
                  {selectedMonth} сарын ЦЭВЭР АШИГ (Net Profit)
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

              {/* Мөнгөн Орлого & Авлага (Cash & Transfer Collection) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <h3 className="font-black text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 uppercase flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span>Мөнгөн Орлогын Тулгалт</span>
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">
                      💵 Бэлнээр авсан
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatTugrik(monthlyPL.totalCashReceived || 0)}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">
                      🏦 Дансаар орсон
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatTugrik(monthlyPL.totalTransferReceived || 0)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    💰 Нийт цугларсан орлого (Бэлэн + Данс):
                  </span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                    {formatTugrik(monthlyPL.totalCollected || 0)}
                  </span>
                </div>

                {(monthlyPL.totalDebtAdded || 0) > 0 && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                      ⚠️ Энэ сард зээлээр үлдсэн өр:
                    </span>
                    <span className="text-base font-black text-rose-600 dark:text-rose-400">
                      +{formatTugrik(monthlyPL.totalDebtAdded || 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Хүргэсэн Талхны Төрөл (Bread Breakdown) */}
              {monthlyPL.breadBreakdown && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                  <h3 className="font-black text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 uppercase flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-500" />
                    <span>Хүргэсэн Талхны Бүтэц ({monthlyPL.totalBreadDelivered} ш)</span>
                  </h3>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                      <span className="text-[11px] font-bold text-slate-500 block">1-р гурил</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {monthlyPL.breadBreakdown.white} ш
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                      <span className="text-[11px] font-bold text-slate-500 block">Бүхэл үр</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {monthlyPL.breadBreakdown.whole} ш
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                      <span className="text-[11px] font-bold text-slate-500 block">Багет</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {monthlyPL.breadBreakdown.baguette} ш
                      </span>
                    </div>
                  </div>

                  {monthlyPL.breadBreakdown.returned > 0 && (
                    <div className="text-xs font-bold text-rose-500 flex items-center justify-between pt-1">
                      <span>Буцаалт авсан нийт талх:</span>
                      <span>{monthlyPL.breadBreakdown.returned} ш</span>
                    </div>
                  )}
                </div>
              )}

              {/* Өдрүүдийн Тооцоо (Өдөр өдрийн хүснэгт) */}
              {monthlyPL.dailyDeliveries && monthlyPL.dailyDeliveries.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                  <div
                    onClick={() => setShowDailyBreakdown(!showDailyBreakdown)}
                    className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 cursor-pointer select-none"
                  >
                    <div>
                      <h3 className="font-black text-base text-slate-900 dark:text-white uppercase flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-amber-600" />
                        <span>Өдрүүдийн Тооцоо ({monthlyPL.dailyDeliveries.length} өдөр)</span>
                      </h3>
                      <span className="text-xs text-slate-400">
                        Дарж тухайн өдрийн дэлгэрэнгүй тооцоо руу орох боломжтой
                      </span>
                    </div>
                    <button type="button" className="text-slate-400">
                      {showDailyBreakdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {showDailyBreakdown && (
                    <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
                      {monthlyPL.dailyDeliveries.map((day) => (
                        <div
                          key={day.date}
                          onClick={() => {
                            setSelectedDate(day.date);
                            setActiveTab('daily');
                          }}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block text-sm">
                              {day.date}
                            </span>
                            <span className="text-slate-500 font-semibold">
                              Хүргэсэн: {day.breadDelivered} ш | Орлого: {formatTugrik(day.cashReceived + day.transferReceived)}
                            </span>
                          </div>

                          <div className="text-right flex items-center gap-2">
                            <div>
                              <span className="font-black text-slate-900 dark:text-white block">
                                {formatTugrik(day.revenue)}
                              </span>
                              {day.debtAdded > 0 && (
                                <span className="text-[10px] font-bold text-rose-500 block">
                                  +{formatTugrik(day.debtAdded)} зээл
                                </span>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Дэлгүүрүүдийн Сарын Нийт Дүн (Store-by-Store Breakdown) */}
              {monthlyPL.storeBreakdown && monthlyPL.storeBreakdown.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                  <div
                    onClick={() => setShowStoreBreakdown(!showStoreBreakdown)}
                    className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 cursor-pointer select-none"
                  >
                    <div>
                      <h3 className="font-black text-base text-slate-900 dark:text-white uppercase flex items-center gap-2">
                        <StoreIcon className="w-5 h-5 text-blue-600" />
                        <span>Дэлгүүрүүдийн Дүн ({monthlyPL.storeBreakdown.length} дэлгүүр)</span>
                      </h3>
                      <span className="text-xs text-slate-400">
                        Энэ сард талх авсан дэлгүүрүүд
                      </span>
                    </div>
                    <button type="button" className="text-slate-400">
                      {showStoreBreakdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {showStoreBreakdown && (
                    <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
                      {monthlyPL.storeBreakdown.map((s) => (
                        <div
                          key={s.storeId}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block text-sm">
                              {s.storeName}
                            </span>
                            <span className="text-slate-500 font-semibold">
                              Авсан: {s.breadDelivered} ш талх | Төлсөн: {formatTugrik(s.paidAmount)}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-black text-slate-900 dark:text-white block text-sm">
                              {formatTugrik(s.totalAmount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Financial Breakdown (Revenue, COGS, Expenses) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <h3 className="font-black text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 uppercase">
                  Санхүүгийн Бүтэц (P&L)
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
