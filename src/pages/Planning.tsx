import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Clock, Search, CheckCircle, LogOut, Trash2, Calendar, BarChart3 } from 'lucide-react';
import { Attendance, Child } from '../types';

const Planning: React.FC = () => {
  const { children, addAttendance, attendanceRecords, updateAttendance, deleteAttendance, loadingAttendance } = useAppContext();
  const [searchTermArrival, setSearchTermArrival] = useState('');
  const [searchTermDeparture, setSearchTermDeparture] = useState('');
  const [selectedChildArrival, setSelectedChildArrival] = useState<string | null>(null);
  const [selectedChildDeparture, setSelectedChildDeparture] = useState<string | null>(null);
  const [selectedChildAbsence, setSelectedChildAbsence] = useState<string | null>(null);
  const [searchTermAbsence, setSearchTermAbsence] = useState('');

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedChildForReport, setSelectedChildForReport] = useState<string>('all');
  const [reportData, setReportData] = useState<Attendance[]>([]);
  const [totalHours, setTotalHours] = useState<string>('0h00');

  const todayString = new Date().toISOString().split('T')[0];

  const parseTime = (timeStr?: string | null): number => {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return -1;
    const timeParts = timeStr.split(':');
    if (timeParts.length < 2 || timeParts.length > 3) return -1; 
    const [hours, minutes] = timeParts.map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        // console.warn(`Invalid time format encountered: ${timeStr}`); // Garder ce warn peut être utile
        return -1;
    }
    return hours * 60 + minutes;
  };

  const formatDuration = (totalMinutes: number): string => {
    if (totalMinutes <= 0) return '0h00';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  const presentChildrenDetails = useMemo(() => {
    const presentMap = new Map<string, Child & { attendanceId: string; arrivalTime?: string }>();
    const sortedAttendanceToday = [...attendanceRecords]
      .filter(att => att.date === todayString)
      .sort((a: Attendance, b: Attendance) => { 
      const timeA = parseTime(a.arrivalTime); 
      const timeB = parseTime(b.arrivalTime);
      if (timeA === -1 && timeB === -1) return a.id.localeCompare(b.id);
          if (timeA === -1) return 1; 
          if (timeB === -1) return -1;
          if (timeA !== timeB) return timeA - timeB;
          return a.id.localeCompare(b.id); 
      });
    sortedAttendanceToday.forEach(att => {
      if (att.status === 'présent') { 
        const childDetail = children.find(c => c.id === att.childId);
        if (childDetail) {
          if (!att.departureTime || att.departureTime === "00:00:00") { 
            presentMap.set(att.childId, { ...childDetail, attendanceId: att.id, arrivalTime: att.arrivalTime === null ? undefined : att.arrivalTime });
          } else {
            presentMap.delete(att.childId); 
          }
        }
      } 
      else {
         presentMap.delete(att.childId);
      }
    });
    return Array.from(presentMap.values());
  }, [attendanceRecords, children, todayString]);

  const departedChildrenCount = useMemo(() => {
    const departedIds = new Set<string>();
    children.forEach(child => {
      const childAttendanceToday = attendanceRecords.filter(
        att => att.childId === child.id && att.date === todayString
      );
      if (childAttendanceToday.length > 0) {
        childAttendanceToday.sort((a: Attendance, b: Attendance) => { 
          const timeA = parseTime(a.arrivalTime);
          const timeB = parseTime(b.arrivalTime);
          if (timeA === -1 && timeB === -1) return a.id.localeCompare(b.id);
          if (timeA === -1) return 1;
          if (timeB === -1) return -1;
          if (timeA !== timeB) return timeA - timeB;
          return a.id.localeCompare(b.id);
        });
        const lastRecord = childAttendanceToday[childAttendanceToday.length - 1];
        if (lastRecord.status === 'parti') {
          departedIds.add(child.id);
        }
      }
    });
    return departedIds.size;
  }, [children, attendanceRecords, todayString]);

  const absentChildrenCount = useMemo(() => {
    return attendanceRecords.filter(
      att => att.date === todayString && att.status === 'absent'
    ).length;
  }, [attendanceRecords, todayString]);

  const filteredChildrenForArrival = useMemo(() => {
    return children
      .filter(child => {
        const childAttendanceToday = attendanceRecords.filter(
          att => att.childId === child.id && att.date === todayString
        );
        if (childAttendanceToday.length === 0) return true;
         childAttendanceToday.sort((a: Attendance, b: Attendance) => { 
          const timeA = parseTime(a.arrivalTime);
          const timeB = parseTime(b.arrivalTime);
          if (timeA === -1 && timeB === -1) return a.id.localeCompare(b.id);
          if (timeA === -1) return 1;
          if (timeB === -1) return -1;
          if (timeA !== timeB) return timeA - timeB;
          return a.id.localeCompare(b.id);
        });
        const lastRecord = childAttendanceToday[childAttendanceToday.length - 1];
        return lastRecord.status !== 'présent' || (lastRecord.departureTime && lastRecord.departureTime !== "00:00:00"); 
      })
      .filter(child => {
        const fullName = `${child.firstName} ${child.lastName}`.toLowerCase();
        return fullName.includes(searchTermArrival.toLowerCase());
      });
  }, [children, attendanceRecords, todayString, searchTermArrival]); 

  const filteredChildrenForAbsence = useMemo(() => {
    const childrenWithRecordToday = new Set(
      attendanceRecords
        .filter(att => att.date === todayString)
        .map(att => att.childId)
    );
    return children
      .filter(child => !childrenWithRecordToday.has(child.id)) 
      .filter(child => {
        const fullName = `${child.firstName} ${child.lastName}`.toLowerCase();
        return fullName.includes(searchTermAbsence.toLowerCase());
      });
  }, [children, attendanceRecords, todayString, searchTermAbsence]);

  const filteredChildrenForDeparture = useMemo(() => {
    return presentChildrenDetails.filter(child => {
      const fullName = `${child.firstName} ${child.lastName}`.toLowerCase();
      return fullName.includes(searchTermDeparture.toLowerCase());
    });
  }, [presentChildrenDetails, searchTermDeparture]); 

  const childrenTodayDetails = useMemo(() => {
    return attendanceRecords
      .filter(att => att.date === todayString)
      .sort((a: Attendance, b: Attendance) => { 
        const timeA = parseTime(a.arrivalTime);
        const timeB = parseTime(b.arrivalTime);
        if (timeA === -1 && timeB === -1) return a.id.localeCompare(b.id);
        if (timeA === -1) return 1;
        if (timeB === -1) return -1;
        if (timeA !== timeB) return timeA - timeB;
        return a.id.localeCompare(b.id);
      })
      .map(att => {
        const childDetail = children.find(c => c.id === att.childId);
        if (!childDetail) return null;
        return {
          childId: childDetail.id, 
          firstName: childDetail.firstName,
          lastName: childDetail.lastName,
          attendanceRecordId: att.id, 
          arrivalTime: att.arrivalTime,
          departureTime: att.departureTime,
          status: att.status,
        };
      })
      .filter(Boolean) as ({ 
        childId: string; 
        firstName: string; 
        lastName: string; 
        attendanceRecordId: string; 
        arrivalTime?: string | null; 
        departureTime?: string | null; 
        status: Attendance['status'] 
      })[];
  }, [attendanceRecords, children, todayString]); 

  const handleArrival = async (childId: string) => {
    setSelectedChildArrival(childId); 
    const now = new Date();
    const newId = crypto.randomUUID(); 
    const attendanceData: Attendance = { 
      id: newId, 
      childId,
      date: now.toISOString().split('T')[0],
      arrivalTime: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'présent' as const,
      departureTime: ""
    };
    try {
      await addAttendance(attendanceData);
      setTimeout(() => setSelectedChildArrival(null), 2000);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'arrivée:", error);
      setSelectedChildArrival(null);
    }
  };

  const handleDeparture = async (childId: string, attendanceId: string) => {
    const now = new Date();
    const departureTimeValue = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const attendanceUpdateData: Partial<Omit<Attendance, 'id' | 'childId' | 'date'>> = {
      departureTime: departureTimeValue,
      status: 'parti',
    };
    try {
      await updateAttendance(attendanceId, attendanceUpdateData);
      setSelectedChildDeparture(childId);
      setTimeout(() => setSelectedChildDeparture(null), 2000);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du départ:", error);
      setSelectedChildDeparture(null);
    }
  };

  const handleDeclareAbsence = async (childId: string) => {
    setSelectedChildAbsence(childId); 
    const newId = crypto.randomUUID(); 
    const absenceData: Attendance = { 
      id: newId, 
      childId,
      date: todayString, 
      status: 'absent', 
      arrivalTime: "", 
      departureTime: "", 
    };
    try {
      await addAttendance(absenceData);
      setTimeout(() => setSelectedChildAbsence(null), 2000);
    } catch (error) {
      console.error("Erreur lors de la déclaration d'absence:", error);
       setTimeout(() => setSelectedChildAbsence(null), 2000);
    }
  };

  const handleDeleteAttendance = async (attendanceId: string) => { 
    try {
      await deleteAttendance(attendanceId);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'enregistrement:", error);
    }
  };

  useEffect(() => {
    if (loadingAttendance) {
      return;
    }

    const targetDate = new Date(selectedDate);
    let startDateObj: Date;
    let endDateObj: Date;

    if (viewMode === 'day') {
      startDateObj = new Date(targetDate); 
      startDateObj.setUTCHours(0, 0, 0, 0); 
      endDateObj = new Date(targetDate);
      endDateObj.setUTCHours(23, 59, 59, 999);
    } else if (viewMode === 'week') {
      const dayOfWeek = targetDate.getUTCDay(); 
      const diffToMonday = targetDate.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDateObj = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), diffToMonday));
      endDateObj = new Date(Date.UTC(startDateObj.getUTCFullYear(), startDateObj.getUTCMonth(), startDateObj.getUTCDate() + 6));
      endDateObj.setUTCHours(23,59,59,999);
    } else { // month
      startDateObj = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), 1));
      endDateObj = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth() + 1, 0));
      endDateObj.setUTCHours(23,59,59,999);
    }

    const startDateStr = startDateObj.toISOString().split('T')[0];
    const endDateStr = endDateObj.toISOString().split('T')[0];

    const filteredRecords = attendanceRecords.filter(att => {
      const recordDateStr = att.date; 
      const childMatch = selectedChildForReport === 'all' || att.childId === selectedChildForReport;
      return childMatch && recordDateStr >= startDateStr && recordDateStr <= endDateStr;
    });
  
  filteredRecords.sort((a, b) => {
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    const childA = children.find(c => c.id === a.childId);
    const childB = children.find(c => c.id === b.childId);
    if (childA && childB) {
      return `${childA.firstName} ${childA.lastName}`.localeCompare(`${childB.firstName} ${childB.lastName}`);
    }
    return 0;
  });
  
  setReportData(filteredRecords);

  let currentTotalMinutes = 0;
  filteredRecords.forEach(att => {
    if (att.arrivalTime && att.departureTime) { // Condition modifiée
      const arrival = parseTime(att.arrivalTime);
      const departure = parseTime(att.departureTime);
      if (arrival !== -1 && departure !== -1 && departure > arrival) {
        currentTotalMinutes += (departure - arrival);
      }
    }
  });
    setTotalHours(formatDuration(currentTotalMinutes));
  }, [viewMode, selectedDate, selectedChildForReport, attendanceRecords, children, loadingAttendance]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Pointer une arrivée</h2>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un enfant pour l'arrivée..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={searchTermArrival}
                  onChange={(e) => setSearchTermArrival(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredChildrenForArrival.length > 0 ? filteredChildrenForArrival.map((child) => (
                <button
                  key={`arrival-${child.id}`}
                  onClick={() => handleArrival(child.id)}
                  className={`flex items-center p-4 rounded-lg border transition-all ${
                    selectedChildArrival === child.id
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex-shrink-0 mr-4">
                    {child.photo ? (
                      <img src={child.photo} alt={`${child.firstName} ${child.lastName}`} className="h-12 w-12 rounded-full object-cover"/>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-medium">{child.firstName[0]}{child.lastName[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-medium text-gray-900">{child.firstName} ${child.lastName}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(child.birthDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  {selectedChildArrival === child.id && <CheckCircle className="h-6 w-6 text-green-500 ml-4" />}
                </button>
              )) : <p className="text-sm text-gray-500 col-span-full">Tous les enfants sont arrivés ou aucun enfant ne correspond à la recherche.</p>}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Pointer un départ</h2>
              <LogOut className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un enfant pour le départ..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={searchTermDeparture}
                  onChange={(e) => setSearchTermDeparture(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredChildrenForDeparture.length > 0 ? filteredChildrenForDeparture.map((child) => (
                <button
                  key={`departure-${child.attendanceId}`} 
                  onClick={() => handleDeparture(child.id, child.attendanceId)}
                  className={`flex items-center p-4 rounded-lg border transition-all ${
                    selectedChildDeparture === child.id 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50'
                  }`}
                >
                   <div className="flex-shrink-0 mr-4">
                    {child.photo ? (
                      <img src={child.photo} alt={`${child.firstName} ${child.lastName}`} className="h-12 w-12 rounded-full object-cover"/>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-600 font-medium">{child.firstName[0]}{child.lastName[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-medium text-gray-900">{child.firstName} {child.lastName}</h3>
                    <p className="text-sm text-gray-500">
                      Arrivé(e) à: {child.arrivalTime}
                    </p>
                  </div>
                  {selectedChildDeparture === child.id && <CheckCircle className="h-6 w-6 text-orange-500 ml-4" />}
                </button>
              )) : <p className="text-sm text-gray-500 col-span-full">Aucun enfant présent à pointer pour le départ.</p>}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Déclarer une absence</h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>
            </div>
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un enfant à déclarer absent..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={searchTermAbsence}
                  onChange={(e) => setSearchTermAbsence(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredChildrenForAbsence.length > 0 ? filteredChildrenForAbsence.map((child) => (
                <button
                  key={`absence-${child.id}`} 
                  onClick={() => handleDeclareAbsence(child.id)}
                  className={`flex items-center p-4 rounded-lg border transition-all ${
                    selectedChildAbsence === child.id 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-white border-gray-200 hover:border-red-200 hover:bg-red-50'
                  }`}
                >
                   <div className="flex-shrink-0 mr-4">
                    {child.photo ? (
                      <img src={child.photo} alt={`${child.firstName} ${child.lastName}`} className="h-12 w-12 rounded-full object-cover"/>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 font-medium">{child.firstName[0]}{child.lastName[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-medium text-gray-900">{child.firstName} {child.lastName}</h3>
                    <p className="text-sm text-gray-500">
                       {new Date(child.birthDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  {selectedChildAbsence === child.id && <CheckCircle className="h-6 w-6 text-red-500 ml-4" />}
                </button>
              )) : <p className="text-sm text-gray-500 col-span-full">Aucun enfant à déclarer absent ou tous ont déjà un enregistrement aujourd'hui.</p>}
            </div>
          </div>

        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité du jour</h2>
            {childrenTodayDetails.length > 0 ? (
              <div className="space-y-3">
                {childrenTodayDetails.map((activityEntry) => (
                  <div key={`today-${activityEntry.attendanceRecordId}`} className="p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-800">{activityEntry.firstName} {activityEntry.lastName}</h4>
                    <p className="text-xs text-gray-600">
                      Arrivée: {activityEntry.arrivalTime === "00:00:00" && activityEntry.status === 'absent' ? 'N/A' : activityEntry.arrivalTime || 'N/A'}
                      {activityEntry.departureTime && activityEntry.departureTime !== "00:00:00" && activityEntry.status !== 'absent' && ` - Départ: ${activityEntry.departureTime}`}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">Statut: {activityEntry.status}</p>
                      <button
                        onClick={() => handleDeleteAttendance(activityEntry.attendanceRecordId)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Supprimer cet enregistrement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucune activité enregistrée pour aujourd'hui.</p>
            )}
            <hr className="my-4"/>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Enfants actuellement présents</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {presentChildrenDetails.length}
                </span>
              </div>
               <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Enfants partis aujourd'hui</span>
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  {departedChildrenCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Enfants absents aujourd'hui</span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  {absentChildrenCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total enfants attendus (selon contrats)</span>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  {children.length} 
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Horaires habituels (Contrats)</h2>
            {children.map((child) => (
              <div key={`contract-${child.id}`} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{child.firstName} {child.lastName}</span>
                <span className="text-gray-900 font-medium">8:30 - 17:30</span> 
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section de visualisation des présences */}
      <div className="mt-12 pt-6 border-t">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 sm:mb-0 flex items-center">
            <BarChart3 size={24} className="mr-3 text-purple-600" />
            Visualisation des Présences
          </h2>
          <div className="flex items-center space-x-2">
            <select value={viewMode} onChange={(e) => setViewMode(e.target.value as 'day' | 'week' | 'month')} className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
              <option value="day">Jour</option>
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
            </select>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="childReportSelect" className="block text-sm font-medium text-gray-700 mb-1">Filtrer par enfant :</label>
          <select 
            id="childReportSelect" 
            value={selectedChildForReport} 
            onChange={(e) => setSelectedChildForReport(e.target.value)}
            className="w-full sm:w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">Tous les enfants</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.firstName} {child.lastName}</option>
            ))}
          </select>
        </div>

        {loadingAttendance ? (
          <p className="text-gray-500 text-center py-8">Chargement des données de présence...</p>
        ) : reportData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune donnée de présence pour la sélection actuelle.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enfant</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrivée</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Départ</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map(att => {
                  const child = children.find(c => c.id === att.childId);
                  let durationMinutes = 0;
                  if (att.arrivalTime && att.departureTime) { // Condition modifiée
                    const arrival = parseTime(att.arrivalTime);
                    const departure = parseTime(att.departureTime);
                    if (arrival !== -1 && departure !== -1 && departure > arrival) {
                      durationMinutes = departure - arrival;
                    }
                  }
                  return (
                    <tr key={att.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(att.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{child ? `${child.firstName} ${child.lastName}` : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{att.arrivalTime === "00:00:00" && att.status !== 'présent' ? '-' : att.arrivalTime || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{att.departureTime === "00:00:00" && att.status !== 'présent' ? '-' : att.departureTime || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{att.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDuration(durationMinutes)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg shadow text-right">
          <span className="text-lg font-semibold text-purple-700">Total des heures pour la sélection : {totalHours}</span>
        </div>
      </div>
    </div>
  );
};

export default Planning;
