import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, Package, Settings as SettingsIcon, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store/useStore';

export default function Layout() {
  const companyName = useStore(state => state.companySettings.name);
  const logout = useStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-16 md:pb-0 md:flex-row">
      {/* Top Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10 hidden md:flex items-center justify-between">
        <h1 className="text-xl font-bold">{companyName}</h1>
        <div className="flex gap-4 items-center">
          <NavLink to="/" className={({isActive}) => clsx("px-3 py-2 rounded-md transition-colors hover:bg-blue-700", isActive && "bg-blue-800")}>Beranda</NavLink>
          <NavLink to="/transactions/new" className={({isActive}) => clsx("px-3 py-2 rounded-md transition-colors hover:bg-blue-700", isActive && "bg-blue-800")}>Sewa Baru</NavLink>
          <NavLink to="/inventory" className={({isActive}) => clsx("px-3 py-2 rounded-md transition-colors hover:bg-blue-700", isActive && "bg-blue-800")}>Inventaris</NavLink>
          <NavLink to="/settings" className={({isActive}) => clsx("px-3 py-2 rounded-md transition-colors hover:bg-blue-700", isActive && "bg-blue-800")}>Pengaturan</NavLink>
          
          <div className="w-px h-6 bg-blue-400 mx-2"></div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors hover:bg-red-500 text-blue-100 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20">
        <NavLink 
          to="/" 
          className={({isActive}) => clsx("flex flex-col items-center p-2 text-xs font-medium transition-colors", isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500")}
        >
          <Home className="w-6 h-6 mb-1" />
          <span>Beranda</span>
        </NavLink>
        <NavLink 
          to="/transactions/new" 
          className={({isActive}) => clsx("flex flex-col items-center p-2 text-xs font-medium transition-colors", isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500")}
        >
          <FileText className="w-6 h-6 mb-1" />
          <span>Sewa Baru</span>
        </NavLink>
        <NavLink 
          to="/inventory" 
          className={({isActive}) => clsx("flex flex-col items-center p-2 text-xs font-medium transition-colors", isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500")}
        >
          <Package className="w-6 h-6 mb-1" />
          <span>Inventaris</span>
        </NavLink>
        <NavLink 
          to="/settings" 
          className={({isActive}) => clsx("flex flex-col items-center p-2 text-xs font-medium transition-colors", isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500")}
        >
          <SettingsIcon className="w-6 h-6 mb-1" />
          <span>Pengaturan</span>
        </NavLink>
      </nav>
    </div>
  );
}