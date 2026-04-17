/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { Transaction, Goal, FixedBill, Category } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  History, 
  Target, 
  Bot, 
  Settings, 
  PlusCircle, 
  MinusCircle, 
  LogOut,
  Menu,
  X,
  Wallet,
  CreditCard
} from 'lucide-react';
import DashboardView from './views/DashboardView';
import TransactionsView from './views/TransactionsView';
import GoalsView from './views/GoalsView';
import ChatView from './views/ChatView';
import FixedBillsView from './views/FixedBillsView';
import SettingsView from './views/SettingsView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // App State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [fixedBills, setFixedBills] = useState<FixedBill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        testConnection();
      }
    });
    return () => unsubscribe();
  }, []);

  async function testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. ");
      }
    }
  }

  useEffect(() => {
    if (!user) return;

    // Listen to Transactions
    const qTrans = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubTrans = onSnapshot(qTrans, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(data);
    });

    // Listen to Goals
    const qGoals = query(collection(db, 'goals'), where('userId', '==', user.uid));
    const unsubGoals = onSnapshot(qGoals, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
      setGoals(data);
    });

    // Listen to Fixed Bills
    const qBills = query(collection(db, 'fixed_bills'), where('userId', '==', user.uid));
    const unsubBills = onSnapshot(qBills, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FixedBill));
      setFixedBills(data);
    });

    return () => {
      unsubTrans();
      unsubGoals();
      unsubBills();
    };
  }, [user]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-violet-600 font-bold text-3xl"
        >
          Finanza
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="bg-violet-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
            <Wallet className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bem-vindo ao Finanza</h1>
          <p className="text-gray-600 mb-8 text-lg">
            A forma mais simples e inteligente de organizar sua vida financeira. Inspirado no jeito Nubank de cuidar do seu dinheiro.
          </p>
          <button 
            onClick={login}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
            Começar com Google
          </button>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'transactions', label: 'Extrato', icon: History },
    { id: 'fixed_bills', label: 'Contas Fixas', icon: CreditCard },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'chat', label: 'Consultor IA', icon: Bot },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-gray-900 font-sans flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white px-6 py-4 flex justify-between items-center shadow-sm z-50">
        <div className="flex items-center gap-2">
          <div className="bg-violet-600 w-8 h-8 rounded-lg flex items-center justify-center">
            <Wallet className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-violet-600">Finanza</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || !window.matchMedia('(max-width: 768px)').matches) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`
              fixed md:static inset-0 bg-white md:bg-white w-[280px] h-full z-40 
              border-r border-gray-100 p-8 flex flex-col justify-between
              transition-transform duration-300 md:translate-x-0
            `}
          >
            <div>
              <div className="hidden md:flex items-center gap-3 mb-12">
                <div className="bg-violet-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
                  <Wallet className="text-white w-6 h-6" />
                </div>
                <span className="font-bold text-2xl text-violet-600 tracking-tight">Finanza</span>
              </div>

              <div className="flex items-center gap-4 mb-10 p-2 bg-gray-50 rounded-2xl">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="w-12 h-12 rounded-xl shadow-sm" alt="Profile" />
                <div className="overflow-hidden">
                  <p className="font-bold text-gray-900 truncate">{user.displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-4 py-3.5 px-6 rounded-2xl font-medium transition-all
                      ${activeTab === item.id 
                        ? 'bg-violet-50 text-violet-700 shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <button 
              onClick={logout}
              className="flex items-center gap-4 py-3.5 px-6 rounded-2xl font-medium text-red-500 hover:bg-red-50 transition-all mt-8"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            {activeTab === 'dashboard' && (
              <DashboardView transactions={transactions} goals={goals} fixedBills={fixedBills} />
            )}
            {activeTab === 'transactions' && (
              <TransactionsView transactions={transactions} userId={user.uid} />
            )}
            {activeTab === 'fixed_bills' && (
              <FixedBillsView fixedBills={fixedBills} userId={user.uid} />
            )}
            {activeTab === 'goals' && (
              <GoalsView goals={goals} userId={user.uid} />
            )}
            {activeTab === 'chat' && (
              <ChatView transactions={transactions} goals={goals} userProfile={user} />
            )}
            {activeTab === 'settings' && (
              <SettingsView user={user} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
