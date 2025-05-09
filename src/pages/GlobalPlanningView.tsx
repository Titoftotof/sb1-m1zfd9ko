import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Contract, Child, PlannedDay } from '../types';
import { CalendarDays } from 'lucide-react';

const GlobalPlanningView: React.FC = () => {
  const { contracts, children, loadingContracts, loadingChildren } = useAppContext();
  const [calendarDate, setCalendarDate] = useState(new Date());

  const getChildName = (childId: string): string => {
    const child = children.find(c => c.id === childId);
    return child ? `${child.firstName} ${child.lastName}` : 'N/A';
  };

  const plannedEventsByDate = useMemo(() => {
    const events = new Map<string, { childName: string; startTime?: string; endTime?: string }[]>();
    if (loadingContracts || loadingChildren) return events;

    contracts.forEach(contract => {
      if (contract.status === 'active' && contract.monthlySchedule) {
        contract.monthlySchedule.forEach(plannedDay => {
          if (plannedDay.status === 'planned') {
            const existingEntries = events.get(plannedDay.date) || [];
            existingEntries.push({
              childName: getChildName(contract.childId),
              startTime: plannedDay.startTime,
              endTime: plannedDay.endTime,
            });
            events.set(plannedDay.date, existingEntries);
          }
        });
      }
    });
    return events;
  }, [contracts, children, loadingContracts, loadingChildren]);

  const renderCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // Lundi = 0

    const days = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="border p-2 min-h-[100px] bg-gray-50"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateString = currentDate.toISOString().split('T')[0];
      const dayEvents = plannedEventsByDate.get(dateString) || [];

      days.push(
        <div 
          key={dateString} 
          className="border p-2 min-h-[120px] flex flex-col"
        >
          <span className="font-medium self-start mb-1">{day}</span>
          <div className="space-y-1 overflow-y-auto text-xs">
            {dayEvents.map((event, index) => (
              <div key={index} className="bg-purple-100 p-1 rounded text-purple-700">
                <strong>{event.childName}</strong>: {event.startTime}-{event.endTime}
              </div>
            ))}
            {dayEvents.length === 0 && <div className="text-gray-400 text-center mt-4"></div>}
          </div>
        </div>
      );
    }
    return days;
  };

  if (loadingContracts || loadingChildren) {
    return <div className="p-6 text-center">Chargement des données du planning...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <CalendarDays size={28} className="mr-3 text-purple-600" />
          Planning Global Mensuel
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            type="button" 
            onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors border"
          >
            Précédent
          </button>
          <h2 className="text-xl font-semibold text-gray-700">
            {calendarDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
          </h2>
          <button 
            type="button" 
            onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors border"
          >
            Suivant
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px border-l border-t bg-gray-200">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(dayName => (
            <div key={dayName} className="text-center font-semibold py-2 bg-gray-100 border-r border-b text-sm text-gray-600">{dayName}</div>
          ))}
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
};

export default GlobalPlanningView;
