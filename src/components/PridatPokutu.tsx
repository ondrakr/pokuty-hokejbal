'use client';

import React, { useState, useEffect } from 'react';
import { Hrac, PokutaTyp, Kategorie } from '../../types';

interface Props {
  hraci: Hrac[];
  onPokutaPridana: () => void;
  kategorie?: Kategorie;
  predvybranyHrac?: Hrac;
  onClose?: () => void;
  forceOpen?: boolean;
}

interface PokutaItem {
  id: number;
  nazev: string;
  selected: boolean;
  quantity?: number;
  castka: number;
  vlastniCastka?: number; // Vlastní částka zadaná uživatelem
  hasQuantity: boolean;
  unit?: string;
}

export default function PridatPokutu({ hraci, onPokutaPridana, kategorie, predvybranyHrac, onClose, forceOpen }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHracIds, setSelectedHracIds] = useState<string[]>([]);
  const [pokuty, setPokuty] = useState<Record<number, PokutaItem>>({});
  const [loading, setLoading] = useState(false);
  const [typyPokutLoading, setTypyPokutLoading] = useState(true);

  // Načtení typů pokut z databáze
  useEffect(() => {
    const loadTypyPokut = async () => {
      try {
        const url = kategorie 
          ? `/api/pokuty-typy?kategorie_id=${kategorie.id}` 
          : '/api/pokuty-typy';
        const response = await fetch(url);
        if (response.ok) {
          const typyPokut: PokutaTyp[] = await response.json();
          
          // Převedeme na náš formát
          const pokutyMap: Record<number, PokutaItem> = {};
          typyPokut.forEach((typ) => {
            pokutyMap[typ.id] = {
              id: typ.id,
              nazev: typ.nazev,
              selected: false,
              quantity: typ.has_quantity ? 1 : undefined,
              castka: typ.cena,
              hasQuantity: typ.has_quantity || false,
              unit: typ.unit
            };
          });
          
          setPokuty(pokutyMap);
        }
      } catch (error) {
        console.error('Chyba při načítání typů pokut:', error);
      } finally {
        setTypyPokutLoading(false);
      }
    };

    loadTypyPokut();
  }, [kategorie]);

  // Nastavení předvybraného hráče při otevření modálu
  useEffect(() => {
    if (predvybranyHrac && isOpen) {
      setSelectedHracIds([predvybranyHrac.id.toString()]);
    }
  }, [predvybranyHrac, isOpen]);

  // Kontrola forceOpen prop
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHracIds.length === 0) {
      alert('Vyberte alespoň jednoho hráče');
      return;
    }

    const selectedPokuty = Object.values(pokuty).filter(p => p.selected);
    if (selectedPokuty.length === 0) {
      alert('Vyberte alespoň jednu pokutu');
      return;
    }

    setLoading(true);

    try {
      // Odešleme všechny vybrané pokuty pro všechny vybrané hráče
      for (const hracId of selectedHracIds) {
        for (const pokuta of selectedPokuty) {
          // Použijeme vlastní částku pokud je zadaná, jinak výchozí částku
          const baseCastka = pokuta.vlastniCastka !== undefined ? pokuta.vlastniCastka : pokuta.castka;
          const finalCastka = pokuta.quantity ? baseCastka * pokuta.quantity : baseCastka;
          
          const response = await fetch('/api/pokuty', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              hracId: hracId,
              typ: pokuta.nazev,
              castka: finalCastka,
              kategorieId: kategorie?.id,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            const hracJmeno = hraci.find(h => h.id.toString() === hracId)?.jmeno || 'Neznámý hráč';
            alert(`Chyba při přidávání pokuty pro ${hracJmeno}: ${error.error}`);
            return;
          }
        }
      }

      // Reset formuláře - resetujeme jen selected stavy
      setSelectedHracIds([]);
      setPokuty(prev => {
        const resetPokuty = { ...prev };
        Object.keys(resetPokuty).forEach(id => {
          resetPokuty[parseInt(id)] = {
            ...resetPokuty[parseInt(id)],
            selected: false,
            quantity: resetPokuty[parseInt(id)].hasQuantity ? 1 : undefined,
            vlastniCastka: undefined
          };
        });
        return resetPokuty;
      });
      setIsOpen(false);
      if (onClose) {
        onClose();
      }
      onPokutaPridana();
    } catch (error) {
      alert('Chyba při přidávání pokut');
    } finally {
      setLoading(false);
    }
  };

  const togglePokuta = (id: number) => {
    setPokuty(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        selected: !prev[id].selected
      }
    }));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setPokuty(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: Math.max(1, quantity)
      }
    }));
  };

  const updateVlastniCastka = (id: number, castka: number) => {
    setPokuty(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        vlastniCastka: Math.max(0, castka)
      }
    }));
  };

  const getTotalAmount = () => {
    return Object.values(pokuty)
      .filter(p => p.selected)
      .reduce((sum, p) => {
        // Použijeme vlastní částku pokud je zadaná, jinak výchozí částku
        const baseCastka = p.vlastniCastka !== undefined ? p.vlastniCastka : p.castka;
        const amount = p.quantity ? baseCastka * p.quantity : baseCastka;
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
          + Přidat pokuty
        </button>
      </div>

      {/* Modální okno */}
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{backgroundColor: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(4px)'}}
          onClick={() => {
            setIsOpen(false);
            if (onClose) {
              onClose();
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] lg:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Přidat novou pokutu</h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onClose) {
                      onClose();
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Výběr hráčů */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vyberte hráče ({selectedHracIds.length} vybráno)
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2 bg-white">
                    {hraci.map((hrac) => (
                      <div key={hrac.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`hrac-${hrac.id}`}
                          checked={selectedHracIds.includes(hrac.id.toString())}
                          onChange={(e) => {
                            const hracId = hrac.id.toString();
                            if (e.target.checked) {
                              setSelectedHracIds(prev => [...prev, hracId]);
                            } else {
                              setSelectedHracIds(prev => prev.filter(id => id !== hracId));
                            }
                          }}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`hrac-${hrac.id}`} className="text-sm text-gray-900 cursor-pointer flex-1">
                          {hrac.jmeno} ({hrac.role === 'trener' ? 'Trenér' : hrac.role === 'golman' ? 'Golman' : 'Hráč'})
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedHracIds.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedHracIds([])}
                        className="text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Zrušit výběr
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedHracIds(hraci.map(h => h.id.toString()))}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Vybrat všechny
                      </button>
                    </div>
                  )}
                </div>

                {/* Seznam pokut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vyberte typy pokut
                  </label>
                  {typyPokutLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Načítám typy pokut...</p>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2">
                      {Object.values(pokuty).map((pokuta) => {
                        // Použijeme vlastní částku pokud je zadaná, jinak výchozí částku
                        const baseCastka = pokuta.vlastniCastka !== undefined ? pokuta.vlastniCastka : pokuta.castka;
                        const finalAmount = pokuta.quantity ? baseCastka * pokuta.quantity : baseCastka;
                      
                        // Všichni hráči (hráč, gólman, trenér) nyní vidí všechny pokuty
                      
                        return (
                          <div key={pokuta.id} className="p-2 bg-gray-50 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`pokuta-${pokuta.id}`}
                                  checked={pokuta.selected}
                                  onChange={() => togglePokuta(pokuta.id)}
                                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`pokuta-${pokuta.id}`} className="text-sm text-gray-900 cursor-pointer">
                                  {pokuta.nazev}
                                </label>
                              </div>
                            
                              <div className="flex items-center gap-2">
                                {pokuta.hasQuantity && pokuta.selected && (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="1"
                                      value={pokuta.quantity || 1}
                                      onChange={(e) => updateQuantity(pokuta.id, parseInt(e.target.value) || 1)}
                                      className="w-16 p-1 text-xs border border-gray-300 rounded text-black"
                                    />
                                    <span className="text-xs text-gray-500">{pokuta.unit}</span>
                                  </div>
                                )}
                                <span className="text-sm font-semibold text-gray-900 min-w-[60px] text-right">
                                  {finalAmount} Kč
                                </span>
                              </div>
                            </div>
                          
                            {/* Vlastní částka - zobrazí se jen pokud je pokuta vybraná */}
                            {pokuta.selected && (
                              <div className="flex items-center gap-2 mt-2 pl-6">
                                <label className="text-xs text-gray-600 min-w-[100px]">
                                  Vlastní částka:
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  placeholder={`${pokuta.castka} Kč (výchozí)`}
                                  value={pokuta.vlastniCastka || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                      // Pokud je pole prázdné, odstraníme vlastní částku
                                      setPokuty(prev => ({
                                        ...prev,
                                        [pokuta.id]: {
                                          ...prev[pokuta.id],
                                          vlastniCastka: undefined
                                        }
                                      }));
                                    } else {
                                      updateVlastniCastka(pokuta.id, parseInt(value) || 0);
                                    }
                                  }}
                                  className="w-20 p-1 text-xs border border-gray-300 rounded text-black"
                                />
                                <span className="text-xs text-gray-500">Kč</span>
                                {pokuta.vlastniCastka !== undefined && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPokuty(prev => ({
                                        ...prev,
                                        [pokuta.id]: {
                                          ...prev[pokuta.id],
                                          vlastniCastka: undefined
                                        }
                                      }));
                                    }}
                                    className="text-xs text-red-500 hover:text-red-700"
                                    title="Vrátit na výchozí částku"
                                  >
                                    ↺ Reset
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Celková částka */}
                {getTotalAmount() > 0 && selectedHracIds.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Částka na hráče:</span>
                      <span className="text-xl font-bold text-blue-600">{getTotalAmount()} Kč</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading || selectedHracIds.length === 0 || getTotalAmount() === 0}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md"
                  >
                    {loading ? 'Přidávám...' : `Přidat pokuty ${selectedHracIds.length > 1 ? `${selectedHracIds.length} hráčům` : ''} (${getTotalAmount()} Kč)`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      if (onClose) {
                        onClose();
                      }
                    }}
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
