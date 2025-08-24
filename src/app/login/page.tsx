'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PrihlasenyUzivatel } from '../../../types';
import Image from 'next/image';

export default function UniversalLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Kontrola, zda už není uživatel přihlášený
  useEffect(() => {
    const checkExistingLogin = () => {
      const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
      const loginTime = localStorage.getItem('admin_login_time');
      const userData = localStorage.getItem('admin_user_data');
      
      if (loggedIn && loginTime && userData) {
        const now = Date.now();
        const loginTimestamp = parseInt(loginTime);
        const hoursPassed = (now - loginTimestamp) / (1000 * 60 * 60);
        
        if (hoursPassed <= 24) {
          const user: PrihlasenyUzivatel = JSON.parse(userData);
          redirectUserToDashboard(user);
        } else {
          // Přihlášení vypršelo
          localStorage.removeItem('admin_logged_in');
          localStorage.removeItem('admin_login_time');
          localStorage.removeItem('admin_user_data');
        }
      }
    };

    checkExistingLogin();
  }, []);

  const redirectUserToDashboard = (uzivatel: PrihlasenyUzivatel) => {
    if (uzivatel.role === 'hlavni_admin') {
      // Hlavní admin -> přesměruj na hlavní admin stránku
      router.push('/admin');
    } else if (uzivatel.role === 'kategorie_admin' && uzivatel.kategorie?.slug) {
      // Kategorie admin -> přesměruj na jeho kategorii
      router.push(`/${uzivatel.kategorie.slug}/admin`);
    } else {
      // Fallback - něco je špatně
      setError('Uživatel nemá přiřazenou správnou roli nebo kategorii');
      localStorage.removeItem('admin_logged_in');
      localStorage.removeItem('admin_login_time');
      localStorage.removeItem('admin_user_data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uzivatelske_jmeno: username,
          heslo: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Chyba při přihlašování');
        setLoading(false);
        return;
      }

      const uzivatel: PrihlasenyUzivatel = data.uzivatel;

      // Uložení do localStorage
      localStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('admin_login_time', Date.now().toString());
      localStorage.setItem('admin_user_data', JSON.stringify(uzivatel));

      // Přesměrování podle role
      redirectUserToDashboard(uzivatel);

    } catch (error) {
      console.error('Chyba při přihlašování:', error);
      setError('Chyba při přihlašování');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Hokejbal Logo"
                width={64}
                height={64}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">
              🔐 Přihlášení pro pokladníka
            </h1>
            <p className="text-gray-600">
              Pokuty Hokejbal - Správa pokut
            </p>
            
            {/* Tlačítko zpět na hlavní stránku */}
            <div className="mt-4">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Zpět na hlavní stránku
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-black mb-2">
                Uživatelské jméno
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Zadej uživatelské jméno"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Heslo
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Zadej heslo"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Přihlašuji...
                </>
              ) : (
                'Přihlásit se'
              )}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
