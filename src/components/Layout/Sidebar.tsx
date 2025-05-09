import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Calendar, 
  Users, 
  MessageSquare, 
  DollarSign, 
  Settings as SettingsIcon,
  BabyIcon,
  CalendarDays // Ajout de l'icône pour le planning global
} from 'lucide-react';

interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: Home },
    { name: 'Contrats', href: '/contracts', icon: FileText },
    { name: 'Planning', href: '/planning', icon: Calendar },
    { name: 'Planning Global', href: '/global-planning', icon: CalendarDays }, // Ajout du nouveau lien
    { name: 'Enfants', href: '/children', icon: Users },
    { name: 'Communication', href: '/communication', icon: MessageSquare },
    { name: 'Finances', href: '/finances', icon: DollarSign },
    { name: 'Paramètres', href: '/settings', icon: SettingsIcon },
  ];

  const handleClick = () => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 flex-shrink-0 items-center px-4 bg-purple-700">
        <BabyIcon className="h-8 w-8 text-white" />
        <span className="ml-2 text-xl font-bold text-white">Nounou Connect</span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleClick}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-purple-700' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
        <div className="w-full">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Nounou Connect
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
