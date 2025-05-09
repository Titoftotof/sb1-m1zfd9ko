import { useState, useEffect } from 'react'; // Importer useState et useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import { supabase } from './lib/supabaseClient'; // Importer supabase
import { Session } from '@supabase/supabase-js'; // Importer le type Session
import Dashboard from './pages/Dashboard';
import Contracts from './pages/Contracts';
import Planning from './pages/Planning';
import Children from './pages/Children';
import ChildDetail from './pages/ChildDetail';
import Communication from './pages/Communication';
import Finances from './pages/Finances';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage'; // Importer LoginPage
import GlobalPlanningView from './pages/GlobalPlanningView'; // Importer la nouvelle page

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // État de chargement pour l'auth

  useEffect(() => {
    // Tenter de récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false); // Fin du chargement initial
    });

    // Écouter les changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (_event !== 'INITIAL_SESSION') { // Ne pas remettre loadingAuth à false si c'est juste la session initiale
             setLoadingAuth(false); // Fin du chargement si changement (SIGNED_IN, SIGNED_OUT)
        }
      }
    );

    // Nettoyer l'écouteur lors du démontage du composant
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Afficher un indicateur de chargement pendant la vérification de la session
  if (loadingAuth) {
    return <div className="flex justify-center items-center h-screen">Chargement de la session...</div>;
  }

  // Si pas de session et que le chargement initial est terminé, afficher la page de connexion
  if (!loadingAuth && !session) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<LoginPage />} /> {/* Rediriger toutes les routes vers LoginPage */}
        </Routes>
      </Router>
    );
  }

  // Si session chargée, afficher l'application principale
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}> {/* Layout est maintenant protégé implicitement */}
            <Route index element={<Dashboard />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="planning" element={<Planning />} />
            <Route path="children" element={<Children />} />
            <Route path="children/:id" element={<ChildDetail />} />
            <Route path="communication" element={<Communication />} />
            <Route path="finances" element={<Finances />} />
            <Route path="settings" element={<Settings />} />
            <Route path="global-planning" element={<GlobalPlanningView />} /> {/* Ajouter la nouvelle route */}
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
