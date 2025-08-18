'use client';

import { useState, useEffect } from 'react';
import { Hrac, Pokuta, Platba } from '../../../types';
import AdminPage from '../../components/AdminPage';

export default function Admin() {
  const [data, setData] = useState<{ hraci: Hrac[], pokuty: Pokuta[], platby: Platba[] }>({
    hraci: [],
    pokuty: [],
    platby: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <AdminPage initialHraci={data.hraci} initialPokuty={data.pokuty} initialPlatby={data.platby} />
    </main>
  );
}