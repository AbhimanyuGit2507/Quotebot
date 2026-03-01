import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SearchResult {
  type: 'page' | 'rfq' | 'quote' | 'client' | 'product';
  title: string;
  subtitle?: string;
  path: string;
  icon: string;
}

// Mock search data - moved outside component to avoid unnecessary re-renders
const allSearchableItems: SearchResult[] = [
  { type: 'page', title: 'Dashboard', path: '/dashboard', icon: 'space_dashboard' },
  { type: 'page', title: 'Inbox', path: '/inbox', icon: 'all_inbox' },
  { type: 'page', title: 'RFQ Management', path: '/rfq-inbox', icon: 'assignment' },
  { type: 'page', title: 'Quotations', path: '/quotations', icon: 'receipt_long' },
  { type: 'page', title: 'Products', path: '/products', icon: 'package_2' },
  { type: 'page', title: 'Clients', path: '/client-ledger', icon: 'groups' },
  { type: 'page', title: 'Analytics', path: '/analytics', icon: 'monitoring' },
  { type: 'page', title: 'Settings', path: '/system-config', icon: 'tune' },
  { type: 'rfq', title: 'RFQ/25-26/2048', subtitle: 'Alpha Manufacturing', path: '/rfq-inbox', icon: 'assignment' },
  { type: 'rfq', title: 'RFQ/25-26/2047', subtitle: 'Global Logistics', path: '/rfq-inbox', icon: 'assignment' },
  { type: 'quote', title: 'QT-2048', subtitle: 'Server Upgrade Phase 2', path: '/quotations', icon: 'receipt_long' },
  { type: 'quote', title: 'QT-2045', subtitle: 'Network Overhaul', path: '/quotations', icon: 'receipt_long' },
  { type: 'client', title: 'Alpha Manufacturing Co.', subtitle: 'VIP Client', path: '/client-ledger', icon: 'business' },
  { type: 'client', title: 'Global Logistics Ltd.', subtitle: 'Regular Client', path: '/client-ledger', icon: 'business' },
  { type: 'product', title: 'Dell Server R750', subtitle: 'SKU: SRV-001', path: '/products', icon: 'dns' },
  { type: 'product', title: 'HP Switch 48-Port', subtitle: 'SKU: NET-042', path: '/products', icon: 'settings_ethernet' },
];

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  const isActive = (path: string) => location.pathname === path;

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allSearchableItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 8));
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSelect = (result: SearchResult) => {
    navigate(result.path);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'rfq', message: 'New RFQ from Tech-Corp International', time: '5 min ago', unread: true },
    { id: 2, type: 'quote', message: 'Quote QT-2024-0089 accepted by client', time: '1 hour ago', unread: true },
    { id: 3, type: 'system', message: 'Daily backup completed successfully', time: '3 hours ago', unread: false },
    { id: 4, type: 'alert', message: 'Low stock alert: 5 items below threshold', time: '5 hours ago', unread: false },
  ]);

  const quickActions = [
    { icon: 'add_circle', label: 'New Quotation', shortcut: 'Ctrl+Q', action: () => navigate('/quotations') },
    { icon: 'request_quote', label: 'New RFQ', shortcut: 'Ctrl+R', action: () => navigate('/rfq-inbox') },
    { icon: 'person_add', label: 'Add Client', shortcut: 'Ctrl+C', action: () => navigate('/client-ledger') },
    { icon: 'inventory_2', label: 'Add Product', shortcut: 'Ctrl+P', action: () => navigate('/products') },
  ];

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-12 bg-white border-b border-slate-300 flex items-center justify-between px-4 shrink-0 z-20 font-sans">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-[var(--erp-accent)] text-2xl">terminal</span>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm uppercase tracking-tight text-[var(--erp-text)]">Quotebot</span>
            <span className="text-[10px] text-slate-400 tracking-widest">ENTERPRISE</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* Global Search - Expanded */}
        <div className="relative" ref={searchRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-[18px]">search</span>
          <input 
            id="global-search"
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowSearchResults(true)}
            placeholder="Search RFQs, quotes, clients, products... (Ctrl+K)"
            className="w-[420px] pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none transition-all"
          />
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[var(--erp-border)] rounded-lg shadow-xl z-50 overflow-hidden">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearchSelect(result)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0"
                >
                  <span className="material-symbols-outlined !text-[18px] text-slate-400">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--erp-text)] truncate">{result.title}</p>
                    {result.subtitle && <p className="text-[11px] text-slate-400 truncate">{result.subtitle}</p>}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">{result.type}</span>
                </button>
              ))}
            </div>
          )}
          {showSearchResults && searchQuery && searchResults.length === 0 && (
            <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[var(--erp-border)] rounded-lg shadow-xl z-50 p-4 text-center">
              <span className="material-symbols-outlined text-slate-300 text-3xl mb-2">search_off</span>
              <p className="text-sm text-slate-500">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Quick Actions */}
        <div className="relative">
          <button 
            className={`p-2 rounded transition-colors ${showQuickActions ? 'bg-slate-100' : 'hover:bg-slate-100'}`}
            onClick={() => { setShowQuickActions(!showQuickActions); setShowNotifications(false); setShowUserMenu(false); }}
            title="Quick Actions"
          >
            <span className="material-symbols-outlined text-slate-500 !text-xl">bolt</span>
          </button>
          {showQuickActions && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-[var(--erp-border)] rounded-lg shadow-xl z-50 w-56 overflow-hidden">
              <div className="p-2.5 border-b border-[var(--erp-border)] text-[11px] font-bold text-[var(--erp-text-muted)] uppercase bg-slate-50">Quick Actions</div>
              {quickActions.map(action => (
                <button 
                  key={action.label} 
                  onClick={() => { action.action(); setShowQuickActions(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined !text-[18px] text-[var(--erp-accent)]">{action.icon}</span>
                    <span>{action.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{action.shortcut}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            className={`p-2 rounded transition-colors relative ${showNotifications ? 'bg-slate-100' : 'hover:bg-slate-100'}`}
            onClick={() => { setShowNotifications(!showNotifications); setShowQuickActions(false); setShowUserMenu(false); }}
            title="Notifications"
          >
            <span className="material-symbols-outlined text-slate-500 !text-xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-[var(--erp-border)] rounded-lg shadow-xl z-50 w-80 overflow-hidden">
              <div className="p-3 border-b border-[var(--erp-border)] flex items-center justify-between bg-slate-50">
                <span className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase">Notifications</span>
                <button onClick={markAllNotificationsRead} className="text-[12px] text-[var(--erp-accent)] hover:underline">Mark all read</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => markNotificationRead(notif.id)}
                    className={`px-3 py-2.5 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${notif.unread ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`material-symbols-outlined !text-[18px] mt-0.5 ${notif.unread ? 'text-[var(--erp-accent)]' : 'text-slate-400'}`}>
                        {notif.type === 'rfq' ? 'request_quote' : notif.type === 'quote' ? 'description' : notif.type === 'alert' ? 'warning' : 'info'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notif.unread ? 'font-medium' : ''}`}>{notif.message}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{notif.time}</p>
                      </div>
                      {notif.unread && <span className="w-2 h-2 bg-[var(--erp-accent)] rounded-full mt-1.5"></span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-[var(--erp-border)] bg-slate-50">
                <button className="w-full text-center text-sm text-[var(--erp-accent)] hover:underline py-1">View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Date Display */}
        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded text-[12px] mx-1">
          <span className="material-symbols-outlined !text-[16px] text-slate-500">calendar_today</span>
          <span className="font-medium text-slate-600">{currentDate}</span>
        </div>

        {/* Subscription/Usage Indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded text-[11px] mx-1">
          <span className="material-symbols-outlined !text-[14px] text-emerald-600">verified</span>
          <span className="font-semibold text-emerald-700">Pro Plan</span>
          <span className="text-emerald-600">•</span>
          <span className="text-emerald-600">2,450 / 5,000 RFQs</span>
        </div>

        {/* Settings Link */}
        <Link 
          to="/system-config" 
          className={`p-2 rounded transition-colors ${isActive('/system-config') ? 'bg-slate-100 text-[var(--erp-accent)]' : 'hover:bg-slate-100'}`}
          title="Settings"
        >
          <span className={`material-symbols-outlined !text-xl ${isActive('/system-config') ? 'text-[var(--erp-accent)]' : 'text-slate-500'}`}>settings</span>
        </Link>

        {/* User Menu */}
        <div className="relative">
          <button 
            className={`flex items-center gap-2 p-1.5 rounded transition-colors ${showUserMenu ? 'bg-slate-100' : 'hover:bg-slate-100'}`}
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); setShowQuickActions(false); }}
          >
            <div className="w-7 h-7 rounded-full bg-[var(--erp-accent)] flex items-center justify-center text-white font-bold text-sm">R</div>
            <span className="material-symbols-outlined text-slate-400 !text-[18px]">expand_more</span>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-[var(--erp-border)] rounded shadow-lg z-50 w-56">
              <div className="p-3 border-b border-[var(--erp-border)]">
                <p className="font-semibold text-sm text-[var(--erp-text)]">Rahul Sharma</p>
                <p className="text-[12px] text-[var(--erp-text-muted)]">System Administrator</p>
              </div>
              <div className="py-1">
                <Link to="/user-permissions" className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50">
                  <span className="material-symbols-outlined !text-[18px] text-slate-500">person</span>
                  My Profile
                </Link>
                <Link to="/system-config" className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50">
                  <span className="material-symbols-outlined !text-[18px] text-slate-500">tune</span>
                  Preferences
                </Link>
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50">
                  <span className="material-symbols-outlined !text-[18px] text-slate-500">help</span>
                  Help & Support
                </button>
              </div>
              <div className="border-t border-[var(--erp-border)] py-1">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <span className="material-symbols-outlined !text-[18px]">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
