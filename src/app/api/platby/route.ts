import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data: platby, error } = await supabase
      .from('platby')
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
    const { hracId, castka } = body;

    // Validace
    if (!hracId || !castka) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje' },
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
