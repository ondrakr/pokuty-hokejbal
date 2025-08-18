import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Místo skutečného mazání označíme jako neaktivní
    const { error } = await supabase
      .from('pokuty_typy')
      .update({ aktivni: false })
      .eq('id', id);

    if (error) {
      console.error('Chyba při mazání typu pokuty:', error);
      return NextResponse.json(
        { error: 'Chyba při mazání typu pokuty' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Typ pokuty smazán' });
  } catch (error) {
    console.error('Chyba při mazání typu pokuty:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
