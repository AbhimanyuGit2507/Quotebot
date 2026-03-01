import React, { useState, useMemo } from 'react';
import PageLayout from '../components/common/PageLayout';
import { useApp, Quote, QuoteItem } from '../context/AppContext';

const Quotations: React.FC = () => {
  const { quotes, addQuote, updateQuote, deleteQuote, showConfirmModal, clients, products } = useApp();
  
  const [selectedId, setSelectedId] = useState<string | null>(quotes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  // Filter quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const matchesSearch = q.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           q.client.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchQuery, statusFilter]);

  const selectedQuote = quotes.find(q => q.id === selectedId);

  const handleDelete = (quote: Quote) => {
    showConfirmModal(
      'Delete Quotation',
      `Are you sure you want to delete "${quote.number}"? This action cannot be undone.`,
      () => deleteQuote(quote.id)
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
      sent: 'bg-blue-100 text-blue-700 border-blue-200',
      accepted: 'bg-green-100 text-green-700 border-green-200',
      declined: 'bg-red-100 text-red-700 border-red-200',
      expired: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return styles[status] || styles.draft;
  };

  const calculateTotal = (items: QuoteItem[]) => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <PageLayout>
      {/* Left Panel - Quote List */}
      <aside className="w-96 bg-white border-r border-[var(--erp-border)] flex flex-col shrink-0">
        <div className="p-3 border-b border-[var(--erp-border)] space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--erp-text)] uppercase">Quotations</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-2 py-1 bg-[var(--erp-accent)] text-white text-[11px] font-bold rounded hover:bg-opacity-90"
            >
              <span className="material-symbols-outlined !text-[14px]">add</span>
              NEW QUOTE
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 !text-[16px]">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotes..."
              className="w-full pl-7 pr-2 py-1.5 text-[12px] border border-[var(--erp-border)] rounded focus:ring-1 focus:ring-[var(--erp-accent)]"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-[11px] border border-[var(--erp-border)] rounded px-1.5 py-1"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Stats Bar */}
        <div className="px-3 py-2 bg-slate-50 border-b border-[var(--erp-border)] flex gap-4 text-[11px]">
          <span className="text-slate-600 font-medium">
            {quotes.filter(q => q.status === 'draft').length} Draft
          </span>
          <span className="text-blue-600 font-medium">
            {quotes.filter(q => q.status === 'sent').length} Sent
          </span>
          <span className="text-green-600 font-medium">
            {quotes.filter(q => q.status === 'accepted').length} Accepted
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredQuotes.map(quote => (
            <div 
              key={quote.id}
              onClick={() => setSelectedId(quote.id)}
              className={`px-3 py-3 border-b border-[var(--erp-border)] cursor-pointer transition-colors ${
                selectedId === quote.id ? 'bg-blue-50 border-l-2 border-l-[var(--erp-accent)]' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-[var(--erp-accent)]">{quote.number}</p>
                  <p className="text-[12px] font-medium text-[var(--erp-text)] truncate mt-0.5">{quote.client}</p>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(quote.status)}`}>
                  {quote.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[var(--erp-text-muted)]">
                <span>{quote.items.length} items</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">₹{calculateTotal(quote.items).toLocaleString()}</span>
                  <span>{quote.date}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredQuotes.length === 0 && (
            <div className="p-4 text-center text-sm text-slate-400">
              <span className="material-symbols-outlined text-3xl mb-2">receipt_long</span>
              <p>No quotations found</p>
            </div>
          )}
        </div>
        <div className="p-2 border-t border-[var(--erp-border)] bg-slate-50 text-[11px] text-[var(--erp-text-muted)]">
          Showing {filteredQuotes.length} of {quotes.length} quotes
        </div>
      </aside>

      {/* Main Content - Quote Details */}
      <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        {selectedQuote ? (
          <>
            <div className="h-14 border-b border-[var(--erp-border)] flex items-center justify-between px-5 shrink-0 bg-slate-50">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold text-[var(--erp-accent)]">{selectedQuote.number}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(selectedQuote.status)}`}>
                  {selectedQuote.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 border border-[var(--erp-border)] bg-white rounded text-[12px] font-medium hover:bg-slate-50">
                  <span className="material-symbols-outlined !text-[16px]">print</span> Print
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 border border-[var(--erp-border)] bg-white rounded text-[12px] font-medium hover:bg-slate-50">
                  <span className="material-symbols-outlined !text-[16px]">mail</span> Email
                </button>
                <button 
                  onClick={() => setEditingQuote(selectedQuote)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[var(--erp-accent)] text-white rounded text-[12px] font-medium hover:bg-opacity-90"
                >
                  <span className="material-symbols-outlined !text-[16px]">edit</span> Edit
                </button>
                <button 
                  onClick={() => handleDelete(selectedQuote)}
                  className="flex items-center gap-1 px-2 py-1.5 text-red-600 hover:bg-red-50 rounded"
                >
                  <span className="material-symbols-outlined !text-[18px]">delete</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {/* Quote Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1">Customer Details</h3>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex">
                      <span className="w-28 text-[var(--erp-text-muted)]">Customer:</span>
                      <span className="font-bold text-[var(--erp-accent)]">{selectedQuote.client}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[var(--erp-text-muted)]">Address:</span>
                      <span className="text-[var(--erp-text)]">123 Business Street, City</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[var(--erp-text-muted)]">Contact:</span>
                      <span className="text-[var(--erp-text)]">contact@{selectedQuote.client.toLowerCase().replace(/\s/g, '')}.com</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1">Quote Details</h3>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex">
                      <span className="w-28 text-[var(--erp-text-muted)]">Quote Date:</span>
                      <span className="font-semibold">{selectedQuote.date}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[var(--erp-text-muted)]">Valid Until:</span>
                      <span className="font-semibold text-amber-600">{selectedQuote.validUntil}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[var(--erp-text-muted)]">Currency:</span>
                      <span>INR - Indian Rupee</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="mb-6">
                <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1 mb-3">Line Items</h3>
                <div className="overflow-hidden rounded border border-[var(--erp-border)]">
                  <table className="w-full text-[13px]">
                    <thead className="bg-slate-100 text-[var(--erp-text-muted)] font-bold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-center w-10">#</th>
                        <th className="px-3 py-2 text-left">Item & Description</th>
                        <th className="px-3 py-2 text-right w-20">Qty</th>
                        <th className="px-3 py-2 text-left w-16">Unit</th>
                        <th className="px-3 py-2 text-right w-24">Rate</th>
                        <th className="px-3 py-2 text-right w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedQuote.items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-center text-[var(--erp-text-muted)]">{index + 1}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-[var(--erp-text)]">{item.name}</p>
                            {item.description && <p className="text-[11px] text-[var(--erp-text-muted)]">{item.description}</p>}
                          </td>
                          <td className="px-3 py-2 text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-[var(--erp-text-muted)]">{item.unit}</td>
                          <td className="px-3 py-2 text-right">₹{item.rate.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-medium">₹{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold">
                      <tr className="border-t border-[var(--erp-border)]">
                        <td colSpan={5} className="px-3 py-2 text-right text-[var(--erp-text-muted)]">Subtotal:</td>
                        <td className="px-3 py-2 text-right">₹{calculateTotal(selectedQuote.items).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="px-3 py-2 text-right text-[var(--erp-text-muted)]">Tax (18% GST):</td>
                        <td className="px-3 py-2 text-right">₹{Math.round(calculateTotal(selectedQuote.items) * 0.18).toLocaleString()}</td>
                      </tr>
                      <tr className="text-lg border-t border-[var(--erp-border)]">
                        <td colSpan={5} className="px-3 py-2 text-right text-[var(--erp-accent)]">Grand Total:</td>
                        <td className="px-3 py-2 text-right text-[var(--erp-accent)]">₹{Math.round(calculateTotal(selectedQuote.items) * 1.18).toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Status Actions */}
              <div className="mb-6">
                <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1 mb-3">Update Status</h3>
                <div className="flex gap-2">
                  {['draft', 'sent', 'accepted', 'declined', 'expired'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateQuote(selectedQuote.id, { status: status as Quote['status'] })}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded border transition-colors ${
                        selectedQuote.status === status 
                          ? 'bg-[var(--erp-accent)] text-white border-[var(--erp-accent)]' 
                          : 'border-[var(--erp-border)] hover:bg-slate-50'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedQuote.notes && (
                <div className="mb-6">
                  <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1 mb-3">Notes</h3>
                  <p className="text-[13px] text-[var(--erp-text)]">{selectedQuote.notes}</p>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1 mb-3">Quick Actions</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateQuote(selectedQuote.id, { status: 'sent' })}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[var(--erp-accent)] text-white text-[12px] font-medium rounded hover:bg-opacity-90"
                  >
                    <span className="material-symbols-outlined !text-[16px]">send</span>
                    Send Quote
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-[var(--erp-border)] text-[12px] font-medium rounded hover:bg-slate-50">
                    <span className="material-symbols-outlined !text-[16px]">content_copy</span>
                    Duplicate
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-[var(--erp-border)] text-[12px] font-medium rounded hover:bg-slate-50">
                    <span className="material-symbols-outlined !text-[16px]">download</span>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl mb-3">receipt_long</span>
              <p className="text-sm">Select a quotation to view details</p>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {(showAddModal || editingQuote) && (
        <QuoteModal
          quote={editingQuote}
          clients={clients}
          products={products}
          onClose={() => { setShowAddModal(false); setEditingQuote(null); }}
          onSave={(data) => {
            if (editingQuote) {
              updateQuote(editingQuote.id, data);
            } else {
              const newNumber = `QT/25-26/${(3000 + quotes.length + 1).toString()}`;
              addQuote({ ...data, number: newNumber, date: new Date().toISOString().split('T')[0] } as Omit<Quote, 'id'>);
            }
            setShowAddModal(false);
            setEditingQuote(null);
          }}
        />
      )}
    </PageLayout>
  );
};

// Quote Modal Component
interface QuoteModalProps {
  quote: Quote | null;
  clients: { id: string; name: string }[];
  products: { id: string; name: string; basePrice: number; unit: string }[];
  onClose: () => void;
  onSave: (data: Partial<Quote>) => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ quote, clients, products, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    client: quote?.client || '',
    clientId: quote?.clientId || '',
    status: quote?.status || 'draft',
    validUntil: quote?.validUntil || '',
    notes: quote?.notes || '',
  });

  const [items, setItems] = useState<QuoteItem[]>(quote?.items || [{
    id: '1', name: '', description: '', quantity: 1, unit: 'Pcs', rate: 0, total: 0
  }]);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', description: '', quantity: 1, unit: 'Pcs', rate: 0, total: 0 }]);
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === 'quantity' || field === 'rate') {
      updated[index].total = updated[index].quantity * updated[index].rate;
    }
    setItems(updated);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (!formData.client || items.length === 0) return;
    onSave({
      ...formData,
      items,
    } as Partial<Quote>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--erp-border)] bg-slate-50">
          <h3 className="text-lg font-bold text-[var(--erp-text)]">{quote ? 'Edit Quotation' : 'Create New Quotation'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Client *</label>
              <select
                value={formData.clientId}
                onChange={(e) => {
                  const client = clients.find(c => c.id === e.target.value);
                  setFormData({ ...formData, clientId: e.target.value, client: client?.name || '' });
                }}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2 bg-white"
              >
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-medium text-[var(--erp-text-muted)]">Line Items *</label>
              <button onClick={addItem} className="text-[11px] text-[var(--erp-accent)] font-medium hover:underline">+ Add Item</button>
            </div>
            <div className="border border-[var(--erp-border)] rounded overflow-hidden">
              <table className="w-full text-[12px]">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Product</th>
                    <th className="px-2 py-1.5 text-center w-16">Qty</th>
                    <th className="px-2 py-1.5 text-left w-16">Unit</th>
                    <th className="px-2 py-1.5 text-right w-24">Rate</th>
                    <th className="px-2 py-1.5 text-right w-24">Total</th>
                    <th className="px-2 py-1.5 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-2 py-1.5">
                        <select
                          value={item.name}
                          onChange={(e) => {
                            const product = products.find(p => p.name === e.target.value);
                            if (product) {
                              updateItem(index, 'name', product.name);
                              updateItem(index, 'rate', product.basePrice);
                              updateItem(index, 'unit', product.unit);
                            }
                          }}
                          className="w-full text-[12px] border border-[var(--erp-border)] rounded px-2 py-1"
                        >
                          <option value="">Select...</option>
                          {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full text-center text-[12px] border border-[var(--erp-border)] rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-[var(--erp-text-muted)]">{item.unit}</td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full text-right text-[12px] border border-[var(--erp-border)] rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-right font-medium">₹{item.total.toLocaleString()}</td>
                      <td className="px-2 py-1.5">
                        <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600">
                          <span className="material-symbols-outlined !text-[16px]">close</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-right text-[13px] font-bold text-[var(--erp-accent)]">
              Total: ₹{items.reduce((sum, i) => sum + i.total, 0).toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2 h-20 resize-none"
              placeholder="Terms, conditions, delivery notes..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-[var(--erp-border)] bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--erp-text-muted)] hover:text-[var(--erp-text)]">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-5 py-2 text-sm font-bold text-white bg-[var(--erp-accent)] rounded hover:bg-opacity-90">
            {quote ? 'Update Quote' : 'Create Quote'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quotations;
