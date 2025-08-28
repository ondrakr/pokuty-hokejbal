import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Načtení výdajů pro kategorii
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kategorieId = searchParams.get('kategorie_id');

    if (!kategorieId) {
      return NextResponse.json(
        { error: 'Kategorie ID je povinné' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('vydaje')
      .select('*')
      .eq('kategorie_id', parseInt(kategorieId))
      .order('datum', { ascending: false });

    if (error) {
      console.error('Chyba při načítání výdajů:', error);
      return NextResponse.json(
        { error: 'Chyba při načítání výdajů' },
        { status: 500 }
      );
    }

    // Převedení dat do správného formátu
    const vydaje = data.map(item => ({
      id: item.id,
      kategorieId: item.kategorie_id,
      castka: item.castka,
      popis: item.popis,
      datum: item.datum
    }));

    return NextResponse.json(vydaje);

  } catch (error) {
    console.error('Chyba při zpracování požadavku:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}

// POST - Přidání nového výdaje
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kategorieId, castka, popis, datum } = body;

    if (!kategorieId || !castka || !popis) {
      return NextResponse.json(
        { error: 'Kategorie ID, částka a popis jsou povinné' },
        { status: 400 }
      );
    }

    if (castka <= 0) {
      return NextResponse.json(
        { error: 'Částka musí být větší než 0' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('vydaje')
      .insert([{
        kategorie_id: kategorieId,
        castka: castka,
        popis: popis.trim(),
        datum: datum || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) {
      console.error('Chyba při přidávání výdaje:', error);
      return NextResponse.json(
        { error: 'Chyba při přidávání výdaje' },
        { status: 500 }
      );
    }

    // Převedení do správného formátu
    const vydajFormatted = {
      id: data.id,
      kategorieId: data.kategorie_id,
      castka: data.castka,
      popis: data.popis,
      datum: data.datum
    };

    return NextResponse.json(vydajFormatted);

  } catch (error) {
    console.error('Chyba při zpracování požadavku:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
