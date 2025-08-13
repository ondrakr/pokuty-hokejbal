'use client';

const pokutyCenik = [
  { nazev: 'První start', castka: '100 Kč' },
  { nazev: 'První gól', castka: '100 Kč' },
  { nazev: 'První asistence', castka: '50 Kč' },
  { nazev: 'Hattrick', castka: '200 Kč' },
  { nazev: 'Desátý gól', castka: '50 Kč' },
  { nazev: 'Vyšší trest - faul', castka: '100 Kč' },
  { nazev: 'Vyšší trest - nesportovní chování', castka: '200 Kč' },
  { nazev: 'Neomluvený pozdní příchod na zápas', castka: '5 Kč/min' },
  { nazev: 'Poprvé kapitán', castka: '200 Kč' },
  { nazev: 'Poprvé asistent', castka: '100 Kč' },
  { nazev: 'Vítězný gól', castka: '20 Kč' },
  { nazev: 'Nesplněný trest (flašky, míčky, ...)', castka: '100 Kč' },
  { nazev: 'Trest pro trenéra', castka: '500 Kč' },
  { nazev: 'Obdržený gól', castka: '2 Kč' },
  { nazev: 'Vychytaná nula', castka: '100 Kč' }
];

export default function CenikPokut() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header s logem a názvem */}
      <div className="bg-blue-600 text-white p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <div className="text-blue-600 font-bold text-lg">🦌</div>
          </div>
          <div>
            <h1 className="text-xl font-bold">POKUTY</h1>
            <p className="text-sm text-blue-100">JUNIOŘI</p>
          </div>
        </div>
      </div>

      {/* Seznam pokut */}
      <div className="p-3">
        <div className="space-y-1">
          {pokutyCenik.map((pokuta, index) => (
            <div key={index} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
              <span className="text-gray-800 text-sm font-medium">{pokuta.nazev}</span>
              <span className="text-sm font-bold text-blue-600">{pokuta.castka}</span>
            </div>
          ))}
        </div>

        {/* QR kód sekce */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-200 mx-auto mb-2 flex items-center justify-center border-2 border-dashed border-gray-400">
              <span className="text-gray-500 text-xs">QR kód</span>
            </div>
            <p className="text-sm font-bold text-gray-800 mb-1">
              Platba QR kódem nebo hotovostí
            </p>
            <p className="text-xs text-gray-600">
              Platba vždy do konce měsíce, další měsíc úrok 100%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
