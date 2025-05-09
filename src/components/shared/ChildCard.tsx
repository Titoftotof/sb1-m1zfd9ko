import React from 'react';
import { Link } from 'react-router-dom';
import { Child } from '../../types';
import { CalendarClock, User, Phone, Mail, Edit } from 'lucide-react'; // Importer Edit

interface ChildCardProps {
  child: Child;
  compact?: boolean;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, compact = false }) => {
  // Calculate age in years and months
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} mois`;
    }
    
    return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
  };

  const age = calculateAge(child.birthDate);

  if (compact) {
    return (
      <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
        {child.photo ? (
          <img 
            src={child.photo} 
            alt={`${child.firstName} ${child.lastName}`} 
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <User className="w-6 h-6 text-purple-500" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-gray-900">{child.firstName} {child.lastName}</h3>
          <p className="text-xs text-gray-500">{age}</p>
        </div>
      </div>
    );
  }

  return (
    // Supprimer le Link extérieur, la navigation se fait par le bouton en bas
    // <Link to={`/children/${child.id}`} className="block"> 
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md flex flex-col"> {/* Ajout flex flex-col pour que le footer reste en bas */}
        {/* Section Image */}
        <Link to={`/children/${child.id}`} className="block h-40 w-full flex-shrink-0"> {/* Mettre le lien sur l'image/placeholder */}
          {child.photo ? (
            <img 
              src={child.photo} 
              alt={`${child.firstName} ${child.lastName}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-purple-100 flex items-center justify-center">
              <User className="w-16 h-16 text-purple-300" />
            </div>
          )}
        </Link>
        {/* Section Contenu */}
        {/* Correction: Supprimer l'image dupliquée et le ternaire incorrect ici */}
        <div className="p-4 flex-grow"> {/* Ajout flex-grow */}
          {/* Le contenu commence ici */}
          <h3 className="text-lg font-medium text-gray-900">{child.firstName} {child.lastName}</h3>
          <div className="mt-2 space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <CalendarClock className="w-4 h-4 mr-2" />
              <span>{age}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <User className="w-4 h-4 mr-2" />
              <span>{child.parentInfo.parent1.firstName} {child.parentInfo.parent1.lastName}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Phone className="w-4 h-4 mr-2" />
              <span>{child.parentInfo.parent1.phone}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Mail className="w-4 h-4 mr-2" />
              <span className="truncate">{child.parentInfo.parent1.email}</span>
            </div>
          </div>
        </div>
        {/* Footer avec bouton */}
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex-shrink-0"> {/* Ajout flex-shrink-0 */}
          <Link 
            to={`/children/${child.id}?edit=true`} 
            className="flex items-center justify-center text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            <Edit className="w-4 h-4 mr-1" />
            Voir / Modifier
          </Link>
        </div>
      </div>
    // </Link> 
  );
};

export default ChildCard;
