'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Stepper } from '@/components/common/Stepper';
import { Truck } from 'lucide-react';

export interface MorningLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCounts: {
    white: number;
    whole: number;
    baguette: number;
  };
  onSave: (counts: { loadedWhite: number; loadedWhole: number; loadedBaguette: number }) => Promise<void>;
}

export const MorningLoadModal: React.FC<MorningLoadModalProps> = ({
  isOpen,
  onClose,
  initialCounts,
  onSave,
}) => {
  const [white, setWhite] = useState<number>(initialCounts.white || 0);
  const [whole, setWhole] = useState<number>(initialCounts.whole || 0);
  const [baguette, setBaguette] = useState<number>(initialCounts.baguette || 0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Зөвхөн цонх нээгдэх үед л анхны утгыг онооно.
  // initialCounts-ийг dependency-д хийж болохгүй, учир нь эх компонент дахин зурагдах бүрт
  // шинэ reference үүсч, хэрэглэгчийн бичсэн тоо 0 болж арилдаг алдаа үүснэ.
  useEffect(() => {
    if (isOpen) {
      setWhite(initialCounts.white || 0);
      setWhole(initialCounts.whole || 0);
      setBaguette(initialCounts.baguette || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const totalLoaded = white + whole + baguette;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSave({
        loadedWhite: white,
        loadedWhole: whole,
        loadedBaguette: baguette,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save morning load:', err);
      alert('Ачилтын тоо хадгалахад алдаа гарлаа: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Өглөөний Ачилт (Машинд хийсэн)"
      subtitle="Машиндаа ачсан нийт талхны тоог оруулна уу"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Total Summary */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <span className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Нийт ачсан талх:
          </span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {totalLoaded} ш
          </span>
        </div>

        {/* 1-р гурил */}
        <Stepper
          label="1-р гурилын талх"
          sublabel="Цагаан хөрөнгөний талх"
          value={white}
          onChange={setWhite}
          highlightColor="amber"
        />

        {/* Бүхэл үр */}
        <Stepper
          label="Бүхэл үрийн талх"
          sublabel="100% бүхэл үрийн гурилтай"
          value={whole}
          onChange={setWhole}
          highlightColor="amber"
        />

        {/* Багет */}
        <Stepper
          label="Багет (Baguette)"
          sublabel="Уламжлалт франц багет"
          value={baguette}
          onChange={setBaguette}
          highlightColor="amber"
        />

        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="xl"
            fullWidth
            isLoading={isSubmitting}
            leftIcon={<Truck className="w-6 h-6" />}
            onClick={handleSubmit}
          >
            АЧИЛТЫН ТОО ХАДГАЛАХ
          </Button>
        </div>
      </div>
    </Modal>
  );
};
