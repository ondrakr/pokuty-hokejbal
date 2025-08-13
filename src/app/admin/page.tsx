import { promises as fs } from 'fs';
import path from 'path';
import { Hrac, Pokuta } from '../../../types';
import AdminPage from '../../components/AdminPage';

async function getData() {
  try {
    const hraciPath = path.join(process.cwd(), 'data/hraci.json');
    const pokutyPath = path.join(process.cwd(), 'data/pokuty.json');
    const platbyPath = path.join(process.cwd(), 'data/platby.json');

    const hraciData = await fs.readFile(hraciPath, 'utf8');
    const pokutyData = await fs.readFile(pokutyPath, 'utf8');
    
    let platbyData;
    try {
      platbyData = await fs.readFile(platbyPath, 'utf8');
    } catch {
      platbyData = '[]';
    }

    const hraci: Hrac[] = JSON.parse(hraciData);
    const pokuty: Pokuta[] = JSON.parse(pokutyData);
    const platby = JSON.parse(platbyData);

    return { hraci, pokuty, platby };
  } catch (error) {
    console.error('Chyba při načítání dat:', error);
    return { hraci: [], pokuty: [], platby: [] };
  }
}

export default async function Admin() {
  const { hraci, pokuty, platby } = await getData();

  return (
    <main className="min-h-screen bg-gray-100">
      <AdminPage initialHraci={hraci} initialPokuty={pokuty} initialPlatby={platby} />
    </main>
  );
}