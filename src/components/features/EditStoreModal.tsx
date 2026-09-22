'use client';

import React, { useState, useEffect } from 'react';
import { Store } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { CreateStoreInput } from '@/services/storeService';
import { Edit3, Save } from 'lucide-react';

export interface EditStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  onUpdateStore: (id: string, updates: Partial<CreateStoreInput>) => Promise<void>;
}

export const EditStoreModal: React.FC<EditStoreModalProps> = ({
  isOpen,
  onClose,
  store,
  onUpdateStore,
}) => {
  const [name, setName] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [routeOrder, setRouteOrder] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && store) {
      setName(store.name || '');
      setOwnerName(store.ownerName || '');
      setPhone(store.phone || '');
      setAddress(store.address || '');
      setBalance(String(store.currentBalance ?? 0));
      setRouteOrder(String(store.routeOrder ?? 1));
    }
  }, [isOpen, store]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!store) return;
    if (!name.trim()) {
      alert('Дэлгүүрийн нэр оруулна уу');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateStore(store.id, {
        name: name.trim(),
        ownerName: ownerName.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        currentBalance: parseFloat(balance) || 0,
        routeOrder: parseInt(routeOrder, 10) || 1,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update store:', err);
      alert('Дэлгүүр засахад алдаа гарлаа: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!store) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Дэлгүүрийн Мэдээлэл Засах"
      subtitle={store.name}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Дэлгүүрийн нэр *"
          placeholder="Жишээ: Номин 8 нэрийн"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Худалдагч / Эзний нэр"
          placeholder="Жишээ: Дулмаа эгч"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
        />

        <Input
          label="Утасны дугаар"
          type="tel"
          placeholder="Жишээ: 99112233"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          label="Хаяг / Байршил"
          placeholder="Жишээ: 13-р хороолол, 24-р байр"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Үлдэгдэл өр (₮)"
            type="number"
            placeholder="0"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            suffix="₮"
          />

          <Input
            label="Маршрутын дараалал"
            type="number"
            min="1"
            placeholder="1"
            value={routeOrder}
            onChange={(e) => setRouteOrder(e.target.value)}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            leftIcon={<Save className="w-5 h-5" />}
            onClick={() => handleSubmit()}
          >
            ӨӨРЧЛӨЛТИЙГ ХАДГАЛАХ
          </Button>
        </div>
      </form>
    </Modal>
  );
};
