'use client';

import { useState, useEffect } from 'react';

interface PokutaTyp {
  id: number;
  nazev: string;
  cena: number;
  popis?: string;
}

interface Props {
  onDataChange: () => void;
}

export default function SpravPokut({ onDataChange }: Props) {
  const [pokutaTypy, setPokutaTypy] = useState<PokutaTyp[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPokuta, setNewPokuta] = useState({ nazev: '', cena: 0, popis: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Načtení typů pokut z API
  const loadPokutyTypy = async () => {
    try {
      const response = await fetch('/api/pokuty-typy');
      if (response.ok) {
        const data = await response.json();
        setPokutaTypy(data);
      } else {
        console.error('Chyba při načítání typů pokut');
      }
    } catch (error) {
      console.error('Chyba při načítání typů pokut:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPokutyTypy();
  }, []);

  const handleEdit = (pokuta: PokutaTyp) => {
    setEditingId(pokuta.id);
  };

  const handleSave = async (id: number, nazev: string, cena: number, popis: string) => {
    try {
      const response = await fetch('/api/pokuty-typy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, nazev, cena, popis }),
      });

      if (response.ok) {
        await loadPokutyTypy();
        setEditingId(null);
      } else {
        alert('Chyba při aktualizaci typu pokuty');
      }
    } catch (error) {
      alert('Chyba při aktualizaci typu pokuty');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Opravdu chcete smazat tento typ pokuty?')) {
      try {
        const response = await fetch(`/api/pokuty-typy/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await loadPokutyTypy();
        } else {
          alert('Chyba při mazání typu pokuty');
        }
      } catch (error) {
        alert('Chyba při mazání typu pokuty');
      }
    }
  };

  const handleAdd = async () => {
    if (newPokuta.nazev && newPokuta.cena > 0) {
      try {
        const response = await fetch('/api/pokuty-typy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPokuta),
        });

        if (response.ok) {
          await loadPokutyTypy();
          setNewPokuta({ nazev: '', cena: 0, popis: '' });
          setShowAddForm(false);
        } else {
          alert('Chyba při přidávání typu pokuty');
        }
      } catch (error) {
        alert('Chyba při přidávání typu pokuty');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Ceník pokut</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          + Přidat typ pokuty
        </button>
      </div>

      {/* Přidání nového typu pokuty */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Přidat nový typ pokuty</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Název</label>
              <input
                type="text"
                value={newPokuta.nazev}
                onChange={(e) => setNewPokuta(prev => ({ ...prev, nazev: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                placeholder="Název pokuty"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cena (Kč)</label>
              <input
                type="number"
                value={newPokuta.cena}
                onChange={(e) => setNewPokuta(prev => ({ ...prev, cena: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Popis</label>
              <input
                type="text"
                value={newPokuta.popis}
                onChange={(e) => setNewPokuta(prev => ({ ...prev, popis: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                placeholder="Popis pokuty"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Přidat
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {/* Tabulka typů pokut */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Název pokuty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cena
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Popis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pokutaTypy.map((pokuta) => (
                <tr key={pokuta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === pokuta.id ? (
                      <input
                        type="text"
                        defaultValue={pokuta.nazev}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-black"
                        onBlur={(e) => {
                          const cenaInput = e.target.parentElement?.parentElement?.querySelector('input[type="number"]') as HTMLInputElement;
                          const opisInput = e.target.parentElement?.parentElement?.querySelector('input[type="text"]:last-of-type') as HTMLInputElement;
                          handleSave(pokuta.id, e.target.value, parseInt(cenaInput?.value || '0'), opisInput?.value || '');
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{pokuta.nazev}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === pokuta.id ? (
                      <input
                        type="number"
                        defaultValue={pokuta.cena}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-black"
                      />
                    ) : (
                      <div className="text-sm font-bold text-blue-600">{pokuta.cena} Kč</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === pokuta.id ? (
                      <input
                        type="text"
                        defaultValue={pokuta.popis}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-black"
                      />
                    ) : (
                      <div className="text-sm text-gray-600">{pokuta.popis}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {editingId === pokuta.id ? (
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Uložit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(pokuta)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Upravit
                        </button>
                        <button
                          onClick={() => handleDelete(pokuta.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Smazat
                        </button>
                      </>
                    )}
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
