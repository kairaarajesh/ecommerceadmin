import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'; // <-- ADD THIS LINE

// Auth Pages
import Register from './pages/auth/Register';
// import OtpVerification from './pages/auth/OtpVerification';
import Login from './pages/auth/Login';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Reports from './pages/admin/Reports';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Brands from './pages/admin/Brands';
import Banners from './pages/admin/Banners';
import Users from './pages/admin/Users';
import Orders from './pages/admin/Orders';
import Payments from './pages/admin/Payments';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        {/* <Route path="/verify-otp" element={<OtpVerification />} /> */}
        <Route path="/login" element={<Login />} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="brands" element={<Brands />} />
          <Route path="banners" element={<Banners />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="payments" element={<Payments />} />
        </Route>

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;