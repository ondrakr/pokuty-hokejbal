'use client';

import { useState } from 'react';
import { Hrac } from '../../types';

interface Props {
  hraci: Hrac[];
  onDataChange: () => void;
}

export default function SpravHracu({ hraci, onDataChange }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingHrac, setEditingHrac] = useState<Hrac | null>(null);
  const [deletingHrac, setDeletingHrac] = useState<Hrac | null>(null);
  const [formData, setFormData] = useState({
    jmeno: '',
    role: 'hrac' as 'hrac' | 'golman' | 'trener'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingHrac ? `/api/hraci/${editingHrac.id}` : '/api/hraci';
      const method = editingHrac ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        resetForm();
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
      role: hrac.role
    });
    setEditingHrac(hrac);
    setIsAdding(true);
  };

  const handleDelete = (hrac: Hrac) => {
    setDeletingHrac(hrac);
  };

  const confirmDelete = async () => {
    if (!deletingHrac) return;
    
    try {
      const response = await fetch(`/api/hraci/${deletingHrac.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeletingHrac(null);
        onDataChange();
      } else {
        alert('Chyba při mazání hráče');
      }
    } catch {
      alert('Chyba při mazání hráče');
    }
  };

  const resetForm = () => {
    setFormData({ jmeno: '', role: 'hrac' });
    setIsAdding(false);
    setEditingHrac(null);
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

      {/* Modální okno pro přidání/editaci */}
      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              {editingHrac ? 'Upravit hráče' : 'Přidat nového hráče'}
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
                  className="w-full p-3 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full p-3 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="hrac">Hráč</option>
                  <option value="golman">Golman</option>
                  <option value="trener">Trenér</option>
                </select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
                >
                  {editingHrac ? 'Uložit změny' : 'Přidat hráče'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(hrac)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Upravit
                    </button>
                    <button
                      onClick={() => handleDelete(hrac)}
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

      {/* Potvrzovací modální okno pro smazání */}
      {deletingHrac && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Smazat hráče
              </h3>
              <p className="text-gray-600 mb-6">
                Opravdu chcete smazat hráče <strong>{deletingHrac.jmeno}</strong>?<br/>
                Tato akce je nevratná.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingHrac(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
                >
                  Zrušit
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
                >
                  Smazat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
