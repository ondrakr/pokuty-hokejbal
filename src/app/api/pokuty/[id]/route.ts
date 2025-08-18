import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Smazání pokuty z Supabase
    const { error } = await supabase
      .from('pokuty')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Chyba při mazání pokuty:', error);
      return NextResponse.json(
        { error: 'Chyba při mazání pokuty' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Pokuta smazána' });
  } catch (error) {
    console.error('Chyba při mazání pokuty:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
