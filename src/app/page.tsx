'use client';

import { useState, useEffect } from 'react';
import { HracSPokutami, Pokuta } from '../../types';
import EvidencePage from '@/components/EvidencePage';
import Image from 'next/image';

export default function Home() {
  const [data, setData] = useState<{ hraci: HracSPokutami[], pokuty: Pokuta[] }>({
    hraci: [],
    pokuty: []
  });
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
          // Přihlášení vypršelo
          localStorage.removeItem('admin_logged_in');
          localStorage.removeItem('admin_login_time');
        }
      }
      
      // Pokud není přihlášen nebo přihlášení vypršelo
      setIsLoggedIn(false);
    };

    checkLogin();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 Načítám data z /api/data');
        const response = await fetch('/api/data', {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Chyba při načítání dat');
        }
        
        const result = await response.json();
        console.log('✅ Data načtena:', result);
        setData(result);
      } catch (error) {
        console.error('❌ Chyba při načítání dat:', error);
        setData({ hraci: [], pokuty: [] });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Mobile/Desktop layout */}
      <div className="lg:container lg:mx-auto">
        {/* Desktop Header - hidden on mobile */}
        <div className="hidden lg:block px-3 py-4">
          <div className="text-center mb-4 relative">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              🏒 Pokuty Junioři
            </h1>
            
            {/* QR kód */}
            <div className="flex justify-center mb-4">
              <Image
                src="/qr-kod.jpg"
                alt="QR kód pro platby"
                width={200}
                height={200}
                className="rounded-lg shadow-md"
              />
            </div>
           
            
            {/* Tlačítko přihlášení/administrace */}
            <div className="absolute top-0 right-0">
              {isLoggedIn ? (
                <a
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  ⚙️ Administrace
                </a>
              ) : (
                <a
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  🔐 Přihlášení
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Komponenta s interaktivitou */}
        <EvidencePage initialHraci={data.hraci} initialPokuty={data.pokuty} isLoggedIn={isLoggedIn} />

        {/* Footer - hidden on mobile */}
        <div className="hidden lg:block mt-6 text-center text-gray-500 px-3">
          <p className="text-xs">Pokuty Junioři</p>
        </div>
      </div>
    </main>
  );
}