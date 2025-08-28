'use client';

import { useState, useEffect } from 'react';
import { Kategorie, Pokladna, FinancniPrehled } from '../../types';

interface Props {
  kategorie?: Kategorie;
  onDataChange?: () => void;
  financniPrehled?: FinancniPrehled;
}

export default function SpravPokladny({ kategorie, onDataChange, financniPrehled }: Props) {
  const [pokladna, setPokladna] = useState<Pokladna | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedCastka, setEditedCastka] = useState<string>('');
  const [editedPopis, setEditedPopis] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadPokladna();
  }, [kategorie]);

  const loadPokladna = async () => {
    if (!kategorie) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/pokladna?kategorie_id=${kategorie.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setPokladna(data);
        setEditedCastka(data?.celkovaCastka?.toString() || '0');
        setEditedPopis(data?.popis || '');
      } else {
        console.error('Chyba při načítání pokladny');
      }
    } catch (error) {
      console.error('Chyba při načítání pokladny:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!kategorie) return;

    const castka = parseInt(editedCastka) || 0;
    
    try {
      setSaving(true);
      const response = await fetch('/api/pokladna', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kategorieId: kategorie.id,
          celkovaCastka: castka,
          popis: editedPopis.trim()
        }),
      });

      if (response.ok) {
        const updatedPokladna = await response.json();
        setPokladna(updatedPokladna);
        setIsEditing(false);
        if (onDataChange) {
          onDataChange();
        }
      } else {
        alert('Chyba při ukládání částky v pokladně');
      }
    } catch (error) {
      console.error('Chyba při ukládání:', error);
      alert('Chyba při ukládání částky v pokladně');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedCastka(pokladna?.celkovaCastka?.toString() || '0');
    setEditedPopis(pokladna?.popis || '');
    setIsEditing(false);
  };

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
        <h2 className="text-xl font-bold text-gray-900">💰 Správa pokladny</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            ✏️ Upravit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="castka" className="block text-sm font-medium text-gray-700 mb-2">
              Ručně přidaná částka (Kč)
            </label>
            <input
              type="number"
              id="castka"
              value={editedCastka}
              onChange={(e) => setEditedCastka(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              min="0"
              step="1"
            />
          </div>

          <div>
            <label htmlFor="popis" className="block text-sm font-medium text-gray-700 mb-2">
              Popis původu částky (volitelné)
            </label>
            <textarea
              id="popis"
              value={editedPopis}
              onChange={(e) => setEditedPopis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              rows={3}
              placeholder="Např. Částka z předchozí sezóny, příjem z akcí..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Ukládám...
                </>
              ) : (
                <>💾 Uložit</>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ❌ Zrušit
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-green-800">Aktuální částka v pokladně:</span>
              <span className={`text-2xl font-bold ${
                ((pokladna?.celkovaCastka || 0) + (financniPrehled?.celkemZaplaceno || 0) - (financniPrehled?.celkemVydaje || 0)) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {(pokladna?.celkovaCastka || 0) + (financniPrehled?.celkemZaplaceno || 0) - (financniPrehled?.celkemVydaje || 0)} Kč
              </span>

            </div>
            
            {/* Rozložení částky */}
            <div className="space-y-2 text-sm border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Zaplacené pokuty:</span>
                <span className="font-semibold text-green-600">
                  +{financniPrehled?.celkemZaplaceno || 0} Kč
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ručně přidáno:</span>
                <span className="font-semibold text-blue-600">
                  +{pokladna?.celkovaCastka || 0} Kč
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Výdaje:</span>
                <span className="font-semibold text-red-600">
                  -{financniPrehled?.celkemVydaje || 0} Kč
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2 font-bold">
                <span className="text-gray-800">Výsledek:</span>
                <span className={
                  ((pokladna?.celkovaCastka || 0) + (financniPrehled?.celkemZaplaceno || 0) - (financniPrehled?.celkemVydaje || 0)) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }>
                  {(pokladna?.celkovaCastka || 0) + (financniPrehled?.celkemZaplaceno || 0) - (financniPrehled?.celkemVydaje || 0)} Kč
                </span>
              </div>
            </div>
          </div>

          {pokladna?.popis && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Popis:</h3>
              <p className="text-gray-600">{pokladna.popis}</p>
            </div>
          )}

          <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
            <p><strong>ℹ️ Informace:</strong></p>
            <p>Aktuální částka v pokladně = Zaplacené pokuty + Ručně přidaná částka - Výdaje. Pokud je výsledek záporný (červený), znamená to, že jste utratili více, než máte v pokladně.</p>
          </div>
        </div>
      )}
    </div>
  );
}
