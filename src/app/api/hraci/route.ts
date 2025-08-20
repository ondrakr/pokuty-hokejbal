import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { Hrac } from '../../../../types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategorieId = searchParams.get('kategorie_id');

    let query = supabase
      .from('hraci')
      .select('*')
      .order('id');

    if (kategorieId) {
      query = query.eq('kategorie_id', parseInt(kategorieId));
    }

    const { data: hraci, error } = await query;

    if (error) {
      console.error('Chyba při načítání hráčů:', error);
      return NextResponse.json(
        { error: 'Chyba při načítání hráčů' },
        { status: 500 }
      );
    }

    return NextResponse.json(hraci);
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
    const { jmeno, role, email, kategorieId } = body;

    // Validace
    if (!jmeno || !role || !kategorieId) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje (jméno, role, kategorieId)' },
        { status: 400 }
      );
    }

    // Přidání nového hráče do Supabase
    const { data: novyHrac, error } = await supabase
      .from('hraci')
      .insert([{ 
        jmeno, 
        role, 
        email: email || null,
        kategorie_id: kategorieId
      }])
      .select()
      .single();

    if (error) {
      console.error('Chyba při přidávání hráče:', error);
      return NextResponse.json(
        { error: 'Chyba při přidávání hráče' },
        { status: 500 }
      );
    }

    return NextResponse.json(novyHrac, { status: 201 });
  } catch (error) {
    console.error('Chyba při přidávání hráče:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
