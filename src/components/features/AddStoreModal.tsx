'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { CreateStoreInput } from '@/services/storeService';
import { Store as StoreIcon } from 'lucide-react';

export interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStore: (store: CreateStoreInput) => Promise<void>;
}

export const AddStoreModal: React.FC<AddStoreModalProps> = ({
  isOpen,
  onClose,
  onAddStore,
}) => {
  const [name, setName] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [initialBalance, setInitialBalance] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      alert('Дэлгүүрийн нэр оруулна уу');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddStore({
        name: name.trim(),
        ownerName: ownerName.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        currentBalance: parseFloat(initialBalance) || 0,
      });
      setName('');
      setOwnerName('');
      setPhone('');
      setAddress('');
      setInitialBalance('0');
      onClose();
    } catch (err) {
      console.error('Failed to create store:', err);
      alert('Дэлгүүр нэмэхэд алдаа гарлаа: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Шинэ Дэлгүүр Нэмэх"
      subtitle="Хүргэлтийн маршрутад шинэ цэг оруулах"
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

        <Input
          label="Анхны өр үлдэгдэл (байгаа бол)"
          type="number"
          placeholder="0"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          suffix="₮"
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            leftIcon={<StoreIcon className="w-5 h-5" />}
            onClick={() => handleSubmit()}
          >
            ДЭЛГҮҮР ХАДГАЛАХ
          </Button>
        </div>
      </form>
    </Modal>
  );
};
