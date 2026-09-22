import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { getTodayDateString } from '@/utils/dateUtils';
import { Plus } from 'lucide-react';

export interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: {
    date: string;
    category: string;
    amount: number;
    note?: string;
  }) => Promise<void>;
}

const CATEGORIES = ['Гурил', 'Түлш', 'Уут сав', 'Цахилгаан', 'Бусад'];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
}) => {
  const [category, setCategory] = useState<string>('Гурил');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!num || num <= 0) {
      alert('Зөв зардлын дүн оруулна уу');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveExpense({
        date,
        category,
        amount: num,
        note: note.trim() || undefined,
      });
      setAmount('');
      setNote('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Зардал бүртгэхэд алдаа гарлаа');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Шинэ Зардал Бүртгэх"
      subtitle="Гурил, түлш, сав баглаа гэх мэт зардлаа оруулна уу"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Pills */}
        <div>
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">
            Зардлын төрөл:
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                  category === cat
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <Input
          label="Зардлын дүн (₮):"
          type="number"
          min="0"
          step="1000"
          placeholder="Жишээ: 180,000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        {/* Note */}
        <Input
          label="Тайлбар:"
          type="text"
          placeholder="Жишээ: 2 шуудай 1-р гурил авсан"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {/* Date */}
        <Input
          label="Огноо:"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            ЗАРДАЛ ХАДГАЛАХ
          </Button>
        </div>
      </form>
    </Modal>
  );
};
