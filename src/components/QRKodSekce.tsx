'use client';

import Image from 'next/image';

export default function QRKodSekce() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
      <h2 className="text-lg font-bold text-gray-900 mb-3 text-center">QR kód</h2>
      
      <div className="flex justify-center mb-4">
        <Image
          src="/qr-kod.jpg"
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
        <p className="text-xs text-red-600 font-semibold">
          Platba vždy do konce měsíce, další měsíc úrok 100%
        </p>
      </div>
    </div>
  );
}
