import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { X, Calendar, Tag, Info } from 'lucide-react';

interface TransactionFormProps {
  type: 'income' | 'expense';
  onClose: () => void;
}

const CATEGORIES = {
  income: ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outros'],
  expense: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros']
};

export default function TransactionForm({ type, onClose }: TransactionFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[type][0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !amount) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: auth.currentUser.uid,
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date).toISOString(),
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (error) {
      console.error("Error adding transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="bg-white w-full max-w-lg rounded-t-[40px] md:rounded-[40px] p-10 relative shadow-2xl overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <div className={type === 'income' ? 'text-emerald-500' : 'text-red-500'}>
            {type === 'income' ? 'Novo Ganho' : 'Novo Gasto'}
          </div>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-300 group-focus-within:text-violet-600 transition-colors">
              R$
            </span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full bg-gray-50 border-none rounded-3xl py-8 pl-16 pr-8 text-4xl font-bold focus:ring-4 focus:ring-violet-100 transition-all outline-none"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4" /> Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-medium focus:ring-4 focus:ring-violet-100 outline-none appearance-none"
              >
                {CATEGORIES[type].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-medium focus:ring-4 focus:ring-violet-100 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4" /> Descrição (Opcional)
            </label>
            <input
              placeholder="Ex: Almoço no shopping"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-medium focus:ring-4 focus:ring-violet-100 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full py-6 rounded-3xl text-xl font-bold text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3
              ${type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isSubmitting ? 'Salvando...' : 'Confirmar'}
          </button>
        </form>
      </div>
    </div>
  );
}
