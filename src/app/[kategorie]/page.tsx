'use client';

import { useState, useEffect } from 'react';
import { HracSPokutami, Pokuta, Kategorie, FinancniPrehled } from '../../../types';
import EvidencePage from '@/components/EvidencePage';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function KategoriePage() {
  const params = useParams();
  const kategorieSlug = params.kategorie as string;
  
  const [data, setData] = useState<{ 
    hraci: HracSPokutami[], 
    pokuty: Pokuta[], 
    financniPrehled?: FinancniPrehled 
  }>({
    hraci: [],
    pokuty: []
  });
  const [kategorie, setKategorie] = useState<Kategorie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kontrola přihlášení
  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
      const loginTime = localStorage.getItem('admin_login_time');
      
      if (loggedIn && loginTime) {
        const now = Date.now();
        const loginTimestamp = parseInt(loginTime);
        const hoursPassed = (now - loginTimestamp) / (1000 * 60 * 60);
        
        if (hoursPassed <= 24) {
          setIsLoggedIn(true);
          return;
        } else {
          localStorage.removeItem('admin_logged_in');
          localStorage.removeItem('admin_login_time');
        }
      }
      
      setIsLoggedIn(false);
    };

    checkLogin();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!kategorieSlug) return;
      
      try {
        console.log('🔍 Načítám data pro kategorii:', kategorieSlug);
        
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
        const dataResponse = await fetch(`/api/data/${kategorieSlug}`, {
          cache: 'no-store'
        });
        
        if (!dataResponse.ok) {
          throw new Error('Chyba při načítání dat');
        }
        
        const result = await dataResponse.json();
        console.log('✅ Data načtena:', result);
        setData(result);
      } catch (error) {
        console.error('❌ Chyba při načítání dat:', error);
        setError('Nepodařilo se načíst data kategorie');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [kategorieSlug]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-bold mb-2">Chyba</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              ← Zpět na výběr kategorií
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!kategorie) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Kategorie nebyla nalezena</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="lg:container lg:mx-auto">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Image
                      src="/logo.png"
                      alt="Hokejbal Logo"
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                    <span className="text-gray-400">→</span>
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Pokuty {kategorie.nazev}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {kategorie.popis || 'Evidence pokut hokejbalového týmu'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors"
                  >
                    ← Kategorie
                  </Link>
                  {isLoggedIn ? (
                    <Link
                      href={`/${kategorieSlug}/admin`}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm"
                    >
                      ⚙️ Administrace
                    </Link>
                  ) : (
                    <Link
                      href={`/${kategorieSlug}/login`}
                      className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm"
                    >
                      Přihlásit se
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </header>
          <div className="pb-6"></div>
        </div>

        <EvidencePage 
          initialHraci={data.hraci} 
          initialPokuty={data.pokuty} 
          isLoggedIn={isLoggedIn}
          kategorie={kategorie}
          kategorieSlug={kategorieSlug}
          financniPrehled={data.financniPrehled}
        />

        {/* Footer */}
        <div className="hidden lg:block mt-6 text-center text-gray-500 px-3">
          <p className="text-xs">Pokuty {kategorie.nazev}</p>
        </div>
      </div>
    </main>
  );
}
