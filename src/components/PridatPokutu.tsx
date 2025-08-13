'use client';

import { useState } from 'react';
import { Hrac } from '../../types';

interface Props {
  hraci: Hrac[];
  onPokutaPridana: () => void;
}

interface PokutaItem {
  typ: string;
  selected: boolean;
  quantity?: number;
  castka: number;
}

const typyPokut: Record<string, { castka: number; hasQuantity: boolean; unit?: string }> = {
  'První start': { castka: 100, hasQuantity: false },
  'První gól': { castka: 100, hasQuantity: false },
  'První asistence': { castka: 50, hasQuantity: false },
  'Hattrick': { castka: 200, hasQuantity: false },
  'Desátý gól': { castka: 50, hasQuantity: false },
  'Vyšší trest - faul': { castka: 100, hasQuantity: false },
  'Vyšší trest - nesportovní chování': { castka: 200, hasQuantity: false },
  'Neomluvený pozdní příchod na zápas': { castka: 5, hasQuantity: true, unit: 'minut' },
  'Poprvé kapitán': { castka: 200, hasQuantity: false },
  'Poprvé asistent': { castka: 100, hasQuantity: false },
  'Vítězný gól': { castka: 20, hasQuantity: false },
  'Nesplněný trest (flašky, míčky, ...)': { castka: 100, hasQuantity: false },
  'Trest pro trenéra': { castka: 500, hasQuantity: false },
  'Obdržený gól': { castka: 2, hasQuantity: true, unit: 'gólů' },
  'Vychytaná nula': { castka: 100, hasQuantity: false }
};

export default function PridatPokutu({ hraci, onPokutaPridana }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHracId, setSelectedHracId] = useState('');
  const [pokuty, setPokuty] = useState<Record<string, PokutaItem>>(
    Object.keys(typyPokut).reduce((acc, typ) => {
      acc[typ] = {
        typ,
        selected: false,
        quantity: typyPokut[typ].hasQuantity ? 1 : undefined,
        castka: typyPokut[typ].castka
      };
      return acc;
    }, {} as Record<string, PokutaItem>)
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHracId) {
      alert('Vyberte hráče');
      return;
    }

    const selectedPokuty = Object.values(pokuty).filter(p => p.selected);
    if (selectedPokuty.length === 0) {
      alert('Vyberte alespoň jednu pokutu');
      return;
    }

    setLoading(true);

    try {
      // Odešleme všechny vybrané pokuty najednou
      for (const pokuta of selectedPokuty) {
        const finalCastka = pokuta.quantity ? pokuta.castka * pokuta.quantity : pokuta.castka;
        
        const response = await fetch('/api/pokuty', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hracId: selectedHracId,
            typ: pokuta.typ,
            castka: finalCastka,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          alert('Chyba při přidávání pokuty: ' + error.error);
          return;
        }
      }

      // Reset formuláře
      setSelectedHracId('');
      setPokuty(Object.keys(typyPokut).reduce((acc, typ) => {
        acc[typ] = {
          typ,
          selected: false,
          quantity: typyPokut[typ].hasQuantity ? 1 : undefined,
          castka: typyPokut[typ].castka
        };
        return acc;
      }, {} as Record<string, PokutaItem>));
      setIsOpen(false);
      onPokutaPridana();
    } catch (error) {
      alert('Chyba při přidávání pokut');
    } finally {
      setLoading(false);
    }
  };

  const togglePokuta = (typ: string) => {
    setPokuty(prev => ({
      ...prev,
      [typ]: {
        ...prev[typ],
        selected: !prev[typ].selected
      }
    }));
  };

  const updateQuantity = (typ: string, quantity: number) => {
    setPokuty(prev => ({
      ...prev,
      [typ]: {
        ...prev[typ],
        quantity: Math.max(1, quantity)
      }
    }));
  };

  const getTotalAmount = () => {
    return Object.values(pokuty)
      .filter(p => p.selected)
      .reduce((sum, p) => {
        const amount = p.quantity ? p.castka * p.quantity : p.castka;
        return sum + amount;
      }, 0);
  };

  return (
    <>
      <div className="mb-3">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full lg:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 justify-center"
        >
          ➕ Přidat pokuty
        </button>
      </div>

      {/* Modální okno */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] lg:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Přidat novou pokutu</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Výběr hráče */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vyberte hráče
                  </label>
                  <select
                    value={selectedHracId}
                    onChange={(e) => setSelectedHracId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
                    required
                  >
                    <option value="">Vyberte hráče</option>
                    {hraci.map((hrac) => (
                      <option key={hrac.id} value={hrac.id}>
                        {hrac.jmeno} ({hrac.role === 'trener' ? 'Trenér' : hrac.role === 'golman' ? 'Golman' : 'Hráč'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seznam pokut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vyberte typy pokut
                  </label>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2">
                    {Object.entries(typyPokut).map(([typ, config]) => {
                      const pokuta = pokuty[typ];
                      const finalAmount = pokuta.quantity ? config.castka * pokuta.quantity : config.castka;
                      
                      // Zjistíme roli vybraného hráče
                      const selectedHrac = hraci.find(h => h.id.toString() === selectedHracId);
                      const isTrener = selectedHrac?.role === 'trener';
                      
                      // Pokud je trenér, zobrazíme jen "Trest pro trenéra"
                      if (isTrener && typ !== 'Trest pro trenéra') {
                        return null;
                      }
                      
                      return (
                        <div key={typ} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={typ}
                              checked={pokuta.selected}
                              onChange={() => togglePokuta(typ)}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <label htmlFor={typ} className="text-sm text-gray-900 cursor-pointer">
                              {typ}
                            </label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {config.hasQuantity && pokuta.selected && (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="1"
                                  value={pokuta.quantity || 1}
                                  onChange={(e) => updateQuantity(typ, parseInt(e.target.value) || 1)}
                                  className="w-16 p-1 text-xs border border-gray-300 rounded text-black"
                                />
                                <span className="text-xs text-gray-500">{config.unit}</span>
                              </div>
                            )}
                            <span className="text-sm font-semibold text-gray-900 min-w-[60px] text-right">
                              {finalAmount} Kč
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Celková částka */}
                {getTotalAmount() > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Celková částka:</span>
                      <span className="text-xl font-bold text-blue-600">{getTotalAmount()} Kč</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading || !selectedHracId || getTotalAmount() === 0}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md"
                  >
                    {loading ? 'Přidávám...' : `Přidat pokuty (${getTotalAmount()} Kč)`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-4 rounded-md"
                  >
                    Zrušit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
