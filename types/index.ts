export interface Hrac {
  id: number;
  jmeno: string;
  role: 'hrac' | 'golman' | 'trener';
  email?: string;
}

export interface Pokuta {
  id: number;
  hracId: number;
  typ: string;
  castka: number;
  datum: string;
  zaplaceno: boolean;
}

export interface Platba {
  id: number;
  hracId: number;
  castka: number;
  datum: string;
}

export interface PokutaTyp {
  id: number;
  nazev: string;
  cena: number;
  popis?: string;
  aktivni: boolean;
  has_quantity?: boolean;
  unit?: string;
}

export interface HracSPokutami extends Hrac {
  pokuty: Pokuta[];
  platby: Platba[];
  celkovaCastka: number;
  zaplaceno: number;
  zbyva: number;
  status: 'vse_zaplaceno' | 'nic_nezaplaceno' | 'neco_chybi';
}
