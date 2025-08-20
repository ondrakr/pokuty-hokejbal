'use client';

import { useState, useEffect } from 'react';
import { Kategorie } from '../../types';

interface PokutaTyp {
  id: number;
  nazev: string;
  cena: number;
  popis?: string;
  has_quantity?: boolean;
  unit?: string;
}

interface Props {
  onDataChange: () => void;
  kategorie?: Kategorie;
}

export default function SpravPokut({ onDataChange, kategorie }: Props) {
  const [pokutaTypy, setPokutaTypy] = useState<PokutaTyp[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState({ nazev: '', cena: 0, has_quantity: false, unit: '' });
  const [newPokuta, setNewPokuta] = useState({ nazev: '', cena: 0, has_quantity: false, unit: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Načtení typů pokut z API
  const loadPokutyTypy = async () => {
    try {
      const url = kategorie 
        ? `/api/pokuty-typy?kategorie_id=${kategorie.id}` 
        : '/api/pokuty-typy';
      
      // Timeout po 10 sekundách
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setPokutaTypy(data);
      } else {
        console.error('Chyba při načítání typů pokut - HTTP status:', response.status);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Načítání typů pokut bylo přerušeno - timeout');
      } else {
        console.error('Chyba při načítání typů pokut:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (kategorie?.id || !kategorie) {
      loadPokutyTypy();
    }
  }, [kategorie?.id]);

  const handleEdit = (pokuta: PokutaTyp) => {
    setEditingId(pokuta.id);
    setEditingData({
      nazev: pokuta.nazev,
      cena: pokuta.cena,
      has_quantity: pokuta.has_quantity || false,
      unit: pokuta.unit || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({ nazev: '', cena: 0, has_quantity: false, unit: '' });
  };

  const handleSave = async () => {
    if (!editingId || !editingData.nazev || editingData.cena <= 0) {
      alert('Vyplňte všechna povinná pole');
      return;
    }
    
    if (editingData.has_quantity && !editingData.unit) {
      alert('U pokut s množstvím musíte vybrat jednotku');
      return;
    }

    try {
      const response = await fetch('/api/pokuty-typy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: editingId, 
          nazev: editingData.nazev, 
          cena: editingData.cena, 
          popis: '',
          has_quantity: editingData.has_quantity,
          unit: editingData.unit
        }),
      });

      if (response.ok) {
        await loadPokutyTypy();
        setEditingId(null);
        setEditingData({ nazev: '', cena: 0, has_quantity: false, unit: '' });
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
    if (!newPokuta.nazev || newPokuta.cena <= 0 || !kategorie) {
      alert('Vyplňte všechna povinná pole');
      return;
    }
    
    if (newPokuta.has_quantity && !newPokuta.unit) {
      alert('U pokut s množstvím musíte vybrat jednotku');
      return;
    }
    
    if (newPokuta.nazev && newPokuta.cena > 0 && kategorie) {
      try {
        const response = await fetch('/api/pokuty-typy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newPokuta,
            kategorieId: kategorie.id
          }),
        });

        if (response.ok) {
          await loadPokutyTypy();
          setNewPokuta({ nazev: '', cena: 0, has_quantity: false, unit: '' });
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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Načítám typy pokut...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Ceník pokut</h2>
        {kategorie && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            + Přidat typ pokuty
          </button>
        )}
      </div>

      {/* Přidání nového typu pokuty */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Přidat nový typ pokuty</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
          
          {/* Typ pokuty */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Typ pokuty</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!newPokuta.has_quantity}
                  onChange={() => setNewPokuta(prev => ({ ...prev, has_quantity: false, unit: '' }))}
                  className="mr-2"
                />
                <span className="text-gray-700">Fixní pokuta (např. 100 Kč)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={newPokuta.has_quantity}
                  onChange={() => setNewPokuta(prev => ({ ...prev, has_quantity: true }))}
                  className="mr-2"
                />
                <span className="text-gray-700">Pokuta s množstvím (např. 5 Kč/min, 2 Kč za gól)</span>
              </label>
            </div>
          </div>

          {/* Jednotka - zobrazí se pouze pokud je has_quantity true */}
          {newPokuta.has_quantity && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jednotka</label>
              <select
                value={newPokuta.unit}
                onChange={(e) => setNewPokuta(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              >
                <option value="">Vyberte jednotku</option>
                <option value="min">za minutu (min)</option>
                <option value="gól">za gól</option>
                <option value="bod">za bod</option>
                <option value="asistence">za asistenci</option>
                <option value="kus">za kus</option>
              </select>
            </div>
          )}
          
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
                  Typ
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
                        value={editingData.nazev}
                        onChange={(e) => setEditingData(prev => ({ ...prev, nazev: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-black"
                        placeholder="Název pokuty"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{pokuta.nazev}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === pokuta.id ? (
                      <input
                        type="number"
                        value={editingData.cena}
                        onChange={(e) => setEditingData(prev => ({ ...prev, cena: parseInt(e.target.value) || 0 }))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-black"
                        placeholder="0"
                      />
                    ) : (
                      <div className="text-sm font-bold text-blue-600">
                        {pokuta.cena} Kč{pokuta.has_quantity && pokuta.unit ? `/${pokuta.unit}` : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === pokuta.id ? (
                      <div className="space-y-2">
                        {/* Typ pokuty */}
                        <div className="space-y-2">
                          <label className="flex items-center text-xs">
                            <input
                              type="radio"
                              checked={!editingData.has_quantity}
                              onChange={() => setEditingData(prev => ({ ...prev, has_quantity: false, unit: '' }))}
                              className="mr-1"
                            />
                            <span>Fixní</span>
                          </label>
                          <label className="flex items-center text-xs">
                            <input
                              type="radio"
                              checked={editingData.has_quantity}
                              onChange={() => setEditingData(prev => ({ ...prev, has_quantity: true }))}
                              className="mr-1"
                            />
                            <span>S množstvím</span>
                          </label>
                        </div>

                        {/* Jednotka - zobrazí se pouze pokud je has_quantity true */}
                        {editingData.has_quantity && (
                          <select
                            value={editingData.unit}
                            onChange={(e) => setEditingData(prev => ({ ...prev, unit: e.target.value }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-black text-xs"
                          >
                            <option value="">Jednotka</option>
                            <option value="min">min</option>
                            <option value="gól">gól</option>
                            <option value="bod">bod</option>
                            <option value="asistence">asistence</option>
                            <option value="kus">kus</option>
                          </select>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        {pokuta.has_quantity ? `Množství (${pokuta.unit || 'neurčeno'})` : 'Fixní'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === pokuta.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                        >
                          ✅ Uložit
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
                        >
                          ❌ Zrušit
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
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
                      </div>
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
