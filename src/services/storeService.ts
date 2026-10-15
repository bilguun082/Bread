import { Store } from '@/types';
import { apiFetch } from './apiClient';

export interface CreateStoreInput {
  name: string;
  ownerName?: string;
  phone?: string;
  address?: string;
  currentBalance?: number;
  routeOrder?: number;
}

export interface SettleDebtParams {
  storeId: string;
  selectedDeliveryIds: string[];
  settleInitialBalance?: boolean;
  paymentMethod?: 'TRANSFER' | 'CASH';
  note?: string;
  customAmount?: number;
}

export interface SettleDebtResult {
  success: boolean;
  updatedBalance: number;
  settledAmount: number;
  updatedDeliveryIds: string[];
}

export const storeService = {
  async getAllStores(): Promise<Store[]> {
    return apiFetch<Store[]>('/api/stores');
  },

  async createStore(store: CreateStoreInput): Promise<Store> {
    return apiFetch<Store>('/api/stores', {
      method: 'POST',
      body: JSON.stringify(store),
    });
  },

  async updateStore(id: string, updates: Partial<CreateStoreInput>): Promise<Store> {
    return apiFetch<Store>(`/api/stores?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async resetBalance(id: string): Promise<Store> {
    return apiFetch<Store>(`/api/stores?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ currentBalance: 0 }),
    });
  },

  async settleDebt(params: SettleDebtParams): Promise<SettleDebtResult> {
    return apiFetch<SettleDebtResult>('/api/stores/settle-debt', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async deleteStore(id: string): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/api/stores?id=${id}`, {
      method: 'DELETE',
    });
  },
};

