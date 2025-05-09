import React from 'react';
import { useAppContext } from '../context/AppContext';
import ChildCard from '../components/shared/ChildCard';
import { PlusCircle, Search } from 'lucide-react';
import { Child } from '../types'; // Importer le type Child
import { supabase } from '../lib/supabaseClient'; // Importer supabase

const Children: React.FC = () => {
  const { children, addChild, loadingChildren, uploadPhoto } = useAppContext(); // Ajouter uploadPhoto
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showAddChildForm, setShowAddChildForm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // État pour gérer la soumission

  // États pour le formulaire
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [birthDate, setBirthDate] = React.useState('');
  const [gender, setGender] = React.useState<'male' | 'female' | ''>('');
  const [photoFile, setPhotoFile] = React.useState<File | null>(null); 
  // États pour Parent 1
  const [parent1FirstName, setParent1FirstName] = React.useState('');
  const [parent1LastName, setParent1LastName] = React.useState('');
  const [parent1Phone, setParent1Phone] = React.useState('');
  const [parent1Email, setParent1Email] = React.useState('');
  const [parent1Address, setParent1Address] = React.useState('');

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setBirthDate('');
    setGender('');
    setParent1FirstName('');
    setParent1LastName('');
    setParent1Phone('');
    setParent1Email('');
    setParent1Address('');
    setPhotoFile(null); 
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    setTimeout(() => {
      setShowAddChildForm(false);
    }, 10); 
  };

  const handleSubmitForm = async () => { // Rendre la fonction async
    if (!firstName || !lastName || !birthDate || !gender) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    setIsSubmitting(true); 

    const newChildData: Omit<Child, 'id' | 'photo'> & { photo?: string } = { 
      firstName,
      lastName,
      birthDate,
      gender: gender as 'male' | 'female', 
      parentInfo: { 
        parent1: { 
          firstName: parent1FirstName || 'N/A', 
          lastName: parent1LastName || 'N/A', 
          phone: parent1Phone || 'N/A', 
          email: parent1Email || 'N/A', 
          address: parent1Address || 'N/A' 
        } 
      },
      medicalInfo: { 
        allergies: [], 
        medications: [], 
        emergencyContacts: [], 
        doctorName: 'N/A', 
        doctorPhone: 'N/A', 
        notes: '' 
      },
      authorizedPickups: [],
    };

    try {
      let photoUrl: string | undefined | null = undefined; // Initialiser à undefined
      if (photoFile) {
        console.log("Tentative d'upload de la photo :", photoFile.name);
        const { data: { session } } = await supabase.auth.getSession(); // Récupérer la session
        if (!session) {
           throw new Error("Aucune session active trouvée pour l'upload.");
        }
        photoUrl = await uploadPhoto(photoFile, session); // Passer la session
        if (photoUrl) {
          newChildData.photo = photoUrl; 
          console.log("Photo uploadée, URL :", photoUrl);
        } else {
           console.warn("L'upload de la photo a échoué ou n'a pas retourné d'URL.");
        }
      }
      
      console.log("Ajout de l'enfant avec données :", newChildData);
      await addChild(newChildData); 
      
      console.log("Enfant ajouté avec succès !");
      resetForm(); 

    } catch (error: any) { 
      console.error("Erreur lors de l'ajout de l'enfant ou de l'upload photo:", error);
      alert(`Une erreur s'est produite : ${error.message || 'Erreur inconnue'}`);
    } finally {
       setIsSubmitting(false); 
    }
  };
  
  const filteredChildren = children.filter(child => {
    const fullName = `${child.firstName} ${child.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });
  
  if (loadingChildren) {
    return <div className="text-center p-10">Chargement des données des enfants...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Enfants</h1>
        <button 
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors z-50"
          onClick={() => setShowAddChildForm(true)}
          disabled={isSubmitting} 
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Ajouter un enfant
        </button>
      </div>

      {showAddChildForm && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center"
          onClick={!isSubmitting ? resetForm : undefined} 
        >
          <div 
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()} 
          >
            <h2 className="text-xl font-bold mb-6 text-center">Ajouter un nouvel enfant</h2>
            <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleSubmitForm(); }}> 
              {/* Champs Enfant */}
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input type="text" name="firstName" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" required disabled={isSubmitting} />
              </div>
              <div className="mb-4">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" name="lastName" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" required disabled={isSubmitting} />
              </div>
              <div className="mb-4">
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input type="date" name="birthDate" id="birthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" required disabled={isSubmitting} />
              </div>
              <div className="mb-6">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                <select name="gender" id="gender" value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" required disabled={isSubmitting}>
                  <option value="" disabled>Sélectionner...</option>
                  <option value="female">Fille</option>
                  <option value="male">Garçon</option>
                </select>
              </div>

              {/* Champ Photo */}
              <div className="mb-4">
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
                  <input 
                    type="file" 
                    name="photo" 
                    id="photo" 
                    accept="image/*" 
                    onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)} 
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" 
                    disabled={isSubmitting}
                  />
              </div>

              {/* Champs Parent 1 */}
              <h3 className="text-lg font-medium mb-4 mt-6 border-t pt-4">Informations Parent 1</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="parent1FirstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom Parent 1</label>
                  <input type="text" name="parent1FirstName" id="parent1FirstName" value={parent1FirstName} onChange={(e) => setParent1FirstName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" disabled={isSubmitting} />
                </div>
                <div className="mb-4">
                  <label htmlFor="parent1LastName" className="block text-sm font-medium text-gray-700 mb-1">Nom Parent 1</label>
                  <input type="text" name="parent1LastName" id="parent1LastName" value={parent1LastName} onChange={(e) => setParent1LastName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" disabled={isSubmitting} />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="parent1Phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone Parent 1</label>
                <input type="tel" name="parent1Phone" id="parent1Phone" value={parent1Phone} onChange={(e) => setParent1Phone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" disabled={isSubmitting} />
              </div>
              <div className="mb-4">
                <label htmlFor="parent1Email" className="block text-sm font-medium text-gray-700 mb-1">Email Parent 1</label>
                <input type="email" name="parent1Email" id="parent1Email" value={parent1Email} onChange={(e) => setParent1Email(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" disabled={isSubmitting} />
              </div>
              <div className="mb-6">
                <label htmlFor="parent1Address" className="block text-sm font-medium text-gray-700 mb-1">Adresse Parent 1</label>
                <textarea name="parent1Address" id="parent1Address" value={parent1Address} onChange={(e) => setParent1Address(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" disabled={isSubmitting}></textarea>
              </div>
              
              {/* Boutons */}
              <div className="flex justify-end gap-4 mt-6">
                <button 
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Reste du composant */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un enfant..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filteredChildren.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChildren.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">Aucun enfant trouvé</p>
        </div>
      )}
    </div>
  );
};

export default Children;
