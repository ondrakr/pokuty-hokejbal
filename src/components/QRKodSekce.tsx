'use client';

import Image from 'next/image';
import { Kategorie } from '../../types';

interface Props {
  kategorie?: Kategorie;
}

export default function QRKodSekce({ kategorie }: Props) {
  // Určení QR kódu podle kategorie
  const getQRKodSrc = () => {
    if (!kategorie) return '/qr-kod-juniori.png'; // výchozí fallback
    
    switch (kategorie.slug) {
      case 'a-tym':
        return '/qr-kod-acko.jpg';
      case 'juniori':
        return '/juniorka-qrkod.png';
      case 'dorost':
        return '/dorost-qrkod.png';
      default:
        return '/qr-kod-juniori.png';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
      <h2 className="text-lg font-bold text-gray-900 mb-3 text-center">
        QR kód
      </h2>
      
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
    </div>
  );
}
