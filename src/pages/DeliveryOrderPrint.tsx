import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Printer, ArrowLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export default function DeliveryOrderPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const transactions = useStore(state => state.transactions);
  const companySettings = useStore(state => state.companySettings);
  const tx = transactions.find(t => t.id === id);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Surat-Jalan-${tx?.customerName.replace(/\s+/g, '-')}-${tx?.id.slice(0, 6)}`
  });

  if (!tx) {
    return <div className="p-8 text-center">Transaksi tidak ditemukan</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>
        <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold">
          <Printer className="w-5 h-5" />
          Cetak Surat Jalan
        </button>
      </div>

      <div ref={printRef} className="bg-white p-10 min-h-[297mm] text-gray-900 border border-gray-200 shadow-sm print:border-none print:shadow-none mx-auto print:m-0 w-[210mm]">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">SURAT JALAN</h1>
            <p className="text-gray-500 mt-1 font-medium tracking-widest text-sm">PENGIRIMAN BARANG SEWA</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">{companySettings.name}</h2>
            <p className="text-sm text-gray-600">{companySettings.address}</p>
            <p className="text-sm text-gray-600">{companySettings.city}</p>
            <p className="text-sm text-gray-600">Telp: {companySettings.phone}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex justify-between mb-10">
          <div className="w-1/2 pr-8 border-r border-gray-300">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Tujuan Pengiriman:</h3>
            <p className="text-lg font-bold text-gray-900">{tx.customerName}</p>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{tx.customerAddress}</p>
            <p className="text-sm text-gray-600 mt-2"><strong>Telp:</strong> {tx.customerPhone}</p>
          </div>
          <div className="w-1/2 pl-8">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">No. Surat Jalan</span>
                <span className="font-bold text-gray-900">SJ-{tx.id.split('-')[0].toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Tanggal Pengiriman</span>
                <span className="font-bold text-gray-900">{format(parseISO(tx.startDate), 'dd MMMM yyyy', { locale: idLocale })}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Tipe Sewa</span>
                <span className="font-bold text-gray-900 uppercase">{tx.rentalType === 'daily' ? 'Harian' : 'Bulanan'}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-500 font-medium">No. Referensi (Ref)</span>
                <span className="font-bold text-gray-900">INV-{tx.id.split('-')[0].toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-sm text-blue-800">
          <strong>Perhatian:</strong> Harap periksa kondisi dan jumlah barang sebelum menandatangani surat jalan ini. Komplain setelah surat jalan ditandatangani tidak dapat kami proses.
        </div>

        {/* Items Table */}
        <table className="w-full mb-12 border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 py-3 px-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider w-16">No</th>
              <th className="border border-gray-300 py-3 px-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Nama Barang / Deskripsi</th>
              <th className="border border-gray-300 py-3 px-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider w-32">Jumlah</th>
              <th className="border border-gray-300 py-3 px-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider w-40">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {tx.items.map((item, idx) => (
              <tr key={idx}>
                <td className="border border-gray-300 py-4 px-4 text-sm text-gray-900 text-center">{idx + 1}</td>
                <td className="border border-gray-300 py-4 px-4 text-sm text-gray-900 font-medium">{item.name}</td>
                <td className="border border-gray-300 py-4 px-4 text-lg text-gray-900 font-bold text-center">{item.quantity}</td>
                <td className="border border-gray-300 py-4 px-4 text-sm text-gray-600 text-center">Baik</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-8 text-center mt-24">
          <div>
            <p className="text-gray-500 mb-24 text-sm font-medium">Penerima / Pelanggan,</p>
            <div className="border-t border-gray-400 pt-2 mx-4">
              <p className="font-bold text-gray-900">{tx.customerName}</p>
              <p className="text-xs text-gray-500 mt-1">Tanda Tangan & Nama Jelas</p>
            </div>
          </div>
          <div>
            <p className="text-gray-500 mb-24 text-sm font-medium">Pengirim / Supir,</p>
            <div className="border-t border-gray-400 pt-2 mx-4">
              <p className="font-bold text-gray-900">___________________</p>
              <p className="text-xs text-gray-500 mt-1">Tanda Tangan & Nama Jelas</p>
            </div>
          </div>
          <div>
            <p className="text-gray-500 mb-24 text-sm font-medium">Gudang / Penyiap,</p>
            <div className="border-t border-gray-400 pt-2 mx-4">
              <p className="font-bold text-gray-900">___________________</p>
              <p className="text-xs text-gray-500 mt-1">Tanda Tangan & Nama Jelas</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-xs text-gray-400 text-center">
          <p>Putih: Pembukuan | Merah: Pelanggan | Kuning: Arsip Gudang</p>
        </div>
      </div>
    </div>
  );
}