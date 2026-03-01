import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved !== null ? saved === 'true' : true;
  });
  
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', String(isExpanded));
  }, [isExpanded]);
  
  const isActive = (path: string) => location.pathname === path;

  const mainMenuItems = [
    { path: '/dashboard', icon: 'space_dashboard', label: 'Dashboard' },
    { path: '/inbox', icon: 'all_inbox', label: 'Inbox' },
    { path: '/rfq-inbox', icon: 'assignment', label: 'RFQ Management' },
    { path: '/quotations', icon: 'receipt_long', label: 'Quotations' },
    { path: '/products', icon: 'package_2', label: 'Products / Inventory' },
    { path: '/client-ledger', icon: 'groups', label: 'Clients' },
    { path: '/analytics', icon: 'monitoring', label: 'Analytics' },
  ];

  const bottomMenuItems = [
    { path: '/user-permissions', icon: 'shield_person', label: 'Users & Roles' },
    { path: '/system-config', icon: 'tune', label: 'Settings' },
  ];

  const NavItem = ({ item, active }: { item: typeof mainMenuItems[0]; active: boolean }) => (
    <Link 
      to={item.path} 
      className={`group flex items-center gap-3 mx-2 px-2.5 h-[40px] text-[13px] rounded-lg transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-[var(--erp-accent)] to-[var(--erp-accent)]/80 text-white shadow-md shadow-[var(--erp-accent)]/25' 
          : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-100'
      }`}
      title={!isExpanded ? item.label : ""}
    >
      <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`}>
        {item.icon}
      </span>
      {isExpanded && (
        <span className={`whitespace-nowrap ${active ? 'font-semibold' : 'font-medium'}`}>
          {item.label}
        </span>
      )}
    </Link>
  );

  return (
    <aside className={`${isExpanded ? 'w-56' : 'w-[56px]'} bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col shrink-0 transition-all duration-300 font-sans`}>
      <div className="h-[52px] px-3 border-b border-slate-700/50 flex items-center gap-2.5">
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isExpanded ? 'menu_open' : 'menu'}
          </span>
        </button>
        {isExpanded && (
          <p className="text-[11px] uppercase text-slate-500 font-semibold tracking-wider whitespace-nowrap">
            Menu
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-0.5">
        {mainMenuItems.map(item => (
          <NavItem 
            key={item.path}
            item={item}
            active={isActive(item.path) || (item.path === '/dashboard' && location.pathname === '/')}
          />
        ))}
      </div>
      <div className="border-t border-slate-700/50 py-2 space-y-0.5">
        {bottomMenuItems.map(item => (
          <NavItem 
            key={item.path}
            item={item}
            active={isActive(item.path)}
          />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
