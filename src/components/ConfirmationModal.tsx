import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export default function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  type = 'info'
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden"
          >
            {type === 'danger' && (
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
            )}
            
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {message}
            </p>

            <div className="flex gap-3">
              <button 
                onClick={onCancel}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl transition-all"
              >
                {cancelText}
              </button>
              <button 
                onClick={onConfirm}
                className={`flex-1 font-bold py-3.5 rounded-2xl shadow-lg transition-all ${
                  type === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
