'use client';

import { useState } from 'react';
import { HracSPokutami, Hrac } from '../../types';
import PlatebniModal from './PlatebniModal';

interface Props {
  hraci: HracSPokutami[];
  onDataChange: () => void;
}

export default function HraciSeznam({ hraci, onDataChange }: Props) {
  const [rozbaleniHraci, setRozbaleniHraci] = useState<Set<number>>(new Set());
  const [platebniModal, setPlatebniModal] = useState<{
    isOpen: boolean;
    hrac: Hrac | null;
    zbyva: number;
  }>({
    isOpen: false,
    hrac: null,
    zbyva: 0
  });

  const toggleRozbaleni = (hracId: number) => {
    const newRozbaleni = new Set(rozbaleniHraci);
    if (newRozbaleni.has(hracId)) {
      newRozbaleni.delete(hracId);
    } else {
      newRozbaleni.add(hracId);
    }
    setRozbaleniHraci(newRozbaleni);
  };

  const formatDatum = (datum: string) => {
    return new Date(datum).toLocaleDateString('cs-CZ');
  };

  const openPlatebniModal = (hrac: Hrac, zbyva: number) => {
    setPlatebniModal({
      isOpen: true,
      hrac,
      zbyva
    });
  };

  const closePlatebniModal = () => {
    setPlatebniModal({
      isOpen: false,
      hrac: null,
      zbyva: 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vse_zaplaceno':
        return 'bg-green-100 text-green-800';
      case 'nic_nezaplaceno':
        return 'bg-red-100 text-red-800';
      case 'neco_chybi':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'vse_zaplaceno':
        return 'Zaplaceno vše';
      case 'nic_nezaplaceno':
        return 'Nezaplaceno nic';
      case 'neco_chybi':
        return 'Něco chybí';
      default:
        return 'Neznámý stav';
    }
  };

  // Seřadíme hráče podle zbývající částky (nejvyšší dluh první)
  const sortedHraci = [...hraci].sort((a, b) => b.zbyva - a.zbyva);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 text-white p-3">
        <h2 className="text-lg font-bold">Seznam hráčů a příspěvky</h2>
        <p className="text-green-100 mt-1 text-sm">Klikněte na hráče pro zobrazení detailů</p>
      </div>

      {/* Seznam hráčů */}
      <div>
        {sortedHraci.map((hrac) => {
          const jerozbalen = rozbaleniHraci.has(hrac.id);

          return (
            <div key={hrac.id} className="border-b border-gray-200 last:border-b-0">
              {/* Hlavní řádek hráče */}
              <div
                className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => toggleRozbaleni(hrac.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      hrac.role === 'trener' ? 'bg-purple-100 text-purple-800' :
                      hrac.role === 'golman' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {hrac.role === 'trener' ? 'T' : hrac.role === 'golman' ? 'G' : 'H'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{hrac.jmeno}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(hrac.status)}`}>
                          {getStatusText(hrac.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {hrac.role === 'trener' ? 'Trenér' : hrac.role === 'golman' ? 'Golman' : 'Hráč'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Celkem</p>
                      <p className="text-sm font-bold text-gray-900">{hrac.celkovaCastka} Kč</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Zaplaceno</p>
                      <p className="text-sm font-semibold text-green-600">{hrac.zaplaceno} Kč</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Zbývá</p>
                      <p className={`text-sm font-semibold ${hrac.zbyva > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {hrac.zbyva} Kč
                      </p>
                    </div>
                    {hrac.zbyva > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPlatebniModal(hrac, hrac.zbyva);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                      >
                        Zaplaceno
                      </button>
                    )}
                    <div className="ml-2">
                      <div className={`transform transition-transform text-xs ${jerozbalen ? 'rotate-180' : ''}`}>
                        ▼
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rozbalené detaily pokut */}
              {jerozbalen && (
                <div className="bg-gray-50 border-t border-gray-200">
                  <div className="p-3">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Detail pokut:</h4>
                    {hrac.pokuty.length === 0 ? (
                      <p className="text-gray-500 italic text-sm">Žádné pokuty</p>
                    ) : (
                      <div className="space-y-2">
                        {hrac.pokuty
                          .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
                          .map((pokuta) => (
                          <div
                            key={pokuta.id}
                            className="bg-white p-2 rounded border border-gray-200 flex justify-between items-center"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 text-sm">{pokuta.typ}</span>
                                <span className="text-xs text-gray-500">{formatDatum(pokuta.datum)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {pokuta.castka} Kč
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer s celkovými součty */}
      <div className="bg-gray-100 p-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-800">Celkem za tým:</span>
          <div className="flex gap-4">
            <div className="text-right">
              <span className="text-xs text-gray-500">Celková částka: </span>
              <span className="text-sm font-bold text-gray-900">
                {hraci.reduce((sum, hrac) => sum + hrac.celkovaCastka, 0)} Kč
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Zaplaceno: </span>
              <span className="text-sm font-bold text-green-600">
                {hraci.reduce((sum, hrac) => sum + hrac.zaplaceno, 0)} Kč
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Zbývá: </span>
              <span className="text-sm font-bold text-red-600">
                {hraci.reduce((sum, hrac) => sum + hrac.zbyva, 0)} Kč
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Platební modál */}
      <PlatebniModal
        isOpen={platebniModal.isOpen}
        onClose={closePlatebniModal}
        hrac={platebniModal.hrac}
        zbyva={platebniModal.zbyva}
        onPlatbaProvedena={onDataChange}
      />
    </div>
  );
}
