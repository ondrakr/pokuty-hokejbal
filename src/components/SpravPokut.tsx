'use client';

import { useState } from 'react';
import { Pokuta, Hrac } from '../../types';

interface Props {
  pokuty: Pokuta[];
  hraci: Hrac[];
  onDataChange: () => void;
}

export default function SpravPokut({ pokuty, hraci, onDataChange }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    zaplaceno: false
  });

  const getHracJmeno = (hracId: number) => {
    const hrac = hraci.find(h => h.id === hracId);
    return hrac ? hrac.jmeno : 'Neznámý hráč';
  };

  const formatDatum = (datum: string) => {
    return new Date(datum).toLocaleDateString('cs-CZ');
  };

  const handleToggleZaplaceno = async (pokutaId: number, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/pokuty', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: pokutaId, 
          zaplaceno: !currentStatus 
        }),
      });

      if (response.ok) {
        onDataChange();
      } else {
        alert('Chyba při aktualizaci pokuty');
      }
    } catch (error) {
      alert('Chyba při aktualizaci pokuty');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Opravdu chcete smazat tuto pokutu?')) return;
    
    try {
      const response = await fetch(`/api/pokuty/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDataChange();
      } else {
        alert('Chyba při mazání pokuty');
      }
    } catch (error) {
      alert('Chyba při mazání pokuty');
    }
  };

  // Seřadíme pokuty podle data (nejnovější první)
  const sortedPokuty = [...pokuty].sort((a, b) => 
    new Date(b.datum).getTime() - new Date(a.datum).getTime()
  );

  const celkovaPokutaNezaplacena = pokuty
    .filter(p => !p.zaplaceno)
    .reduce((sum, p) => sum + p.castka, 0);

  const celkovaPokutaZaplacena = pokuty
    .filter(p => p.zaplaceno)
    .reduce((sum, p) => sum + p.castka, 0);

  return (
    <div className="space-y-6">
      {/* Statistiky */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500">Celkem pokut</div>
          <div className="text-2xl font-bold text-gray-900">{pokuty.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500">Nezaplaceno</div>
          <div className="text-2xl font-bold text-red-600">{celkovaPokutaNezaplacena} Kč</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500">Zaplaceno</div>
          <div className="text-2xl font-bold text-green-600">{celkovaPokutaZaplacena} Kč</div>
        </div>
      </div>

      {/* Seznam pokut */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-bold text-gray-900">Seznam všech pokut</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hráč
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ pokuty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Částka
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPokuty.map((pokuta) => (
                <tr key={pokuta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDatum(pokuta.datum)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getHracJmeno(pokuta.hracId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pokuta.typ}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pokuta.castka} Kč
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pokuta.zaplaceno 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pokuta.zaplaceno ? 'Zaplaceno' : 'Nezaplaceno'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleToggleZaplaceno(pokuta.id, pokuta.zaplaceno)}
                      className={`${
                        pokuta.zaplaceno 
                          ? 'text-orange-600 hover:text-orange-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {pokuta.zaplaceno ? 'Označit jako nezaplaceno' : 'Označit jako zaplaceno'}
                    </button>
                    <button
                      onClick={() => handleDelete(pokuta.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Smazat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
