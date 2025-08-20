import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { data: kategorie, error } = await supabase
      .from('kategorie')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Kategorie nebyla nalezena' },
          { status: 404 }
        );
      }
      console.error('Chyba při načítání kategorie:', error);
      return NextResponse.json(
        { error: 'Chyba při načítání kategorie', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(kategorie);
  } catch (error) {
    console.error('Chyba serveru:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const updates = await request.json();
    
    const { data, error } = await supabase
      .from('kategorie')
      .update(updates)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Chyba při aktualizaci kategorie:', error);
      return NextResponse.json(
        { error: 'Chyba při aktualizaci kategorie', details: error },
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { error } = await supabase
      .from('kategorie')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('Chyba při mazání kategorie:', error);
      return NextResponse.json(
        { error: 'Chyba při mazání kategorie', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chyba serveru:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
