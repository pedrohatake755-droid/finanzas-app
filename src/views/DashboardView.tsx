import React, { useState } from 'react';
import { Transaction, Goal, FixedBill } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Plus, Minus, TrendingUp, TrendingDown, DollarSign, Target, Bot, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import TransactionForm from '../components/TransactionForm';

interface DashboardProps {
  transactions: Transaction[];
  goals: Goal[];
  fixedBills: FixedBill[];
}

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

export default function DashboardView({ transactions, goals, fixedBills }: DashboardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any[], t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, []);

  const openForm = (type: 'income' | 'expense') => {
    setFormType(type);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <p className="text-sm font-medium text-gray-400 mb-2 relative z-10 uppercase tracking-wider">Saldo Total</p>
          <p className={`text-4xl font-bold relative z-10 ${balance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">Ganhos (Mês)</p>
            <p className="text-2xl font-bold text-emerald-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <TrendingUp className="text-emerald-500 w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">Gastos (Mês)</p>
            <p className="text-2xl font-bold text-red-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
            <TrendingDown className="text-red-500 w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={() => openForm('income')}
          className="flex-1 bg-white hover:bg-emerald-50 text-emerald-600 font-bold py-5 px-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center gap-3 transition-all transform active:scale-95"
        >
          <div className="bg-emerald-100 p-2 rounded-xl">
            <Plus className="w-5 h-5" />
          </div>
          Adicionar Ganho
        </button>
        <button 
          onClick={() => openForm('expense')}
          className="flex-1 bg-white hover:bg-red-50 text-red-600 font-bold py-5 px-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center gap-3 transition-all transform active:scale-95"
        >
          <div className="bg-red-100 p-2 rounded-xl">
            <Minus className="w-5 h-5" />
          </div>
          Adicionar Gasto
        </button>
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-8 uppercase tracking-tight">Gastos por Categoria</h3>
          <div className="h-[350px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                <DollarSign className="w-12 h-12 opacity-20" />
                <p>Nenhum gasto registrado este mês</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Goals Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Minhas Metas</h3>
              <Target className="text-violet-600 w-6 h-6" />
            </div>
            <div className="space-y-6">
              {goals.length > 0 ? goals.slice(0, 3).map((goal) => {
                const progress = (goal.currentValue / goal.targetValue) * 100;
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-gray-700">{goal.title}</span>
                      <span className="text-violet-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        className="bg-violet-600 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              }) : (
                <p className="text-gray-400 text-center py-4">Sem metas no momento</p>
              )}
            </div>
          </div>

          {/* Pending Bills Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Contas a Pagar</h3>
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                {fixedBills.filter(b => b.status === 'pending').length} Pendentes
              </span>
            </div>
            <div className="space-y-4">
              {fixedBills.length > 0 ? fixedBills.filter(b => b.status === 'pending').slice(0, 3).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <CreditCard className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{bill.title}</p>
                      <p className="text-xs text-gray-400">Vence dia {bill.dueDate}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bill.amount)}
                  </span>
                </div>
              )) : (
                <p className="text-gray-400 text-center py-4 text-sm">Tudo pago por aqui! 🎉</p>
              )}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-violet-600 p-8 rounded-3xl shadow-lg relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Bot className="w-20 h-20" />
            </div>
            <h3 className="text-xl font-bold mb-4 z-10 relative">Dica da Finanza AI</h3>
            <p className="text-violet-100 z-10 relative leading-relaxed">
              {balance < 0 
                ? "Ops! Seus gastos estão maiores que seus ganhos. Que tal revisar seus 'outros' e cortar o supérfluo hoje?" 
                : "Parabéns! Você está no azul. Que tal separar R$ 50 para sua meta 'Reserva de Emergência' agora mesmo?"}
            </p>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <TransactionForm 
          type={formType} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
