'use client';

import { useState, useEffect } from 'react';
import { Hrac, Pokuta, HracSPokutami } from '../../types';
import HraciSeznam from './HraciSeznam';
import CenikPokut from './CenikPokut';
import PridatPokutu from './PridatPokutu';
import MobileHeader from './MobileHeader';
import MobilePlayerCard from './MobilePlayerCard';
import PlatebniModal from './PlatebniModal';

interface Props {
  initialHraci: Hrac[];
  initialPokuty: Pokuta[];
}

export default function EvidencePage({ initialHraci, initialPokuty }: Props) {
  const [hraci] = useState<Hrac[]>(initialHraci);
  const [pokuty, setPokuty] = useState<Pokuta[]>(initialPokuty);
  const [hraciSPokutami, setHraciSPokutami] = useState<HracSPokutami[]>([]);
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

  // Funkce pro výpočet hráčů s pokutami a platbami
  const vypocitejHraceSPokutami = async () => {
    try {
      // Načteme platby ze serveru
      const platbyResponse = await fetch('/data/platby.json');
      const platby = platbyResponse.ok ? await platbyResponse.json() : [];

      return hraci.map(hrac => {
        const hracovePokuty = pokuty.filter(pokuta => pokuta.hracId === hrac.id);
        const hracovePlatby = platby.filter((platba: any) => platba.hracId === hrac.id);
        
        const celkovaCastka = hracovePokuty.reduce((sum, pokuta) => sum + pokuta.castka, 0);
        const zaplaceno = hracovePlatby.reduce((sum: number, platba: any) => sum + platba.castka, 0);
        const zbyva = celkovaCastka - zaplaceno;
        
        let status: 'vse_zaplaceno' | 'nic_nezaplaceno' | 'neco_chybi';
        if (zbyva <= 0) {
          status = 'vse_zaplaceno';
        } else if (zaplaceno === 0) {
          status = 'nic_nezaplaceno';
        } else {
          status = 'neco_chybi';
        }
        
        return {
          ...hrac,
          pokuty: hracovePokuty,
          platby: hracovePlatby,
          celkovaCastka,
          zaplaceno,
          zbyva: Math.max(0, zbyva),
          status
        };
      });
    } catch (error) {
      console.error('Chyba při načítání plateb:', error);
      return hraci.map(hrac => ({
        ...hrac,
        pokuty: [],
        platby: [],
        celkovaCastka: 0,
        zaplaceno: 0,
        zbyva: 0,
        status: 'nic_nezaplaceno' as const
      }));
    }
  };

  // Aktualizace hráčů s pokutami při změně pokut
  useEffect(() => {
    const loadData = async () => {
      const data = await vypocitejHraceSPokutami();
      setHraciSPokutami(data);
    };
    loadData();
  }, [pokuty, hraci]);

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

  // Seřadíme hráče podle zbývající částky (nejvyšší dluh první)
  const sortedHraci = [...hraciSPokutami].sort((a, b) => b.zbyva - a.zbyva);

  return (
    <>
      {/* Mobile Header - shown only on mobile */}
      <div className="lg:hidden">
        <MobileHeader title="Pokuty JUNIOŘI" />
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
                  {hraciSPokutami.reduce((sum, hrac) => sum + hrac.celkovaCastka, 0)} Kč
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Zaplaceno</div>
                <div className="font-bold text-green-600">
                  {hraciSPokutami.reduce((sum, hrac) => sum + hrac.zaplaceno, 0)} Kč
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Zbývá</div>
                <div className="font-bold text-red-600">
                  {hraciSPokutami.reduce((sum, hrac) => sum + hrac.zbyva, 0)} Kč
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <PridatPokutu hraci={hraci} onPokutaPridana={handlePokutaPridana} />
            <button
              onClick={() => setShowPriceList(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center gap-3 shadow-lg justify-center"
            >
              📋 Ceník
            </button>
          </div>

          {/* Mobile Player Cards */}
          <div className="space-y-4">
            <h2 className="font-bold text-gray-800 text-lg mb-3">
              👥 Seznam hráčů ({sortedHraci.length})
            </h2>
            {sortedHraci.map((hrac) => (
              <MobilePlayerCard
                key={hrac.id}
                hrac={hrac}
                onOpenPayment={openPlatebniModal}
              />
            ))}
          </div>
        </div>

        {/* Mobile Price List Modal */}
        {showPriceList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white w-full rounded-t-xl max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h3 className="text-lg font-bold">📋 Ceník pokut</h3>
                <button
                  onClick={() => setShowPriceList(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <CenikPokut />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout - hidden on mobile */}
      <div className="hidden lg:block">
        <div className="px-3">
          {/* Desktop Tlačítko pro přidání pokut */}
          <div className="mb-6 text-center">
            <PridatPokutu hraci={hraci} onPokutaPridana={handlePokutaPridana} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Levý sloupec - Ceník pokut */}
            <div className="lg:col-span-1">
              <CenikPokut />
            </div>
            
            {/* Pravý sloupec - Seznam hráčů */}
            <div className="lg:col-span-2">
              <HraciSeznam hraci={hraciSPokutami} onDataChange={handleDataChange} />
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
    </>
  );
}
