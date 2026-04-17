import React from 'react';
import { User } from 'firebase/auth';
import { LogOut, Shield, User as UserIcon, Bell, Info, Github } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface SettingsViewProps {
  user: User;
}

export default function SettingsView({ user }: SettingsViewProps) {
  const logout = () => signOut(auth);

  const sections = [
    {
      title: 'Perfil',
      items: [
        { icon: UserIcon, label: 'Nome', value: user.displayName || 'Não definido' },
        { icon: UserIcon, label: 'Email', value: user.email || 'Não definido' },
      ]
    },
    {
      title: 'Privacidade e Segurança',
      items: [
        { icon: Shield, label: 'Dados Protegidos', value: 'Seus dados são isolados por UID no Firebase' },
      ]
    },
    {
      title: 'Sobre',
      items: [
        { icon: Info, label: 'Versão', value: '1.0.0' },
      ]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Configurações</h2>
        <p className="text-gray-500 mt-1">Gerencie seu perfil e preferências do aplicativo.</p>
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
        <div className="p-10 flex items-center gap-6 border-b border-gray-50 bg-gray-50/50">
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
            className="w-24 h-24 rounded-[32px] shadow-sm ring-4 ring-white" 
            alt="Profile" 
          />
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{user.displayName}</h3>
            <p className="text-gray-500 font-medium">{user.email}</p>
            <span className="inline-block mt-3 px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-widest rounded-full">
              Usuário Free
            </span>
          </div>
        </div>

        <div className="p-10 space-y-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">{section.title}</h4>
              <div className="space-y-6">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 p-3 rounded-2xl text-gray-500 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-6">
            <button 
              onClick={logout}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm py-8">
        <p>Feito com ❤️ para ajudar você a conquistar sua liberdade financeira.</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Github className="w-4 h-4 cursor-pointer hover:text-gray-600" />
        </div>
      </div>
    </div>
  );
}
