'use client';

import Image from 'next/image';
import { Kategorie } from '../../types';

interface Props {
  kategorie?: Kategorie;
}

export default function QRKodSekce({ kategorie }: Props) {
  // Určení QR kódu podle kategorie
  const getQRKodSrc = () => {
    if (!kategorie) return '/qr-kod-juniori.jpg'; // výchozí fallback
    
    switch (kategorie.slug) {
      case 'a-tym':
        return '/qr-kod-acko.jpg';
      case 'juniori':
        return '/qr-kod-juniori.jpg';
      default:
        return '/qr-kod-juniori.jpg';
    }
  };

  // Kontrola, zda je kategorie dorost
  const isDorost = kategorie?.slug === 'dorost';

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
      <h2 className="text-lg font-bold text-gray-900 mb-3 text-center">
        {isDorost ? 'Platba' : 'QR kód'}
      </h2>
      
      {isDorost ? (
        // Pro dorost - pouze text bez QR kódu
        <div className="text-center space-y-4">
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-lg text-gray-800 font-medium">
              💰 Platba hotovostí pokladníkovi
            </p>
          </div>
        </div>
      ) : (
        // Pro ostatní kategorie - QR kód
        <>
          <div className="flex justify-center mb-4">
            <Image
              src={getQRKodSrc()}
              alt="QR kód pro platby"
              width={180}
              height={180}
              className="rounded-lg shadow-md"
            />
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-700 font-medium">
              Platba QR kódem nebo hotovostí
            </p>
          </div>
        </>
      )}
    </div>
  );
}
