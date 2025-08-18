import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { jmeno, role, email } = body;
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Validace
    if (!jmeno || !role) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje' },
        { status: 400 }
      );
    }

    // Aktualizace hráče v Supabase
    const { data: aktualizovanyHrac, error } = await supabase
      .from('hraci')
      .update({ jmeno, role, email: email || null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Chyba při aktualizaci hráče:', error);
      return NextResponse.json(
        { error: 'Chyba při aktualizaci hráče' },
        { status: 500 }
      );
    }

    if (!aktualizovanyHrac) {
      return NextResponse.json(
        { error: 'Hráč nenalezen' },
        { status: 404 }
      );
    }

    return NextResponse.json(aktualizovanyHrac);
  } catch (error) {
    console.error('Chyba při aktualizaci hráče:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Smazání hráče z Supabase
    const { error } = await supabase
      .from('hraci')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Chyba při mazání hráče:', error);
      return NextResponse.json(
        { error: 'Chyba při mazání hráče' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Hráč smazán' });
  } catch (error) {
    console.error('Chyba při mazání hráče:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
