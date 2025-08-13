import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Hrac } from '../../../../../types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { jmeno, role, email } = body;
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

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

    // Najití a aktualizace hráče
    const hracIndex = hraci.findIndex(h => h.id === id);
    if (hracIndex === -1) {
      return NextResponse.json(
        { error: 'Hráč nenalezen' },
        { status: 404 }
      );
    }

    hraci[hracIndex] = {
      ...hraci[hracIndex],
      jmeno,
      role,
      email: email || undefined
    };

    // Uložení zpět do souboru
    await fs.writeFile(hraciPath, JSON.stringify(hraci, null, 2));

    return NextResponse.json(hraci[hracIndex]);
  } catch (error) {
    console.error('Chyba při aktualizaci hráče:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Načtení existujících hráčů
    const hraciPath = path.join(process.cwd(), 'data/hraci.json');
    const hraciData = await fs.readFile(hraciPath, 'utf8');
    const hraci: Hrac[] = JSON.parse(hraciData);

    // Najití a smazání hráče
    const hracIndex = hraci.findIndex(h => h.id === id);
    if (hracIndex === -1) {
      return NextResponse.json(
        { error: 'Hráč nenalezen' },
        { status: 404 }
      );
    }

    hraci.splice(hracIndex, 1);

    // Uložení zpět do souboru
    await fs.writeFile(hraciPath, JSON.stringify(hraci, null, 2));

    return NextResponse.json({ message: 'Hráč smazán' });
  } catch (error) {
    console.error('Chyba při mazání hráče:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
