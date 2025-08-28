import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// DELETE - Smazání výdaje
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vydajId = parseInt(id);

    if (isNaN(vydajId)) {
      return NextResponse.json(
        { error: 'Neplatné ID výdaje' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('vydaje')
      .delete()
      .eq('id', vydajId);

    if (error) {
      console.error('Chyba při mazání výdaje:', error);
      return NextResponse.json(
        { error: 'Chyba při mazání výdaje' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Chyba při zpracování požadavku:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
