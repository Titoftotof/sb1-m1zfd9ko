import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin,
  AlertCircle, 
  Heart, 
  UserCheck,
  Edit,
  Clock,
  FileText,
  MessageSquare,
  ChevronLeft,
  Upload 
} from 'lucide-react';
import { Child } from '../types';
import { supabase } from '../lib/supabaseClient'; 

// --- Fonctions Helper ---

const getMoodColor = (mood: string) => {
  switch (mood) {
    case 'happy': return 'bg-green-50 text-green-700 border border-green-200';
    case 'calm': return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'tired': return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'upset': return 'bg-red-50 text-red-700 border border-red-200';
    case 'sad': return 'bg-gray-50 text-gray-700 border border-gray-200';
    default: return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
};

const getMoodLabel = (mood: string) => {
  switch (mood) {
    case 'happy': return 'Joyeux';
    case 'calm': return 'Calme';
    case 'tired': return 'Fatigué';
    case 'upset': return 'Agité';
    case 'sad': return 'Triste';
    default: return mood;
  }
};

const getStatusColor = (status: string) => {
    switch (status) {
      case 'présent': return 'bg-green-50 text-green-700 border-green-200';
      case 'parti': return 'bg-orange-50 text-orange-700 border-orange-200'; 
      case 'absent': return 'bg-red-50 text-red-700 border-red-200';
      case 'malade': return 'bg-red-50 text-red-700 border-red-200'; 
      case 'vacances': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'férié': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
      case 'présent': return 'Présent';
      case 'parti': return 'Parti'; 
      case 'absent': return 'Absent';
      case 'malade': return 'Malade';
      case 'vacances': return 'Vacances';
      case 'férié': return 'Férié';
      default: return status;
    }
};

const calculateAge = (birthDate: string): string => {
    if (!birthDate) return 'N/A'; 
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 'Date invalide'; 

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    if (years === 0) return `${months} mois`;
    return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
};

// --- Interfaces ---
interface TabProps { child: Child; }
interface ActivitiesTabProps { records: any[]; }
interface EditFormProps {
  childData: Partial<Omit<Child, 'id'>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isSaving: boolean;
}
interface AttendancePanelProps { child: Child; attendanceRecords: any[]; } 

// --- Valeurs par défaut pour l'initialisation ---
const defaultParentInfo = {
  parent1: { firstName: '', lastName: '', phone: '', email: '', address: '' },
  // parent2: { firstName: '', lastName: '', phone: '', email: '', address: '' } // Décommenter si Parent 2 est utilisé
};

const defaultMedicalInfo = {
  allergies: [],
  medications: [],
  emergencyContacts: [],
  doctorName: '',
  doctorPhone: '',
  notes: ''
};

// --- Composant Principal ---
const ChildDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation(); // Pour lire les query params
  const { children, dailyRecords, updateChild, uploadPhoto, attendanceRecords } = useAppContext(); 
  
  const [child, setChild] = useState<Child | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>('info');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false); 

  const [editData, setEditData] = useState<Partial<Omit<Child, 'id'>>>({});
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    const currentChild = children.find((c) => c.id === id);
    setChild(currentChild);
    if (currentChild) {
      // Initialiser editData avec une copie profonde et des valeurs par défaut complètes
      setEditData({
        firstName: currentChild.firstName,
        lastName: currentChild.lastName,
        birthDate: currentChild.birthDate,
        gender: currentChild.gender,
        photo: currentChild.photo, 
        parentInfo: JSON.parse(JSON.stringify(currentChild.parentInfo || defaultParentInfo)), 
        medicalInfo: JSON.parse(JSON.stringify(currentChild.medicalInfo || defaultMedicalInfo)), 
        authorizedPickups: JSON.parse(JSON.stringify(currentChild.authorizedPickups || [])), 
      });
      setEditPhotoFile(null); 
    } else {
      // Réinitialiser si aucun enfant n'est trouvé (par exemple, après suppression ou navigation invalide)
      setEditData({});
    }
  }, [id, children]); 

  // Lire le query param 'edit' pour passer en mode édition directement
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [location.search]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('parentInfo.parent1.')) {
      const field = name.split('.').pop() as keyof Child['parentInfo']['parent1'];
      setEditData(prev => {
        const newParentInfo = JSON.parse(JSON.stringify(prev?.parentInfo || defaultParentInfo));
        if (!newParentInfo.parent1) newParentInfo.parent1 = { ...defaultParentInfo.parent1 }; // S'assurer que parent1 existe
        newParentInfo.parent1[field] = value;
        return { ...prev, parentInfo: newParentInfo };
      });
    } else if (name.startsWith('medicalInfo.')) {
       const field = name.split('.').pop() as keyof Child['medicalInfo'];
       setEditData(prev => {
         const newMedicalInfo = JSON.parse(JSON.stringify(prev?.medicalInfo || defaultMedicalInfo));
         if (field === 'allergies' || field === 'medications') {
           newMedicalInfo[field] = value.split(',').map(s => s.trim()).filter(Boolean);
         } else {
           newMedicalInfo[field] = value;
         }
         return { ...prev, medicalInfo: newMedicalInfo };
       });
    } else {
      setEditData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditPhotoFile(e.target.files ? e.target.files[0] : null);
  };

  const handleSaveChanges = async () => {
    if (!child || !editData) return;
    setIsSaving(true);
    let finalPhotoUrl = editData.photo; 
    try {
      if (editPhotoFile) {
        console.log("Uploading new photo...");
        const { data: { session } } = await supabase.auth.getSession(); 
        if (!session) {
           throw new Error("Aucune session active trouvée pour l'upload.");
        }
        const uploadedUrl = await uploadPhoto(editPhotoFile, session); 
        if (uploadedUrl) {
          finalPhotoUrl = uploadedUrl;
          console.log("New photo uploaded:", finalPhotoUrl);
        } else {
          console.warn("Photo upload failed, keeping previous photo URL if exists.");
        }
      }
      
      // S'assurer que les objets complexes ont une structure valide même si vides
      const updatedData: Partial<Omit<Child, 'id'>> = { 
         ...editData, 
         photo: finalPhotoUrl,
         parentInfo: editData.parentInfo || defaultParentInfo, 
         medicalInfo: editData.medicalInfo || defaultMedicalInfo,
         authorizedPickups: editData.authorizedPickups || []
      };
      
      console.log("Updating child with data:", updatedData);
      await updateChild(child.id, updatedData);
      console.log("Child updated successfully!");
      setIsEditing(false); 
      setEditPhotoFile(null); 
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert(`Erreur lors de la sauvegarde: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!child) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 mb-4">Enfant non trouvé ou chargement...</p>
        <Link to="/children" className="inline-flex items-center text-purple-600 hover:text-purple-800"><ChevronLeft className="w-4 h-4 mr-1" /> Retour à la liste</Link>
      </div>
    );
  }
  
  const childRecords = dailyRecords
    .filter(record => record.childId === child.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Link to="/children" className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Retour à la liste"><ChevronLeft className="w-5 h-5 text-gray-500" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? `${editData.firstName || ''} ${editData.lastName || ''}` : `${child.firstName} ${child.lastName}`}</h1>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button onClick={handleSaveChanges} disabled={isSaving} className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50">{isSaving ? 'Sauvegarde...' : 'Enregistrer'}</button>
              <button onClick={() => { setIsEditing(false); setEditData({ firstName: child.firstName, lastName: child.lastName, birthDate: child.birthDate, gender: child.gender, photo: child.photo, parentInfo: JSON.parse(JSON.stringify(child.parentInfo || defaultParentInfo)), medicalInfo: JSON.parse(JSON.stringify(child.medicalInfo || defaultMedicalInfo)), authorizedPickups: JSON.parse(JSON.stringify(child.authorizedPickups || [])) }); setEditPhotoFile(null); }} disabled={isSaving} className="flex items-center bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md transition-colors disabled:opacity-50">Annuler</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"><Edit className="w-4 h-4 mr-2" /> Modifier</button>
              <button className="flex items-center bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md transition-colors"><MessageSquare className="w-4 h-4 mr-2" /> Message</button>
            </>
          )}
        </div>
      </div>
      
      {/* En-tête Profil */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
         <div className="relative bg-purple-100 h-32">
           {(editData.medicalInfo?.allergies?.length ?? child.medicalInfo?.allergies?.length ?? 0) > 0 && ( <div className="absolute top-4 right-4 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium border border-red-200 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />Allergies</div> )}
         </div>
         <div className="px-6 pb-6">
           <div className="flex flex-col sm:flex-row -mt-16 mb-6">
             <div className="flex-shrink-0 relative"> 
               {(editData.photo || child.photo) ? ( <img src={editData.photo || child.photo} alt={`${editData.firstName || child.firstName} ${editData.lastName || child.lastName}`} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-sm" /> ) : ( <div className="w-24 h-24 rounded-full border-4 border-white bg-purple-200 flex items-center justify-center shadow-sm"><User className="w-10 h-10 text-purple-500" /></div> )}
               {isEditing && (
                  <div className="absolute bottom-0 right-0 mb-1 mr-1">
                    <label htmlFor="editPhoto" className="cursor-pointer bg-white p-1.5 rounded-full shadow border border-gray-200 hover:bg-gray-100 transition-colors">
                      <Upload size={16} className="text-purple-600"/>
                    </label>
                    <input id="editPhoto" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={isSaving}/>
                  </div>
               )}
             </div>
             <div className="mt-6 sm:mt-0 sm:ml-6">
               {editPhotoFile && isEditing && <p className="text-xs text-gray-500 mt-1 truncate" title={editPhotoFile.name}>Nouveau: {editPhotoFile.name}</p>}
               <div className="flex flex-wrap gap-3 mt-2">
                 <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"><Calendar className="w-4 h-4 mr-1 text-gray-500" />{calculateAge(editData.birthDate || child.birthDate)}</div>
                 <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"><User className="w-4 h-4 mr-1 text-gray-500" />{(editData.gender || child.gender) === 'male' ? 'Garçon' : 'Fille'}</div>
               </div>
             </div>
           </div>
           {!isEditing && ( <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-6 overflow-x-auto"><button onClick={() => setActiveTab('info')} className={`py-2 px-1 whitespace-nowrap font-medium text-sm border-b-2 ${activeTab === 'info' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Informations</button><button onClick={() => setActiveTab('medical')} className={`py-2 px-1 whitespace-nowrap font-medium text-sm border-b-2 ${activeTab === 'medical' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Santé</button><button onClick={() => setActiveTab('activities')} className={`py-2 px-1 whitespace-nowrap font-medium text-sm border-b-2 ${activeTab === 'activities' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Activités</button><button onClick={() => setActiveTab('documents')} className={`py-2 px-1 whitespace-nowrap font-medium text-sm border-b-2 ${activeTab === 'documents' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Documents</button></nav></div> )}
         </div>
       </div>
      
      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {isEditing ? ( <EditForm childData={editData} onChange={handleEditChange} isSaving={isSaving} /> ) : (
            <>
              {activeTab === 'info' && <InfoTab child={child} />}
              {activeTab === 'medical' && <MedicalTab child={child} />}
              {activeTab === 'activities' && <ActivitiesTab records={childRecords} />}
              {activeTab === 'documents' && <DocumentsTab />}
            </>
          )}
        </div>
        {!isEditing && ( <div><QuickActionsPanel /><div className="mt-6"><AttendancePanel child={child} attendanceRecords={attendanceRecords} /></div></div> )}
      </div>
    </div>
  );
};

// --- Composant Formulaire d'Édition ---
const EditForm: React.FC<EditFormProps> = ({ childData, onChange, isSaving }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informations de l'enfant</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label><input type="text" name="firstName" id="firstName" value={childData.firstName || ''} onChange={onChange} disabled={isSaving} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" /></div>
          <div><label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom</label><input type="text" name="lastName" id="lastName" value={childData.lastName || ''} onChange={onChange} disabled={isSaving} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" /></div>
          <div><label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Date de naissance</label><input type="date" name="birthDate" id="birthDate" value={childData.birthDate || ''} onChange={onChange} disabled={isSaving} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" /></div>
          <div><label htmlFor="gender" className="block text-sm font-medium text-gray-700">Genre</label><select name="gender" id="gender" value={childData.gender || ''} onChange={onChange} disabled={isSaving} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"><option value="female">Fille</option><option value="male">Garçon</option></select></div>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informations Parent 1</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div><label htmlFor="parent1FirstName" className="block text-sm font-medium text-gray-700">Prénom</label><input type="text" name="parentInfo.parent1.firstName" id="parent1FirstName" value={childData.parentInfo?.parent1?.firstName || ''} onChange={onChange} disabled={isSaving} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" /></div>
           <div><label htmlFor="parent1LastName" className="block text-sm font-medium text-gray-700">Nom</label><input type="text" name="parentInfo.parent1.lastName" id="parent1LastName" value={childData.parentInfo?.parent1?.lastName || ''} onChange={onChange} disabled={isSaving} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" /></div>
           <div><label htmlFor="parent1Phone" className="block text-sm font-medium text-gray-700">Téléphone</label><input type="tel" name="parentInfo.parent1.phone" id="parent1Phone" value={childData.parentInfo?.parent1?.phone || ''} onChange={onChange} disabled={isSaving} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" /></div>
           <div><label htmlFor="parent1Email" className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="parentInfo.parent1.email" id="parent1Email" value={childData.parentInfo?.parent1?.email || ''} onChange={onChange} disabled={isSaving} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" /></div>
           <div className="md:col-span-2"><label htmlFor="parent1Address" className="block text-sm font-medium text-gray-700">Adresse</label><textarea name="parentInfo.parent1.address" id="parent1Address" value={childData.parentInfo?.parent1?.address || ''} onChange={onChange} disabled={isSaving} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"></textarea></div>
        </div>
      </div>
       <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informations Médicales</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Allergies (séparées par virgule)</label><input type="text" name="medicalInfo.allergies" id="allergies" value={childData.medicalInfo?.allergies?.join(', ') || ''} onChange={onChange} disabled={isSaving} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" /></div>
             <div><label htmlFor="medications" className="block text-sm font-medium text-gray-700">Médicaments (séparés par virgule)</label><input type="text" name="medicalInfo.medications" id="medications" value={childData.medicalInfo?.medications?.join(', ') || ''} onChange={onChange} disabled={isSaving} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" /></div>
             <div><label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">Nom Médecin</label><input type="text" name="medicalInfo.doctorName" id="doctorName" value={childData.medicalInfo?.doctorName || ''} onChange={onChange} disabled={isSaving} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" /></div>
             <div><label htmlFor="doctorPhone" className="block text-sm font-medium text-gray-700">Tél Médecin</label><input type="tel" name="medicalInfo.doctorPhone" id="doctorPhone" value={childData.medicalInfo?.doctorPhone || ''} onChange={onChange} disabled={isSaving} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm" /></div>
             <div className="md:col-span-2"><label htmlFor="medicalNotes" className="block text-sm font-medium text-gray-700">Notes Médicales</label><textarea name="medicalInfo.notes" id="medicalNotes" value={childData.medicalInfo?.notes || ''} onChange={onChange} disabled={isSaving} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"></textarea></div>
         </div>
      </div>
    </div>
  );
};

// --- Composants des Onglets (Restaurés) ---
const InfoTab: React.FC<TabProps> = ({ child }) => { 
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Parents</h2>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Parent 1</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start"><User className="w-5 h-5 text-gray-400 mt-0.5 mr-2" /><div><p className="text-gray-900 font-medium">{child.parentInfo.parent1.firstName} {child.parentInfo.parent1.lastName}</p></div></div>
              <div className="flex items-start"><Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-2" /><div><p className="text-gray-900">{child.parentInfo.parent1.phone}</p><p className="text-xs text-gray-500">Mobile</p></div></div>
              <div className="flex items-start"><Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-2" /><div><p className="text-gray-900">{child.parentInfo.parent1.email}</p><p className="text-xs text-gray-500">Email</p></div></div>
              <div className="flex items-start"><MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-2" /><div><p className="text-gray-900">{child.parentInfo.parent1.address}</p><p className="text-xs text-gray-500">Adresse</p></div></div>
            </div>
          </div>
          {child.parentInfo.parent2 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Parent 2</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-start"><User className="w-5 h-5 text-gray-400 mt-0.5 mr-2" /><div><p className="text-gray-900 font-medium">{child.parentInfo.parent2.firstName} {child.parentInfo.parent2.lastName}</p></div></div>
                 <div className="flex items-start"><Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-2" /><div><p className="text-gray-900">{child.parentInfo.parent2.phone}</p><p className="text-xs text-gray-500">Mobile</p></div></div>
                 <div className="flex items-start"><Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-2" /><div><p className="text-gray-900">{child.parentInfo.parent2.email}</p><p className="text-xs text-gray-500">Email</p></div></div>
                 <div className="flex items-start"><MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-2" /><div><p className="text-gray-900">{child.parentInfo.parent2.address}</p><p className="text-xs text-gray-500">Adresse</p></div></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Personnes autorisées à venir chercher l'enfant</h2>
        {child.authorizedPickups.length > 0 ? ( <div className="divide-y divide-gray-200">{child.authorizedPickups.map((person, index) => ( <div key={index} className="py-3 flex items-center"><div className="flex-shrink-0 mr-3"><div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"><UserCheck className="h-5 w-5 text-gray-400" /></div></div><div><p className="text-sm font-medium text-gray-900">{person.name}</p><div className="flex items-center mt-1 text-xs text-gray-500"><span className="mr-3">{person.relationship}</span><span>{person.phone}</span></div></div></div> ))}</div> ) : (<p className="text-gray-500 italic">Aucune personne autorisée renseignée</p>)}
      </div>
    </div>
  );
};
const MedicalTab: React.FC<TabProps> = ({ child }) => { 
 return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informations médicales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><h3 className="text-sm font-medium text-gray-500 mb-2">Allergies</h3>{child.medicalInfo.allergies.length > 0 ? (<div className="flex flex-wrap gap-2">{child.medicalInfo.allergies.map((allergy, index) => (<span key={index} className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm border border-red-100">{allergy}</span>))}</div>) : (<p className="text-gray-500 italic">Aucune allergie connue</p>)}</div>
          <div><h3 className="text-sm font-medium text-gray-500 mb-2">Médicaments</h3>{child.medicalInfo.medications.length > 0 ? (<div className="flex flex-wrap gap-2">{child.medicalInfo.medications.map((medication, index) => (<span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm border border-blue-100">{medication}</span>))}</div>) : (<p className="text-gray-500 italic">Aucun médicament</p>)}</div>
        </div>
        <div className="mt-6"><h3 className="text-sm font-medium text-gray-500 mb-2">Médecin traitant</h3><div className="flex flex-col sm:flex-row sm:items-center gap-3"><div className="flex items-center"><Heart className="w-5 h-5 text-gray-400 mr-2" /><span className="text-gray-900">{child.medicalInfo.doctorName}</span></div><div className="flex items-center"><Phone className="w-5 h-5 text-gray-400 mr-2" /><span className="text-gray-900">{child.medicalInfo.doctorPhone}</span></div></div></div>
        {child.medicalInfo.notes && (<div className="mt-6"><h3 className="text-sm font-medium text-gray-500 mb-2">Notes médicales</h3><p className="bg-yellow-50 text-yellow-800 p-3 rounded-md border border-yellow-100 text-sm">{child.medicalInfo.notes}</p></div>)}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Contacts en cas d'urgence</h2>
        {child.medicalInfo.emergencyContacts.length > 0 ? (<div className="divide-y divide-gray-200">{child.medicalInfo.emergencyContacts.map((contact, index) => (<div key={index} className="py-3 flex items-center"><div className="flex-shrink-0 mr-3"><div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center"><Phone className="h-5 w-5 text-red-500" /></div></div><div><p className="text-sm font-medium text-gray-900">{contact.name}</p><div className="flex items-center mt-1 text-xs text-gray-500"><span className="mr-3">{contact.relationship}</span><span>{contact.phone}</span></div></div></div>))}</div>) : (<p className="text-gray-500 italic">Aucun contact d'urgence renseigné</p>)}
      </div>
    </div>
  );
};
const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ records }) => { 
 return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Activités récentes</h2>
      {records.length > 0 ? (<div className="space-y-6">{records.map((record: any) => (<div key={record.id} className="border border-gray-200 rounded-lg p-4"><div className="flex items-center justify-between mb-3"><h3 className="font-medium text-gray-900">{new Date(record.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3><span className={`px-2 py-1 text-xs rounded-full ${getMoodColor(record.mood)}`}>{getMoodLabel(record.mood)}</span></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">{record.meals.lunch && (<div className="flex items-start"><div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center mr-3 mt-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" x2="6" y1="2" y2="4"></line><line x1="10" x2="10" y1="2" y2="4"></line><line x1="14" x2="14" y1="2" y2="4"></line></svg></div><div><p className="text-sm font-medium">Repas ({record.meals.lunch.time})</p><p className="text-sm text-gray-600">{record.meals.lunch.description}</p><p className="text-xs text-gray-500 mt-1">{record.meals.lunch.eaten === 'well' ? 'Bien mangé' : record.meals.lunch.eaten === 'average' ? 'Moyennement mangé' : 'Peu mangé'}</p></div></div>)}{record.naps.length > 0 && (<div className="flex items-start"><div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 mt-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 4a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8a8 8 0 0 0-8-8Z"></path><path d="M16 8c0 2-2 2.5-2 5"></path><path d="M10 8c0 2-2 2.5-2 5"></path><line x1="12" x2="12" y1="16" y2="16.01"></line></svg></div><div><p className="text-sm font-medium">Sieste</p>{record.naps.map((nap: any, index: number) => (<div key={index} className="mb-1"><p className="text-sm text-gray-600">{nap.startTime} - {nap.endTime}</p><p className="text-xs text-gray-500">{nap.quality === 'good' ? 'Bonne sieste' : nap.quality === 'average' ? 'Sieste moyenne' : 'Sieste agitée'}</p></div>))}</div></div>)}</div><div><h4 className="text-sm font-medium mb-2">Activités:</h4><div className="flex flex-wrap gap-2">{record.activities.map((activity: string, index: number) => (<span key={index} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-sm border border-purple-100">{activity}</span>))}</div></div>{record.notes && (<div className="mt-3 pt-3 border-t border-gray-100"><p className="text-sm text-gray-600">{record.notes}</p></div>)}</div>))}</div>) : (<p className="text-gray-500 italic">Aucune activité enregistrée</p>)}<div className="mt-6"><button className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium py-2 px-4 rounded-md border border-purple-200 transition-colors">Ajouter une activité</button></div>
    </div>
  );
};
const DocumentsTab: React.FC<Omit<TabProps, 'child'>> = () => { 
 return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-medium text-gray-900">Documents</h2><button className="bg-purple-50 text-purple-700 hover:bg-purple-100 text-sm font-medium py-1 px-3 rounded-md border border-purple-200 transition-colors">Ajouter un document</button></div>
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
        <div className="p-4 flex items-center justify-between"><div className="flex items-center"><div className="h-10 w-10 flex-shrink-0 bg-blue-50 rounded-lg flex items-center justify-center mr-3"><FileText className="h-5 w-5 text-blue-500" /></div><div><p className="text-sm font-medium text-gray-900">Fiche sanitaire</p><p className="text-xs text-gray-500">Ajouté le 10/05/2022</p></div></div><button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Télécharger</button></div>
        <div className="p-4 flex items-center justify-between"><div className="flex items-center"><div className="h-10 w-10 flex-shrink-0 bg-blue-50 rounded-lg flex items-center justify-center mr-3"><FileText className="h-5 w-5 text-blue-500" /></div><div><p className="text-sm font-medium text-gray-900">Autorisation parentale</p><p className="text-xs text-gray-500">Ajouté le 02/01/2022</p></div></div><button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Télécharger</button></div>
        <div className="p-4 flex items-center justify-between"><div className="flex items-center"><div className="h-10 w-10 flex-shrink-0 bg-blue-50 rounded-lg flex items-center justify-center mr-3"><FileText className="h-5 w-5 text-blue-500" /></div><div><p className="text-sm font-medium text-gray-900">Carnet de vaccinations</p><p className="text-xs text-gray-500">Ajouté le 15/02/2022</p></div></div><button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Télécharger</button></div>
      </div>
    </div>
  );
};

// --- Composants Panneaux Latéraux (Restaurés) ---
const QuickActionsPanel: React.FC = () => { 
  const actions = [ { name: 'Pointer arrivée', icon: Clock, color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' }, { name: 'Activité', icon: Edit, color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' }, { name: 'Message', icon: MessageSquare, color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' }, { name: 'Absence', icon: Calendar, color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' }, ];
  return ( <div className="bg-white rounded-lg shadow p-6"> <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2> <div className="grid grid-cols-2 gap-3"> {actions.map((action) => ( <button key={action.name} className={`flex flex-col items-center p-4 rounded-lg border ${action.color} transition-colors`}> <action.icon className="h-6 w-6 mb-2" /> <span className="text-sm font-medium text-center">{action.name}</span> </button> ))} </div> </div> );
};
const AttendancePanel: React.FC<AttendancePanelProps> = ({ child, attendanceRecords }) => { 
  const recentAttendance = attendanceRecords .filter(att => att.childId === child.id) .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) .slice(0, 5); 
  return ( <div className="bg-white rounded-lg shadow p-6"> <div className="flex justify-between items-center mb-4"> <h2 className="text-lg font-medium text-gray-900">Présences récentes</h2> <Link to="/planning" className="text-sm text-purple-600 hover:text-purple-800">Voir tout</Link> </div> <div className="space-y-3"> {recentAttendance.length > 0 ? recentAttendance.map((record, index) => ( <div key={index} className="p-3 border border-gray-200 rounded-lg"> <div className="flex justify-between items-center mb-1"> <p className="text-sm font-medium text-gray-900">{new Date(record.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</p> <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(record.status)}`}>{getStatusLabel(record.status)}</span> </div> {record.status === 'présent' && record.arrivalTime && record.arrivalTime !== "00:00:00" && ( <div className="flex space-x-2 text-xs text-gray-500"> <span>Arrivée: {record.arrivalTime}</span> {record.departureTime && record.departureTime !== "00:00:00" && ( <><span>•</span><span>Départ: {record.departureTime}</span></> )} </div> )} </div> )) : <p className="text-sm text-gray-500 italic">Aucune présence récente enregistrée.</p>} </div> </div> );
};


export default ChildDetail;
