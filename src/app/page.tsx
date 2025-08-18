import { HracSPokutami, Pokuta } from '../../types';
import EvidencePage from '@/components/EvidencePage';

async function getData() {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/data`, {
      cache: 'no-store' // Vždy načíst čerstvá data
    });
    
    if (!response.ok) {
      throw new Error('Chyba při načítání dat');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chyba při načítání dat:', error);
    // Fallback prázdná data
    return { hraci: [], pokuty: [], platby: [] };
  }
}

export default async function Home() {
  const { hraci, pokuty } = await getData();

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Mobile/Desktop layout */}
      <div className="lg:container lg:mx-auto">
        {/* Desktop Header - hidden on mobile */}
        <div className="hidden lg:block px-3 py-4">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              🏒 Evidence pokut hokejbalového týmu - JUNIOŘI
            </h1>
            <p className="text-sm text-gray-600">
              Příspěvky na rozlučku na konci sezóny
            </p>
          </div>
        </div>

        {/* Komponenta s interaktivitou */}
        <EvidencePage initialHraci={hraci} initialPokuty={pokuty} />

        {/* Footer - hidden on mobile */}
        <div className="hidden lg:block mt-6 text-center text-gray-500 px-3">
          <p className="text-xs">Systém evidence příspěvků • Hokejbalový tým JUNIOŘI • Rozlučka sezóny</p>
        </div>
      </div>
    </main>
  );
}