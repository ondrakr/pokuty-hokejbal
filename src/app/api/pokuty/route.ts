import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Pokuta } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hracId, typ, castka } = body;

    // Validace
    if (!hracId || !typ || !castka) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje' },
        { status: 400 }
      );
    }

    // Načtení existujících pokut
    const pokutyPath = path.join(process.cwd(), 'data/pokuty.json');
    const pokutyData = await fs.readFile(pokutyPath, 'utf8');
    const pokuty: Pokuta[] = JSON.parse(pokutyData);

    // Vytvoření nové pokuty
    const novaPokuta: Pokuta = {
      id: Math.max(...pokuty.map(p => p.id), 0) + 1,
      hracId: parseInt(hracId),
      typ,
      castka: parseInt(castka),
      datum: new Date().toISOString().split('T')[0],
      zaplaceno: false
    };

    // Přidání nové pokuty
    pokuty.push(novaPokuta);

    // Uložení zpět do souboru
    await fs.writeFile(pokutyPath, JSON.stringify(pokuty, null, 2));

    return NextResponse.json(novaPokuta, { status: 201 });
  } catch (error) {
    console.error('Chyba při přidávání pokuty:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, zaplaceno } = body;

    // Načtení existujících pokut
    const pokutyPath = path.join(process.cwd(), 'data/pokuty.json');
    const pokutyData = await fs.readFile(pokutyPath, 'utf8');
    const pokuty: Pokuta[] = JSON.parse(pokutyData);

    // Najití a aktualizace pokuty
    const pokutaIndex = pokuty.findIndex(p => p.id === id);
    if (pokutaIndex === -1) {
      return NextResponse.json(
        { error: 'Pokuta nenalezena' },
        { status: 404 }
      );
    }

    pokuty[pokutaIndex].zaplaceno = zaplaceno;

    // Uložení zpět do souboru
    await fs.writeFile(pokutyPath, JSON.stringify(pokuty, null, 2));

    return NextResponse.json(pokuty[pokutaIndex]);
  } catch (error) {
    console.error('Chyba při aktualizaci pokuty:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
