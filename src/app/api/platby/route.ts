import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategorieId = searchParams.get('kategorie_id');

    let query = supabase
      .from('platby')
      .select(`
        *,
        hraci (
          id,
          jmeno,
          role,
          kategorie_id
        )
      `)
      .order('datum', { ascending: false });

    if (kategorieId) {
      query = query.eq('kategorie_id', parseInt(kategorieId));
    }

    const { data: platby, error } = await query;

    if (error) {
      console.error('Chyba při načítání plateb:', error);
      return NextResponse.json(
        { error: 'Chyba při načítání plateb' },
        { status: 500 }
      );
    }

    return NextResponse.json(platby);
  } catch (error) {
    console.error('Chyba serveru:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hracId, castka, kategorieId } = body;

    // Validace
    if (!hracId || !castka || !kategorieId) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje (hracId, castka, kategorieId)' },
        { status: 400 }
      );
    }

    // Přidání nové platby do Supabase
    const { data: novaPlatba, error } = await supabase
      .from('platby')
      .insert([{
        hrac_id: parseInt(hracId),
        castka: parseInt(castka),
        datum: new Date().toISOString().split('T')[0],
        kategorie_id: kategorieId
      }])
      .select()
      .single();

    if (error) {
      console.error('Chyba při přidávání platby:', error);
      return NextResponse.json(
        { error: 'Chyba při přidávání platby' },
        { status: 500 }
      );
    }

    return NextResponse.json(novaPlatba, { status: 201 });
  } catch (error) {
    console.error('Chyba při přidávání platby:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
