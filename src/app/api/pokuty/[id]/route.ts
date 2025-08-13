import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Pokuta } from '../../../../../types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Načtení existujících pokut
    const pokutyPath = path.join(process.cwd(), 'data/pokuty.json');
    const pokutyData = await fs.readFile(pokutyPath, 'utf8');
    const pokuty: Pokuta[] = JSON.parse(pokutyData);

    // Najití a smazání pokuty
    const pokutaIndex = pokuty.findIndex(p => p.id === id);
    if (pokutaIndex === -1) {
      return NextResponse.json(
        { error: 'Pokuta nenalezena' },
        { status: 404 }
      );
    }

    pokuty.splice(pokutaIndex, 1);

    // Uložení zpět do souboru
    await fs.writeFile(pokutyPath, JSON.stringify(pokuty, null, 2));

    return NextResponse.json({ message: 'Pokuta smazána' });
  } catch (error) {
    console.error('Chyba při mazání pokuty:', error);
    return NextResponse.json(
      { error: 'Chyba serveru' },
      { status: 500 }
    );
  }
}
