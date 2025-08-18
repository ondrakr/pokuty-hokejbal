import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data: pokuty, error } = await supabase
      .from('pokuty')
      .select(`
        *,
        hraci (
          id,
          jmeno,
          role
        )
      `)
      .order('datum', { ascending: false });

    if (error) {
      console.error('Chyba při načítání pokut:', error);
      return NextResponse.json(
        { error: 'Chyba při načítání pokut' },
        { status: 500 }
      );
    }

    return NextResponse.json(pokuty);
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
    const { hracId, typ, castka } = body;

    // Validace
    if (!hracId || !typ || !castka) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje' },
        { status: 400 }
      );
    }

    // Přidání nové pokuty do Supabase
    const { data: novaPokuta, error } = await supabase
      .from('pokuty')
      .insert([{
        hrac_id: parseInt(hracId),
        typ,
        castka: parseInt(castka),
        datum: new Date().toISOString().split('T')[0],
        zaplaceno: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Chyba při přidávání pokuty:', error);
      return NextResponse.json(
        { error: 'Chyba při přidávání pokuty' },
        { status: 500 }
      );
    }

    return NextResponse.json(novaPokuta, { status: 201 });
  } catch (error) {
    console.error('Chyba při přidávání pokuty:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, zaplaceno } = body;

    console.log('🔄 PATCH /api/pokuty - aktualizuji pokuta ID:', id, 'zaplaceno:', zaplaceno);

    // Aktualizace pokuty v Supabase
    const { data: aktualizovanaPokuta, error } = await supabase
      .from('pokuty')
      .update({ zaplaceno })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Chyba při aktualizaci pokuty:', error);
      return NextResponse.json(
        { error: 'Chyba při aktualizaci pokuty' },
        { status: 500 }
      );
    }

    if (!aktualizovanaPokuta) {
      return NextResponse.json(
        { error: 'Pokuta nenalezena' },
        { status: 404 }
      );
    }

    return NextResponse.json(aktualizovanaPokuta);
  } catch (error) {
    console.error('Chyba při aktualizaci pokuty:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
