import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Printer, ArrowLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export default function InvoicePrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const transactions = useStore(state => state.transactions);
  const companySettings = useStore(state => state.companySettings);
  const tx = transactions.find(t => t.id === id);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${tx?.customerName.replace(/\s+/g, '-')}-${tx?.id.slice(0, 6)}`
  });

  if (!tx) {
    return <div className="p-8 text-center">Transaksi tidak ditemukan</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const calculateTotalExtensions = () => {
    return tx.extensions.reduce((acc, ext) => acc + ext.additionalCost, 0);
  };

  const baseTotal = tx.totalCost - calculateTotalExtensions();
  const totalTagihan = tx.totalCost + tx.depositAmount;
  const balanceDue = totalTagihan - tx.amountPaid;

  return (
    <div className="max-w-4xl mx-auto p-4 relative">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>
        <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold">
          <Printer className="w-5 h-5" />
          Cetak Invoice
        </button>
      </div>

      <div ref={printRef} className="bg-white p-10 min-h-[297mm] text-gray-900 border border-gray-200 shadow-sm print:border-none print:shadow-none mx-auto print:m-0 w-[210mm] relative">
        {/* LUNAS Stamp */}
        {tx.paymentStatus === 'paid' && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] opacity-20 pointer-events-none print:opacity-20 z-10">
            <div className="border-8 border-green-600 rounded-xl px-8 py-4">
              <p className="text-8xl font-black text-green-600 tracking-widest uppercase">LUNAS</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-blue-900 tracking-tighter uppercase">INVOICE</h1>
            <p className="text-gray-500 mt-1 font-medium tracking-widest text-sm">SEWA SCAFFOLDING</p>
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
          <div className="w-1/2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Tagihan Kepada:</h3>
            <p className="text-lg font-bold text-gray-900">{tx.customerName}</p>
            <p className="text-sm text-gray-600">{tx.customerAddress}</p>
            <p className="text-sm text-gray-600">Telp: {tx.customerPhone}</p>
          </div>
          <div className="w-1/2 text-right">
            <div className="grid grid-cols-2 gap-2 text-sm justify-end">
              <span className="text-gray-500 font-medium">No. Invoice:</span>
              <span className="font-bold text-gray-900">INV-{tx.id.split('-')[0].toUpperCase()}</span>
              
              <span className="text-gray-500 font-medium">Tanggal Dibuat:</span>
              <span className="font-bold text-gray-900">{format(parseISO(tx.createdAt), 'dd MMMM yyyy', { locale: idLocale })}</span>
              
              <span className="text-gray-500 font-medium">Tipe Sewa:</span>
              <span className="font-bold text-gray-900 uppercase">{tx.rentalType === 'daily' ? 'Harian' : 'Bulanan'}</span>
            </div>
          </div>
        </div>

        {/* Rental Period */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-8 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Periode Sewa Awal</p>
            <p className="font-semibold text-gray-900">{format(parseISO(tx.startDate), 'dd MMMM yyyy', { locale: idLocale })} - {format(parseISO(tx.endDate), 'dd MMMM yyyy', { locale: idLocale })}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Durasi</p>
            <p className="font-semibold text-gray-900 text-lg">{tx.duration} {tx.rentalType === 'daily' ? 'Hari' : 'Bulan'}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider w-1/2">Deskripsi Item</th>
              <th className="py-3 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">Qty</th>
              <th className="py-3 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Harga/Satuan</th>
              <th className="py-3 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tx.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-4 text-sm text-gray-900 font-medium">{item.name}</td>
                <td className="py-4 text-sm text-gray-600 text-center">{item.quantity}</td>
                <td className="py-4 text-sm text-gray-600 text-right">{formatCurrency(item.pricePerUnit)}</td>
                <td className="py-4 text-sm text-gray-900 text-right font-semibold">{formatCurrency(item.quantity * item.pricePerUnit * (tx.duration - tx.extensions.reduce((acc, ext) => acc + ext.duration, 0)))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Extensions if any */}
        {tx.extensions.length > 0 && (
          <div className="mb-8 border border-orange-200 bg-orange-50 rounded-lg p-4">
            <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-2">Riwayat Perpanjangan</h4>
            <div className="space-y-2">
              {tx.extensions.map((ext, idx) => (
                <div key={idx} className="flex justify-between text-sm text-orange-900">
                  <span>Perpanjangan #{idx + 1}: {ext.duration} {tx.rentalType === 'daily' ? 'Hari' : 'Bulan'}</span>
                  <span className="font-semibold">{formatCurrency(ext.additionalCost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between py-2 text-gray-600">
              <span className="text-sm font-medium uppercase tracking-wider">Subtotal Sewa</span>
              <span className="font-semibold text-gray-900">{formatCurrency(baseTotal)}</span>
            </div>
            {tx.extensions.length > 0 && (
              <div className="flex justify-between py-2 text-gray-600 border-t border-gray-200">
                <span className="text-sm font-medium uppercase tracking-wider">Total Perpanjangan</span>
                <span className="font-semibold text-gray-900">{formatCurrency(calculateTotalExtensions())}</span>
              </div>
            )}
            <div className="flex justify-between py-2 text-gray-600 border-t border-gray-200">
              <span className="text-sm font-medium uppercase tracking-wider">Uang Jaminan (Deposit)</span>
              <span className="font-semibold text-blue-600">{formatCurrency(tx.depositAmount)}</span>
            </div>
            <div className="flex justify-between py-4 mt-2 border-t-2 border-gray-900 bg-gray-50 px-2 rounded-lg">
              <span className="text-lg font-bold text-gray-900 uppercase tracking-wider">TOTAL TAGIHAN</span>
              <span className="text-2xl font-black text-gray-900">{formatCurrency(totalTagihan)}</span>
            </div>
            <div className="flex justify-between py-2 mt-2 text-gray-600 px-2">
              <span className="text-sm font-medium uppercase tracking-wider">Total Dibayar</span>
              <span className="font-semibold text-green-600">{formatCurrency(tx.amountPaid)}</span>
            </div>
            <div className="flex justify-between py-2 text-gray-600 border-t border-gray-200 px-2">
              <span className="text-sm font-bold uppercase tracking-wider">{balanceDue > 0 ? 'SISA TAGIHAN' : 'STATUS'}</span>
              <span className={`font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {balanceDue > 0 ? formatCurrency(balanceDue) : 'LUNAS'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500">
          <p className="font-bold text-gray-700 mb-2">Catatan & Ketentuan:</p>
          <ul className="list-disc pl-5 space-y-1">
            {companySettings.termsAndConditions.split('\n').map((term, i) => (
              <li key={i}>{term}</li>
            ))}
            <li>Pembayaran harap ditransfer ke Rekening <strong>{companySettings.bankName}</strong>: {companySettings.bankAccount} a.n {companySettings.bankAccountName}.</li>
          </ul>
        </div>
        
        {/* Signatures */}
        <div className="mt-16 flex justify-between px-10">
          <div className="text-center">
            <p className="text-gray-500 mb-20 text-sm font-medium">Hormat Kami,</p>
            <p className="font-bold text-gray-900 border-t border-gray-400 pt-2 inline-block min-w-[160px]">{companySettings.name}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 mb-20 text-sm font-medium">Penyewa,</p>
            <p className="font-bold text-gray-900 border-t border-gray-400 pt-2 inline-block min-w-[160px]">{tx.customerName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}