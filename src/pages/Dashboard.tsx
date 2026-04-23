import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { PlusCircle, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function Dashboard() {
  const transactions = useStore(state => state.transactions);
  const inventory = useStore(state => state.inventory);

  const activeTransactions = transactions.filter(t => t.status === 'active');
  const completedTransactions = transactions.filter(t => t.status === 'completed');

  const dueSoonTransactions = activeTransactions.filter(tx => {
    const daysLeft = differenceInDays(parseISO(tx.endDate), new Date());
    return daysLeft <= 2;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 md:hidden">Beranda</h1>
        <h1 className="text-3xl font-bold text-gray-900 hidden md:block">Ringkasan Penyewaan</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-medium text-gray-500">Sewa Aktif</h2>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeTransactions.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-medium text-gray-500">Jatuh Tempo</h2>
          </div>
          <p className="text-2xl font-bold text-gray-900">{dueSoonTransactions.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-medium text-gray-500">Selesai</h2>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedTransactions.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-medium text-gray-500">Total Transaksi</h2>
          </div>
          <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
        </div>
      </div>

      {dueSoonTransactions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-bold text-red-800 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            Pengingat: Masa Sewa Segera Berakhir
          </h2>
          <div className="space-y-2">
            {dueSoonTransactions.map(tx => {
              const daysLeft = differenceInDays(parseISO(tx.endDate), new Date());
              return (
                <Link key={tx.id} to={`/transactions/${tx.id}`} className="block bg-white p-3 rounded-lg border border-red-100 hover:border-red-300 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{tx.customerName}</p>
                      <p className="text-sm text-gray-500">Berakhir: {format(parseISO(tx.endDate), 'dd MMM yyyy', { locale: idLocale })}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${daysLeft < 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {daysLeft < 0 ? `Terlambat ${Math.abs(daysLeft)} hari` : daysLeft === 0 ? 'Hari ini' : `${daysLeft} hari lagi`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h2>
          <Link to="/transactions/new" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Sewa Baru</span>
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Belum ada transaksi.</p>
              <Link to="/transactions/new" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Buat Transaksi Pertama
              </Link>
            </div>
          ) : (
            transactions.slice(0, 5).map(tx => (
              <Link 
                key={tx.id} 
                to={`/transactions/${tx.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="mb-2 sm:mb-0">
                  <p className="font-medium text-gray-900">{tx.customerName}</p>
                  <p className="text-sm text-gray-500">
                    {format(parseISO(tx.startDate), 'dd MMM yyyy', { locale: idLocale })} - {format(parseISO(tx.endDate), 'dd MMM yyyy', { locale: idLocale })}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end">
                  <p className="font-semibold text-gray-900">{formatCurrency(tx.totalCost)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium mt-1 ${
                    tx.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {tx.status === 'active' ? 'Aktif' : 'Selesai'}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}