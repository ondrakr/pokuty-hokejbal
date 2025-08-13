import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Hrac } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jmeno, role, email } = body;

    // Validace
    if (!jmeno || !role) {
      return NextResponse.json(
        { error: 'Chybí povinné údaje' },
        { status: 400 }
      );
    }

    // Načtení existujících hráčů
    const hraciPath = path.join(process.cwd(), 'data/hraci.json');
    const hraciData = await fs.readFile(hraciPath, 'utf8');
    const hraci: Hrac[] = JSON.parse(hraciData);

    // Vytvoření nového hráče
    const novyHrac: Hrac = {
      id: Math.max(...hraci.map(h => h.id), 0) + 1,
      jmeno,
      role,
      email: email || undefined
    };

    // Přidání nového hráče
    hraci.push(novyHrac);

    // Uložení zpět do souboru
    await fs.writeFile(hraciPath, JSON.stringify(hraci, null, 2));

    return NextResponse.json(novyHrac, { status: 201 });
  } catch (error) {
    console.error('Chyba při přidávání hráče:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
