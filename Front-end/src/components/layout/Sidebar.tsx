import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building, 
  Clock, 
  UserCheck,
  UserPlus,
  Settings,
  FileText,
  X 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Crianças', href: '/criancas', icon: Users },
  { name: 'Responsáveis', href: '/responsaveis', icon: UserPlus },
  { name: 'Creches', href: '/creches', icon: Building },
  { name: 'Turmas', href: '/turmas', icon: Clock },
  { name: 'Critérios', href: '/criterios', icon: Settings },
  { name: 'Fila de Espera', href: '/fila', icon: Clock },
  { name: 'Alocações', href: '/alocacoes', icon: UserCheck },
  { name: 'Relatórios', href: '/relatorios', icon: FileText },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-gray-900/80 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-xl">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className="h-8 w-auto"
              src="/logo.svg"
              alt="Central Vagas"
            />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Central Vagas
            </span>
            <button
              type="button"
              className="ml-auto text-gray-700 lg:hidden"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200
                            ${isActive
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                            }
                          `}
                          onClick={onClose}
                        >
                          <item.icon
                            className={`h-6 w-6 shrink-0 ${
                              isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                            }`}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

