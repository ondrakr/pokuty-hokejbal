import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// Získání všech typů pokut
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategorieId = searchParams.get('kategorie_id');

    let query = supabase
      .from('pokuty_typy')
      .select('*')
      .eq('aktivni', true)
      .order('nazev');

    if (kategorieId) {
      query = query.eq('kategorie_id', parseInt(kategorieId));
    }

    const { data: pokutyTypy, error } = await query;

    if (error) {
      console.error('Chyba při načítání typů pokut:', error);
      return NextResponse.json(
        { error: 'Chyba při načítání typů pokut' },
        { status: 500 }
      );
    }

    return NextResponse.json(pokutyTypy);
  } catch (error) {
    console.error('Chyba serveru:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}

// Přidání nového typu pokuty
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nazev, cena, popis, kategorieId, has_quantity, unit } = body;

    // Validace
    if (!nazev || !cena || !kategorieId) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje (nazev, cena, kategorieId)' },
        { status: 400 }
      );
    }

    // Přidání nového typu pokuty do Supabase
    const { data: novyTyp, error } = await supabase
      .from('pokuty_typy')
      .insert([{
        nazev,
        cena: parseInt(cena),
        popis: popis || null,
        aktivni: true,
        kategorie_id: kategorieId,
        has_quantity: has_quantity || false,
        unit: unit || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Chyba při přidávání typu pokuty:', error);
      return NextResponse.json(
        { error: 'Chyba při přidávání typu pokuty' },
        { status: 500 }
      );
    }

    return NextResponse.json(novyTyp, { status: 201 });
  } catch (error) {
    console.error('Chyba při přidávání typu pokuty:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}

// Aktualizace typu pokuty
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nazev, cena, popis, has_quantity, unit } = body;

    // Validace
    if (!id || !nazev || !cena) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje' },
        { status: 400 }
      );
    }

    // Aktualizace typu pokuty v Supabase
    const { data: aktualizovanyTyp, error } = await supabase
      .from('pokuty_typy')
      .update({
        nazev,
        cena: parseInt(cena),
        popis: popis || null,
        has_quantity: has_quantity || false,
        unit: unit || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Chyba při aktualizaci typu pokuty:', error);
      return NextResponse.json(
        { error: 'Chyba při aktualizaci typu pokuty' },
        { status: 500 }
      );
    }

    if (!aktualizovanyTyp) {
      return NextResponse.json(
        { error: 'Typ pokuty nenalezen' },
        { status: 404 }
      );
    }

    return NextResponse.json(aktualizovanyTyp);
  } catch (error) {
    console.error('Chyba při aktualizaci typu pokuty:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
