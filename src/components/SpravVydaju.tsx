'use client';

import { useState, useEffect } from 'react';
import { Kategorie, Vydaj } from '../../types';

interface Props {
  kategorie?: Kategorie;
  onDataChange?: () => void;
}

export default function SpravVydaju({ kategorie, onDataChange }: Props) {
  const [vydaje, setVydaje] = useState<Vydaj[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [formCastka, setFormCastka] = useState('');
  const [formPopis, setFormPopis] = useState('');
  const [formDatum, setFormDatum] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadVydaje();
  }, [kategorie]);

  const loadVydaje = async () => {
    if (!kategorie) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/vydaje?kategorie_id=${kategorie.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setVydaje(data);
      } else {
        console.error('Chyba při načítání výdajů');
      }
    } catch (error) {
      console.error('Chyba při načítání výdajů:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kategorie || !formCastka.trim() || !formPopis.trim()) {
      alert('Vyplňte všechna povinná pole');
      return;
    }

    const castka = parseInt(formCastka);
    if (isNaN(castka) || castka <= 0) {
      alert('Částka musí být kladné číslo');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/vydaje', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kategorieId: kategorie.id,
          castka: castka,
          popis: formPopis.trim(),
          datum: formDatum
        }),
      });

      if (response.ok) {
        // Reset formuláře
        setFormCastka('');
        setFormPopis('');
        setFormDatum(new Date().toISOString().split('T')[0]);
        setShowForm(false);
        
        // Reload dat
        await loadVydaje();
        
        if (onDataChange) {
          onDataChange();
        }
      } else {
        alert('Chyba při přidávání výdaje');
      }
    } catch (error) {
      console.error('Chyba při přidávání výdaje:', error);
      alert('Chyba při přidávání výdaje');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vydajId: number) => {
    if (!confirm('Opravdu chcete smazat tento výdaj?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vydaje/${vydajId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadVydaje();
        if (onDataChange) {
          onDataChange();
        }
      } else {
        alert('Chyba při mazání výdaje');
      }
    } catch (error) {
      console.error('Chyba při mazání výdaje:', error);
      alert('Chyba při mazání výdaje');
    }
  };

  const formatDate = (datum: string) => {
    return new Date(datum).toLocaleDateString('cs-CZ');
  };

  const celkemVydaje = vydaje.reduce((sum, vydaj) => sum + vydaj.castka, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">💸 Správa výdajů</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
        >
          {showForm ? '❌ Zrušit' : '➕ Přidat výdaj'}
        </button>
      </div>

      {/* Formulář pro přidání výdaje */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Nový výdaj</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="castka" className="block text-sm font-medium text-gray-700 mb-2">
                Částka (Kč) *
              </label>
              <input
                type="number"
                id="castka"
                value={formCastka}
                onChange={(e) => setFormCastka(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                min="1"
                step="1"
                required
              />
            </div>

            <div>
              <label htmlFor="datum" className="block text-sm font-medium text-gray-700 mb-2">
                Datum
              </label>
              <input
                type="date"
                id="datum"
                value={formDatum}
                onChange={(e) => setFormDatum(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="popis" className="block text-sm font-medium text-gray-700 mb-2">
              Popis výdaje *
            </label>
            <textarea
              id="popis"
              value={formPopis}
              onChange={(e) => setFormPopis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              rows={3}
              placeholder="Za co byly výdaje (např. nové dresy, míče, občerstvení...)"
              required
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Přidávám...
                </>
              ) : (
                <>💾 Přidat výdaj</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Celkové výdaje */}
      {vydaje.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-800">Celkové výdaje:</span>
            <span className="text-2xl font-bold text-red-600">
              {celkemVydaje} Kč
            </span>
          </div>
        </div>
      )}

      {/* Seznam výdajů */}
      <div className="space-y-3">
        {vydaje.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Zatím nejsou evidovány žádné výdaje.</p>
            <p className="text-sm mt-2">Kliknutím na "Přidat výdaj" přidáte první záznam.</p>
          </div>
        ) : (
          vydaje.map((vydaj) => (
            <div key={vydaj.id} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-red-600">{vydaj.castka} Kč</span>
                    <span className="text-sm text-gray-500">{formatDate(vydaj.datum)}</span>
                  </div>
                  <p className="text-gray-700">{vydaj.popis}</p>
                </div>
                <button
                  onClick={() => handleDelete(vydaj.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Smazat výdaj"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
