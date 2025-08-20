'use client';

import { useState, useEffect } from 'react';
import { PrihlasenyUzivatel } from '../../../types';
import LoginForm from '@/components/LoginForm';
import Link from 'next/link';

export default function MainAdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<PrihlasenyUzivatel | null>(null);

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
          
          // Pouze hlavní administrátor má přístup k této stránce
          if (user.role !== 'hlavni_admin') {
            // Přesměruj na univerzální login
            window.location.href = '/login';
            return;
          }
          
          setCurrentUser(user);
          setIsLoggedIn(true);
          return;
        } else {
          // Přihlášení vypršelo
          localStorage.removeItem('admin_logged_in');
          localStorage.removeItem('admin_login_time');
          localStorage.removeItem('admin_user_data');
        }
      }
      
      // Přesměruj na univerzální login
      window.location.href = '/login';
    };

    checkLogin();
  }, []);

  const handleLogin = (uzivatel: PrihlasenyUzivatel) => {
    // Tato funkce už není potřeba, protože přihlašování se dělá na /login
    // Ale nechávám pro kompatibilitu
    if (uzivatel.role !== 'hlavni_admin') {
      window.location.href = '/login';
      return;
    }
    setCurrentUser(uzivatel);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_login_time');
    localStorage.removeItem('admin_user_data');
    setIsLoggedIn(false);
    setCurrentUser(null);
    // Okamžité přesměrování na login
    window.location.href = '/login';
  };

  // Pokud není přihlášen, už je přesměrován na /login v useEffect
  // Zde jen loading state zatímco probíhá přesměrování
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Přesměrováváme na přihlášení...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🔧 Hlavní administrace
              </h1>
              <p className="text-gray-600">Správa všech kategorií a systému</p>
            </div>
            {currentUser && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Přihlášen jako:</p>
                <p className="font-bold text-gray-900">{currentUser.uzivatelske_jmeno}</p>
                <p className="text-xs text-gray-500">Hlavní administrátor</p>
                <button
                  onClick={handleLogout}
                  className="mt-2 text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors"
                >
                  Odhlásit se
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Kategorie A-tým */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-red-600">A</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">A-tým</h2>
              <p className="text-gray-600 text-sm">Hlavní tým dospělých hráčů</p>
            </div>
            <div className="space-y-3">
              <Link
                href="/a-tym"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded transition-colors"
              >
                📊 Zobrazit evidenci
              </Link>
              <Link
                href="/a-tym/admin"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded transition-colors"
              >
                ⚙️ Administrace
              </Link>
            </div>
          </div>

          {/* Kategorie Junioři */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">J</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Junioři</h2>
              <p className="text-gray-600 text-sm">Juniorské družstvo</p>
            </div>
            <div className="space-y-3">
              <Link
                href="/juniori"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded transition-colors"
              >
                📊 Zobrazit evidenci
              </Link>
              <Link
                href="/juniori/admin"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded transition-colors"
              >
                ⚙️ Administrace
              </Link>
            </div>
          </div>

          {/* Kategorie Dorost */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-600">D</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Dorost</h2>
              <p className="text-gray-600 text-sm">Dorostenci</p>
            </div>
            <div className="space-y-3">
              <Link
                href="/dorost"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded transition-colors"
              >
                📊 Zobrazit evidenci
              </Link>
              <Link
                href="/dorost/admin"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded transition-colors"
              >
                ⚙️ Administrace
              </Link>
            </div>
          </div>
        </div>



        {/* Návrat na úvodní stránku */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ← Zpět na výběr kategorií
          </Link>
        </div>
      </div>
    </div>
  );
}