import React, { useState } from 'react';
import { Transaction } from '../types';
import { Search, History as HistoryIcon, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ConfirmationModal from '../components/ConfirmationModal';

interface TransactionsViewProps {
  transactions: Transaction[];
  userId: string;
}

export default function TransactionsView({ transactions }: TransactionsViewProps) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredTransactions = transactions
    .filter(t => {
      const matchesType = filter === 'all' || t.type === filter;
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
                          t.category.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'transactions', deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting transaction", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Extrato</h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              placeholder="Buscar por descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm"
            />
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white border border-gray-100 rounded-2xl py-3 px-4 font-medium focus:ring-4 focus:ring-violet-100 outline-none transition-all shadow-sm appearance-none min-w-[120px]"
          >
            <option value="all">Todos</option>
            <option value="income">Ganhos</option>
            <option value="expense">Gastos</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filteredTransactions.map((t) => (
              <div key={t.id} className="group flex items-center justify-between p-6 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                    {t.type === 'income' ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{t.description || t.category}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.category}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span className="text-sm text-gray-500">
                        {format(new Date(t.date), "dd 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <span className={`text-xl font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-gray-900'}`}>
                    {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                  </span>
                  
                  <button 
                    onClick={() => setDeleteId(t.id)}
                    className="opacity-0 group-hover:opacity-100 p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <HistoryIcon className="text-gray-300 w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma transação encontrada</h3>
            <p className="text-gray-400">Tente ajustar seus filtros ou adicione uma nova transação no painel principal.</p>
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={!!deleteId}
        title="Excluir Transação"
        message="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        type="danger"
        confirmText="Excluir"
      />
    </div>
  );
}
