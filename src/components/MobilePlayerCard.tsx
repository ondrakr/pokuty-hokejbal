'use client';

import { useState } from 'react';
import { HracSPokutami, Hrac } from '../../types';

interface Props {
  hrac: HracSPokutami;
  onOpenPayment?: (hrac: Hrac, amount: number) => void;
  readOnly?: boolean;
}

export default function MobilePlayerCard({ hrac, onOpenPayment, readOnly = false }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDeletePokuta = async (pokutaId: number) => {
    if (!confirm('Opravdu chcete smazat tuto pokutu?')) return;
    
    try {
      const response = await fetch(`/api/pokuty/${pokutaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh stránky pro obnovení dat
        window.location.reload();
      } else {
        alert('Chyba při mazání pokuty');
      }
    } catch (error) {
      alert('Chyba při mazání pokuty');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vse_zaplaceno':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'nic_nezaplaceno':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'neco_chybi':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'trener':
        return { icon: 'T', color: 'bg-purple-500' };
      case 'golman':
        return { icon: 'G', color: 'bg-yellow-500' };
      default:
        return { icon: 'H', color: 'bg-blue-500' };
    }
  };

  const formatDatum = (datum: string) => {
    return new Date(datum).toLocaleDateString('cs-CZ');
  };

  const roleInfo = getRoleIcon(hrac.role);

  return (
    <div className="bg-white rounded-xl shadow-md mb-4 overflow-hidden">
      {/* Header karty */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${roleInfo.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}>
              {roleInfo.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{hrac.jmeno}</h3>
              <p className="text-gray-500 text-sm">
                {hrac.role === 'trener' ? 'Trenér' : hrac.role === 'golman' ? 'Golman' : 'Hráč'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(hrac.status)}`}>
              {getStatusText(hrac.status)}
            </div>
          </div>
        </div>

        {/* Finanční přehled */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Celkem</div>
            <div className="font-bold text-gray-900">{hrac.celkovaCastka} Kč</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Zaplaceno</div>
            <div className="font-bold text-green-600">{hrac.zaplaceno} Kč</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Zbývá</div>
            <div className={`font-bold ${hrac.zbyva > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {hrac.zbyva} Kč
            </div>
          </div>
        </div>

        {/* Tlačítko pro platbu */}
        {hrac.zbyva > 0 && !readOnly && onOpenPayment && (
          <div className="mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPayment(hrac, hrac.zbyva);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all transform active:scale-95"
            >
              💰 Zaznamenat platbu
            </button>
          </div>
        )}
        
        {/* Informace pro read-only režim */}
        {readOnly && hrac.zbyva > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-100 text-gray-600 font-medium py-3 px-4 rounded-xl text-center">
              💰 {hrac.zbyva} Kč
            </div>
          </div>
        )}

        {/* Expand indikátor */}
        <div className="mt-3 flex justify-center">
          <div className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rozbalené detaily */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            📋 Detail pokut ({hrac.pokuty.length})
          </h4>
          
          {hrac.pokuty.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <div className="text-4xl mb-2">🎉</div>
              <p>Žádné pokuty!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {hrac.pokuty
                .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
                .map((pokuta) => (
                <div
                  key={pokuta.id}
                  className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 text-sm">{pokuta.typ}</h5>
                      <p className="text-xs text-gray-500">{formatDatum(pokuta.datum)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{pokuta.castka} Kč</span>
                      {!readOnly && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePokuta(pokuta.id);
                          }}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Smazat pokutu"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
