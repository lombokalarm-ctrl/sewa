import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { format, parseISO, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { FileText, ArrowLeft, Clock, CalendarDays, Receipt, CheckCircle, AlertTriangle, CreditCard, Plus } from 'lucide-react';

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const transactions = useStore(state => state.transactions);
  const completeTransaction = useStore(state => state.completeTransaction);
  const extendTransaction = useStore(state => state.extendTransaction);

  const tx = transactions.find(t => t.id === id);

  const [isExtending, setIsExtending] = useState(false);
  const [extensionDuration, setExtensionDuration] = useState(1);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const addPayment = useStore(state => state.addPayment);

  if (!tx) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Transaksi tidak ditemukan</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const handleComplete = () => {
    if (window.confirm('Anda yakin transaksi ini sudah selesai dan barang telah dikembalikan?')) {
      completeTransaction(tx.id);
      alert('Transaksi selesai. Jangan lupa mengembalikan uang jaminan.');
    }
  };

  const handleExtend = () => {
    if (window.confirm(`Perpanjang sewa selama ${extensionDuration} ${tx.rentalType === 'daily' ? 'hari' : 'bulan'}?`)) {
      extendTransaction(tx.id, extensionDuration);
      setIsExtending(false);
      setExtensionDuration(1);
    }
  };

  const handleAddPayment = () => {
    if (paymentAmount <= 0) return;
    if (window.confirm(`Simpan pembayaran sebesar ${formatCurrency(paymentAmount)}?`)) {
      addPayment(tx.id, paymentAmount, paymentMethod);
      setIsAddingPayment(false);
      setPaymentAmount(0);
    }
  };

  const daysLeft = differenceInDays(parseISO(tx.endDate), new Date());
  const isExpiringSoon = tx.status === 'active' && daysLeft <= 2;
  const balanceDue = (tx.totalCost + tx.depositAmount) - tx.amountPaid;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate('/')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Detail Transaksi</h1>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${
          tx.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        }`}>
          {tx.status === 'active' ? 'Aktif' : 'Selesai'}
        </span>
      </div>

      {isExpiringSoon && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-red-800">
                Peringatan Masa Sewa
              </h3>
              <div className="mt-1 text-sm text-red-700">
                <p>
                  {daysLeft < 0 
                    ? `Masa sewa telah berakhir ${Math.abs(daysLeft)} hari yang lalu.` 
                    : daysLeft === 0 
                      ? 'Masa sewa berakhir hari ini.' 
                      : `Masa sewa akan berakhir dalam ${daysLeft} hari.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Informasi Pelanggan</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nama Lengkap</p>
              <p className="font-semibold text-gray-900">{tx.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">No. Telepon / WhatsApp</p>
              <p className="font-semibold text-gray-900">{tx.customerPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Alamat Pengiriman</p>
              <p className="font-semibold text-gray-900">{tx.customerAddress}</p>
            </div>
          </div>
        </div>

        {/* Rental Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Periode Sewa</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Tipe Sewa</p>
                <p className="font-semibold text-gray-900 capitalize">{tx.rentalType === 'daily' ? 'Harian' : 'Bulanan'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Durasi</p>
                <p className="font-semibold text-gray-900">{tx.duration} {tx.rentalType === 'daily' ? 'Hari' : 'Bulan'}</p>
              </div>
            </div>
            <div className="flex gap-4 bg-gray-50 p-3 rounded-lg items-center">
              <CalendarDays className="text-blue-500 w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Tanggal Mulai</p>
                <p className="font-bold text-gray-900">{format(parseISO(tx.startDate), 'dd MMM yyyy', { locale: idLocale })}</p>
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Tanggal Selesai</p>
                <p className="font-bold text-gray-900">{format(parseISO(tx.endDate), 'dd MMM yyyy', { locale: idLocale })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Item Scaffolding</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-2">Item</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase py-2">Qty</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase py-2">Harga Satuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tx.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-3 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 text-sm text-center text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-sm text-right text-gray-600">{formatCurrency(item.pricePerUnit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Ringkasan Biaya</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Total Biaya Sewa Utama</span>
              <span className="font-medium">{formatCurrency(tx.totalCost - tx.extensions.reduce((acc, ext) => acc + ext.additionalCost, 0))}</span>
            </div>
            
            {tx.extensions.length > 0 && (
              <div className="pl-4 border-l-2 border-orange-200 space-y-2 py-2">
                <p className="text-xs font-bold text-orange-600 uppercase">Riwayat Perpanjangan:</p>
                {tx.extensions.map(ext => (
                  <div key={ext.id} className="flex justify-between text-sm text-gray-600">
                    <span>+ {ext.duration} {tx.rentalType === 'daily' ? 'hari' : 'bulan'} ({format(parseISO(ext.dateAdded), 'dd/MM/yyyy')})</span>
                    <span>{formatCurrency(ext.additionalCost)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Uang Jaminan (Deposit)</span>
              <span className="font-medium text-blue-600">{formatCurrency(tx.depositAmount)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-lg font-bold text-gray-900">
              <span>Total Biaya Keseluruhan</span>
              <span>{formatCurrency(tx.totalCost + tx.depositAmount)}</span>
            </div>

            <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-200">
              <span>Total Dibayar</span>
              <span className="font-medium text-green-600">{formatCurrency(tx.amountPaid)}</span>
            </div>

            <div className={`flex justify-between items-center pt-2 font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
              <span>{balanceDue > 0 ? 'Sisa Tagihan' : 'Status Pembayaran'}</span>
              <span>
                {balanceDue > 0 ? formatCurrency(balanceDue) : 'LUNAS'}
              </span>
            </div>
            
            {tx.paymentStatus !== 'paid' && !isAddingPayment && (
              <button 
                onClick={() => setIsAddingPayment(true)}
                className="mt-4 w-full bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Pembayaran
              </button>
            )}

            {isAddingPayment && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-3 text-sm">Pembayaran Baru</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nominal (Rp)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={paymentAmount || ''}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      placeholder="Contoh: 500000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Metode Pembayaran</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="cash">Tunai (Cash)</option>
                      <option value="transfer">Transfer Bank</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleAddPayment} className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold text-sm hover:bg-blue-700">Simpan</button>
                    <button onClick={() => setIsAddingPayment(false)} className="flex-1 bg-white border border-gray-300 text-gray-600 py-2 rounded font-semibold text-sm hover:bg-gray-50">Batal</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        {tx.payments && tx.payments.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Riwayat Pembayaran
            </h2>
            <div className="space-y-3">
              {tx.payments.map((payment, idx) => (
                <div key={payment.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-700 p-2 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Pembayaran #{idx + 1} ({payment.method === 'cash' ? 'Tunai' : 'Transfer'})</p>
                      <p className="text-xs text-gray-500">{format(parseISO(payment.date), 'dd MMM yyyy HH:mm', { locale: idLocale })}</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <Link 
          to={`/invoice/${tx.id}`}
          className="flex-1 bg-white border-2 border-gray-200 text-gray-700 px-4 py-3 rounded-lg font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
        >
          <Receipt className="w-5 h-5" />
          <span>Cetak Invoice</span>
        </Link>
        <Link 
          to={`/delivery-order/${tx.id}`}
          className="flex-1 bg-white border-2 border-gray-200 text-gray-700 px-4 py-3 rounded-lg font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          <span>Cetak Surat Jalan</span>
        </Link>
      </div>

      {tx.status === 'active' && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Aksi Transaksi Aktif
          </h3>
          
          {isExtending ? (
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Durasi Perpanjangan ({tx.rentalType === 'daily' ? 'Hari' : 'Bulan'})</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  min="1" 
                  value={extensionDuration}
                  onChange={e => setExtensionDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-center"
                />
                <button onClick={handleExtend} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Simpan Perpanjangan</button>
                <button onClick={() => setIsExtending(false)} className="text-gray-500 px-4 py-2 hover:bg-gray-100 rounded">Batal</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setIsExtending(true)}
                className="flex-1 bg-white border border-blue-200 text-blue-700 px-4 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <Clock className="w-5 h-5" />
                <span>Perpanjang Sewa</span>
              </button>
              <button 
                onClick={handleComplete}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 shadow-md shadow-green-200 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Selesaikan & Kembalikan Barang</span>
              </button>
            </div>
          )}
          
          <div className="mt-4 text-xs text-blue-800 flex items-start gap-2 bg-blue-100 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Pastikan Anda telah memeriksa kondisi fisik scaffolding saat pengembalian sebelum menekan tombol "Selesaikan". Uang jaminan sebesar <strong>{formatCurrency(tx.depositAmount)}</strong> harus dikembalikan kepada pelanggan jika barang utuh.</p>
          </div>
        </div>
      )}
    </div>
  );
}