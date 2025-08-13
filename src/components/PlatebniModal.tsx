'use client';

import { useState } from 'react';
import { Hrac } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hrac: Hrac | null;
  zbyva: number;
  onPlatbaProvedena: () => void;
}

export default function PlatebniModal({ isOpen, onClose, hrac, zbyva, onPlatbaProvedena }: Props) {
  const [castka, setCastka] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrac || !castka) return;

    const platbaCastka = parseInt(castka);
    if (platbaCastka <= 0 || platbaCastka > zbyva) {
      alert(`Částka musí být mezi 1 a ${zbyva} Kč`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/platby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hracId: hrac.id,
          castka: platbaCastka,
        }),
      });

      if (response.ok) {
        setCastka('');
        onClose();
        onPlatbaProvedena();
      } else {
        const error = await response.json();
        alert('Chyba: ' + error.error);
      }
    } catch (error) {
      alert('Chyba při zaznamenání platby');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCastka('');
    onClose();
  };

  if (!isOpen || !hrac) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center lg:items-center lg:justify-center z-50 p-4 lg:p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg lg:rounded-lg shadow-xl max-w-md w-full lg:max-w-md lg:w-full max-h-[90vh] lg:max-h-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Zaznamenat platbu</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Hráč:</strong> {hrac.jmeno}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Zbývá doplatit:</strong> <span className="text-red-600 font-semibold">{zbyva} Kč</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Částka platby (Kč)
              </label>
              <input
                type="number"
                value={castka}
                onChange={(e) => setCastka(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                placeholder={`Max. ${zbyva} Kč`}
                min="1"
                max={zbyva}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md"
              >
                {loading ? 'Ukládám...' : 'Zaznamenat platbu'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-4 rounded-md"
              >
                Zrušit
              </button>
            </div>

            {/* Quick buttons pro celou částku */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCastka(zbyva.toString())}
                className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-md text-sm"
              >
                Zaplatit celou zbývající částku ({zbyva} Kč)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
