import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Calendar, Coffee, Moon, Sun, Star, Clock } from 'lucide-react';

const ActivityFeed: React.FC = () => {
  const { dailyRecords } = useAppContext();
  
  // Sort records by date, newest first
  const sortedRecords = [...dailyRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Format a date string to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const isToday = new Date().toDateString() === date.toDateString();
    
    if (isToday) {
      return "Aujourd'hui";
    }
    
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric',
      month: 'long'
    });
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return <Coffee className="w-5 h-5 text-amber-500" />;
      case 'nap':
        return <Moon className="w-5 h-5 text-blue-500" />;
      case 'morning':
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'activity':
        return <Star className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const activities = sortedRecords.map(record => {
    const childName = `${record.childId === '1' ? 'Emma' : 'Lucas'}`; // In real app, get from child object
    
    // Create multiple activity entries from a single record
    const entryList = [];
    
    // Add meals
    if (record.meals.lunch) {
      entryList.push({
        id: `${record.id}-lunch`,
        childId: record.childId,
        childName,
        date: record.date,
        time: record.meals.lunch.time,
        type: 'meal',
        description: `Repas: ${record.meals.lunch.description} (${record.meals.lunch.eaten === 'well' ? 'Bien mangé' : record.meals.lunch.eaten === 'average' ? 'Moyennement mangé' : 'Peu mangé'})`
      });
    }
    
    // Add naps
    record.naps.forEach((nap, index) => {
      entryList.push({
        id: `${record.id}-nap-${index}`,
        childId: record.childId,
        childName,
        date: record.date,
        time: `${nap.startTime} - ${nap.endTime}`,
        type: 'nap',
        description: `Sieste: ${nap.quality === 'good' ? 'Bonne' : nap.quality === 'average' ? 'Moyenne' : 'Agitée'}`
      });
    });
    
    // Add activities
    entryList.push({
      id: `${record.id}-activities`,
      childId: record.childId,
      childName,
      date: record.date,
      time: '10:00',
      type: 'activity',
      description: `Activités: ${record.activities.join(', ')}`
    });
    
    return entryList;
  }).flat();
  
  // Group activities by date
  const groupedActivities: Record<string, typeof activities> = {};
  activities.forEach(activity => {
    const date = activity.date;
    if (!groupedActivities[date]) {
      groupedActivities[date] = [];
    }
    groupedActivities[date].push(activity);
  });
  
  // Sort by time within each day
  Object.keys(groupedActivities).forEach(date => {
    groupedActivities[date].sort((a, b) => {
      const timeA = a.time.split(' - ')[0] || a.time;
      const timeB = b.time.split(' - ')[0] || b.time;
      return timeA.localeCompare(timeB);
    });
  });
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Activités récentes</h2>
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-8">
        {Object.keys(groupedActivities)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
          .map(date => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                {formatDate(date)}
              </h3>
              
              <ul className="space-y-4">
                {groupedActivities[date].map(activity => (
                  <li key={activity.id} className="flex">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{activity.childName}</span>
                        <span className="text-gray-500 ml-2 text-xs">{activity.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
      
      <div className="mt-6">
        <button className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium py-2 px-4 rounded-md border border-purple-200 transition-colors">
          Voir toutes les activités
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;