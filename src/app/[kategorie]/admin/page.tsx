'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Hrac, Pokuta, Kategorie, PrihlasenyUzivatel } from '../../../../types';
import AdminPage from '@/components/AdminPage';
import LoginForm from '@/components/LoginForm';

export default function KategorieAdminPage() {
  const params = useParams();
  const kategorieSlug = params.kategorie as string;
  
  const [initialHraci, setInitialHraci] = useState<Hrac[]>([]);
  const [initialPokuty, setInitialPokuty] = useState<Pokuta[]>([]);
  const [kategorie, setKategorie] = useState<Kategorie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = checking, false = not logged, true = logged
  const [currentUser, setCurrentUser] = useState<PrihlasenyUzivatel | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Kontrola přihlášení
  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
      const loginTime = localStorage.getItem('admin_login_time');
      const userData = localStorage.getItem('admin_user_data');
      
      if (loggedIn && loginTime && userData) {
        const now = Date.now();
        const loginTimestamp = parseInt(loginTime);
        const hoursPassed = (now - loginTimestamp) / (1000 * 60 * 60);
        
        if (hoursPassed <= 24) {
          const user: PrihlasenyUzivatel = JSON.parse(userData);
          
          // Kontrola oprávnění pro kategorii
          if (user.role === 'kategorie_admin' && user.kategorie?.slug !== kategorieSlug) {
            // Uživatel nemá oprávnění k této kategorii - odhlásíme ho
            localStorage.removeItem('admin_logged_in');
            localStorage.removeItem('admin_login_time');
            localStorage.removeItem('admin_user_data');
            return;
          }
          
          // Hlavní admin má přístup ke všem kategoriím
          if (user.role !== 'hlavni_admin' && user.role !== 'kategorie_admin') {
            localStorage.removeItem('admin_logged_in');
            localStorage.removeItem('admin_login_time');
            localStorage.removeItem('admin_user_data');
            return;
          }
          
          setCurrentUser(user);
          setIsLoggedIn(true);
          setAuthChecked(true);
          return;
        } else {
          // Přihlášení vypršelo
          localStorage.removeItem('admin_logged_in');
          localStorage.removeItem('admin_login_time');
          localStorage.removeItem('admin_user_data');
        }
      }
      
      // Uživatel není přihlášen
      setIsLoggedIn(false);
      setAuthChecked(true);
    };

    checkLogin();
  }, [kategorieSlug]);

  useEffect(() => {
    const loadData = async () => {
      if (!kategorieSlug || isLoggedIn !== true) return;
      
      try {
        // Načtení informací o kategorii
        const kategorieResponse = await fetch(`/api/kategorie/${kategorieSlug}`);
        if (!kategorieResponse.ok) {
          if (kategorieResponse.status === 404) {
            setError('Kategorie nebyla nalezena');
            return;
          }
          throw new Error('Chyba při načítání kategorie');
        }
        const kategorieData = await kategorieResponse.json();
        setKategorie(kategorieData);
        
        // Načtení dat pro kategorii
        const dataResponse = await fetch(`/api/data/${kategorieSlug}`);
        if (!dataResponse.ok) {
          throw new Error('Chyba při načítání dat');
        }
        
        const result = await dataResponse.json();
        setInitialHraci(result.hraci || []);
        setInitialPokuty(result.pokuty || []);
      } catch (error) {
        console.error('Chyba při načítání dat:', error);
        setError('Nepodařilo se načíst data kategorie');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [kategorieSlug, isLoggedIn]);

  const handleLogin = (uzivatel: PrihlasenyUzivatel) => {
    // Kontrola oprávnění
    if (uzivatel.role === 'kategorie_admin' && uzivatel.kategorie?.slug !== kategorieSlug) {
      alert('Nemáte oprávnění k této kategorii');
      return;
    }
    
    if (uzivatel.role !== 'hlavni_admin' && uzivatel.role !== 'kategorie_admin') {
      alert('Nemáte oprávnění k administraci');
      return;
    }
    
    // Uložení do localStorage
    localStorage.setItem('admin_logged_in', 'true');
    localStorage.setItem('admin_login_time', Date.now().toString());
    localStorage.setItem('admin_user_data', JSON.stringify(uzivatel));
    
    setCurrentUser(uzivatel);
    setIsLoggedIn(true);
  };

  // Pokud se ještě kontroluje přihlášení, zobrazíme loading
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám...</p>
        </div>
      </div>
    );
  }

  // Pokud není přihlášen, zobrazíme login formulář
  if (isLoggedIn === false) {
    return <LoginForm onLogin={handleLogin} kategorieSlug={kategorieSlug} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám data...</p>
        </div>
      </div>
    );
  }

  if (error || !kategorie) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-bold mb-2">Chyba</h2>
            <p className="text-red-600">{error || 'Kategorie nebyla nalezena'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminPage 
      initialHraci={initialHraci} 
      initialPokuty={initialPokuty} 
      initialPlatby={[]}
      kategorie={kategorie}
      kategorieSlug={kategorieSlug}
      currentUser={currentUser}
    />
  );
}
