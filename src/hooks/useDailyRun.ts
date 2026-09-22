import { useState, useEffect, useCallback } from 'react';
import { DailyRun } from '@/types';
import { deliveryService } from '@/services/deliveryService';
import { getTodayDateString } from '@/utils/dateUtils';

export interface RemainingInventory {
  white: number;
  whole: number;
  baguette: number;
}

export function useDailyRun(initialDate?: string) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || getTodayDateString());
  const [dailyRun, setDailyRun] = useState<DailyRun | null>(null);
  const [remainingInCar, setRemainingInCar] = useState<RemainingInventory>({
    white: 0,
    whole: 0,
    baguette: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyRun = useCallback(async (dateToFetch: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deliveryService.getDailyRun(dateToFetch);
      setDailyRun(data.dailyRun);
      setRemainingInCar(data.remainingInCar);
    } catch (err: unknown) {
      console.error('Failed to load daily run:', err);
      setError((err as Error).message || 'Ачаалахад алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyRun(selectedDate);
  }, [selectedDate, fetchDailyRun]);

  const updateLoadedInventory = async (counts: {
    loadedWhite: number;
    loadedWhole: number;
    loadedBaguette: number;
  }) => {
    setIsLoading(true);
    try {
      const updated = await deliveryService.updateLoadedInventory({
        date: selectedDate,
        ...counts,
      });
      setDailyRun((prev) => (prev ? { ...prev, ...updated } : updated));
      // Шинэчилсний дараа үлдэгдлийг дахин тооцоолох
      await fetchDailyRun(selectedDate);
      return updated;
    } catch (err: unknown) {
      setError((err as Error).message || 'Ачилтын тоо хадгалахад алдаа гарлаа');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = useCallback(() => {
    fetchDailyRun(selectedDate);
  }, [fetchDailyRun, selectedDate]);

  return {
    selectedDate,
    setSelectedDate,
    dailyRun,
    remainingInCar,
    isLoading,
    error,
    updateLoadedInventory,
    refresh,
  };
}
