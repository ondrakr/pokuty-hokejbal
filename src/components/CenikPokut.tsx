'use client';

import { useState, useEffect } from 'react';
import { Kategorie } from '../../types';

interface PokutaTyp {
  id: number;
  nazev: string;
  cena: number;
  popis?: string;
}

interface Props {
  kategorie?: Kategorie;
}

export default function CenikPokut({ kategorie }: Props) {
  const [pokutyCenik, setPokutyCenik] = useState<PokutaTyp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCenik = async () => {
      try {
        const url = kategorie 
          ? `/api/pokuty-typy?kategorie_id=${kategorie.id}` 
          : '/api/pokuty-typy';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setPokutyCenik(data);
        }
      } catch (error) {
        console.error('Chyba při načítání ceníku:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCenik();
  }, [kategorie]);
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header s logem a názvem */}
      <div className="bg-blue-600 text-white p-3">
        <h2 className="text-lg font-bold">Seznam pokut</h2>
      </div>

      {/* Seznam pokut */}
      <div className="p-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-1">
            {pokutyCenik.map((pokuta) => (
              <div key={pokuta.id} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-800 text-sm font-medium">{pokuta.nazev}</span>
                <span className="text-sm font-bold text-blue-600">
                  {pokuta.cena} Kč{pokuta.has_quantity && pokuta.unit ? `/${pokuta.unit}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
