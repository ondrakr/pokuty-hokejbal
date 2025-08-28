'use client';

import { Vydaj } from '../../types';

interface Props {
  vydaje: Vydaj[];
  showModal?: boolean;
  onClose?: () => void;
}

export default function SeznamVydaju({ vydaje, showModal = false, onClose }: Props) {
  const formatDate = (datum: string) => {
    return new Date(datum).toLocaleDateString('cs-CZ');
  };

  const celkemVydaje = vydaje.reduce((sum, vydaj) => sum + vydaj.castka, 0);

  // Desktop modální okno
  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)'}}>
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center rounded-t-lg">
            <h3 className="text-lg font-bold text-gray-900">💸 Seznam výdajů</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ✕
            </button>
          </div>
          
          <div className="p-4">
            {vydaje.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Zatím nejsou evidovány žádné výdaje.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vydaje.map((vydaj) => (
                  <div key={vydaj.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-red-600">{vydaj.castka} Kč</span>
                          <span className="text-sm text-gray-500">{formatDate(vydaj.datum)}</span>
                        </div>
                        <p className="text-gray-700">{vydaj.popis}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Celkové výdaje */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800">Celkové výdaje:</span>
                    <span className="text-xl font-bold text-red-600">
                      {celkemVydaje} Kč
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mobile zobrazení (podobné ceníku pokut)
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-red-600 text-white p-3">
        <h2 className="text-lg font-bold">💸 Seznam výdajů</h2>
      </div>

      {/* Seznam výdajů */}
      <div className="p-3">
        {vydaje.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Zatím nejsou evidovány žádné výdaje.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vydaje.map((vydaj) => (
              <div key={vydaj.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-red-600">{vydaj.castka} Kč</span>
                  <span className="text-xs text-gray-500">{formatDate(vydaj.datum)}</span>
                </div>
                <p className="text-sm text-gray-700">{vydaj.popis}</p>
              </div>
            ))}
            
            {/* Celkové výdaje */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-red-800">Celkem:</span>
                <span className="text-lg font-bold text-red-600">
                  {celkemVydaje} Kč
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
