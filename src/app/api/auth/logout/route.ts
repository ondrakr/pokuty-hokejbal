import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { session_token } = await request.json();

    if (session_token) {
      // Smaž session z databáze
      await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', session_token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chyba při odhlašování:', error);
    return NextResponse.json(
      { error: 'Chyba při odhlašování' },
      { status: 500 }
    );
  }
}
