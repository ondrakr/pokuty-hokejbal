export interface Kategorie {
  id: number;
  nazev: string;
  slug: string;
  popis?: string;
  aktivni: boolean;
  poradi: number;
}

export interface Hrac {
  id: number;
  jmeno: string;
  role: 'hrac' | 'golman' | 'trener';
  email?: string;
  kategorieId: number;
}

export interface Pokuta {
  id: number;
  hracId: number;
  typ: string;
  castka: number;
  datum: string;
  zaplaceno: boolean;
  kategorieId: number;
}

export interface Platba {
  id: number;
  hracId: number;
  castka: number;
  datum: string;
  kategorieId: number;
}

export interface PokutaTyp {
  id: number;
  nazev: string;
  cena: number;
  popis?: string;
  aktivni: boolean;
  has_quantity?: boolean;
  unit?: string;
  kategorieId: number;
}

export interface Uzivatel {
  id: number;
  uzivatelske_jmeno: string;
  role: 'hlavni_admin' | 'kategorie_admin';
  kategorieId?: number;
  aktivni: boolean;
}

export interface PrihlasenyUzivatel extends Uzivatel {
  kategorie?: Kategorie;
}

export interface Pokladna {
  id: number;
  kategorieId: number;
  celkovaCastka: number;
  popis?: string;
}

export interface Vydaj {
  id: number;
  kategorieId: number;
  castka: number;
  popis: string;
  datum: string;
}

export interface FinancniPrehled {
  celkemPokuty: number;
  celkemZaplaceno: number;
  celkemZbyva: number;
  celkemVydaje: number;
  pokladnaCastka: number;
  dostupnaCastkaCelkem: number;
}

export interface HracSPokutami extends Hrac {
  pokuty: Pokuta[];
  platby: Platba[];
  celkovaCastka: number;
  zaplaceno: number;
  zbyva: number;
  status: 'vse_zaplaceno' | 'nic_nezaplaceno' | 'neco_chybi';
}
