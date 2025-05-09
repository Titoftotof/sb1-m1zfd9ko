import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Contract, RegularScheduleEntry, PlannedDay } from '../types';
import { PlusCircle, Edit, Trash2, FileText, X, Save, CalendarDays } from 'lucide-react';

const initialContractFormState: Partial<Omit<Contract, 'id'>> = {
  childId: '',
  startDate: new Date().toISOString().split('T')[0], // Date d'aujourd'hui par défaut
  endDate: '',
  type: 'CDI',
  hoursPerWeek: 0,
  hourlyRate: 0,
  maintenanceAllowance: 0,
  mealsProvided: false,
  mealAllowance: 0,
  documentsUrl: [],
  status: 'pending',
  notes: '',
  regularSchedule: [],
  monthlySchedule: [], // Initialiser monthlySchedule
};

const Contracts: React.FC = () => {
  const { contracts, children, addContract, updateContract, loadingChildren, loadingContracts, deleteContract } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContract, setCurrentContract] = useState<Partial<Omit<Contract, 'id'> & { id?: string }>>(initialContractFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date()); // Date pour la navigation du calendrier

  // Helper pour obtenir le nom de l'enfant
  const getChildName = (childId: string): string => {
    const child = children.find(c => c.id === childId);
    return child ? `${child.firstName} ${child.lastName}` : 'Enfant inconnu';
  };

  // Helper pour formater les jours de la semaine
  const formatDayOfWeek = (day: number): string => {
    return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][day] || '';
  };

  const daysOfWeekOptions = [
    { value: 1, label: 'Lundi' }, { value: 2, label: 'Mardi' }, { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' }, { value: 5, label: 'Vendredi' }, { value: 6, label: 'Samedi' },
    { value: 0, label: 'Dimanche' },
  ];

  const handleOpenModal = (contract?: Contract) => {
    if (contract) {
      setCurrentContract({ ...contract });
      setIsEditing(true);
    } else {
      setCurrentContract(initialContractFormState);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentContract(initialContractFormState);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }
    
    setCurrentContract(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleScheduleChange = (index: number, field: keyof RegularScheduleEntry, value: string | number) => {
    const updatedSchedule = [...(currentContract.regularSchedule || [])];
    if (field === 'dayOfWeek') {
      updatedSchedule[index] = { ...updatedSchedule[index], [field]: Number(value) };
    } else {
      updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    }
    setCurrentContract(prev => ({ ...prev, regularSchedule: updatedSchedule }));
  };

  const addScheduleEntry = () => {
    const newEntry: RegularScheduleEntry = { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' };
    setCurrentContract(prev => ({
      ...prev,
      regularSchedule: [...(prev.regularSchedule || []), newEntry]
    }));
  };

  const removeScheduleEntry = (index: number) => {
    setCurrentContract(prev => ({
      ...prev,
      regularSchedule: prev.regularSchedule?.filter((_, i) => i !== index)
    }));
  };

  const handleDayClick = (clickedDate: Date) => {
    if (!currentContract.childId) {
      alert("Veuillez d'abord sélectionner un enfant pour ce contrat.");
      return;
    }
    const dateString = clickedDate.toISOString().split('T')[0];
    const existingEntryIndex = currentContract.monthlySchedule?.findIndex(entry => entry.date === dateString);

    if (existingEntryIndex !== undefined && existingEntryIndex !== -1) {
      // Jour déjà planifié, on le supprime
      const updatedSchedule = currentContract.monthlySchedule?.filter(entry => entry.date !== dateString);
      setCurrentContract(prev => ({ ...prev, monthlySchedule: updatedSchedule }));
    } else {
      // Jour non planifié, on l'ajoute
      let startTimeToUse = '09:00';
      let endTimeToUse = '17:00';
      
      const dayOfWeek = clickedDate.getDay(); // 0 (Dimanche) à 6 (Samedi)
      const regularEntryForDay = currentContract.regularSchedule?.find(entry => entry.dayOfWeek === dayOfWeek);

      if (regularEntryForDay) {
        startTimeToUse = regularEntryForDay.startTime;
        endTimeToUse = regularEntryForDay.endTime;
      }

      const newEntry: PlannedDay = { date: dateString, startTime: startTimeToUse, endTime: endTimeToUse, status: 'planned' };
      setCurrentContract(prev => ({ ...prev, monthlySchedule: [...(prev.monthlySchedule || []), newEntry] }));
    }
  };
  
  const renderCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Dim) - 6 (Sam), ajuster pour Lundi = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Ajustement pour que Lundi soit le premier jour de la semaine (0) et Dimanche (6)
    const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    const days = [];
    // Espaces vides pour les jours avant le premier du mois
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="border p-2 h-20"></div>);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateString = currentDate.toISOString().split('T')[0];
      const plannedEntry = currentContract.monthlySchedule?.find(entry => entry.date === dateString);
      
      let bgColor = 'bg-white hover:bg-gray-100';
      let textColor = 'text-gray-700';
      let content = null;

      if (plannedEntry) {
        if (plannedEntry.status === 'planned') {
          bgColor = 'bg-purple-200 hover:bg-purple-300';
          textColor = 'text-purple-800';
          content = <div className="text-xs mt-1">{plannedEntry.startTime} - {plannedEntry.endTime}</div>;
        } else if (plannedEntry.status === 'absent_planned') {
          bgColor = 'bg-red-200 hover:bg-red-300';
          textColor = 'text-red-800';
          content = <div className="text-xs mt-1">Absent</div>;
        } else if (plannedEntry.status === 'holiday_planned') {
          bgColor = 'bg-blue-200 hover:bg-blue-300';
          textColor = 'text-blue-800';
          content = <div className="text-xs mt-1">Férié</div>;
        }
      }

      days.push(
        <div 
          key={day} 
          className={`border p-2 h-20 cursor-pointer flex flex-col justify-start items-start ${bgColor} ${textColor} transition-colors`}
          onClick={() => handleDayClick(currentDate)}
        >
          <span className="font-medium">{day}</span>
          {content}
        </div>
      );
    }
    return days;
  };

  const handleDelete = async (contractId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contrat ?")) {
      try {
        await deleteContract(contractId);
        // Optionnel: afficher une notification de succès
      } catch (error) {
        console.error("Erreur lors de la suppression du contrat:", error);
        // Optionnel: afficher une notification d'erreur
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContract.childId) {
      alert("Veuillez sélectionner un enfant.");
      return;
    }
    // Assurer que les champs numériques optionnels qui sont vides sont bien undefined ou une valeur par défaut appropriée
    const contractToSave = {
      ...currentContract,
      mealAllowance: currentContract.mealsProvided ? (currentContract.mealAllowance || 0) : undefined,
      endDate: currentContract.endDate || undefined, // Si vide, alors undefined
      // Générer un ID si c'est un nouveau contrat et que addContract ne le fait pas
    };

    if (isEditing && currentContract.id) {
      updateContract(currentContract.id, contractToSave as Partial<Contract>);
    } else {
      // Pour un nouveau contrat, il faut un ID. Soit le générer ici, soit s'attendre à ce que addContract le fasse.
      // Pour l'instant, on suppose que addContract gère la création d'ID si nécessaire ou que la structure l'attend.
      // Si addContract attend un objet Contract complet (avec id), il faudra le générer.
      // Exemple simple de génération d'ID (à remplacer par une meilleure méthode si besoin)
      const newContractWithId = { ...contractToSave, id: currentContract.id || Date.now().toString() } as Contract;
      addContract(newContractWithId);
    }
    handleCloseModal();
  };


  if (loadingChildren || loadingContracts) { // Modifié pour inclure loadingContracts
    return <div className="p-6 text-center">Chargement des données...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contrats</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          Ajouter un contrat
        </button>
      </div>

      {/* Liste des contrats */}
      {/* {console.log("Contracts.tsx: Rendering contracts. Children data:", children, "Contracts data:", contracts)} */}
      {contracts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun contrat pour le moment.</p>
          <p className="text-sm text-gray-400 mt-1">Cliquez sur "Ajouter un contrat" pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {contracts.map((contract) => (
            <div key={contract.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-purple-700">{getChildName(contract.childId)}</h2>
                    <p className="text-sm text-gray-500">
                      Du {new Date(contract.startDate).toLocaleDateString('fr-FR')} 
                      {contract.endDate ? ` au ${new Date(contract.endDate).toLocaleDateString('fr-FR')}` : ' (Durée indéterminée)'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    contract.status === 'active' ? 'bg-green-100 text-green-700' :
                    contract.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {contract.status === 'active' ? 'Actif' : contract.status === 'pending' ? 'En attente' : 'Inactif'}
                  </span>
                </div>
              </div>
              
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                <div><strong className="text-gray-600">Type:</strong> <span className="text-gray-800">{contract.type}</span></div>
                {contract.hoursPerWeek != null && <div><strong className="text-gray-600">Heures/semaine:</strong> <span className="text-gray-800">{contract.hoursPerWeek}h</span></div>}
                <div><strong className="text-gray-600">Taux Horaire:</strong> <span className="text-gray-800">{contract.hourlyRate?.toFixed(2)} €</span></div>
                <div><strong className="text-gray-600">Indemnité Entretien:</strong> <span className="text-gray-800">{contract.maintenanceAllowance?.toFixed(2)} €</span></div>
                <div><strong className="text-gray-600">Repas Fournis:</strong> <span className="text-gray-800">{contract.mealsProvided ? 'Oui' : 'Non'}</span></div>
                {contract.mealsProvided && contract.mealAllowance != null && ( // Vérifier la non-nullité
                  <div><strong className="text-gray-600">Indemnité Repas:</strong> <span className="text-gray-800">{contract.mealAllowance?.toFixed(2)} €</span></div>
                )}
                <div className="md:col-span-2 lg:col-span-3">
                  <strong className="text-gray-600 block mb-1">Horaires Habituels:</strong>
                  {contract.regularSchedule && contract.regularSchedule.length > 0 ? (
                    <div className="space-y-1">
                      {contract.regularSchedule.map(schedule => (
                        <div key={schedule.dayOfWeek} className="flex items-center bg-gray-50 p-2 rounded">
                          <span className="font-medium w-12">{formatDayOfWeek(schedule.dayOfWeek)}:</span>
                          <span className="text-gray-700">{schedule.startTime} - {schedule.endTime}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Non spécifiés</p>
                  )}
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <strong className="text-gray-600 block mb-1">Planning Mensuel Détaillé:</strong>
                  {contract.monthlySchedule && contract.monthlySchedule.length > 0 ? (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {contract.monthlySchedule
                        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map(plannedDay => (
                        <div key={plannedDay.date} className="flex items-center bg-gray-50 p-2 rounded text-xs">
                          <span className="font-medium w-24">{new Date(plannedDay.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}:</span>
                          {plannedDay.status === 'planned' && plannedDay.startTime && plannedDay.endTime && (
                            <span className="text-gray-700">{plannedDay.startTime} - {plannedDay.endTime}</span>
                          )}
                          {plannedDay.status === 'absent_planned' && <span className="text-red-600">Absent prévu</span>}
                          {plannedDay.status === 'holiday_planned' && <span className="text-blue-600">Férié/Congé</span>}
                          {plannedDay.notes && <span className="text-gray-500 ml-2 italic">({plannedDay.notes})</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Aucun planning mensuel détaillé</p>
                  )}
                </div>
                {contract.notes && (
                  <div className="md:col-span-2 lg:col-span-3"><strong className="text-gray-600">Notes:</strong> <p className="text-gray-700 whitespace-pre-wrap">{contract.notes}</p></div>
                )}
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button 
                  onClick={() => handleOpenModal(contract)}
                  className="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center"
                >
                  <Edit size={16} className="mr-1" /> Modifier
                </button>
                <button 
                  onClick={() => handleDelete(contract.id)}
                  className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center"
                >
                  <Trash2 size={16} className="mr-1" /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'édition/ajout */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">{isEditing ? 'Modifier le contrat' : 'Ajouter un contrat'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              {/* Champs du formulaire */}
              <div>
                <label htmlFor="childId" className="block text-sm font-medium text-gray-700">Enfant</label>
                <select name="childId" id="childId" value={currentContract.childId || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm">
                  <option value="" disabled>Sélectionner un enfant</option>
                  {children.map(child => <option key={child.id} value={child.id}>{child.firstName} {child.lastName}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Date de début</label>
                  <input type="date" name="startDate" id="startDate" value={currentContract.startDate || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Date de fin (optionnel)</label>
                  <input type="date" name="endDate" id="endDate" value={currentContract.endDate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type de contrat</label>
                  <select name="type" id="type" value={currentContract.type || 'CDI'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm">
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut</label>
                  <select name="status" id="status" value={currentContract.status || 'pending'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm">
                    <option value="pending">En attente</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">Taux horaire (€)</label>
                  <input type="number" name="hourlyRate" id="hourlyRate" value={currentContract.hourlyRate || ''} onChange={handleChange} step="0.01" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-gray-700">Heures par semaine (indicatif)</label>
                  <input type="number" name="hoursPerWeek" id="hoursPerWeek" value={currentContract.hoursPerWeek || ''} onChange={handleChange} step="0.1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label htmlFor="maintenanceAllowance" className="block text-sm font-medium text-gray-700">Indemnité d'entretien (€)</label>
                  <input type="number" name="maintenanceAllowance" id="maintenanceAllowance" value={currentContract.maintenanceAllowance || ''} onChange={handleChange} step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" />
                </div>
                <div className="flex items-center space-x-4 pt-6">
                    <input type="checkbox" name="mealsProvided" id="mealsProvided" checked={currentContract.mealsProvided || false} onChange={handleChange} className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                    <label htmlFor="mealsProvided" className="text-sm font-medium text-gray-700">Repas fournis</label>
                </div>
              </div>
              
              {currentContract.mealsProvided && (
                <div>
                  <label htmlFor="mealAllowance" className="block text-sm font-medium text-gray-700">Indemnité repas (€)</label>
                  <input type="number" name="mealAllowance" id="mealAllowance" value={currentContract.mealAllowance || ''} onChange={handleChange} step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" />
                </div>
              )}

              {/* Horaires Habituels */}
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-2">Horaires Habituels</h3>
                {currentContract.regularSchedule?.map((entry, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 items-center mb-3 p-3 border rounded-md">
                    <select value={entry.dayOfWeek} onChange={(e) => handleScheduleChange(index, 'dayOfWeek', e.target.value)} className="col-span-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm">
                      {daysOfWeekOptions.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
                    </select>
                    <input type="time" value={entry.startTime} onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)} className="col-span-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" />
                    <input type="time" value={entry.endTime} onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)} className="col-span-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" />
                    <button type="button" onClick={() => removeScheduleEntry(index)} className="col-span-1 text-red-500 hover:text-red-700 justify-self-end">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addScheduleEntry} className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center">
                  <PlusCircle size={18} className="mr-1" /> Ajouter un horaire
                </button>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea name="notes" id="notes" value={currentContract.notes || ''} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"></textarea>
              </div>

              {/* Planning Mensuel Détaillé */}
              <div className="border-t pt-6">
                <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                  <CalendarDays size={20} className="mr-2 text-purple-600" />
                  Planning Mensuel Détaillé
                </h3>
                {/* Navigation Calendrier */}
                <div className="flex items-center justify-between mb-4">
                  <button 
                    type="button" 
                    onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="p-2 rounded-md hover:bg-gray-200"
                  >
                    Précédent
                  </button>
                  <h4 className="text-lg font-medium">
                    {calendarDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="p-2 rounded-md hover:bg-gray-200"
                  >
                    Suivant
                  </button>
                </div>

                {/* Grille Calendrier */}
                <div className="grid grid-cols-7 gap-px border bg-gray-200">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="text-center font-medium py-2 bg-gray-100 text-sm">{day}</div>
                  ))}
                  {renderCalendarDays()}
                </div>
                <p className="text-xs text-gray-500 mt-2">Cliquez sur un jour pour l'ajouter/le retirer du planning. Les heures par défaut sont 09:00-17:00. Pour modifier les heures ou le statut, il faudra une étape ultérieure.</p>
                 {/* TODO: Ajouter un moyen d'éditer les détails d'un PlannedDay (heures, statut, notes) */}
              </div>
              

              <div className="pt-5 flex justify-end space-x-3">
                <button type="button" onClick={handleCloseModal} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  Annuler
                </button>
                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors">
                  <Save size={18} className="mr-2" />
                  {isEditing ? 'Enregistrer les modifications' : 'Ajouter le contrat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
