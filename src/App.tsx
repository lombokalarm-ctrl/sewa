import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewTransaction from './pages/NewTransaction';
import TransactionDetail from './pages/TransactionDetail';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import InvoicePrint from './pages/InvoicePrint';
import DeliveryOrderPrint from './pages/DeliveryOrderPrint';
import Login from './pages/Login';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useStore(state => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="transactions/new" element={<NewTransaction />} />
          <Route path="transactions/:id" element={<TransactionDetail />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="/invoice/:id" element={
          <ProtectedRoute>
            <InvoicePrint />
          </ProtectedRoute>
        } />
        <Route path="/delivery-order/:id" element={
          <ProtectedRoute>
            <DeliveryOrderPrint />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;