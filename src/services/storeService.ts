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

  async deleteStore(id: string): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/api/stores?id=${id}`, {
      method: 'DELETE',
    });
  },
};
