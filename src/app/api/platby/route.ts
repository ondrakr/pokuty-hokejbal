import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Platba } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hracId, castka } = body;

    // Validace
    if (!hracId || !castka) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje' },
        { status: 400 }
      );
    }

    // Načtení existujících plateb
    const platbyPath = path.join(process.cwd(), 'data/platby.json');
    const platbyData = await fs.readFile(platbyPath, 'utf8');
    const platby: Platba[] = JSON.parse(platbyData);

    // Vytvoření nové platby
    const novaPlatba: Platba = {
      id: Math.max(...platby.map(p => p.id), 0) + 1,
      hracId: parseInt(hracId),
      castka: parseInt(castka),
      datum: new Date().toISOString().split('T')[0],
    };

    // Přidání nové platby
    platby.push(novaPlatba);

    // Uložení zpět do souboru
    await fs.writeFile(platbyPath, JSON.stringify(platby, null, 2));

    return NextResponse.json(novaPlatba, { status: 201 });
  } catch (error) {
    console.error('Chyba při přidávání platby:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
