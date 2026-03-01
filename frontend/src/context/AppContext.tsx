import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface RFQ {
  id: string;
  number: string;
  date: string;
  client: string;
  clientId: string;
  items: number;
  value: string;
  status: 'pending' | 'draft' | 'quoted' | 'expired' | 'converted';
  channel: 'email' | 'whatsapp' | 'manual';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  notes?: string;
}

export interface Quote {
  id: string;
  number: string;
  rfqNumber?: string;
  date: string;
  client: string;
  clientId: string;
  project?: string;
  items: QuoteItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  validUntil: string;
  validity?: string;
  followUpDate?: string;
  notes?: string;
}

export interface QuoteItem {
  id: string;
  productId?: string;
  productName?: string;
  name: string;
  description?: string;
  sku?: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  rate: number;
  discount?: number;
  total: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  basePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  hsn?: string;
  gst: number;
  status: 'active' | 'inactive' | 'low_stock';
}

export interface Client {
  id: string;
  name: string;
  type: 'company' | 'individual';
  email: string;
  phone: string;
  gst?: string;
  address: string;
  city: string;
  state: string;
  tier: 'gold' | 'silver' | 'bronze' | 'vip' | 'regular' | 'new';
  totalOrders: number;
  totalValue: number;
  createdAt: string;
  lastOrderAt?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'viewer';
  department: string;
  status: 'online' | 'offline' | 'active' | 'inactive';
  avatar?: string;
  lastLogin: string;
  permissions?: string[];
}

export interface InboxMessage {
  id: string;
  channel: 'email' | 'whatsapp';
  sender: string;
  from?: string;
  subject: string;
  preview: string;
  content?: string;
  timestamp: string;
  status: 'new' | 'parsed' | 'needs_review' | 'duplicate' | 'failed';
  isRead: boolean;
  confidence: number;
  extractedItems: number;
  attachments?: string[];
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  // Data
  rfqs: RFQ[];
  quotes: Quote[];
  products: Product[];
  clients: Client[];
  users: User[];
  inboxMessages: InboxMessage[];
  
  // Actions
  addRFQ: (rfq: Omit<RFQ, 'id'>) => void;
  updateRFQ: (id: string, data: Partial<RFQ>) => void;
  deleteRFQ: (id: string) => void;
  
