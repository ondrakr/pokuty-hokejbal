'use client';

import { useState, useEffect } from 'react';
import { Hrac, Pokuta, Platba } from '../../../types';
import AdminPage from '../../components/AdminPage';
import LoginForm from '../../components/LoginForm';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [data, setData] = useState<{ hraci: Hrac[], pokuty: Pokuta[], platby: Platba[] }>({
    hraci: [],
    pokuty: [],
    platby: []
  });
  const [loading, setLoading] = useState(true);

  // Kontrola přihlášení při načtení komponenty
  useEffect(() => {
    const checkLogin = () => {
      const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
      const loginTime = localStorage.getItem('admin_login_time');
      
      // Kontrola, zda není přihlášení starší než 24 hodin
      if (isLoggedIn && loginTime) {
        const now = Date.now();
        const loginTimestamp = parseInt(loginTime);
        const hoursPassed = (now - loginTimestamp) / (1000 * 60 * 60);
        
        if (hoursPassed > 24) {
          // Přihlášení vypršelo
          localStorage.removeItem('admin_logged_in');
          localStorage.removeItem('admin_login_time');
          setIsLoggedIn(false);
        } else {
          setIsLoggedIn(true);
        }
      } else {
        setIsLoggedIn(false);
      }
      
      setCheckingAuth(false);
    };

    checkLogin();
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_login_time');
    setIsLoggedIn(false);
  };

  // Načtení dat pouze pokud je uživatel přihlášen
  useEffect(() => {
    if (isLoggedIn) {
      const loadData = async () => {
        try {
          const response = await fetch('/api/data', {
            cache: 'no-store'
          });
          
          if (!response.ok) {
            throw new Error('Chyba při načítání dat');
          }
          
          const result = await response.json();
          setData({
            hraci: result.hraci.map((h: any) => ({ id: h.id, jmeno: h.jmeno, role: h.role, email: h.email })),
            pokuty: result.pokuty,
            platby: result.platby
          });
        } catch (error) {
          console.error('Chyba při načítání dat:', error);
          setData({ hraci: [], pokuty: [], platby: [] });
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [isLoggedIn]);

  // Kontrola autentizace
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ověřuji přihlášení...</p>
        </div>
      </div>
    );
  }

  // Zobrazení login formuláře pokud není přihlášen
  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Loading při načítání dat
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

  // Hlavní admin stránka
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header s logout tlačítkem */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              🛠️ Administrace - Hokejbalový tým JUNIOŘI
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm transition duration-200"
            >
              Odhlásit se
            </button>
          </div>
        </div>
      </div>
      
      <AdminPage initialHraci={data.hraci} initialPokuty={data.pokuty} initialPlatby={data.platby} />
    </main>
  );
}