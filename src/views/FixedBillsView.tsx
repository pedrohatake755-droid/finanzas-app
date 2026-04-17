import React, { useState } from 'react';
import { FixedBill } from '../types';
import { Plus, Calendar, CheckCircle, Clock, Trash2, DollarSign } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import ConfirmationModal from '../components/ConfirmationModal';

interface FixedBillsViewProps {
  fixedBills: FixedBill[];
  userId: string;
}

export default function FixedBillsView({ fixedBills, userId }: FixedBillsViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newBill, setNewBill] = useState({
    title: '',
    amount: '',
    dueDate: '',
    category: 'Essencial'
  });

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.title || !newBill.amount || !newBill.dueDate) return;

    try {
      await addDoc(collection(db, 'fixed_bills'), {
        ...newBill,
        amount: parseFloat(newBill.amount),
        userId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsFormOpen(false);
      setNewBill({ title: '', amount: '', dueDate: '', category: 'Essencial' });
    } catch (error) {
      console.error("Error adding fixed bill", error);
    }
  };

  const toggleStatus = async (bill: FixedBill) => {
    try {
      await updateDoc(doc(db, 'fixed_bills', bill.id), {
        status: bill.status === 'paid' ? 'pending' : 'paid'
      });
    } catch (error) {
      console.error("Error updating bill status", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'fixed_bills', deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting bill", error);
    }
  };

  const totalPending = fixedBills
    .filter(b => b.status === 'pending')
    .reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Contas Fixas</h2>
          <p className="text-gray-500 mt-1">Gerencie seus compromissos mensais recorrentes.</p>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Conta
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
        <div className="bg-orange-50 p-4 rounded-2xl text-orange-500">
          <Clock className="w-8 h-8" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Pendente</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fixedBills.map((bill) => (
          <div key={bill.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden">
            <div className={`absolute top-0 right-0 w-2 h-full ${bill.status === 'paid' ? 'bg-emerald-500' : 'bg-orange-400'}`} />
            
            <div className="flex justify-between items-start mb-4 pr-6">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">{bill.category}</span>
                <h3 className="text-xl font-bold text-gray-900">{bill.title}</h3>
              </div>
              <button 
                onClick={() => setDeleteId(bill.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-600" />
                Vence dia {bill.dueDate}
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-violet-600" />
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bill.amount)}
              </div>
            </div>

            <button 
              onClick={() => toggleStatus(bill)}
              className={`w-full py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                bill.status === 'paid' 
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <CheckCircle className={`w-5 h-5 ${bill.status === 'paid' ? 'text-emerald-500' : 'text-gray-300'}`} />
              {bill.status === 'paid' ? 'Paga' : 'Marcar como Paga'}
            </button>
          </div>
        ))}

        {fixedBills.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-400">Nenhuma conta fixa cadastrada. Comece adicionando seu aluguel, internet ou streaming!</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-10 relative shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 uppercase tracking-tight">Nova Conta Fixa</h3>
            
            <form onSubmit={handleAddBill} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Título</label>
                <input 
                  autoFocus
                  required
                  placeholder="Ex: Aluguel, Netflix..."
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
                  value={newBill.title}
                  onChange={e => setNewBill({...newBill, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Valor</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-4 focus:ring-violet-100 outline-none transition-all font-mono"
                    value={newBill.amount}
                    onChange={e => setNewBill({...newBill, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Dia Vencimento</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    max="31"
                    placeholder="1-31"
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
                    value={newBill.dueDate}
                    onChange={e => setNewBill({...newBill, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Categoria</label>
                <select 
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-4 focus:ring-violet-100 outline-none transition-all appearance-none"
                  value={newBill.category}
                  onChange={e => setNewBill({...newBill, category: e.target.value})}
                >
                  <option value="Essencial">Essencial</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Assinatura">Assinatura</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={!!deleteId}
        title="Excluir Conta Fixa"
        message="Tem certeza que deseja excluir esta conta recorrente?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        type="danger"
        confirmText="Excluir"
      />
    </div>
  );
}
