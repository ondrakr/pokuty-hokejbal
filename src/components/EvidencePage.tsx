'use client';

import { useState, useEffect } from 'react';
import { Hrac, Pokuta, HracSPokutami, Kategorie } from '../../types';
import HraciSeznam from './HraciSeznam';
import CenikPokut from './CenikPokut';
import PridatPokutu from './PridatPokutu';
import MobileHeader from './MobileHeader';
import MobilePlayerCard from './MobilePlayerCard';
import PlatebniModal from './PlatebniModal';
import QRKodSekce from './QRKodSekce';

interface Props {
  initialHraci: HracSPokutami[];
  initialPokuty: Pokuta[];
  isLoggedIn?: boolean;
  kategorie?: Kategorie;
  kategorieSlug?: string;
}

export default function EvidencePage({ initialHraci, initialPokuty, isLoggedIn = false, kategorie, kategorieSlug }: Props) {
  const [hraci] = useState<Hrac[]>(initialHraci.map(h => ({ id: h.id, jmeno: h.jmeno, role: h.role, email: h.email })));
  const [pokuty] = useState<Pokuta[]>(initialPokuty);
  const [hraciSPokutami, setHraciSPokutami] = useState<HracSPokutami[]>(initialHraci);
  const [showPriceList, setShowPriceList] = useState(false);
  const [platebniModal, setPlatebniModal] = useState<{
    isOpen: boolean;
    hrac: Hrac | null;
    zbyva: number;
  }>({
    isOpen: false,
    hrac: null,
    zbyva: 0
  });
  const [showQRModal, setShowQRModal] = useState(false);
  const [pridatPokutuModal, setPridatPokutuModal] = useState<{
    isOpen: boolean;
    predvybranyHrac: Hrac | null;
  }>({
    isOpen: false,
    predvybranyHrac: null
  });

  // Data už máme připravená z API, nemusíme nic přepočítávat
  useEffect(() => {
    setHraciSPokutami(initialHraci);
  }, [initialHraci]);

  // Funkce pro obnovení dat po přidání pokuty
  const handlePokutaPridana = () => {
    // Znovu načteme data ze serveru
    window.location.reload();
  };

  // Funkce pro obnovění dat po platbě
  const handleDataChange = () => {
    window.location.reload();
  };

  // Funkce pro otevření platebního modálu
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

  // Funkce pro otevření modálu přidání pokuty s předvybraným hráčem
  const openPridatPokutuModal = (hracSPokutami: HracSPokutami) => {
    const hrac: Hrac = {
      id: hracSPokutami.id,
      jmeno: hracSPokutami.jmeno,
      role: hracSPokutami.role,
      email: hracSPokutami.email
    };
    setPridatPokutuModal({
      isOpen: true,
      predvybranyHrac: hrac
    });
  };

  const closePridatPokutuModal = () => {
    setPridatPokutuModal({
      isOpen: false,
      predvybranyHrac: null
    });
  };

  // Filtrujeme a seřadíme hráče
  const filteredHraci = isLoggedIn 
    ? hraciSPokutami 
    : hraciSPokutami.filter(hrac => hrac.pokuty.length > 0); // Nepřihlášeným pouze hráče s pokutami
  
  const sortedHraci = [...filteredHraci].sort((a, b) => b.zbyva - a.zbyva);

  return (
    <>
      {/* Mobile Header - shown only on mobile */}
      <div className="lg:hidden">
        <MobileHeader title={isLoggedIn ? `Pokuty ${kategorie?.nazev || 'Junioři'} - Admin` : `Pokuty ${kategorie?.nazev || 'Junioři'}`} />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden bg-gray-100 min-h-screen">
        {/* Mobile Stats Card */}
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <h2 className="font-bold text-gray-800 mb-3 text-center">📊 Přehled týmu</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500 mb-1">Celkem</div>
                <div className="font-bold text-gray-900">
                  {sortedHraci.reduce((sum, hrac) => sum + hrac.celkovaCastka, 0)} Kč
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Zaplaceno</div>
                <div className="font-bold text-green-600">
                  {sortedHraci.reduce((sum, hrac) => sum + hrac.zaplaceno, 0)} Kč
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Zbývá</div>
                <div className="font-bold text-red-600">
                  {sortedHraci.reduce((sum, hrac) => sum + hrac.zbyva, 0)} Kč
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          {isLoggedIn ? (
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <PridatPokutu hraci={hraci} onPokutaPridana={handlePokutaPridana} kategorie={kategorie} />
                <button
                  onClick={() => setShowPriceList(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center gap-3 shadow-lg justify-center"
                >
                  📋 Ceník
                </button>
              </div>
              <button
                onClick={() => setShowQRModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-base flex items-center gap-2 shadow-lg justify-center"
              >
                📱 Zobrazit QR kód
              </button>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              <button
                onClick={() => setShowPriceList(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center gap-3 shadow-lg justify-center"
              >
                📋 Ceník pokut
              </button>
              <button
                onClick={() => setShowQRModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-base flex items-center gap-2 shadow-lg justify-center"
              >
                📱 Zobrazit QR kód
              </button>
            </div>
          )}

          {/* Mobile Player Cards */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-gray-800 text-lg">
                👥 {isLoggedIn ? `Seznam hráčů (${sortedHraci.length})` : `Hráči s pokutami (${sortedHraci.length})`}
              </h2>
            </div>
            {sortedHraci.map((hrac) => (
              <MobilePlayerCard
                key={hrac.id}
                hrac={hrac}
                onOpenPayment={isLoggedIn ? openPlatebniModal : undefined}
                onOpenPridatPokutu={isLoggedIn ? openPridatPokutuModal : undefined}
                readOnly={!isLoggedIn}
              />
            ))}
          </div>
        </div>

        {/* Mobile Price List Modal */}
        {showPriceList && (
          <div className="fixed inset-0 z-50 flex items-end" style={{backgroundColor: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(4px)'}}>
            <div className="bg-white w-full rounded-t-xl max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-black">📋 Ceník pokut</h3>
                <button
                  onClick={() => setShowPriceList(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <CenikPokut kategorie={kategorie} />
              </div>
            </div>
          </div>
        )}

        {/* Mobile QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(4px)'}}>
            <div className="bg-white rounded-xl max-w-sm w-full">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">📱 QR kód pro platby</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <QRKodSekce kategorie={kategorie} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout - hidden on mobile */}
      <div className="hidden lg:block">
        <div className="px-3">
          {/* Desktop Header s informací o režimu */}
          {isLoggedIn && (
            <div className="mb-6 text-center">
              <PridatPokutu hraci={hraci} onPokutaPridana={handlePokutaPridana} kategorie={kategorie} />
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Levý sloupec - Ceník pokut a QR kód */}
            <div className="lg:col-span-1">
              <CenikPokut kategorie={kategorie} />
              <QRKodSekce kategorie={kategorie} />
            </div>
            
            {/* Pravý sloupec - Seznam hráčů */}
            <div className="lg:col-span-2">
              <HraciSeznam 
                hraci={sortedHraci} 
                onDataChange={handleDataChange} 
                readOnly={!isLoggedIn}
                onOpenPridatPokutu={isLoggedIn ? openPridatPokutuModal : undefined}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Platební modál - pro oba layouty */}
      <PlatebniModal
        isOpen={platebniModal.isOpen}
        onClose={closePlatebniModal}
        hrac={platebniModal.hrac}
        zbyva={platebniModal.zbyva}
        onPlatbaProvedena={handleDataChange}
      />

      {/* Modál pro přidání pokuty s předvybraným hráčem */}
      {pridatPokutuModal.isOpen && (
        <PridatPokutu
          hraci={hraci}
          onPokutaPridana={handlePokutaPridana}
          kategorie={kategorie}
          predvybranyHrac={pridatPokutuModal.predvybranyHrac}
          onClose={closePridatPokutuModal}
          forceOpen={true}
        />
      )}
    </>
  );
}
