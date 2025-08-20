'use client';

import { useState, useEffect } from 'react';
import { Kategorie } from '../../types';
import Link from 'next/link';
import Image from 'next/image';

export default function KategorieSelector() {
  const [kategorie, setKategorie] = useState<Kategorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadKategorie = async () => {
      try {
        const response = await fetch('/api/kategorie');
        if (!response.ok) {
          throw new Error('Chyba při načítání kategorií');
        }
        const data = await response.json();
        setKategorie(data);
      } catch (err) {
        console.error('Chyba při načítání kategorií:', err);
        setError('Nepodařilo se načíst kategorie');
      } finally {
        setLoading(false);
      }
    };

    loadKategorie();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám kategorie...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold mb-2">Chyba</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-4">
                <Image
                  src="/logo.png"
                  alt="Hokejbal Logo"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Pokuty Hokejbal
                  </h1>
                  <p className="text-sm text-gray-600">Vyberte kategorii</p>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-center py-4 px-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Hokejbal Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">
                Pokuty Hokejbal
              </h1>
              <p className="text-sm text-gray-600">Vyberte kategorii</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Desktop Grid */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
            {kategorie
              .filter(kat => kat.aktivni)
              .sort((a, b) => a.poradi - b.poradi)
              .map((kat) => (
                <Link
                  key={kat.id}
                  href={`/${kat.slug}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 overflow-hidden"
                >
                  <div className="p-8 text-center">
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                        <span className="text-3xl font-bold text-blue-600">
                          {kat.nazev.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {kat.nazev}
                    </h2>
                    {kat.popis && (
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {kat.popis}
                      </p>
                    )}
                    <div className="inline-flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                      Vstoupit
                      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
            ))}
          </div>

          {/* Mobile Stack */}
          <div className="lg:hidden space-y-4">
            {kategorie
              .filter(kat => kat.aktivni)
              .sort((a, b) => a.poradi - b.poradi)
              .map((kat) => (
                <Link
                  key={kat.id}
                  href={`/${kat.slug}`}
                  className="block bg-white rounded-xl shadow-lg active:shadow-xl transition-all border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {kat.nazev.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                          {kat.nazev}
                        </h2>
                        {kat.popis && (
                          <p className="text-gray-600 text-sm">
                            {kat.popis}
                          </p>
                        )}
                      </div>
                      <div className="text-blue-600">
                        <span className="text-xl">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
            ))}
          </div>

          {/* Empty State */}
          {kategorie.filter(kat => kat.aktivni).length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="mb-4">
                <span className="text-4xl">🏒</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Žádné aktivní kategorie
              </h2>
              <p className="text-gray-600">
                V současné době nejsou k dispozici žádné aktivní kategorie.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Access */}
      <div className="text-center py-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          🔐 Přihlášení do administrace
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 py-6">
        <p className="text-sm">Pokuty Hokejbal - Evidence pokut</p>
      </div>
    </div>
  );
}
