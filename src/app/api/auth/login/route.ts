import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { uzivatelske_jmeno, heslo } = await request.json();

    if (!uzivatelske_jmeno || !heslo) {
      return NextResponse.json(
        { error: 'Chybí uživatelské jméno nebo heslo' },
        { status: 400 }
      );
    }

    // Najdeme uživatele v databázi
    const { data: uzivatel, error } = await supabase
      .from('uzivatele')
      .select(`
        *,
        kategorie (
          id,
          nazev,
          slug,
          popis
        )
      `)
      .eq('uzivatelske_jmeno', uzivatelske_jmeno)
      .eq('aktivni', true)
      .single();

    if (error || !uzivatel) {
      // Zaloguj neúspěšný pokus (bez uvedení důvodu)
      console.log(`Neúspěšný pokus o přihlášení: ${uzivatelske_jmeno} z IP: ${request.ip || 'unknown'}`);
      return NextResponse.json(
        { error: 'Neplatné přihlašovací údaje' },
        { status: 401 }
      );
    }

    // Kontrola, zda není účet zablokován
    if (uzivatel.zablokovano_do && new Date(uzivatel.zablokovano_do) > new Date()) {
      return NextResponse.json(
        { error: 'Účet je dočasně zablokován kvůli opakovaným neúspěšným pokusům o přihlášení' },
        { status: 423 }
      );
    }

    // Ověření hesla pomocí bcrypt
    const isPasswordValid = await bcrypt.compare(heslo, uzivatel.heslo_hash);
    
    if (!isPasswordValid) {
      // Zvýšení počtu neúspěšných pokusů
      const newFailedAttempts = (uzivatel.pocet_neuspesnych_pokusu || 0) + 1;
      let updateData: any = { pocet_neuspesnych_pokusu: newFailedAttempts };
      
      // Při 5 neúspěšných pokusech zablokuj účet na 15 minut
      if (newFailedAttempts >= 5) {
        const blockUntil = new Date();
        blockUntil.setMinutes(blockUntil.getMinutes() + 15);
        updateData.zablokovano_do = blockUntil.toISOString();
      }
      
      await supabase
        .from('uzivatele')
        .update(updateData)
        .eq('id', uzivatel.id);

      console.log(`Neúspěšný pokus o přihlášení (špatné heslo): ${uzivatelske_jmeno} z IP: ${request.ip || 'unknown'}`);
      return NextResponse.json(
        { error: 'Neplatné přihlašovací údaje' },
        { status: 401 }
      );
    }

    // Úspěšné přihlášení - resetuj počet neúspěšných pokusů
    await supabase
      .from('uzivatele')
      .update({ 
        pocet_neuspesnych_pokusu: 0,
        zablokovano_do: null,
        posledni_prihlaseni: new Date().toISOString()
      })
      .eq('id', uzivatel.id);

    // Úspěšné přihlášení
    const prihlasenyUzivatel = {
      id: uzivatel.id,
      uzivatelske_jmeno: uzivatel.uzivatelske_jmeno,
      role: uzivatel.role,
      kategorieId: uzivatel.kategorie_id,
      aktivni: uzivatel.aktivni,
      kategorie: uzivatel.kategorie
    };

    return NextResponse.json({
      success: true,
      uzivatel: prihlasenyUzivatel
    });

  } catch (error) {
    console.error('Chyba při přihlašování:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
