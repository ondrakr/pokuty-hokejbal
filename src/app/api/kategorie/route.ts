import { NextResponse } from 'next/server';
import { supabase, SUPABASE_URL_INFERRED } from '../../../lib/supabase';

export async function GET() {
  try {
    console.log('Načítám kategorie ze Supabase URL:', SUPABASE_URL_INFERRED)
    const { data: kategorie, error } = await supabase
      .from('kategorie')
      .select('*')
      .order('poradi');

    if (error) {
      console.error('Chyba při načítání kategorií:', {
        message: (error as any)?.message,
        code: (error as any)?.code,
        hint: (error as any)?.hint,
        details: (error as any)?.details,
      });
      const code = (error as any)?.code as string | undefined
      const status = code === 'PGRST301' || code === 'PGRST302' ? 401 : 500
      return NextResponse.json(
        {
          error: 'Chyba při načítání kategorií',
          details: {
            message: (error as any)?.message,
            code: (error as any)?.code,
            hint: (error as any)?.hint,
          },
        },
        { status }
      );
    }

    return NextResponse.json(kategorie || []);
  } catch (error) {
    const err = error as any
    console.error('Chyba serveru při načítání kategorií:', {
      message: err?.message,
      stack: err?.stack,
      cause: err?.cause,
    });
    // Pokud jde o problém s připojením (undici fetch failed), vrať 502
    const isUpstreamFetchFailed = typeof err?.message === 'string' && err.message.includes('fetch failed')
    return NextResponse.json(
      { error: 'Chyba serveru', details: { message: err?.message } },
      { status: isUpstreamFetchFailed ? 502 : 500 }
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
