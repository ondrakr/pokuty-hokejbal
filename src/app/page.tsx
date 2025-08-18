'use client';

import { useState, useEffect } from 'react';
import { HracSPokutami, Pokuta } from '../../types';
import EvidencePage from '@/components/EvidencePage';

export default function Home() {
  const [data, setData] = useState<{ hraci: HracSPokutami[], pokuty: Pokuta[] }>({
    hraci: [],
    pokuty: []
  });
  const [loading, setLoading] = useState(true);

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
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              🏒 Pokuty Junioři
            </h1>
            <p className="text-sm text-gray-600">
              Příspěvky na rozlučku na konci sezóny
            </p>
          </div>
        </div>

        {/* Komponenta s interaktivitou */}
        <EvidencePage initialHraci={data.hraci} initialPokuty={data.pokuty} />

        {/* Footer - hidden on mobile */}
        <div className="hidden lg:block mt-6 text-center text-gray-500 px-3">
          <p className="text-xs">Pokuty Junioři</p>
        </div>
      </div>
    </main>
  );
}