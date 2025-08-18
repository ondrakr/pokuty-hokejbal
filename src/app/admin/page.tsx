import { Hrac, Pokuta, Platba } from '../../../types';
import AdminPage from '../../components/AdminPage';

async function getData() {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/data`, {
      cache: 'no-store' // Vždy načíst čerstvá data
    });
    
    if (!response.ok) {
      throw new Error('Chyba při načítání dat');
    }
    
    const data = await response.json();
    return {
      hraci: data.hraci.map((h: any) => ({ id: h.id, jmeno: h.jmeno, role: h.role, email: h.email })),
      pokuty: data.pokuty,
      platby: data.platby
    };
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