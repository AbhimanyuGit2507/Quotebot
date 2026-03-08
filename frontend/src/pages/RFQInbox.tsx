import React, { useState, useMemo } from 'react';
import PageLayout from '../components/common/PageLayout';
import { useApp, RFQ } from '../context/AppContext';
import { exportToCSV, prepareRFQsForExport, getDateStamp } from '../utils/exportUtils';

const RFQInbox: React.FC = () => {
  const { rfqs, addRFQ, updateRFQ, deleteRFQ, showConfirmModal, clients } = useApp();
  
  const [selectedId, setSelectedId] = useState<string | null>(rfqs[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRFQ, setEditingRFQ] = useState<RFQ | null>(null);

  // Filter RFQs
  const filteredRFQs = useMemo(() => {
    return rfqs.filter(r => {
      const matchesSearch = r.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           r.client.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesChannel = channelFilter === 'all' || r.channel === channelFilter;
      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [rfqs, searchQuery, statusFilter, channelFilter]);

  const selectedRFQ = rfqs.find(r => r.id === selectedId);

  const handleDelete = (rfq: RFQ) => {
    showConfirmModal(
      'Delete RFQ',
      `Are you sure you want to delete "${rfq.number}"? This action cannot be undone.`,
      () => deleteRFQ(rfq.id)
    );
  };

  const handleConvertToQuote = (rfq: RFQ) => {
    updateRFQ(rfq.id, { status: 'converted' });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      draft: 'bg-blue-100 text-blue-700 border-blue-200',
      quoted: 'bg-green-100 text-green-700 border-green-200',
      expired: 'bg-red-100 text-red-700 border-red-200',
      converted: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return styles[status] || styles.pending;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return 'mail';
      case 'whatsapp': return 'chat';
      default: return 'edit_note';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-slate-400';
    }
  };

  const handleExportRFQs = () => {
    const data = prepareRFQsForExport(filteredRFQs);
    exportToCSV(data, `rfqs_${getDateStamp()}.csv`);
  };

  return (
    <PageLayout>
      {/* Left Panel - RFQ List */}
      <aside className="w-96 bg-white border-r border-[var(--erp-border)] flex flex-col shrink-0">
        <div className="p-3 border-b border-[var(--erp-border)] space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--erp-text)] uppercase">RFQ Management</h2>
            <div className="flex gap-1">
              <button 
                onClick={handleExportRFQs}
                className="px-2 py-1 border border-[var(--erp-border)] bg-white text-[11px] font-medium rounded hover:bg-slate-50"
                title="Export to CSV"
                data-action="export-csv"
              >
                <span className="material-symbols-outlined !text-[14px]">download</span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 px-2 py-1 bg-[var(--erp-accent)] text-white text-[11px] font-bold rounded hover:bg-opacity-90"
                data-action="new-rfq"
              >
                <span className="material-symbols-outlined !text-[14px]">add</span>
                NEW RFQ
              </button>
            </div>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 !text-[16px]">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search RFQs..."
              className="w-full pl-7 pr-2 py-1.5 text-[12px] border border-[var(--erp-border)] rounded focus:ring-1 focus:ring-[var(--erp-accent)]"
              data-search="rfqs"
            />
          </div>
          <div className="flex gap-1">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 text-[11px] border border-[var(--erp-border)] rounded px-1.5 py-1"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="quoted">Quoted</option>
              <option value="expired">Expired</option>
              <option value="converted">Converted</option>
            </select>
            <select 
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="flex-1 text-[11px] border border-[var(--erp-border)] rounded px-1.5 py-1"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-3 py-2 bg-slate-50 border-b border-[var(--erp-border)] flex gap-4 text-[11px]">
          <span className="text-yellow-600 font-medium">
            {rfqs.filter(r => r.status === 'pending').length} Pending
          </span>
          <span className="text-blue-600 font-medium">
            {rfqs.filter(r => r.status === 'draft').length} Draft
          </span>
          <span className="text-green-600 font-medium">
            {rfqs.filter(r => r.status === 'quoted').length} Quoted
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredRFQs.map(rfq => (
            <div 
              key={rfq.id}
              onClick={() => setSelectedId(rfq.id)}
              className={`px-3 py-3 border-b border-[var(--erp-border)] cursor-pointer transition-colors ${
                selectedId === rfq.id ? 'bg-blue-50 border-l-2 border-l-[var(--erp-accent)]' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined !text-[14px] ${getPriorityColor(rfq.priority)}`}>
                      {rfq.priority === 'high' ? 'priority_high' : rfq.priority === 'medium' ? 'remove' : 'arrow_downward'}
                    </span>
                    <p className="text-[12px] font-bold text-[var(--erp-accent)]">{rfq.number}</p>
                  </div>
                  <p className="text-[12px] font-medium text-[var(--erp-text)] truncate mt-0.5">{rfq.client}</p>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(rfq.status)}`}>
                  {rfq.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[var(--erp-text-muted)]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined !text-[14px]">{getChannelIcon(rfq.channel)}</span>
                  <span>{rfq.items} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{rfq.value}</span>
                  <span>{rfq.date}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredRFQs.length === 0 && (
            <div className="p-4 text-center text-sm text-slate-400">
              <span className="material-symbols-outlined text-3xl mb-2">assignment</span>
              <p>No RFQs found</p>
            </div>
          )}
        </div>
        <div className="p-2 border-t border-[var(--erp-border)] bg-slate-50 text-[11px] text-[var(--erp-text-muted)]">
          Showing {filteredRFQs.length} of {rfqs.length} RFQs
        </div>
      </aside>

      {/* Main Content - RFQ Details */}
      <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        {selectedRFQ ? (
          <>
            <div className="h-14 border-b border-[var(--erp-border)] flex items-center justify-between px-5 shrink-0 bg-slate-50">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold text-[var(--erp-accent)]">{selectedRFQ.number}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(selectedRFQ.status)}`}>
                  {selectedRFQ.status.toUpperCase()}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getPriorityColor(selectedRFQ.priority)} bg-opacity-10`}>
                  {selectedRFQ.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedRFQ.status === 'pending' && (
                  <button 
                    onClick={() => handleConvertToQuote(selectedRFQ)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--erp-accent)] text-white rounded text-[12px] font-medium hover:bg-opacity-90"
                  >
                    <span className="material-symbols-outlined !text-[16px]">add</span> Create Quote
                  </button>
                )}
                <button 
                  onClick={() => setEditingRFQ(selectedRFQ)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-[var(--erp-border)] bg-white rounded text-[12px] font-medium hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined !text-[16px]">edit</span> Edit
                </button>
                <button 
                  onClick={() => handleDelete(selectedRFQ)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-red-200 bg-white rounded text-[12px] font-medium text-red-600 hover:bg-red-50"
                >
                  <span className="material-symbols-outlined !text-[16px]">delete</span> Delete
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {/* RFQ Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded border border-[var(--erp-border)]">
                  <p className="text-[11px] text-[var(--erp-text-muted)] mb-1">Client</p>
                  <p className="text-sm font-bold text-[var(--erp-text)]">{selectedRFQ.client}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-[var(--erp-border)]">
                  <p className="text-[11px] text-[var(--erp-text-muted)] mb-1">Date Received</p>
                  <p className="text-sm font-bold text-[var(--erp-text)]">{selectedRFQ.date}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-[var(--erp-border)]">
                  <p className="text-[11px] text-[var(--erp-text-muted)] mb-1">Items</p>
                  <p className="text-sm font-bold text-[var(--erp-text)]">{selectedRFQ.items} line items</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                  <p className="text-[11px] text-emerald-700 mb-1">Estimated Value</p>
                  <p className="text-sm font-bold text-emerald-700">{selectedRFQ.value}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1">RFQ Details</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'RFQ Number', value: selectedRFQ.number, accent: true },
                      { label: 'Client', value: selectedRFQ.client },
                      { label: 'Channel', value: selectedRFQ.channel.charAt(0).toUpperCase() + selectedRFQ.channel.slice(1) },
                      { label: 'Priority', value: selectedRFQ.priority.charAt(0).toUpperCase() + selectedRFQ.priority.slice(1) },
                      { label: 'Due Date', value: selectedRFQ.dueDate || 'Not specified' },
                    ].map(item => (
                      <div key={item.label} className="flex text-[13px]">
                        <span className="w-28 text-[var(--erp-text-muted)]">{item.label}:</span>
                        <span className={`font-medium ${item.accent ? 'text-[var(--erp-accent)]' : 'text-[var(--erp-text)]'}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1">Notes</h3>
                  <p className="text-[13px] text-[var(--erp-text)]">
                    {selectedRFQ.notes || 'No notes added for this RFQ.'}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="mb-6">
                <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1 mb-3">Update Status</h3>
                <div className="flex gap-2">
                  {['pending', 'draft', 'quoted', 'expired'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateRFQ(selectedRFQ.id, { status: status as RFQ['status'] })}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded border transition-colors ${
                        selectedRFQ.status === status 
                          ? 'bg-[var(--erp-accent)] text-white border-[var(--erp-accent)]' 
                          : 'border-[var(--erp-border)] hover:bg-slate-50'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1 mb-3">Quick Actions</h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-[var(--erp-accent)] text-white text-[12px] font-medium rounded hover:bg-opacity-90">
                    <span className="material-symbols-outlined !text-[16px]">receipt_long</span>
                    Generate Quote
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-[var(--erp-border)] text-[12px] font-medium rounded hover:bg-slate-50">
                    <span className="material-symbols-outlined !text-[16px]">reply</span>
                    Reply to Client
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-[var(--erp-border)] text-[12px] font-medium rounded hover:bg-slate-50">
                    <span className="material-symbols-outlined !text-[16px]">forward_to_inbox</span>
                    Forward
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-[var(--erp-border)] text-[12px] font-medium rounded hover:bg-slate-50">
                    <span className="material-symbols-outlined !text-[16px]">print</span>
                    Print
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl mb-3">assignment</span>
              <p className="text-sm">Select an RFQ to view details</p>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {(showAddModal || editingRFQ) && (
        <RFQModal
          rfq={editingRFQ}
          clients={clients}
          onClose={() => { setShowAddModal(false); setEditingRFQ(null); }}
          onSave={(data) => {
            if (editingRFQ) {
              updateRFQ(editingRFQ.id, data);
            } else {
              const newNumber = `RFQ/25-26/${(2048 + rfqs.length + 1).toString()}`;
              addRFQ({ ...data, number: newNumber, date: new Date().toISOString().split('T')[0] } as Omit<RFQ, 'id'>);
            }
            setShowAddModal(false);
            setEditingRFQ(null);
          }}
        />
      )}
    </PageLayout>
  );
};

// RFQ Modal Component
interface RFQModalProps {
  rfq: RFQ | null;
  clients: { id: string; name: string }[];
  onClose: () => void;
  onSave: (data: Partial<RFQ>) => void;
}

const RFQModal: React.FC<RFQModalProps> = ({ rfq, clients, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    client: rfq?.client || '',
    clientId: rfq?.clientId || '',
    items: rfq?.items?.toString() || '1',
    value: rfq?.value || '',
    status: rfq?.status || 'pending',
    channel: rfq?.channel || 'manual',
    priority: rfq?.priority || 'medium',
    dueDate: rfq?.dueDate || '',
    notes: rfq?.notes || '',
  });

  const handleSubmit = () => {
    if (!formData.client) return;
    onSave({
      ...formData,
      items: parseInt(formData.items),
    } as Partial<RFQ>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--erp-border)] bg-slate-50">
          <h3 className="text-lg font-bold text-[var(--erp-text)]">{rfq ? 'Edit RFQ' : 'Create New RFQ'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Line Items</label>
              <input
                type="number"
                value={formData.items}
                onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2"
                min="1"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Est. Value</label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2"
                placeholder="₹0"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Channel</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value as RFQ['channel'] })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2 bg-white"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as RFQ['priority'] })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RFQ['status'] })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2 bg-white"
              >
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
                <option value="quoted">Quoted</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2 h-20 resize-none"
              placeholder="Additional notes..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-[var(--erp-border)] bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--erp-text-muted)] hover:text-[var(--erp-text)]">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-5 py-2 text-sm font-bold text-white bg-[var(--erp-accent)] rounded hover:bg-opacity-90">
            {rfq ? 'Update RFQ' : 'Create RFQ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RFQInbox;
