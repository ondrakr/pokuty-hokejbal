'use client';

import { useState } from 'react';
import { Hrac } from '../../types';

interface Props {
  hraci: Hrac[];
  onDataChange: () => void;
}

export default function SpravHracu({ hraci, onDataChange }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    jmeno: '',
    role: 'hrac' as 'hrac' | 'golman' | 'trener',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/hraci/${editingId}` : '/api/hraci';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ jmeno: '', role: 'hrac', email: '' });
        setIsAdding(false);
        setEditingId(null);
        onDataChange();
      } else {
        const error = await response.json();
        alert('Chyba: ' + error.error);
      }
    } catch (error) {
      alert('Chyba při ukládání hráče');
    }
  };

  const handleEdit = (hrac: Hrac) => {
    setFormData({
      jmeno: hrac.jmeno,
      role: hrac.role,
      email: hrac.email || ''
    });
    setEditingId(hrac.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Opravdu chcete smazat tohoto hráče?')) return;
    
    try {
      const response = await fetch(`/api/hraci/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDataChange();
      } else {
        alert('Chyba při mazání hráče');
      }
    } catch {
      alert('Chyba při mazání hráče');
    }
  };

  const resetForm = () => {
    setFormData({ jmeno: '', role: 'hrac', email: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Tlačítko pro přidání */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Seznam hráčů</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          ➕ Přidat hráče
        </button>
      </div>

      {/* Formulář */}
      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4">
            {editingId ? 'Upravit hráče' : 'Přidat nového hráče'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jméno
              </label>
              <input
                type="text"
                value={formData.jmeno}
                onChange={(e) => setFormData({ ...formData, jmeno: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md text-black"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-md text-black"
              >
                <option value="hrac">Hráč</option>
                <option value="golman">Golman</option>
                <option value="trener">Trenér</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (volitelný)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md text-black"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
              >
                {editingId ? 'Uložit změny' : 'Přidat hráče'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-md"
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Seznam hráčů */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jméno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hraci.map((hrac) => (
                <tr key={hrac.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {hrac.jmeno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      hrac.role === 'trener' ? 'bg-purple-100 text-purple-800' :
                      hrac.role === 'golman' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {hrac.role === 'trener' ? 'Trenér' : hrac.role === 'golman' ? 'Golman' : 'Hráč'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {hrac.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(hrac)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Upravit
                    </button>
                    <button
                      onClick={() => handleDelete(hrac.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Smazat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
