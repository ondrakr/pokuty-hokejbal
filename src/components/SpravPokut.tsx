'use client';

import { useState } from 'react';

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
  const [pokutaTypy, setPokutaTypy] = useState<PokutaTyp[]>([
    { id: 1, nazev: 'První gól', cena: 100, popis: 'První gól v zápase' },
    { id: 2, nazev: 'Vítězný gól', cena: 20, popis: 'Rozhodující gól' },
    { id: 3, nazev: 'První start', cena: 100, popis: 'První start v sezóně' },
    { id: 4, nazev: 'Vychytaná nula', cena: 100, popis: 'Čisté konto brankáře' },
    { id: 5, nazev: 'Hattrick', cena: 200, popis: 'Tři góly v jednom zápase' },
    { id: 6, nazev: 'Poprvé kapitán', cena: 200, popis: 'První kapitánská páska' },
    { id: 7, nazev: 'První asistence', cena: 50, popis: 'První asistence v sezóně' },
    { id: 8, nazev: 'Obdržený gól', cena: 2, popis: 'Gól proti brankáři' },
    { id: 9, nazev: 'Žlutá karta', cena: 50, popis: 'Napomenutí rozhodčího' },
    { id: 10, nazev: 'Červená karta', cena: 200, popis: 'Vyloučení ze hry' },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPokuta, setNewPokuta] = useState({ nazev: '', cena: 0, popis: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (pokuta: PokutaTyp) => {
    setEditingId(pokuta.id);
  };

  const handleSave = (id: number, nazev: string, cena: number, popis: string) => {
    setPokutaTypy(prev => prev.map(p => 
      p.id === id ? { ...p, nazev, cena, popis } : p
    ));
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Opravdu chcete smazat tento typ pokuty?')) {
      setPokutaTypy(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAdd = () => {
    if (newPokuta.nazev && newPokuta.cena > 0) {
      const id = Math.max(...pokutaTypy.map(p => p.id), 0) + 1;
      setPokutaTypy(prev => [...prev, { id, ...newPokuta }]);
      setNewPokuta({ nazev: '', cena: 0, popis: '' });
      setShowAddForm(false);
    }
  };

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
