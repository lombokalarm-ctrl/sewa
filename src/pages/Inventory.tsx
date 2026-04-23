import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { Package, Search, Edit2, Plus, Trash2, X } from 'lucide-react';
import { InventoryItem } from '../types';

export default function Inventory() {
  const inventory = useStore(state => state.inventory);
  const addInventoryItem = useStore(state => state.addInventoryItem);
  const updateInventoryItem = useStore(state => state.updateInventoryItem);
  const deleteInventoryItem = useStore(state => state.deleteInventoryItem);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const editingItem = useMemo(() => inventory.find(i => i.id === editingItemId) || null, [inventory, editingItemId]);

  const [newName, setNewName] = useState('');
  const [newTotalStock, setNewTotalStock] = useState(0);
  const [newDailyRate, setNewDailyRate] = useState(0);
  const [newMonthlyRate, setNewMonthlyRate] = useState(0);

  const [editName, setEditName] = useState('');
  const [editTotalStock, setEditTotalStock] = useState(0);
  const [editDailyRate, setEditDailyRate] = useState(0);
  const [editMonthlyRate, setEditMonthlyRate] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetAddForm = () => {
    setNewName('');
    setNewTotalStock(0);
    setNewDailyRate(0);
    setNewMonthlyRate(0);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditName(item.name);
    setEditTotalStock(item.totalStock);
    setEditDailyRate(item.dailyRate);
    setEditMonthlyRate(item.monthlyRate);
  };

  const closeEdit = () => {
    setEditingItemId(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = addInventoryItem({
      name: newName,
      totalStock: Number(newTotalStock),
      dailyRate: Number(newDailyRate),
      monthlyRate: Number(newMonthlyRate),
    });
    if (!ok) {
      alert('Gagal menambah item. Pastikan nama tidak kosong dan tidak duplikat.');
      return;
    }
    resetAddForm();
    setIsAdding(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemId) return;
    const ok = updateInventoryItem(editingItemId, {
      name: editName,
      totalStock: Number(editTotalStock),
      dailyRate: Number(editDailyRate),
      monthlyRate: Number(editMonthlyRate),
    });
    if (!ok) {
      alert('Gagal menyimpan. Nama tidak boleh duplikat. Jika item sudah pernah dipakai transaksi, nama tidak bisa diubah. Total stok tidak boleh lebih kecil dari stok yang sedang disewa.');
      return;
    }
    closeEdit();
  };

  const handleDelete = (item: InventoryItem) => {
    if (!confirm(`Hapus item "${item.name}" dari inventori?`)) return;
    const ok = deleteInventoryItem(item.id);
    if (!ok) {
      alert('Tidak bisa menghapus item ini karena sudah pernah dipakai di transaksi.');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventaris Scaffolding</h1>
        <button
          onClick={() => setIsAdding(prev => !prev)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Tambah Item Inventori</h2>
            <button
              type="button"
              onClick={() => { setIsAdding(false); resetAddForm(); }}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Item</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: Scaffolding Main Frame 1.9m"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Stok</label>
              <input
                type="number"
                min={0}
                value={newTotalStock}
                onChange={(e) => setNewTotalStock(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarif Harian</label>
              <input
                type="number"
                min={0}
                value={newDailyRate}
                onChange={(e) => setNewDailyRate(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarif Bulanan</label>
              <input
                type="number"
                min={0}
                value={newMonthlyRate}
                onChange={(e) => setNewMonthlyRate(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Simpan Item
            </button>
            <button
              type="button"
              onClick={() => { resetAddForm(); setIsAdding(false); }}
              className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      )}

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
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Item</h2>
                <p className="text-sm text-gray-500">Jika item sudah pernah dipakai transaksi, nama tidak bisa diubah.</p>
              </div>
              <button
                onClick={closeEdit}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Item</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Stok</label>
                  <input
                    type="number"
                    min={0}
                    value={editTotalStock}
                    onChange={(e) => setEditTotalStock(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Sedang disewa: <span className="font-semibold">{editingItem.totalStock - editingItem.availableStock}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarif Harian</label>
                  <input
                    type="number"
                    min={0}
                    value={editDailyRate}
                    onChange={(e) => setEditDailyRate(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarif Bulanan</label>
                  <input
                    type="number"
                    min={0}
                    value={editMonthlyRate}
                    onChange={(e) => setEditMonthlyRate(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleDelete(editingItem)}
                  className="bg-red-50 text-red-600 border border-red-100 px-4 py-2.5 rounded-lg font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
