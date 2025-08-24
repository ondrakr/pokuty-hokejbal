'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PrihlasenyUzivatel } from '../../../../types';

export default function KategorieLoginPage() {
  const params = useParams();
  const router = useRouter();
  const kategorieSlug = params.kategorie as string;
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Kontrola, zda už není přihlášen
  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
      const loginTime = localStorage.getItem('admin_login_time');
      
      if (loggedIn && loginTime) {
        const now = Date.now();
        const loginTimestamp = parseInt(loginTime);
        const hoursPassed = (now - loginTimestamp) / (1000 * 60 * 60);
        
        if (hoursPassed <= 24) {
          // Už je přihlášen, přesměruj na detail hráčů
          router.push(`/${kategorieSlug}`);
          return;
        } else {
          localStorage.removeItem('admin_logged_in');
          localStorage.removeItem('admin_login_time');
          localStorage.removeItem('admin_user_data');
        }
      }
    };

    checkLogin();
  }, [kategorieSlug, router]);

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

      // Kontrola oprávnění pro kategorii
      if (uzivatel.role === 'kategorie_admin' && uzivatel.kategorie?.slug !== kategorieSlug) {
        setError('Nemáte oprávnění k přístupu do této kategorie');
        setLoading(false);
        return;
      }
      
      if (uzivatel.role !== 'hlavni_admin' && uzivatel.role !== 'kategorie_admin') {
        setError('Nemáte oprávnění k administraci');
        setLoading(false);
        return;
      }

      // Uložení do localStorage
      localStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('admin_login_time', Date.now().toString());
      localStorage.setItem('admin_user_data', JSON.stringify(uzivatel));

      // Přesměrování na detail hráčů (ne na administraci)
      router.push(`/${kategorieSlug}`);
    } catch (error) {
      console.error('Chyba při přihlašování:', error);
      setError('Chyba při přihlašování');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black mb-2">
              Přihlášení pro pokladníka
            </h1>
            <p className="text-black">
              Kategorie: {kategorieSlug}
            </p>
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

          {/* Back to category */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push(`/${kategorieSlug}`)}
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              ← Zpět na kategorii
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Pokuty Hokejbal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
