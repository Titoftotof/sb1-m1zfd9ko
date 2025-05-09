import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  CalendarPlus, 
  FileText, 
  Edit, 
  Camera, 
  Send,
  CalendarClock,
} from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    { 
      name: 'Pointer une arrivée', 
      icon: Clock, 
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      link: '/planning'
    },
    { 
      name: 'Ajouter une absence', 
      icon: CalendarPlus, 
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
      link: '/planning'
    },
    { 
      name: 'Nouveau contrat', 
      icon: FileText, 
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      link: '/contracts'
    },
    { 
      name: 'Saisir une activité', 
      icon: Edit, 
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      link: '/communication'
    },
    { 
      name: 'Prendre une photo', 
      icon: Camera, 
      color: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100',
      link: '/communication'
    },
    { 
      name: 'Envoyer un message', 
      icon: Send, 
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
      link: '/communication'
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
        <CalendarClock className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            to={action.link}
            className={`flex flex-col items-center p-4 rounded-lg border ${action.color} transition-colors`}
          >
            <action.icon className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium text-center">{action.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;