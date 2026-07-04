import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: DashboardIcon, end: true },
    { path: '/admin/reports', label: 'Reports', icon: ReportsIcon },
    { path: '/admin/products', label: 'Products', icon: ProductsIcon },
    { path: '/admin/categories', label: 'Categories', icon: CategoriesIcon },
    { path: '/admin/brands', label: 'Brands', icon: BrandsIcon },
    { path: '/admin/banners', label: 'Banners', icon: BannersIcon },
    { path: '/admin/users', label: 'Users', icon: UsersIcon },
    { path: '/admin/orders', label: 'Orders', icon: OrdersIcon },
    { path: '/admin/payments', label: 'Payments', icon: PaymentsIcon },
  ];

  const styles = {
    sidebar: {
      width: collapsed ? '78px' : '270px',
      height: '100vh',
      background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      overflow: 'hidden',
      boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
    },
    logoSection: {
      padding: collapsed ? '20px 10px' : '24px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      marginBottom: '8px',
    },
    logoBox: {
      width: '42px',
      height: '42px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 4px 15px rgba(108, 92, 231, 0.4)',
    },
    logoText: {
      color: '#fff',
      fontSize: '17px',
      fontWeight: 700,
      whiteSpace: 'nowrap',
      opacity: collapsed ? 0 : 1,
      transition: 'opacity 0.2s ease',
      letterSpacing: '-0.3px',
    },
    logoSub: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: '11px',
      fontWeight: 400,
      whiteSpace: 'nowrap',
      opacity: collapsed ? 0 : 1,
      transition: 'opacity 0.2s ease',
      marginTop: '2px',
    },
    navContainer: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '12px 0',
      scrollbarWidth: 'none',
    },
    sectionLabel: {
      padding: collapsed ? '8px 14px 6px' : '8px 24px 6px',
      color: 'rgba(255,255,255,0.3)',
      fontSize: '10px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      whiteSpace: 'nowrap',
      opacity: collapsed ? 0 : 1,
      transition: 'opacity 0.2s ease',
    },
    navLink: (isActive, isHovered) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: collapsed ? '12px 18px' : '11px 24px',
      margin: '2px 10px',
      borderRadius: '12px',
      textDecoration: 'none',
      color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
      background: isActive
        ? 'linear-gradient(135deg, rgba(108,92,231,0.25), rgba(168,85,247,0.15))'
        : isHovered
          ? 'rgba(255,255,255,0.06)'
          : 'transparent',
      borderLeft: isActive ? '3px solid #a855f7' : '3px solid transparent',
      transition: 'all 0.2s ease',
      position: 'relative',
      cursor: 'pointer',
      overflow: 'hidden',
    }),
    iconWrapper: (isActive) => ({
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isActive
        ? 'linear-gradient(135deg, #6c5ce7, #a855f7)'
        : 'rgba(255,255,255,0.05)',
      flexShrink: 0,
      transition: 'all 0.2s ease',
      boxShadow: isActive ? '0 4px 12px rgba(108,92,231,0.3)' : 'none',
    }),
    label: {
      fontSize: '13.5px',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      opacity: collapsed ? 0 : 1,
      transition: 'opacity 0.2s ease',
    },
    badge: {
      marginLeft: 'auto',
      background: 'linear-gradient(135deg, #ef4444, #f97316)',
      color: '#fff',
      fontSize: '10px',
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: '20px',
      opacity: collapsed ? 0 : 1,
      transition: 'opacity 0.2s ease',
    },
    toggleBtn: {
      position: 'absolute',
      top: '28px',
      right: '-14px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: '#1a1a3e',
      border: '2px solid rgba(255,255,255,0.1)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: 101,
      transition: 'all 0.2s ease',
      fontSize: '12px',
    },
    profileSection: {
      padding: collapsed ? '16px 10px' : '16px 20px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 700,
      fontSize: '15px',
      flexShrink: 0,
    },
    profileInfo: {
      opacity: collapsed ? 0 : 1,
      transition: 'opacity 0.2s ease',
      whiteSpace: 'nowrap',
    },
    profileName: {
      color: '#fff',
      fontSize: '13px',
      fontWeight: 600,
    },
    profileRole: {
      color: 'rgba(255,255,255,0.4)',
      fontSize: '11px',
      marginTop: '2px',
    },
    tooltip: {
      position: 'absolute',
      left: '70px',
      background: '#1e1e3f',
      color: '#fff',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.1)',
      pointerEvents: 'none',
      zIndex: 200,
    },
    activeDot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: '#a855f7',
      position: 'absolute',
      right: '12px',
      boxShadow: '0 0 8px rgba(168,85,247,0.6)',
      opacity: collapsed ? 1 : 0,
    },
  };

  return (
    <>
      <style>{`
        .sidebar-nav::-webkit-scrollbar { display: none; }
        .nav-link-item:hover .icon-glow {
          filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.4));
        }
        .toggle-btn:hover {
          background: #6c5ce7 !important;
          border-color: #6c5ce7 !important;
          transform: scale(1.1);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .nav-link-item {
          animation: slideIn 0.3s ease forwards;
        }
      `}</style>

      <div style={styles.sidebar}>
        {/* Toggle Button */}
        <button
          className="toggle-btn"
          style={styles.toggleBtn}
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '»' : '«'}
        </button>

        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <div style={styles.logoText}>Admin</div>
              <div style={styles.logoSub}>E-Commerce Panel</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" style={styles.navContainer}>
          <div style={styles.sectionLabel}>Main Menu</div>
          {menuItems.slice(0, 2).map((item, index) => (
            <NavItem
              key={item.path}
              item={item}
              collapsed={collapsed}
              index={index}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
              styles={styles}
              badge={item.label === 'Reports' ? '3' : null}
            />
          ))}

          <div style={{ ...styles.sectionLabel, marginTop: '16px' }}>Catalog</div>
          {menuItems.slice(2, 6).map((item, index) => (
            <NavItem
              key={item.path}
              item={item}
              collapsed={collapsed}
              index={index + 2}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
              styles={styles}
              badge={item.label === 'Products' ? '24' : null}
            />
          ))}

          <div style={{ ...styles.sectionLabel, marginTop: '16px' }}>Management</div>
          {menuItems.slice(6).map((item, index) => (
            <NavItem
              key={item.path}
              item={item}
              collapsed={collapsed}
              index={index + 6}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
              styles={styles}
              badge={item.label === 'Orders' ? '12' : item.label === 'Users' ? '5' : null}
            />
          ))}
        </nav>

        {/* Profile Section */}
        <div style={styles.profileSection}>
          <div style={styles.avatar}>A</div>
          {!collapsed && (
            <div style={styles.profileInfo}>
              <div style={styles.profileName}>Admin User</div>
              <div style={styles.profileRole}>Super Admin</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const NavItem = ({ item, collapsed, index, hoveredItem, setHoveredItem, styles, badge }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isActive = item.end
    ? window.location.pathname === item.path
    : window.location.pathname.startsWith(item.path);

  return (
    <NavLink
      to={item.path}
      end={item.end}
      className="nav-link-item"
      style={styles.navLink(isActive, hoveredItem === index)}
      onMouseEnter={() => {
        setHoveredItem(index);
        if (collapsed) setShowTooltip(true);
      }}
      onMouseLeave={() => {
        setHoveredItem(null);
        setShowTooltip(false);
      }}
    >
      <div style={styles.iconWrapper(isActive)} className="icon-glow">
        {item.icon(isActive ? '#fff' : 'rgba(255,255,255,0.5)')}
      </div>
      <span style={styles.label}>{item.label}</span>
      {badge && <span style={styles.badge}>{badge}</span>}
      {isActive && collapsed && <div style={styles.activeDot} />}
      {collapsed && showTooltip && (
        <div style={styles.tooltip}>{item.label}</div>
      )}
    </NavLink>
  );
};

// ─── SVG ICON COMPONENTS ───────────────────────────────────────────

const DashboardIcon = (color) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ReportsIcon = (color) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const ProductsIcon = (color) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const CategoriesIcon = (color) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    <line x1="12" y1="11" x2="12" y2="17" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </svg>
);

const BrandsIcon = (color) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
  </svg>
);

const BannersIcon = (color) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <circle cx="8" cy="10" r="1.5" fill={color} stroke="none" />
    <path d="M14 8l2 2-2 2" />
    <line x1="10" y1="10" x2="16" y2="10" />
  </svg>
);

const UsersIcon = (color) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const OrdersIcon = (color) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const PaymentsIcon = (color) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
    <line x1="6" y1="15" x2="10" y2="15" />
    <line x1="14" y1="15" x2="14.01" y2="15" />
  </svg>
);

export default Sidebar;