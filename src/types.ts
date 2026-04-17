export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  deadline?: string;
}

export interface FixedBill {
  id: string;
  userId: string;
  title: string;
  amount: number;
  dueDate: number;
  status: 'paid' | 'pending';
  category: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}
