import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data: kategorie, error } = await supabase
      .from('kategorie')
      .select('*')
      .order('poradi');

    if (error) {
      console.error('Chyba při načítání kategorií:', error);
      return NextResponse.json(
        { error: 'Chyba při načítání kategorií', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(kategorie || []);
  } catch (error) {
    console.error('Chyba serveru:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nazev, slug, popis, poradi } = await request.json();

    if (!nazev || !slug) {
      return NextResponse.json(
        { error: 'Název a slug jsou povinné' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('kategorie')
      .insert([{ nazev, slug, popis, poradi: poradi || 0 }])
      .select()
      .single();

    if (error) {
      console.error('Chyba při vytváření kategorie:', error);
      return NextResponse.json(
        { error: 'Chyba při vytváření kategorie', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Chyba serveru:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
