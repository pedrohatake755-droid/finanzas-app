import React, { useState } from 'react';
import { Goal } from '../types';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Target, Plus, Trash2, CheckCircle2, ChevronRight, PieChart } from 'lucide-react';
import { motion } from 'motion/react';
import ConfirmationModal from '../components/ConfirmationModal';

interface GoalsViewProps {
  goals: Goal[];
  userId: string;
}

export default function GoalsView({ goals, userId }: GoalsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', current: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target) return;

    try {
      await addDoc(collection(db, 'goals'), {
        userId,
        title: newGoal.title,
        targetValue: parseFloat(newGoal.target),
        currentValue: parseFloat(newGoal.current || '0'),
      });
      setNewGoal({ title: '', target: '', current: '' });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding goal", error);
    }
  };

  const updateProgress = async (goalId: string, current: number, delta: number) => {
    const newValue = Math.max(0, current + delta);
    try {
      await updateDoc(doc(db, 'goals', goalId), {
        currentValue: newValue
      });
    } catch (error) {
      console.error("Error updating goal", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'goals', deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting goal", error);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Suas Metas</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Meta
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[32px] shadow-sm border border-violet-100"
        >
          <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input 
              placeholder="Nome da Meta (ex: Viagem)"
              value={newGoal.title}
              onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
              className="bg-gray-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-violet-100 outline-none"
              required
            />
            <input 
              type="number"
              placeholder="Valor Objetivo (R$)"
              value={newGoal.target}
              onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
              className="bg-gray-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-violet-100 outline-none"
              required
            />
            <div className="flex gap-4">
              <input 
                type="number"
                placeholder="Valor Atual (R$)"
                value={newGoal.current}
                onChange={(e) => setNewGoal({...newGoal, current: e.target.value})}
                className="flex-1 bg-gray-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-violet-100 outline-none"
              />
              <button className="bg-emerald-500 text-white p-4 rounded-2xl hover:bg-emerald-600 shadow-md transition-all">
                <CheckCircle2 className="w-6 h-6" />
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {goals.map((goal) => {
          const progress = (goal.currentValue / goal.targetValue) * 100;
          return (
            <motion.div 
              layout
              key={goal.id} 
              className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 group hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="bg-violet-50 p-4 rounded-2xl text-violet-600">
                  <PieChart className="w-8 h-8" />
                </div>
                <button 
                  onClick={() => setDeleteId(goal.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{goal.title}</h3>
              <div className="flex justify-between items-end mb-4">
                <span className="text-3xl font-bold text-violet-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.currentValue)}
                </span>
                <span className="text-gray-400 font-bold mb-1">
                  de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.targetValue)}
                </span>
              </div>

              <div className="w-full bg-gray-100 h-5 rounded-full mb-8 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-violet-600'}`}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => updateProgress(goal.id, goal.currentValue, 50)}
                  className="flex-1 bg-gray-50 hover:bg-violet-50 text-gray-600 hover:text-violet-600 font-bold py-4 rounded-2xl transition-all border border-transparent hover:border-violet-100"
                >
                  + R$ 50
                </button>
                <button 
                  onClick={() => updateProgress(goal.id, goal.currentValue, 100)}
                  className="flex-1 bg-gray-50 hover:bg-violet-50 text-gray-600 hover:text-violet-600 font-bold py-4 rounded-2xl transition-all border border-transparent hover:border-violet-100"
                >
                  + R$ 100
                </button>
              </div>
            </motion.div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center p-10">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
              <Target className="text-gray-200 w-16 h-16" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quais são seus sonhos?</h3>
            <p className="text-gray-400 max-w-sm">
              Criar metas ajuda você a guardar dinheiro com propósito. Que tal começar com uma "Reserva de Emergência"?
            </p>
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={!!deleteId}
        title="Excluir Meta"
        message="Tem certeza que deseja excluir esta meta? Todo o progresso será perdido."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        type="danger"
        confirmText="Excluir"
      />
    </div>
  );
}
