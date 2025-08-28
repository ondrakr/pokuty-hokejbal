import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { HracSPokutami } from '../../../../../types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kategorie: string }> }
) {
  try {
    const { kategorie: kategorieSlug } = await params;
    console.log('🔍 API /data/[kategorie] - začátek pro:', kategorieSlug);
    
    // Najdeme kategorii podle slug
    const { data: kategorie, error: kategorieError } = await supabase
      .from('kategorie')
      .select('id')
      .eq('slug', kategorieSlug)
      .single();

    if (kategorieError) {
      console.error('❌ Kategorie nenalezena:', kategorieError);
      return NextResponse.json(
        { error: 'Kategorie nebyla nalezena' },
        { status: 404 }
      );
    }

    const kategorieId = kategorie.id;
    console.log('✅ Kategorie ID:', kategorieId);

    // Načtení hráčů pro danou kategorii
    const { data: hraci, error: hraciError } = await supabase
      .from('hraci')
      .select('*')
      .eq('kategorie_id', kategorieId)
      .order('id');

    if (hraciError) {
      console.error('❌ Chyba při načítání hráčů:', hraciError);
      return NextResponse.json(
        { error: 'Chyba při načítání hráčů', details: hraciError },
        { status: 500 }
      );
    }

    console.log('✅ Načtení hráčů:', hraci?.length || 0);

    // Načtení pokut pro danou kategorii
    const { data: pokuty, error: pokutyError } = await supabase
      .from('pokuty')
      .select('*')
      .eq('kategorie_id', kategorieId)
      .order('datum', { ascending: false });

    if (pokutyError) {
      console.error('Chyba při načítání pokut:', pokutyError);
      return NextResponse.json(
        { error: 'Chyba při načítání pokut' },
        { status: 500 }
      );
    }

    // Načtení plateb pro danou kategorii
    const { data: platby, error: platbyError } = await supabase
      .from('platby')
      .select('*')
      .eq('kategorie_id', kategorieId)
      .order('datum', { ascending: false });

    if (platbyError) {
      console.error('Chyba při načítání plateb:', platbyError);
      return NextResponse.json(
        { error: 'Chyba při načítání plateb' },
        { status: 500 }
      );
    }

    // Načtení pokladny pro danou kategorii
    const { data: pokladna, error: pokladnaError } = await supabase
      .from('pokladna')
      .select('*')
      .eq('kategorie_id', kategorieId)
      .single();

    if (pokladnaError && pokladnaError.code !== 'PGRST116') {
      console.error('Chyba při načítání pokladny:', pokladnaError);
      return NextResponse.json(
        { error: 'Chyba při načítání pokladny' },
        { status: 500 }
      );
    }

    // Načtení výdajů pro danou kategorii
    const { data: vydaje, error: vydajeError } = await supabase
      .from('vydaje')
      .select('*')
      .eq('kategorie_id', kategorieId)
      .order('datum', { ascending: false });

    if (vydajeError) {
      console.error('Chyba při načítání výdajů:', vydajeError);
      return NextResponse.json(
        { error: 'Chyba při načítání výdajů' },
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
        kategorieId: hrac.kategorie_id,
        pokuty: hracPokuty.map(pokuta => ({
          id: pokuta.id,
          hracId: pokuta.hrac_id,
          typ: pokuta.typ,
          castka: pokuta.castka,
          datum: pokuta.datum,
          zaplaceno: pokuta.zaplaceno,
          kategorieId: pokuta.kategorie_id
        })),
        platby: hracPlatby.map(platba => ({
          id: platba.id,
          hracId: platba.hrac_id,
          castka: platba.castka,
          datum: platba.datum,
          kategorieId: platba.kategorie_id
        })),
        celkovaCastka,
        zaplaceno,
        zbyva: Math.max(0, zbyva),
        status
      };
    });

    // Kalkulace celkových sum a finančního přehledu
    const celkemPokuty = hraciSPokutami.reduce((sum, hrac) => sum + hrac.celkovaCastka, 0);
    const celkemZaplaceno = hraciSPokutami.reduce((sum, hrac) => sum + hrac.zaplaceno, 0);
    const celkemZbyva = hraciSPokutami.reduce((sum, hrac) => sum + hrac.zbyva, 0);
    const celkemVydaje = vydaje?.reduce((sum, vydaj) => sum + vydaj.castka, 0) || 0;
    const pokladnaCastka = pokladna?.celkova_castka || 0;
    
    // Celková částka dostupná pro nepřihlášené (pokladna (ručně přidaná) + zaplacené pokuty - výdaje)
    const dostupnaCastkaCelkem = pokladnaCastka + celkemZaplaceno - celkemVydaje;

    return NextResponse.json({
      hraci: hraciSPokutami,
      pokuty: pokuty.map(pokuta => ({
        id: pokuta.id,
        hracId: pokuta.hrac_id,
        typ: pokuta.typ,
        castka: pokuta.castka,
        datum: pokuta.datum,
        zaplaceno: pokuta.zaplaceno,
        kategorieId: pokuta.kategorie_id
      })),
      platby: platby.map(platba => ({
        id: platba.id,
        hracId: platba.hrac_id,
        castka: platba.castka,
        datum: platba.datum,
        kategorieId: platba.kategorie_id
      })),
      pokladna: pokladna ? {
        id: pokladna.id,
        kategorieId: pokladna.kategorie_id,
        celkovaCastka: pokladna.celkova_castka,
        popis: pokladna.popis
      } : null,
      vydaje: vydaje?.map(vydaj => ({
        id: vydaj.id,
        kategorieId: vydaj.kategorie_id,
        castka: vydaj.castka,
        popis: vydaj.popis,
        datum: vydaj.datum
      })) || [],
      financniPrehled: {
        celkemPokuty,
        celkemZaplaceno,
        celkemZbyva,
        celkemVydaje,
        pokladnaCastka,
        dostupnaCastkaCelkem
      }
    });
  } catch (error) {
    console.error('Chyba serveru:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
