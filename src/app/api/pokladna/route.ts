import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Načtení pokladny pro všechny kategorie nebo specifickou kategorii
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kategorieId = searchParams.get('kategorie_id');

    let query = supabase
      .from('pokladna')
      .select('*');

    if (kategorieId) {
      query = query.eq('kategorie_id', parseInt(kategorieId));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Chyba při načítání pokladny:', error);
      return NextResponse.json(
        { error: 'Chyba při načítání pokladny' },
        { status: 500 }
      );
    }

    // Převedení dat do správného formátu
    const pokladna = data.map(item => ({
      id: item.id,
      kategorieId: item.kategorie_id,
      celkovaCastka: item.celkova_castka,
      popis: item.popis
    }));

    return NextResponse.json(kategorieId ? pokladna[0] || null : pokladna);

  } catch (error) {
    console.error('Chyba při zpracování požadavku:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}

// POST - Vytvoření nebo aktualizace pokladny pro kategorii
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kategorieId, celkovaCastka, popis } = body;

    if (!kategorieId || celkovaCastka === undefined) {
      return NextResponse.json(
        { error: 'Kategorie ID a celková částka jsou povinné' },
        { status: 400 }
      );
    }

    // Zkusíme aktualizovat existující záznam
    const { data: existingData, error: selectError } = await supabase
      .from('pokladna')
      .select('id')
      .eq('kategorie_id', kategorieId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Chyba při kontrole existující pokladny:', selectError);
      return NextResponse.json(
        { error: 'Chyba při kontrole existující pokladny' },
        { status: 500 }
      );
    }

    let result;
    if (existingData) {
      // Aktualizace existujícího záznamu
      const { data, error } = await supabase
        .from('pokladna')
        .update({
          celkova_castka: celkovaCastka,
          popis: popis
        })
        .eq('kategorie_id', kategorieId)
        .select()
        .single();

      if (error) {
        console.error('Chyba při aktualizaci pokladny:', error);
        return NextResponse.json(
          { error: 'Chyba při aktualizaci pokladny' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Vytvoření nového záznamu
      const { data, error } = await supabase
        .from('pokladna')
        .insert([{
          kategorie_id: kategorieId,
          celkova_castka: celkovaCastka,
          popis: popis
        }])
        .select()
        .single();

      if (error) {
        console.error('Chyba při vytváření pokladny:', error);
        return NextResponse.json(
          { error: 'Chyba při vytváření pokladny' },
          { status: 500 }
        );
      }
      result = data;
    }

    // Převedení do správného formátu
    const pokladnaFormatted = {
      id: result.id,
      kategorieId: result.kategorie_id,
      celkovaCastka: result.celkova_castka,
      popis: result.popis
    };

    return NextResponse.json(pokladnaFormatted);

  } catch (error) {
    console.error('Chyba při zpracování požadavku:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
