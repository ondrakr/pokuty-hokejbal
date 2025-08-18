import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { HracSPokutami } from '../../../../types';

export async function GET() {
  try {
    // Načtení hráčů s jejich pokutami a platbami
    const { data: hraci, error: hraciError } = await supabase
      .from('hraci')
      .select('*')
      .order('id');

    if (hraciError) {
      console.error('Chyba při načítání hráčů:', hraciError);
      return NextResponse.json(
        { error: 'Chyba při načítání hráčů' },
        { status: 500 }
      );
    }

    // Načtení pokut
    const { data: pokuty, error: pokutyError } = await supabase
      .from('pokuty')
      .select('*')
      .order('datum', { ascending: false });

    if (pokutyError) {
      console.error('Chyba při načítání pokut:', pokutyError);
      return NextResponse.json(
        { error: 'Chyba při načítání pokut' },
        { status: 500 }
      );
    }

    // Načtení plateb
    const { data: platby, error: platbyError } = await supabase
      .from('platby')
      .select('*')
      .order('datum', { ascending: false });

    if (platbyError) {
      console.error('Chyba při načítání plateb:', platbyError);
      return NextResponse.json(
        { error: 'Chyba při načítání plateb' },
        { status: 500 }
      );
    }

    // Propojení dat - vytvoření HracSPokutami objektů
    const hraciSPokutami: HracSPokutami[] = hraci.map(hrac => {
      const hracPokuty = pokuty.filter(pokuta => pokuta.hrac_id === hrac.id);
      const hracPlatby = platby.filter(platba => platba.hrac_id === hrac.id);
      
      const celkovaCastka = hracPokuty.reduce((sum, pokuta) => sum + pokuta.castka, 0);
      const zaplaceno = hracPlatby.reduce((sum, platba) => sum + platba.castka, 0);
      const zbyva = celkovaCastka - zaplaceno;
      
      let status: 'vse_zaplaceno' | 'nic_nezaplaceno' | 'neco_chybi';
      if (celkovaCastka === 0) {
        status = 'vse_zaplaceno';
      } else if (zaplaceno === 0) {
        status = 'nic_nezaplaceno';
      } else if (zbyva <= 0) {
        status = 'vse_zaplaceno';
      } else {
        status = 'neco_chybi';
      }

      return {
        ...hrac,
        pokuty: hracPokuty.map(pokuta => ({
          id: pokuta.id,
          hracId: pokuta.hrac_id,
          typ: pokuta.typ,
          castka: pokuta.castka,
          datum: pokuta.datum,
          zaplaceno: pokuta.zaplaceno
        })),
        platby: hracPlatby.map(platba => ({
          id: platba.id,
          hracId: platba.hrac_id,
          castka: platba.castka,
          datum: platba.datum
        })),
        celkovaCastka,
        zaplaceno,
        zbyva: Math.max(0, zbyva),
        status
      };
    });

    return NextResponse.json({
      hraci: hraciSPokutami,
      pokuty: pokuty.map(pokuta => ({
        id: pokuta.id,
        hracId: pokuta.hrac_id,
        typ: pokuta.typ,
        castka: pokuta.castka,
        datum: pokuta.datum,
        zaplaceno: pokuta.zaplaceno
      })),
      platby: platby.map(platba => ({
        id: platba.id,
        hracId: platba.hrac_id,
        castka: platba.castka,
        datum: platba.datum
      }))
    });
  } catch (error) {
    console.error('Chyba serveru:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
