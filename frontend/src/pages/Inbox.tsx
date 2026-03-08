import React, { useState, useMemo } from 'react';
import PageLayout from '../components/common/PageLayout';
import { useApp, InboxMessage } from '../context/AppContext';
import { exportToCSV, prepareInboxMessagesForExport, getDateStamp } from '../utils/exportUtils';

const Inbox: React.FC = () => {
  const { inboxMessages, updateInboxMessage, addRFQ, showToast, showConfirmModal } = useApp();
  
  const [selectedId, setSelectedId] = useState<string | null>(inboxMessages[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'raw' | 'parsed' | 'attachments'>('raw');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter messages
  const filteredMessages = useMemo(() => {
    return inboxMessages.filter(msg => {
      const matchesSearch = msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChannel = channelFilter === 'all' || msg.channel === channelFilter;
      const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [inboxMessages, searchQuery, channelFilter, statusFilter]);

  const selectedMessage = inboxMessages.find(m => m.id === selectedId);

  const handleMarkAsRead = (msg: InboxMessage) => {
    if (!msg.isRead) {
      updateInboxMessage(msg.id, { isRead: true });
    }
  };

  const handleSelectMessage = (msg: InboxMessage) => {
    setSelectedId(msg.id);
    handleMarkAsRead(msg);
  };

  const handleConvertToRFQ = (msg: InboxMessage) => {
    const newRfqNumber = `RFQ/25-26/${(2048 + Math.floor(Math.random() * 100)).toString()}`;
    addRFQ({
      number: newRfqNumber,
      client: msg.sender,
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      items: msg.extractedItems,
      value: '₹0',
      status: 'pending',
      channel: msg.channel,
      priority: 'medium',
    });
    updateInboxMessage(msg.id, { status: 'parsed' });
    showToast(`Created ${newRfqNumber} from message`, 'success');
  };

  const handleArchive = (msg: InboxMessage) => {
    showConfirmModal(
      'Archive Message',
      `Are you sure you want to archive this message from ${msg.sender}?`,
      () => {
        updateInboxMessage(msg.id, { status: 'duplicate' });
        showToast('Message archived', 'success');
      }
    );
  };

  const handleMarkNeedsReview = (msg: InboxMessage) => {
    updateInboxMessage(msg.id, { status: 'needs_review' });
    showToast('Marked for review', 'warning');
  };

  const getStatusBadge = (status: InboxMessage['status']) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700 border-blue-200',
      parsed: 'bg-green-100 text-green-700 border-green-200',
      needs_review: 'bg-amber-100 text-amber-700 border-amber-200',
      duplicate: 'bg-slate-100 text-slate-600 border-slate-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
    };
    const labels: Record<string, string> = {
      new: 'NEW',
      parsed: 'PARSED',
      needs_review: 'REVIEW',
      duplicate: 'ARCHIVED',
      failed: 'FAILED',
    };
    return <span className={`text-[10px] font-bold px-1.5 py-0.5 border rounded ${styles[status]}`}>{labels[status]}</span>;
  };

  const getChannelIcon = (channel: string) => {
    return channel === 'email' ? 'mail' : 'chat';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const handleExportMessages = () => {
    const data = prepareInboxMessagesForExport(filteredMessages);
    exportToCSV(data, `inbox_messages_${getDateStamp()}.csv`);
  };

  const unreadCount = inboxMessages.filter(m => !m.isRead).length;

  return (
    <PageLayout>
      {/* Left Panel - Message List */}
      <aside className="w-96 border-r border-[var(--erp-border)] flex flex-col bg-white shrink-0">
        <div className="h-12 border-b border-[var(--erp-border)] bg-slate-50 flex items-center justify-between px-3 shrink-0">
          <h2 className="text-sm font-bold text-[var(--erp-text)] uppercase tracking-wider">Inbox</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportMessages}
              className="p-1 hover:bg-slate-200 rounded"
              title="Export to CSV"
              data-action="export-csv"
            >
              <span className="material-symbols-outlined !text-[16px] text-[var(--erp-text-muted)]">download</span>
            </button>
            <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
              {unreadCount} new
            </span>
          </div>
        </div>
        
        {/* Filters */}
        <div className="p-2 border-b border-[var(--erp-border)] space-y-2 shrink-0">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 !text-[16px]">search</span>
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full text-sm border border-[var(--erp-border)] rounded pl-7 pr-2 py-1.5 focus:ring-1 focus:ring-[var(--erp-accent)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-search="inbox"
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="flex-1 text-[11px] border border-[var(--erp-border)] rounded px-2 py-1 bg-white"
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <select 
              className="flex-1 text-[11px] border border-[var(--erp-border)] rounded px-2 py-1 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="parsed">Parsed</option>
              <option value="needs_review">Needs Review</option>
              <option value="duplicate">Archived</option>
            </select>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-3 py-2 bg-slate-50 border-b border-[var(--erp-border)] flex gap-4 text-[11px]">
          <span className="text-blue-600 font-medium">
            {inboxMessages.filter(m => m.status === 'new').length} New
          </span>
          <span className="text-amber-600 font-medium">
            {inboxMessages.filter(m => m.status === 'needs_review').length} Review
          </span>
          <span className="text-green-600 font-medium">
            {inboxMessages.filter(m => m.status === 'parsed').length} Parsed
          </span>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map(msg => (
            <div 
              key={msg.id}
              onClick={() => handleSelectMessage(msg)}
              className={`p-3 border-b border-[var(--erp-border)] cursor-pointer transition-colors ${
                selectedId === msg.id ? 'bg-blue-50 border-l-[3px] border-l-[var(--erp-accent)]' : 'hover:bg-slate-50'
              } ${!msg.isRead ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex items-start gap-2">
                <span className={`material-symbols-outlined !text-[18px] mt-0.5 ${msg.channel === 'whatsapp' ? 'text-green-500' : 'text-blue-500'}`}>
                  {getChannelIcon(msg.channel)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-[12px] font-semibold truncate ${!msg.isRead ? 'text-[var(--erp-text)]' : 'text-[var(--erp-text-muted)]'}`}>
                      {msg.sender}
                    </span>
                    <span className="text-[10px] text-[var(--erp-text-muted)] shrink-0">{msg.timestamp}</span>
                  </div>
                  <p className={`text-[12px] truncate mb-1 ${!msg.isRead ? 'font-medium' : ''}`}>{msg.subject}</p>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(msg.status)}
                    {msg.extractedItems > 0 && (
                      <span className="text-[10px] text-[var(--erp-text-muted)]">{msg.extractedItems} items</span>
                    )}
                    {msg.confidence > 0 && (
                      <span className={`text-[10px] font-medium ${getConfidenceColor(msg.confidence)}`}>
                        {msg.confidence}% conf.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredMessages.length === 0 && (
            <div className="p-4 text-center text-sm text-slate-400">
              <span className="material-symbols-outlined text-3xl mb-2">inbox</span>
              <p>No messages found</p>
            </div>
          )}
        </div>
        <div className="p-2 border-t border-[var(--erp-border)] bg-slate-50 text-[11px] text-[var(--erp-text-muted)]">
          Showing {filteredMessages.length} of {inboxMessages.length} messages
        </div>
      </aside>

      {/* Main Content - Message Detail */}
      <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        {selectedMessage ? (
          <>
            {/* Message Header */}
            <div className="h-14 border-b border-[var(--erp-border)] flex items-center justify-between px-5 shrink-0 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined !text-[24px] ${selectedMessage.channel === 'whatsapp' ? 'text-green-500' : 'text-blue-500'}`}>
                  {getChannelIcon(selectedMessage.channel)}
                </span>
                <div>
                  <h1 className="text-base font-bold text-[var(--erp-text)]">{selectedMessage.sender}</h1>
                  <p className="text-[12px] text-[var(--erp-text-muted)]">{selectedMessage.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedMessage.status === 'new' && (
                  <button 
                    onClick={() => handleConvertToRFQ(selectedMessage)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--erp-accent)] text-white rounded text-[12px] font-medium hover:bg-opacity-90"
                  >
                    <span className="material-symbols-outlined !text-[16px]">add</span> Create RFQ
                  </button>
                )}
                <button 
                  onClick={() => handleMarkNeedsReview(selectedMessage)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-amber-300 bg-amber-50 text-amber-700 rounded text-[12px] font-medium hover:bg-amber-100"
                >
                  <span className="material-symbols-outlined !text-[16px]">flag</span> Mark Review
                </button>
                <button 
                  onClick={() => handleArchive(selectedMessage)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-[var(--erp-border)] bg-white rounded text-[12px] font-medium hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined !text-[16px]">archive</span> Archive
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-[var(--erp-border)] flex shrink-0">
              {[
                { id: 'raw', label: 'Raw Message', icon: 'article' },
                { id: 'parsed', label: 'Extracted Data', icon: 'data_object' },
                { id: 'attachments', label: 'Attachments', icon: 'attach_file' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[var(--erp-accent)] text-[var(--erp-accent)] bg-blue-50/50'
                      : 'border-transparent text-[var(--erp-text-muted)] hover:text-[var(--erp-text)]'
                  }`}
                >
                  <span className="material-symbols-outlined !text-[16px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'raw' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 p-3 rounded border border-[var(--erp-border)]">
                      <p className="text-[11px] text-[var(--erp-text-muted)] mb-1">From</p>
                      <p className="text-sm font-medium">{selectedMessage.sender}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border border-[var(--erp-border)]">
                      <p className="text-[11px] text-[var(--erp-text-muted)] mb-1">Received</p>
                      <p className="text-sm font-medium">{selectedMessage.timestamp}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest mb-2">Subject</h3>
                    <p className="text-sm font-medium text-[var(--erp-text)]">{selectedMessage.subject}</p>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest mb-2">Message Body</h3>
                    <div className="bg-slate-50 p-4 rounded border border-[var(--erp-border)] text-sm text-[var(--erp-text)] whitespace-pre-wrap">
                      {selectedMessage.preview}
                      {'\n\n'}
                      Please provide your best quotation including:
                      {'\n'}- Unit prices
                      {'\n'}- Delivery timeline
                      {'\n'}- Payment terms
                      {'\n'}- Warranty information
                      {'\n\n'}
                      Looking forward to your response.
                      {'\n\n'}
                      Best regards,
                      {'\n'}{selectedMessage.sender}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'parsed' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${getConfidenceColor(selectedMessage.confidence)}`}>
                        {selectedMessage.confidence}%
                      </span>
                      <span className="text-[12px] text-[var(--erp-text-muted)]">AI Confidence Score</span>
                    </div>
                    {getStatusBadge(selectedMessage.status)}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest mb-2">Extracted Items ({selectedMessage.extractedItems})</h3>
                    {selectedMessage.extractedItems > 0 ? (
                      <div className="border border-[var(--erp-border)] rounded overflow-hidden">
                        <table className="w-full text-[12px]">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-3 py-2 text-left">#</th>
                              <th className="px-3 py-2 text-left">Item Description</th>
                              <th className="px-3 py-2 text-center">Qty</th>
                              <th className="px-3 py-2 text-center">Unit</th>
                              <th className="px-3 py-2 text-center">Confidence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {Array.from({ length: Math.min(selectedMessage.extractedItems, 5) }, (_, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-3 py-2 text-[var(--erp-text-muted)]">{i + 1}</td>
                                <td className="px-3 py-2 font-medium">Sample Product {i + 1}</td>
                                <td className="px-3 py-2 text-center">{(i + 1) * 5}</td>
                                <td className="px-3 py-2 text-center">Pcs</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`font-medium ${getConfidenceColor(95 - i * 5)}`}>
                                    {95 - i * 5}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-400 bg-slate-50 rounded border border-[var(--erp-border)]">
                        <span className="material-symbols-outlined text-2xl mb-2">search_off</span>
                        <p>No items could be extracted</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleConvertToRFQ(selectedMessage)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[var(--erp-accent)] text-white text-[12px] font-medium rounded hover:bg-opacity-90"
                    >
                      <span className="material-symbols-outlined !text-[16px]">add</span>
                      Create RFQ from Extracted Data
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 border border-[var(--erp-border)] text-[12px] font-medium rounded hover:bg-slate-50">
                      <span className="material-symbols-outlined !text-[16px]">edit</span>
                      Edit Extracted Data
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest mb-2">Attachments</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'RFQ_Requirements.pdf', size: '245 KB', icon: 'picture_as_pdf', color: 'text-red-500' },
                      { name: 'Product_List.xlsx', size: '128 KB', icon: 'table_chart', color: 'text-green-600' },
                    ].map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border border-[var(--erp-border)] rounded hover:bg-slate-50 cursor-pointer">
                        <span className={`material-symbols-outlined !text-[24px] ${file.color}`}>{file.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-[11px] text-[var(--erp-text-muted)]">{file.size}</p>
                        </div>
                        <button className="text-[var(--erp-accent)] hover:bg-blue-50 p-1 rounded">
                          <span className="material-symbols-outlined !text-[18px]">download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl mb-3">inbox</span>
              <p className="text-sm">Select a message to view details</p>
            </div>
          </div>
        )}
      </main>
    </PageLayout>
  );
};

export default Inbox;
