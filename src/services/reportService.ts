import { DailyCloseoutSummary, Expense } from '@/types';
import { apiFetch } from './apiClient';

export interface MonthlyDaySummary {
  date: string;
  breadDelivered: number;
  revenue: number;
  cashReceived: number;
  transferReceived: number;
  debtAdded: number;
}

export interface MonthlyStoreSummary {
  storeId: string;
  storeName: string;
  breadDelivered: number;
  totalAmount: number;
  paidAmount: number;
}

export interface MonthlyPLReport {
  month: string; // YYYY-MM
  totalRevenue: number;
  totalCostOfGoods: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  totalBreadDelivered: number;
  breadBreakdown?: {
    white: number;
    whole: number;
    baguette: number;
    returned: number;
  };
  totalCashReceived?: number;
  totalTransferReceived?: number;
  totalCollected?: number;
  totalDebtAdded?: number;
  dailyDeliveries?: MonthlyDaySummary[];
  storeBreakdown?: MonthlyStoreSummary[];
  expenses: Expense[];
}

export const reportService = {
  // Өдрийн хаалтын баланс ба тулгалт
  async getDailyCloseout(date?: string): Promise<DailyCloseoutSummary> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return apiFetch<DailyCloseoutSummary>(`/api/reports/daily${query}`);
  },

  // Өдөр хаах (Статус COMPLETED болгох)
  async closeDailyRun(date: string): Promise<{ success: boolean; status: string }> {
    return apiFetch<{ success: boolean; status: string }>('/api/reports/daily', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },

  // Сар тутмын P&L тайлан
  async getMonthlyPL(month?: string): Promise<MonthlyPLReport> {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    return apiFetch<MonthlyPLReport>(`/api/reports/monthly${query}`);
  },

  // Зардал нэмэх
  async addExpense(expense: { date: string; category: string; amount: number; note?: string }): Promise<Expense> {
    return apiFetch<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  },

  // Зардал устгах
  async deleteExpense(id: string): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/api/expenses?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