  addQuote: (quote: Omit<Quote, 'id'>) => void;
  updateQuote: (id: string, data: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  updateInboxMessage: (id: string, data: Partial<InboxMessage>) => void;
  
  // Toast
  toast: ToastState;
  showToast: (message: string, type?: ToastState['type']) => void;
  hideToast: () => void;
  
  // Modals
  confirmModal: { show: boolean; title: string; message: string; onConfirm: () => void };
  showConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
  hideConfirmModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial mock data
const initialRFQs: RFQ[] = [
  { id: '1', number: 'RFQ/25-26/2048', date: '2026-03-01', client: 'Alpha Manufacturing Co.', clientId: '1', items: 12, value: '₹4,50,000', status: 'pending', channel: 'email', priority: 'high' },
  { id: '2', number: 'RFQ/25-26/2047', date: '2026-03-01', client: 'Global Logistics Ltd.', clientId: '2', items: 5, value: '₹1,28,500', status: 'draft', channel: 'whatsapp', priority: 'medium' },
  { id: '3', number: 'RFQ/25-26/2046', date: '2026-02-28', client: 'Precision Instruments Inc.', clientId: '3', items: 32, value: '₹12,24,000', status: 'quoted', channel: 'email', priority: 'high' },
  { id: '4', number: 'RFQ/25-26/2045', date: '2026-02-28', client: 'Southern Steel Works', clientId: '4', items: 8, value: '₹82,000', status: 'expired', channel: 'manual', priority: 'low' },
  { id: '5', number: 'RFQ/25-26/2044', date: '2026-02-27', client: 'Nexus Tech Solutions', clientId: '5', items: 15, value: '₹6,20,000', status: 'converted', channel: 'email', priority: 'medium' },
];

const initialQuotes: Quote[] = [
  { id: '1', number: 'QT-2048', rfqNumber: 'RFQ/25-26/2046', date: '2026-03-01', client: 'Precision Instruments Inc.', clientId: '3', project: 'Server Upgrade Phase 2', items: [
    { id: '1', name: 'Dell PowerEdge R750', description: 'Enterprise server', quantity: 3, unit: 'Unit', rate: 450000, total: 1350000 },
    { id: '2', name: 'Cisco Catalyst 9300', description: '48-port switch', quantity: 2, unit: 'Unit', rate: 185000, total: 370000 },
  ], subtotal: 1720000, tax: 309600, total: 2029600, status: 'sent', validUntil: '2026-03-15' },
  { id: '2', number: 'QT-2047', rfqNumber: 'RFQ/25-26/2044', date: '2026-02-28', client: 'Nexus Tech Solutions', clientId: '5', project: 'Network Overhaul', items: [
    { id: '1', name: 'NetApp AFF A250', description: 'Storage system', quantity: 2, unit: 'Unit', rate: 1250000, total: 2500000 },
    { id: '2', name: 'Fortinet FortiGate 100F', description: 'Firewall', quantity: 1, unit: 'Unit', rate: 95000, total: 95000 },
  ], subtotal: 2595000, tax: 467100, total: 3062100, status: 'accepted', validUntil: '2026-03-28' },
  { id: '3', number: 'QT-2046', date: '2026-02-27', client: 'Alpha Manufacturing Co.', clientId: '1', project: 'Q4 Maintenance', items: [
    { id: '1', name: 'APC Smart-UPS 3000VA', description: 'UPS system', quantity: 2, unit: 'Unit', rate: 125000, total: 250000 },
  ], subtotal: 250000, tax: 45000, total: 295000, status: 'draft', validUntil: '2026-03-27' },
  { id: '4', number: 'QT-2045', date: '2026-02-25', client: 'Global Logistics Ltd.', clientId: '2', project: 'Warehouse Automation', items: [
    { id: '1', name: 'Cisco Catalyst 9300', description: '48-port switch', quantity: 4, unit: 'Unit', rate: 185000, total: 740000 },
  ], subtotal: 740000, tax: 133200, total: 873200, status: 'sent', validUntil: '2026-03-04', followUpDate: '2026-03-02' },
  { id: '5', number: 'QT-2044', date: '2026-02-20', client: 'Southern Steel Works', clientId: '4', project: 'ERP Integration', items: [
    { id: '1', name: 'Dell PowerEdge R750', description: 'Enterprise server', quantity: 1, unit: 'Unit', rate: 450000, total: 450000 },
  ], subtotal: 450000, tax: 81000, total: 531000, status: 'declined', validUntil: '2026-03-05' },
];

const initialProducts: Product[] = [
  { id: '1', sku: 'SRV-001', name: 'Dell PowerEdge R750', category: 'Servers', price: 450000, basePrice: 450000, stock: 12, minStock: 5, unit: 'Unit', hsn: '8471', gst: 18, status: 'active' },
  { id: '2', sku: 'NET-042', name: 'Cisco Catalyst 9300 48-Port', category: 'Networking', price: 185000, basePrice: 185000, stock: 8, minStock: 3, unit: 'Unit', hsn: '8517', gst: 18, status: 'active' },
  { id: '3', sku: 'STR-015', name: 'NetApp AFF A250', category: 'Storage', price: 1250000, basePrice: 1250000, stock: 3, minStock: 2, unit: 'Unit', hsn: '8471', gst: 18, status: 'active' },
  { id: '4', sku: 'SEC-008', name: 'Fortinet FortiGate 100F', category: 'Security', price: 95000, basePrice: 95000, stock: 15, minStock: 5, unit: 'Unit', hsn: '8517', gst: 18, status: 'active' },
  { id: '5', sku: 'CAB-001', name: 'CAT6A Ethernet Cable 305m', category: 'Cables', price: 8500, basePrice: 8500, stock: 2, minStock: 10, unit: 'Box', hsn: '8544', gst: 18, status: 'low_stock' },
  { id: '6', sku: 'UPS-003', name: 'APC Smart-UPS 3000VA', category: 'Power', price: 125000, basePrice: 125000, stock: 6, minStock: 3, unit: 'Unit', hsn: '8504', gst: 18, status: 'active' },
];

const initialClients: Client[] = [
  { id: '1', name: 'Alpha Manufacturing Co.', type: 'company', email: 'procurement@alphamfg.in', phone: '+91 98765 43210', gst: '27AABCA1234A1ZA', address: 'Plot 42, MIDC', city: 'Pune', state: 'Maharashtra', tier: 'gold', totalOrders: 48, totalValue: 12500000, createdAt: '2023-06-15', lastOrderAt: '2026-02-28' },
  { id: '2', name: 'Global Logistics Ltd.', type: 'company', email: 'it@globallogistics.com', phone: '+91 98765 43211', gst: '27AABCG5678B1ZB', address: 'Tower 3, BKC', city: 'Mumbai', state: 'Maharashtra', tier: 'gold', totalOrders: 32, totalValue: 8900000, createdAt: '2023-08-20', lastOrderAt: '2026-03-01' },
  { id: '3', name: 'Precision Instruments Inc.', type: 'company', email: 'purchase@precision.co.in', phone: '+91 98765 43212', gst: '29AABCP9012C1ZC', address: 'Electronic City', city: 'Bangalore', state: 'Karnataka', tier: 'silver', totalOrders: 18, totalValue: 4200000, createdAt: '2024-01-10', lastOrderAt: '2026-02-28' },
  { id: '4', name: 'Southern Steel Works', type: 'company', email: 'admin@southernsteel.in', phone: '+91 98765 43213', gst: '33AABCS3456D1ZD', address: 'Industrial Estate', city: 'Chennai', state: 'Tamil Nadu', tier: 'bronze', totalOrders: 12, totalValue: 1800000, createdAt: '2024-03-05', lastOrderAt: '2026-02-25' },
  { id: '5', name: 'Nexus Tech Solutions', type: 'company', email: 'cto@nexustech.io', phone: '+91 98765 43214', gst: '06AABCN7890E1ZE', address: 'Cyber Hub', city: 'Gurugram', state: 'Haryana', tier: 'new', totalOrders: 5, totalValue: 950000, createdAt: '2025-11-20', lastOrderAt: '2026-02-27' },
];

const initialUsers: User[] = [
  { id: '1', username: 'admin_rahul', name: 'Rahul Sharma', email: 'rahul@quotebot.in', role: 'admin', department: 'Management', status: 'online', lastLogin: '2026-03-01 09:15' },
  { id: '2', username: 'priya_sales', name: 'Priya Patel', email: 'priya@quotebot.in', role: 'manager', department: 'Sales', status: 'online', lastLogin: '2026-03-01 08:45' },
  { id: '3', username: 'amit_exec', name: 'Amit Kumar', email: 'amit@quotebot.in', role: 'sales', department: 'Sales', status: 'offline', lastLogin: '2026-02-28 17:30' },
  { id: '4', username: 'sneha_ops', name: 'Sneha Reddy', email: 'sneha@quotebot.in', role: 'manager', department: 'Operations', status: 'online', lastLogin: '2026-03-01 07:00' },
  { id: '5', username: 'vikram_fin', name: 'Vikram Singh', email: 'vikram@quotebot.in', role: 'viewer', department: 'Finance', status: 'offline', lastLogin: '2026-02-15 14:20' },
];

const initialInboxMessages: InboxMessage[] = [
  { id: '1', channel: 'email', sender: 'Alpha Manufacturing Co.', from: 'procurement@alphamfg.in', subject: 'RFQ for Server Equipment', preview: 'Please send quote for 5x Dell R750 servers...', content: 'Dear Team,\n\nPlease send quote for the following:\n1. 5x Dell PowerEdge R750 servers\n2. 2x Cisco 48-port switches\n3. Installation and setup\n\nRequired by end of month.', timestamp: '10 mins ago', status: 'new', isRead: false, confidence: 95, extractedItems: 7 },
  { id: '2', channel: 'whatsapp', sender: 'Global Logistics Ltd.', from: '+91 98765 43211', subject: 'Urgent UPS Quote', preview: 'Need urgent quote for UPS units', content: 'Hi, need urgent quote for 10x APC UPS 3000VA. Delivery to Mumbai warehouse.', timestamp: '25 mins ago', status: 'parsed', isRead: false, confidence: 92, extractedItems: 1 },
  { id: '3', channel: 'email', sender: 'Nexus Tech Solutions', from: 'cto@nexustech.io', subject: 'Re: Network Infrastructure Quote', preview: 'Following up on our discussion...', content: 'Hi,\n\nFollowing up on our discussion yesterday. Please include:\n- FortiGate firewall\n- Managed switches\n- CAT6A cabling', timestamp: '1 hour ago', status: 'needs_review', isRead: true, confidence: 72, extractedItems: 3 },
  { id: '4', channel: 'email', sender: 'Precision Instruments', from: 'purchase@precision.co.in', subject: 'Storage expansion inquiry', preview: 'We need to expand our storage capacity...', content: 'Team,\n\nOur storage is running low. Please quote for NetApp expansion options.', timestamp: '2 hours ago', status: 'parsed', isRead: true, confidence: 85, extractedItems: 1 },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rfqs, setRFQs] = useState<RFQ[]>(initialRFQs);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>(initialInboxMessages);
  
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: () => {} });

  // Generate unique IDs
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  // RFQ actions
  const addRFQ = (rfq: Omit<RFQ, 'id'>) => {
    setRFQs(prev => [{ ...rfq, id: generateId() }, ...prev]);
    showToast('RFQ created successfully');
  };
  const updateRFQ = (id: string, data: Partial<RFQ>) => {
    setRFQs(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    showToast('RFQ updated successfully');
  };
  const deleteRFQ = (id: string) => {
    setRFQs(prev => prev.filter(r => r.id !== id));
    showToast('RFQ deleted');
  };

  // Quote actions
  const addQuote = (quote: Omit<Quote, 'id'>) => {
    setQuotes(prev => [{ ...quote, id: generateId() }, ...prev]);
    showToast('Quotation created successfully');
  };
  const updateQuote = (id: string, data: Partial<Quote>) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...data } : q));
    showToast('Quotation updated successfully');
  };
  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    showToast('Quotation deleted');
  };

  // Product actions
  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts(prev => [{ ...product, id: generateId() }, ...prev]);
    showToast('Product added successfully');
  };
  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    showToast('Product updated successfully');
  };
  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product deleted');
  };

  // Client actions
  const addClient = (client: Omit<Client, 'id'>) => {
    setClients(prev => [{ ...client, id: generateId() }, ...prev]);
    showToast('Client added successfully');
  };
  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    showToast('Client updated successfully');
  };
  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    showToast('Client deleted');
  };

  // User actions
  const addUser = (user: Omit<User, 'id'>) => {
    setUsers(prev => [{ ...user, id: generateId() }, ...prev]);
    showToast('User added successfully');
  };
  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    showToast('User updated successfully');
  };
  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    showToast('User deleted');
  };

  // Inbox actions
  const updateInboxMessage = (id: string, data: Partial<InboxMessage>) => {
    setInboxMessages(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  // Toast
  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };
  const hideToast = () => setToast(prev => ({ ...prev, show: false }));

  // Confirm modal
  const showConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };
  const hideConfirmModal = () => setConfirmModal(prev => ({ ...prev, show: false }));

  return (
    <AppContext.Provider value={{
      rfqs, quotes, products, clients, users, inboxMessages,
      addRFQ, updateRFQ, deleteRFQ,
      addQuote, updateQuote, deleteQuote,
      addProduct, updateProduct, deleteProduct,
      addClient, updateClient, deleteClient,
      addUser, updateUser, deleteUser,
      updateInboxMessage,
      toast, showToast, hideToast,
      confirmModal, showConfirmModal, hideConfirmModal,
    }}>
      {children}
      
      {/* Global Toast */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 z-[100] animate-slide-up px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' :
          toast.type === 'error' ? 'bg-red-600 text-white' :
          toast.type === 'warning' ? 'bg-amber-500 text-white' :
          'bg-blue-600 text-white'
        }`}>
          <span className="material-symbols-outlined">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'info'}
          </span>
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={hideToast} className="ml-2 hover:bg-white/20 rounded p-0.5">
            <span className="material-symbols-outlined !text-[18px]">close</span>
          </button>
        </div>
      )}
      
      {/* Global Confirm Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={hideConfirmModal}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600">delete</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--erp-text)]">{confirmModal.title}</h3>
              </div>
              <p className="text-sm text-[var(--erp-text-muted)]">{confirmModal.message}</p>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={hideConfirmModal}
                  className="px-4 py-2 text-sm font-medium text-[var(--erp-text-muted)] hover:text-[var(--erp-text)] border border-[var(--erp-border)] rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { confirmModal.onConfirm(); hideConfirmModal(); }}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
