import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { RentalType, RentalItem } from '../types';

export default function NewTransaction() {
  const navigate = useNavigate();
  const inventory = useStore(state => state.inventory);
  const addTransaction = useStore(state => state.addTransaction);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [rentalType, setRentalType] = useState<RentalType>('daily');
  const [duration, setDuration] = useState(1);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [depositAmount, setDepositAmount] = useState(0);
  const [initialPayment, setInitialPayment] = useState(0);
  const [initialPaymentMethod, setInitialPaymentMethod] = useState('cash');
  
  const [selectedItems, setSelectedItems] = useState<RentalItem[]>([]);

  const handleAddItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    if (selectedItems.some(i => i.id === itemId)) {
      setSelectedItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, {
        id: item.id,
        name: item.name,
        quantity: 1,
        pricePerUnit: rentalType === 'daily' ? item.dailyRate : item.monthlyRate
      }]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setSelectedItems(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  // Recalculate prices when rental type changes
  const handleRentalTypeChange = (type: RentalType) => {
    setRentalType(type);
    setSelectedItems(prev => prev.map(item => {
      const invItem = inventory.find(i => i.id === item.id);
      return {
        ...item,
        pricePerUnit: invItem ? (type === 'daily' ? invItem.dailyRate : invItem.monthlyRate) : item.pricePerUnit
      };
    }));
  };

  const calculateTotalCost = () => {
    return selectedItems.reduce((total, item) => total + (item.quantity * item.pricePerUnit * duration), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      alert('Silakan pilih setidaknya satu item untuk disewa.');
      return;
    }

    const newId = addTransaction({
      customerName,
      customerPhone,
      customerAddress,
      rentalType,
      duration,
      startDate,
      depositAmount: Number(depositAmount),
      items: selectedItems,
      initialPayment: Number(initialPayment),
      initialPaymentMethod
    });

    navigate(`/transactions/${newId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Buat Transaksi Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Data */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Data Pelanggan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                required 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Masukkan nama pelanggan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon/WA</label>
              <input 
                type="tel" 
                required 
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0812xxxxxx"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman</label>
              <textarea 
                required 
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Alamat lengkap proyek/rumah"
              />
            </div>
          </div>
        </div>

        {/* Rental Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Detail Sewa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Sewa</label>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleRentalTypeChange('daily')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${rentalType === 'daily' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Harian
                </button>
                <button
                  type="button"
                  onClick={() => handleRentalTypeChange('monthly')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${rentalType === 'monthly' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Bulanan
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durasi ({rentalType === 'daily' ? 'Hari' : 'Bulan'})</label>
              <div className="flex items-center">
                <button type="button" onClick={() => setDuration(Math.max(1, duration - 1))} className="p-3 bg-gray-100 border border-gray-300 rounded-l-lg text-gray-600 hover:bg-gray-200">
                  <Minus className="w-4 h-4" />
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={duration}
                  onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-3 border-y border-gray-300 text-center focus:ring-0"
                />
                <button type="button" onClick={() => setDuration(duration + 1)} className="p-3 bg-gray-100 border border-gray-300 rounded-r-lg text-gray-600 hover:bg-gray-200">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input 
                type="date" 
                required 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Item Scaffolding</label>
            <select 
              onChange={e => {
                if (e.target.value) {
                  handleAddItem(e.target.value);
                  e.target.value = ""; // reset
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue=""
            >
              <option value="" disabled>+ Tambah Item</option>
              {inventory.filter(i => i.availableStock > 0).map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (Tersedia: {item.availableStock}) - {formatCurrency(rentalType === 'daily' ? item.dailyRate : item.monthlyRate)}/{rentalType === 'daily' ? 'hari' : 'bln'}
                </option>
              ))}
            </select>
          </div>

          {selectedItems.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga/{rentalType === 'daily' ? 'hr' : 'bln'}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedItems.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" onClick={() => handleQuantityChange(item.id, -1)} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 font-semibold">{item.quantity}</span>
                          <button type="button" onClick={() => handleQuantityChange(item.id, 1)} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCurrency(item.pricePerUnit)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Deposit and Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Pembayaran</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Uang Jaminan (Deposit)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Rp</span>
              </div>
              <input 
                type="number" 
                min="0"
                required 
                value={depositAmount}
                onChange={e => setDepositAmount(Number(e.target.value))}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg font-semibold"
                placeholder="0"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Uang jaminan akan dikembalikan saat penyewaan selesai dan barang kembali utuh.</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg space-y-2 mb-6">
            <div className="flex justify-between text-sm text-blue-800">
              <span>Total Biaya Sewa ({duration} {rentalType === 'daily' ? 'hari' : 'bulan'})</span>
              <span className="font-semibold">{formatCurrency(calculateTotalCost())}</span>
            </div>
            <div className="flex justify-between text-sm text-blue-800">
              <span>Uang Jaminan</span>
              <span className="font-semibold">{formatCurrency(depositAmount)}</span>
            </div>
            <div className="pt-2 border-t border-blue-200 flex justify-between items-center text-lg font-bold text-blue-900">
              <span>Total Tagihan Pertama</span>
              <span>{formatCurrency(calculateTotalCost() + depositAmount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dibayar Sekarang (Opsional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Rp</span>
                </div>
                <input 
                  type="number" 
                  min="0"
                  value={initialPayment}
                  onChange={e => setInitialPayment(Number(e.target.value))}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
              <select 
                value={initialPaymentMethod}
                onChange={e => setInitialPaymentMethod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="cash">Tunai (Cash)</option>
                <option value="transfer">Transfer Bank</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sticky Submit Button for Mobile */}
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:static md:border-none md:bg-transparent md:p-0 z-10 flex justify-end">
          <button 
            type="submit"
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <span>Simpan Transaksi</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}