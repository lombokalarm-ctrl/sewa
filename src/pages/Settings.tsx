import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Save, Building2, Landmark, FileText, CheckCircle2, Lock, LogOut } from 'lucide-react';
import { CompanySettings } from '../types';

export default function Settings() {
  const storeSettings = useStore(state => state.companySettings);
  const updateCompanySettings = useStore(state => state.updateCompanySettings);
  const updateCredentials = useStore(state => state.updateCredentials);
  const logout = useStore(state => state.logout);
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<CompanySettings>(storeSettings);
  const [isSaved, setIsSaved] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passcodeSaved, setPasscodeSaved] = useState(false);

  useEffect(() => {
    setSettings(storeSettings);
  }, [storeSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.length < 3) {
      alert('Username minimal 3 karakter');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }
    updateCredentials(newUsername, newPassword);
    setNewUsername('');
    setNewPassword('');
    setPasscodeSaved(true);
    setTimeout(() => setPasscodeSaved(false), 3000);
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Perusahaan</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Informasi Umum
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan / Toko</label>
              <input 
                type="text" 
                name="name"
                required 
                value={settings.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
              <input 
                type="text" 
                name="address"
                required 
                value={settings.address}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kota & Kode Pos</label>
                <input 
                  type="text" 
                  name="city"
                  required 
                  value={settings.city}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon / WhatsApp</label>
                <input 
                  type="text" 
                  name="phone"
                  required 
                  value={settings.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-600" />
            Informasi Rekening Bank
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label>
              <input 
                type="text" 
                name="bankName"
                required 
                value={settings.bankName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: BCA / Mandiri / BRI"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
              <input 
                type="text" 
                name="bankAccount"
                required 
                value={settings.bankAccount}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik Rekening</label>
              <input 
                type="text" 
                name="bankAccountName"
                required 
                value={settings.bankAccountName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Syarat & Ketentuan Sewa
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan untuk Invoice (Pisahkan baris baru dengan Enter)</label>
            <textarea 
              name="termsAndConditions"
              required 
              rows={5}
              value={settings.termsAndConditions}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Simpan Pengaturan
          </button>

          {isSaved && (
            <span className="text-green-600 font-medium flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-5 h-5" />
              Berhasil disimpan!
            </span>
          )}
        </div>
      </form>

      {/* Security Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          Keamanan & Autentikasi
        </h2>
        <form onSubmit={handlePasscodeSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ganti Kredensial Login</label>
            <p className="text-xs text-gray-500 mb-3">Default Username: <strong>admin</strong> | Default Password: <strong>password123</strong>.</p>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Username baru"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input 
                type="text" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password baru"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button 
                type="submit"
                className="bg-gray-800 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors whitespace-nowrap"
              >
                Ubah Login
              </button>
            </div>
            {passcodeSaved && (
              <p className="text-green-600 text-sm mt-2 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Kredensial berhasil diubah!
              </p>
            )}
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 md:hidden">
          <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 border border-red-100 px-6 py-3 rounded-lg font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Keluar dari Aplikasi
          </button>
        </div>
      </div>
    </div>
  );
}