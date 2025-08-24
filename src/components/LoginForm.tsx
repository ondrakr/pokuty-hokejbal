'use client';

import { useState } from 'react';
import { PrihlasenyUzivatel } from '../../types';

interface Props {
  onLogin: (uzivatel: PrihlasenyUzivatel) => void;
  kategorieSlug?: string; // Pro kategorie-specifické přihlášení
}

export default function LoginForm({ onLogin, kategorieSlug }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      // Kontrola, zda uživatel může přistupovat k této kategorii
      if (kategorieSlug) {
        // Pokud jsme na kategorie-specifické stránce
        if (uzivatel.role === 'kategorie_admin' && uzivatel.kategorie?.slug !== kategorieSlug) {
          setError('Nemáte oprávnění k přístupu do této kategorie');
          setLoading(false);
          return;
        }
      }

      // Uložení do localStorage
      localStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('admin_login_time', Date.now().toString());
      localStorage.setItem('admin_user_data', JSON.stringify(uzivatel));

      onLogin(uzivatel);
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
              🔐 Přihlášení pro pokladníka
            </h1>
            <p className="text-black">
              {kategorieSlug ? `Kategorie: ${kategorieSlug}` : 'Pokuty Hokejbal'}
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

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Pokuty Junioři</p>
          </div>
        </div>
      </div>
    </div>
  );
}
