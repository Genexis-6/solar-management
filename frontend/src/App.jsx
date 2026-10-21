import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Customers from './pages/Customers.jsx';
import CustomerDetail from './pages/CustomerDetail.jsx';
import Installations from './pages/Installations.jsx';
import InstallationDetail from './pages/InstallationDetail.jsx';
import Maintenance from './pages/Maintenance.jsx';
import Notifications from './pages/Notifications.jsx';
import Mailing from './pages/Mailing.jsx';
import Users from './pages/Users.jsx';

export default function App() {
  const { user, isAdmin } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route element={user ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="installations" element={<Installations />} />
        <Route path="installations/:id" element={<InstallationDetail />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="mailing" element={<Mailing />} />
        <Route path="users" element={<Users />} />
        <Route path="*" element={<p>Page not found.</p>} />
      </Route>
    </Routes>
  );
}
