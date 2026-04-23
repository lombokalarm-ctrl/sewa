import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Package, Search, Edit2 } from 'lucide-react';

export default function Inventory() {
  const inventory = useStore(state => state.inventory);
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventaris Scaffolding</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400 w-5 h-5 flex-shrink-0" />
        <input 
          type="text" 
          placeholder="Cari item..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            
            <h2 className="font-semibold text-gray-900 mb-1 leading-tight line-clamp-2">{item.name}</h2>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tersedia</p>
                <p className={`text-xl font-bold ${item.availableStock > 10 ? 'text-green-600' : 'text-red-500'}`}>
                  {item.availableStock} <span className="text-sm font-medium text-gray-500">/ {item.totalStock}</span>
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4 bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Tarif Harian</p>
                <p className="font-semibold text-gray-800 text-sm">{formatCurrency(item.dailyRate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tarif Bulanan</p>
                <p className="font-semibold text-gray-800 text-sm">{formatCurrency(item.monthlyRate)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Item tidak ditemukan.</p>
        </div>
      )}
    </div>
  );
}