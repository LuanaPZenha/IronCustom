import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ToastContainer from '../components/ToastContainer';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import ServiceOrders from '../pages/ServiceOrders';
import Clients from '../pages/Clients';
import Inventory from '../pages/Inventory';
import Projects from '../pages/Projects';
import Finance from '../pages/Finance';
import PrivateRoute from './PrivateRoute';

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-workshop-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-workshop-700 border-t-workshop-accent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ordens-servico" element={<ServiceOrders />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/estoque" element={<Inventory />} />
          <Route path="/projetos" element={<Projects />} />
          <Route path="/financeiro" element={<Finance />} />
          <Route path="/itens" element={<Navigate to="/estoque" replace />} />
        </Route>

        <Route element={<PrivateRoute adminOnly />}>
          <Route path="/usuarios" element={<Users />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
