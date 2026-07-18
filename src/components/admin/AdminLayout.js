import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Routes, Route } from 'react-router-dom';
// import Dashboard from '../../pages/admin/Dashboard';
import Reports from '../../pages/admin/Reports';

  // Simple auth check
  // const token = localStorage.getItem('adminToken');
  // if (!token) {
  //   return <Navigate to="/login" />;
  // }

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fb' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main style={{ 
        marginLeft: collapsed ? '78px' : '270px', 
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '24px',
        flex: 1,
        background: '#f8f9fc',
        minHeight: '100vh'
      }}>
        <Routes>
          {/* <Route path="/" element={<Dashboard />} /> */}
          <Route path="/reports" element={<Reports />} />
          {/* ... other routes */}
        </Routes>
        <Outlet />
      </main>
    </div>
  );
  
};

export default AdminLayout;
