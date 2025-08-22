'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  title: string;
  showMenu?: boolean;
}

export default function MobileHeader({ title, showMenu = true }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 bg-blue-600 text-white shadow-lg z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg p-1">
              <Image
                src="/logo.png"
                alt="Logo"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-lg font-bold truncate">{title}</h1>
          </div>
          
          {showMenu && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1">
                <div className={`h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`h-0.5 bg-white transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30" style={{backgroundColor: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(4px)'}} onClick={() => setIsMenuOpen(false)}>
          <div className="absolute top-20 right-4 bg-white rounded-lg shadow-xl p-4 min-w-[200px]">
            <div className="space-y-3">
              <Link 
                href="/" 
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                📊 Hlavní stránka
              </Link>
              <Link 
                href="/admin" 
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                🔧 Administrace
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
