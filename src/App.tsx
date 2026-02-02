import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthLayout } from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import OrdersPage from './pages/Orders';
import ProductsPage from './pages/Products';
import InventoryPage from './pages/Inventory';
import TablesPage from './pages/Tables';
import UsersPage from './pages/Users';
import ReportsPage from './pages/Reports';
import POSPage from './pages/POS';
import ProfilePage from './pages/Profile';
import SettingsPage from './pages/Settings';

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Admin routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/tables" element={<TablesPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
