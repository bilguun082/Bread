import { useState, useEffect, useCallback, useMemo } from 'react';
import { Store } from '@/types';
import { storeService, CreateStoreInput } from '@/services/storeService';

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await storeService.getAllStores();
      setStores(data);
    } catch (err: unknown) {
      console.error('Failed to load stores:', err);
      setError((err as Error).message || 'Дэлгүүрүүд ачаалахад алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Дэлгүүр хайх шүүлтүүр
  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const q = searchQuery.toLowerCase().trim();
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.ownerName && s.ownerName.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q))
    );
  }, [stores, searchQuery]);

  // Бүх дэлгүүрийн нийт өр (авлага) тооцох
  const totalReceivables = useMemo(() => {
    return stores.reduce((sum, s) => sum + (s.currentBalance > 0 ? s.currentBalance : 0), 0);
  }, [stores]);

  // Шинэ дэлгүүр нэмэх
  const addStore = async (storeInput: CreateStoreInput) => {
    const newStore = await storeService.createStore(storeInput);
    setStores((prev) => [...prev, newStore]);
    return newStore;
  };

  // Дэлгүүрийн мэдээлэл засах
  const updateStore = async (id: string, updates: Partial<CreateStoreInput>) => {
    const updated = await storeService.updateStore(id, updates);
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    return updated;
  };

  // Хүргэлтийн дараа орон нутгийн state дахь балансыг шууд шинэчлэх (Optimistic update)
  const updateStoreBalanceLocal = (storeId: string, newBalance: number) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, currentBalance: newBalance } : s))
    );
  };

  // Дэлгүүрийн өрийг тэглэх (Тооцоо дууссан)
  const resetStoreBalance = async (id: string) => {
    const updated = await storeService.resetBalance(id);
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, currentBalance: 0 } : s)));
    return updated;
  };

  // Дэлгүүр устгах
  const deleteStore = async (id: string) => {
    await storeService.deleteStore(id);
    setStores((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    stores,
    filteredStores,
    searchQuery,
    setSearchQuery,
    totalReceivables,
    isLoading,
    error,
    addStore,
    updateStore,
    resetStoreBalance,
    deleteStore,
    updateStoreBalanceLocal,
    refresh: fetchStores,
  };
}
