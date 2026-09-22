import { DailyRun, DeliveryRecord, DeliveryFormData, Product } from '@/types';
import { apiFetch } from './apiClient';

export interface RecordDeliveryResponse {
  record: DeliveryRecord;
  updatedBalance: number;
  remainingInCar: {
    white: number;
    whole: number;
    baguette: number;
  };
}

export const deliveryService = {
  // 1. Бүтээгдэхүүний жагсаалт авах
  async getProducts(): Promise<Product[]> {
    return apiFetch<Product[]>('/api/products');
  },

  // 2. Тухайн өдрийн ачилт, статус авах
  async getDailyRun(date?: string): Promise<{ dailyRun: DailyRun; remainingInCar: { white: number; whole: number; baguette: number } }> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return apiFetch(`/api/daily-run${query}`);
  },

  // 3. Өглөөний ачсан талхны тоог хадгалах
  async updateLoadedInventory(data: { date: string; loadedWhite: number; loadedWhole: number; loadedBaguette: number }): Promise<DailyRun> {
    return apiFetch<DailyRun>('/api/daily-run', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 4. Дэлгүүрийн хүргэлт хадгалах (5 секундийн модалаас дуудагдана)
  async recordStoreDelivery(data: DeliveryFormData): Promise<RecordDeliveryResponse> {
    return apiFetch<RecordDeliveryResponse>('/api/delivery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 5. Дэлгүүрийн хүргэлтийн түүх авах
  async getStoreDeliveries(storeId: string): Promise<DeliveryRecord[]> {
    return apiFetch<DeliveryRecord[]>(`/api/delivery?storeId=${encodeURIComponent(storeId)}`);
  },
};
