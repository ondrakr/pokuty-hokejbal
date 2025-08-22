'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Hrac, Pokuta, Kategorie, PrihlasenyUzivatel } from '../../types';
import SpravHracu from './SpravHracu';
import SpravPokut from './SpravPokut';
import MobileHeader from './MobileHeader';

interface Props {
  initialHraci: Hrac[];
  initialPokuty: Pokuta[];
  initialPlatby: unknown[];
  kategorie?: Kategorie;
  kategorieSlug?: string;
  currentUser?: PrihlasenyUzivatel | null;
}

export default function AdminPage({ initialHraci, initialPokuty, kategorie, kategorieSlug, currentUser }: Props) {
  const [activeTab, setActiveTab] = useState<'hraci' | 'pokuty'>('hraci');
  const [hraci, setHraci] = useState<Hrac[]>(initialHraci);
  const [pokuty, setPokuty] = useState<Pokuta[]>(initialPokuty);

  const handleDataRefresh = async () => {
    if (!kategorieSlug || !kategorie) return;
    
    try {
      // Načtení aktuálních dat ze serveru
      const response = await fetch(`/api/data/${kategorieSlug}`);
      if (response.ok) {
        const data = await response.json();
        setHraci(data.hraci || []);
        setPokuty(data.pokuty || []);
      }
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_login_time');
    localStorage.removeItem('admin_user_data');
    // Okamžité přesměrování na login
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden">
        <MobileHeader title="Administrace" />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden bg-gray-100 min-h-screen">
        <div className="p-4">
          {/* Mobile Back Button */}
          <div className="mb-4">
            <Link
              href={kategorieSlug ? `/${kategorieSlug}` : "/"}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              ⬅️ {kategorieSlug ? `Zpět na ${kategorie?.nazev || 'kategorii'}` : 'Zpět na hlavní stránku'}
            </Link>
          </div>

          {/* Mobile Tab Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setActiveTab('hraci')}
              className={`py-4 px-4 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'hraci'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 shadow-md'
              }`}
            >
              👥 Správa hráčů
            </button>
            <button
              onClick={() => setActiveTab('pokuty')}
              className={`py-4 px-4 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'pokuty'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 shadow-md'
              }`}
            >
              📋 Správa pokut
            </button>
          </div>

          {/* Mobile Content */}
          <div className="space-y-4">
            {activeTab === 'hraci' && <SpravHracu hraci={hraci} onDataChange={handleDataRefresh} kategorie={kategorie} />}
            {activeTab === 'pokuty' && <SpravPokut onDataChange={handleDataRefresh} kategorie={kategorie} />}
          </div>


        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Desktop Header */}
            <div className="bg-gray-800 text-white p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <Link
                    href={kategorieSlug ? `/${kategorieSlug}` : "/"}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                  >
                    ⬅️ {kategorieSlug ? `Zpět na ${kategorie?.nazev || 'kategorii'}` : 'Zpět na hlavní stránku'}
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold">🔧 Administrace {kategorie ? `- ${kategorie.nazev}` : ''}</h1>
                    <p className="text-gray-300 mt-1">Správa hráčů a pokut{kategorie ? ` pro kategorii ${kategorie.nazev}` : ''}</p>
                  </div>
                </div>
                {currentUser && (
                  <div className="text-right">
                    <p className="text-sm text-gray-300">Přihlášen jako:</p>
                    <p className="font-bold">{currentUser.uzivatelske_jmeno}</p>
                    <p className="text-xs text-gray-400">
                      {currentUser.role === 'hlavni_admin' ? 'Hlavní administrátor' : 'Administrátor kategorie'}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="mt-2 text-xs bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                    >
                      Odhlásit se
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('hraci')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'hraci'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  👥 Správa hráčů
                </button>
                <button
                  onClick={() => setActiveTab('pokuty')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'pokuty'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📋 Správa pokut
                </button>
              </nav>
            </div>

            {/* Desktop Content */}
            <div className="p-6">
              {activeTab === 'hraci' && <SpravHracu hraci={hraci} onDataChange={handleDataRefresh} kategorie={kategorie} />}
              {activeTab === 'pokuty' && <SpravPokut onDataChange={handleDataRefresh} kategorie={kategorie} />}
            </div>


          </div>
        </div>
      </div>
    </>
  );
}