import React, { useMemo } from 'react'; // Importer useMemo
import { useAppContext } from '../../context/AppContext';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import ChildCard from '../shared/ChildCard';
import { Attendance, Child } from '../../types'; // Importer les types

const TodaySummary: React.FC = () => {
  const { children, attendanceRecords } = useAppContext(); // Récupérer attendanceRecords
  const todayString = new Date().toISOString().split('T')[0];

  // Helper function to parse HH:MM time string into minutes since midnight (copié depuis Planning.tsx)
  const parseTime = (timeStr: string): number => { // Accepte string valide
    // Les vérifications sont faites avant l'appel maintenant
    const parts = timeStr.split(':');
    if (parts.length !== 2) return -1;
    const [hours, minutes] = parts.map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.warn(`Invalid time format encountered in TodaySummary: ${timeStr}`);
        return -1;
    }
    return hours * 60 + minutes;
  };

  // Calculer les enfants présents (logique copiée et adaptée depuis Planning.tsx)
  const presentChildrenDetails = useMemo(() => {
    const presentMap = new Map<string, Child & { attendanceId: string; arrivalTime?: string }>();

    const sortedAttendanceToday = [...attendanceRecords]
      .filter(att => att.date === todayString)
      .sort((a: Attendance, b: Attendance) => { // Typer explicitement
          // Gérer null explicitement et forcer le type string si non-null
          const timeA = a.arrivalTime === null ? -1 : parseTime(a.arrivalTime as string); 
          const timeB = b.arrivalTime === null ? -1 : parseTime(b.arrivalTime as string);
          if (timeA === -1 && timeB === -1) return a.id.localeCompare(b.id);
          if (timeA === -1) return 1; 
          if (timeB === -1) return -1;
          if (timeA !== timeB) return timeA - timeB;
          return a.id.localeCompare(b.id); 
      });

    sortedAttendanceToday.forEach(att => {
      if (att.status === 'présent') { // Utiliser le statut français
        const childDetail = children.find(c => c.id === att.childId);
        if (childDetail) {
          // Consider "00:00:00" or null/undefined as not departed for this logic
          if (!att.departureTime || att.departureTime === "00:00:00") { 
            // Convert null arrivalTime to undefined for the map's type
            presentMap.set(att.childId, { ...childDetail, attendanceId: att.id, arrivalTime: att.arrivalTime === null ? undefined : att.arrivalTime });
          } else {
            presentMap.delete(att.childId); 
          }
        }
      } else {
         presentMap.delete(att.childId);
      }
    });

    return Array.from(presentMap.values());
  }, [attendanceRecords, children, todayString]); // Dépendances

  const presentCount = presentChildrenDetails.length;
  
  // Calcul du nombre d'enfants partis aujourd'hui (logique copiée de Planning.tsx)
  const departedChildrenCount = useMemo(() => {
    const departedIds = new Set<string>();
    children.forEach(child => {
      const childAttendanceToday = attendanceRecords.filter(
        att => att.childId === child.id && att.date === todayString
      );
      if (childAttendanceToday.length > 0) {
        childAttendanceToday.sort((a: Attendance, b: Attendance) => { // Typer explicitement
          const timeA = a.arrivalTime === null ? -1 : parseTime(a.arrivalTime as string);
          const timeB = b.arrivalTime === null ? -1 : parseTime(b.arrivalTime as string);
          if (timeA === -1 && timeB === -1) return a.id.localeCompare(b.id);
          if (timeA === -1) return 1;
          if (timeB === -1) return -1;
          if (timeA !== timeB) return timeA - timeB;
          return a.id.localeCompare(b.id);
        });
        const lastRecord = childAttendanceToday[childAttendanceToday.length - 1];
        if (lastRecord.status === 'parti') { // Vérifier le statut 'parti'
          departedIds.add(child.id);
        }
      }
    });
    return departedIds.size;
  }, [children, attendanceRecords, todayString]); // Dépend de parseTime implicitement

  const expectedChildren = children.length; // Placeholder

  // Calcul simplifié du nombre d'absents : compte uniquement les enregistrements avec statut 'absent' aujourd'hui.
  const absentChildrenCount = useMemo(() => {
    return attendanceRecords.filter(
      att => att.date === todayString && att.status === 'absent'
    ).length;
  }, [attendanceRecords, todayString]); // Dépendances simplifiées


  // Note: La somme de presentCount, departedChildrenCount, absentChildrenCount peut ne pas égaler expectedChildren
  // si expectedChildren est juste children.length et ne tient pas compte des jours de présence contractuels.
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Aujourd'hui</h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">Présents</p>
              <p className="text-xl font-semibold text-green-900">{presentCount}</p> 
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Attendus</p>
              <p className="text-xl font-semibold text-yellow-900">{expectedChildren}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-500 mr-2" /> 
            <div>
              <p className="text-sm font-medium text-orange-800">Partis</p> 
              <p className="text-xl font-semibold text-orange-900">{departedChildrenCount}</p> 
            </div>
          </div>
        </div>
        
        {/* Bloc Absents */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center">
             <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
             <div>
               <p className="text-sm font-medium text-red-800">Absents</p> 
               <p className="text-xl font-semibold text-red-900">{absentChildrenCount}</p> 
             </div>
          </div>
        </div>

      </div>
      
      <h3 className="text-sm font-medium text-gray-700 mb-3">Enfants actuellement présents</h3>
      
      <div className="space-y-2">
        {presentChildrenDetails.length > 0 ? (
          presentChildrenDetails.map(child => (
            // Utiliser attendanceId pour la clé si disponible et pertinent ici, sinon child.id
            <ChildCard key={child.attendanceId || child.id} child={child} compact /> 
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">Aucun enfant présent pour le moment</p>
        )}
      </div>
      
      <div className="mt-6">
        <button className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium py-2 px-4 rounded-md border border-purple-200 transition-colors">
          Voir le planning complet
        </button>
      </div>
    </div>
  );
};

export default TodaySummary;
