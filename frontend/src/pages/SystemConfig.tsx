import React, { useState } from 'react';
import PageLayout from '../components/common/PageLayout';
import { useApp } from '../context/AppContext';

type ConfigTab = 'company' | 'communication' | 'whatsapp' | 'templates' | 'automation' | 'notifications' | 'integrations' | 'billing' | 'security';

interface CompanySettings {
  companyName: string;
  tradingName: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  currency: string;
}

interface EmailProvider {
  name: string;
  icon: string;
  connected: boolean;
  email?: string;
}

interface AutomationRule {
  id: string;
  condition: string;
  action: string;
  active: boolean;
}

interface NotificationSetting {
  id: string;
  label: string;
  checked: boolean;
}

const SystemConfig: React.FC = () => {
  const { showToast, showConfirmModal } = useApp();
  const [activeTab, setActiveTab] = useState<ConfigTab>('company');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Company Settings State
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: 'Quotebot Solutions Pvt Ltd',
    tradingName: '',
    gstin: '27AABCU9603R1ZM',
    pan: 'AABCU9603R',
    address: 'Plot 42, MIDC Industrial Area',
    city: 'Pune',
    state: 'Maharashtra',
    currency: 'INR',
  });

  // Email Providers State
  const [emailProviders, setEmailProviders] = useState<EmailProvider[]>([
    { name: 'Gmail', icon: 'mail', connected: true, email: 'sales@quotebot.in' },
    { name: 'Outlook', icon: 'mail', connected: false },
    { name: 'Custom SMTP/IMAP', icon: 'dns', connected: false },
    { name: 'Quotebot Email', icon: 'verified', connected: false },
  ]);

  const [defaultSendFrom, setDefaultSendFrom] = useState('sales@quotebot.in (Gmail)');

  // WhatsApp Settings
  const [whatsappConnected, setWhatsappConnected] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('+91 98765 43210');
  const [whatsappBusinessName, setWhatsappBusinessName] = useState('Quotebot Solutions');
  const [whatsappCategory, setWhatsappCategory] = useState('IT Services');
  const [whatsappAutoReply, setWhatsappAutoReply] = useState(true);
  const [whatsappAutoReplyMessage, setWhatsappAutoReplyMessage] = useState('Thank you for your message. We have received your RFQ and will respond shortly.');

  // Automation Rules State
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    { id: '1', condition: 'Confidence > 90%', action: 'Auto-send quotation', active: true },
    { id: '2', condition: 'Missing quantity', action: 'Ask clarification', active: true },
    { id: '3', condition: 'New RFQ from VIP client', action: 'Notify sales manager', active: true },
    { id: '4', condition: 'Quote expires in 2 days', action: 'Send reminder', active: false },
  ]);

  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState<NotificationSetting[]>([
    { id: 'new-rfq', label: 'New RFQ received', checked: true },
    { id: 'quote-sent', label: 'Quote sent successfully', checked: true },
    { id: 'quote-viewed', label: 'Quote viewed by client', checked: true },
    { id: 'quote-accepted', label: 'Quote accepted', checked: true },
    { id: 'quote-declined', label: 'Quote declined', checked: true },
    { id: 'processing-failures', label: 'Processing failures', checked: true },
    { id: 'daily-summary', label: 'Daily summary report', checked: false },
    { id: 'weekly-analytics', label: 'Weekly analytics digest', checked: false },
  ]);

  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [require2FA, setRequire2FA] = useState(true);

  // Update company settings
  const updateCompanySetting = (field: keyof CompanySettings, value: string) => {
    setCompanySettings(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Toggle email provider connection
  const toggleEmailProvider = (providerName: string) => {
    setEmailProviders(prev => prev.map(p => 
      p.name === providerName ? { ...p, connected: !p.connected, email: !p.connected ? `${providerName.toLowerCase()}@quotebot.in` : undefined } : p
    ));
    setHasUnsavedChanges(true);
    showToast(`${providerName} ${emailProviders.find(p => p.name === providerName)?.connected ? 'disconnected' : 'connected'}`, 'success');
  };

  // Test email connection
  const testEmailConnection = (provider: EmailProvider) => {
    showToast('Testing connection...', 'info');
    setTimeout(() => showToast(`${provider.name} connection successful!`, 'success'), 1500);
  };

  // Toggle WhatsApp connection
  const toggleWhatsAppConnection = () => {
    if (whatsappConnected) {
      showConfirmModal(
        'Disconnect WhatsApp',
        'Are you sure you want to disconnect WhatsApp? You will no longer receive RFQs via WhatsApp.',
        () => {
          setWhatsappConnected(false);
          setHasUnsavedChanges(true);
          showToast('WhatsApp disconnected', 'success');
        }
      );
    } else {
      setWhatsappConnected(true);
      setHasUnsavedChanges(true);
      showToast('WhatsApp connected', 'success');
    }
  };

  // Toggle automation rule
  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, active: !r.active } : r
    ));
    setHasUnsavedChanges(true);
  };

  // Toggle notification setting
  const toggleNotification = (notificationId: string) => {
    setEmailNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, checked: !n.checked } : n
    ));
    setHasUnsavedChanges(true);
  };

  // Save all settings
  const handleSave = () => {
    showToast('Saving settings...', 'info');
    setTimeout(() => {
      setHasUnsavedChanges(false);
      showToast('Settings saved successfully!', 'success');
    }, 1000);
  };

  // Discard changes
  const handleDiscard = () => {
    if (hasUnsavedChanges) {
      showConfirmModal(
        'Discard Changes',
        'Are you sure you want to discard all unsaved changes?',
        () => {
          setHasUnsavedChanges(false);
          showToast('Changes discarded', 'info');
          // Reset to original values (in a real app, you'd reload from backend)
        }
      );
    }
  };

  // Handle logo upload
  const handleLogoUpload = () => {
    showToast('Logo upload functionality would open file picker here', 'info');
    setHasUnsavedChanges(true);
  };

  // Create new automation rule
  const createAutomationRule = () => {
    showToast('Create automation rule modal would open here', 'info');
  };

  // Handle export
  const handleExport = (format: string) => {
    showToast(`Exporting invoice as ${format}...`, 'info');
    setTimeout(() => showToast('Export complete!', 'success'), 1000);
  };

  const tabs: { id: ConfigTab; label: string; icon: string }[] = [
    { id: 'company', label: 'Company', icon: 'business' },
    { id: 'communication', label: 'Email', icon: 'mail' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'chat' },
    { id: 'templates', label: 'Templates', icon: 'description' },
    { id: 'automation', label: 'Automation', icon: 'smart_toy' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'integrations', label: 'Integrations', icon: 'hub' },
    { id: 'billing', label: 'Billing', icon: 'credit_card' },
    { id: 'security', label: 'Security', icon: 'security' },
  ];

  const renderCompanyContent = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[var(--erp-text)]">Company Profile</h1>
        <p className="text-sm text-[var(--erp-text-muted)]">Configuration for your organization details.</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-[var(--erp-text-muted)] font-medium">Company Name *</label>
            <input 
              className="w-full text-sm border border-[var(--erp-border)] rounded py-2 px-3 focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none" 
              type="text" 
              value={companySettings.companyName}
              onChange={(e) => updateCompanySetting('companyName', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-[var(--erp-text-muted)] font-medium">Trading Name</label>
            <input 
              className="w-full text-sm border border-[var(--erp-border)] rounded py-2 px-3 focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none" 
              type="text" 
              value={companySettings.tradingName}
              onChange={(e) => updateCompanySetting('tradingName', e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Logo Upload</h3>
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50 hover:border-[var(--erp-accent)] transition-colors cursor-pointer" onClick={handleLogoUpload}>
            <span className="material-symbols-outlined text-3xl text-slate-400">image</span>
          </div>
          <div className="space-y-2">
            <button onClick={handleLogoUpload} className="text-sm px-4 py-1.5 bg-[var(--erp-accent)] text-white rounded font-medium hover:bg-opacity-90">Upload Logo</button>
            <p className="text-[11px] text-slate-400">PNG, JPG up to 2MB. Recommended: 400x100px</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">GST & Tax Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-[var(--erp-text-muted)] font-medium">GSTIN</label>
            <input 
              className="w-full text-sm border border-[var(--erp-border)] rounded py-2 px-3 focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none" 
              type="text" 
              value={companySettings.gstin}
              onChange={(e) => updateCompanySetting('gstin', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-[var(--erp-text-muted)] font-medium">PAN Number</label>
            <input 
              className="w-full text-sm border border-[var(--erp-border)] rounded py-2 px-3 focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none" 
              type="text" 
              value={companySettings.pan}
              onChange={(e) => updateCompanySetting('pan', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Address</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1">
            <label className="text-sm text-[var(--erp-text-muted)] font-medium">Street Address</label>
            <input 
              className="w-full text-sm border border-[var(--erp-border)] rounded py-2 px-3 focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none" 
              type="text" 
              value={companySettings.address}
              onChange={(e) => updateCompanySetting('address', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-[var(--erp-text-muted)] font-medium">City</label>
            <input 
              className="w-full text-sm border border-[var(--erp-border)] rounded py-2 px-3 focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none" 
              type="text" 
              value={companySettings.city}
              onChange={(e) => updateCompanySetting('city', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-[var(--erp-text-muted)] font-medium">State</label>
            <select 
              className="w-full text-sm border border-[var(--erp-border)] rounded py-2 px-3 bg-white focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none"
              value={companySettings.state}
              onChange={(e) => updateCompanySetting('state', e.target.value)}
            >
              <option>Maharashtra</option>
              <option>Karnataka</option>
              <option>Tamil Nadu</option>
              <option>Delhi</option>
              <option>Gujarat</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Default Currency</h3>
        <div className="w-64">
          <select 
            className="w-full text-sm border border-[var(--erp-border)] rounded py-2 px-3 bg-white focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none"
            value={companySettings.currency}
            onChange={(e) => updateCompanySetting('currency', e.target.value)}
          >
            <option value="INR">INR (₹) - Indian Rupee</option>
            <option value="USD">USD ($) - US Dollar</option>
            <option value="EUR">EUR (€) - Euro</option>
            <option value="GBP">GBP (£) - British Pound</option>
          </select>
        </div>
      </section>
    </div>
  );

  const renderCommunicationContent = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[var(--erp-text)]">Email Communication</h1>
        <p className="text-sm text-[var(--erp-text-muted)]">Configure email connections and settings.</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Email Providers</h3>
        <div className="grid grid-cols-2 gap-4">
          {emailProviders.map(provider => (
            <div key={provider.name} className={`p-4 border rounded transition-all ${provider.connected ? 'border-green-300 bg-green-50' : 'border-[var(--erp-border)]'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-slate-500">{provider.icon}</span>
                  <span className="font-medium text-[var(--erp-text)]">{provider.name}</span>
                </div>
                {provider.connected ? (
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">CONNECTED</span>
                ) : (
                  <button 
                    onClick={() => toggleEmailProvider(provider.name)}
                    className="text-[12px] px-3 py-1 bg-[var(--erp-accent)] text-white rounded font-medium hover:bg-opacity-90"
                  >
                    Connect
                  </button>
                )}
              </div>
              {provider.connected && (
                <div className="text-[12px] text-green-700">
                  <p>Connected: {provider.email}</p>
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => testEmailConnection(provider)}
                      className="text-[var(--erp-accent)] hover:underline"
                    >
                      Test Connection
                    </button>
                    <span className="text-slate-300">|</span>
                    <button 
                      onClick={() => toggleEmailProvider(provider.name)}
                      className="text-red-600 hover:underline"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Default Send-From</h3>
        <select 
          className="w-64 text-sm border border-[var(--erp-border)] rounded py-2 px-3 bg-white focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none"
          value={defaultSendFrom}
          onChange={(e) => {
            setDefaultSendFrom(e.target.value);
            setHasUnsavedChanges(true);
          }}
        >
          {emailProviders.filter(p => p.connected).map(p => (
            <option key={p.email} value={`${p.email} (${p.name})`}>{p.email} ({p.name})</option>
          ))}
        </select>
      </section>
    </div>
  );

  const renderWhatsAppContent = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[var(--erp-text)]">WhatsApp Configuration</h1>
        <p className="text-sm text-[var(--erp-text-muted)]">Connect and configure WhatsApp Business.</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Connection Status</h3>
        <div className={`p-4 border rounded transition-all ${whatsappConnected ? 'border-green-300 bg-green-50' : 'border-slate-300 bg-slate-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-3xl ${whatsappConnected ? 'text-green-600' : 'text-slate-400'}`}>chat</span>
              <div>
                <p className={`font-bold ${whatsappConnected ? 'text-green-700' : 'text-slate-500'}`}>
                  {whatsappConnected ? 'WhatsApp Connected' : 'WhatsApp Disconnected'}
                </p>
                {whatsappConnected && <p className="text-sm text-green-600">{whatsappNumber}</p>}
              </div>
            </div>
            <button 
              onClick={toggleWhatsAppConnection}
              className={`text-sm px-4 py-1.5 border rounded hover:bg-opacity-90 ${whatsappConnected ? 'border-red-300 text-red-600 bg-white hover:bg-red-50' : 'border-[var(--erp-accent)] bg-[var(--erp-accent)] text-white'}`}
            >
              {whatsappConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
      </section>

      {whatsappConnected && (
        <>
          <section className="space-y-4">
            <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Business Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-[var(--erp-text-muted)] font-medium">Business Name</label>
                <input 
                  className="w-full text-sm border border-[var(--erp-border)] rounded py-2 px-3 focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none" 
                  value={whatsappBusinessName}
                  onChange={(e) => {
                    setWhatsappBusinessName(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[var(--erp-text-muted)] font-medium">Business Category</label>
                <select 
                  className="w-full text-sm border border-[var(--erp-border)] rounded py-2 px-3 bg-white focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none"
                  value={whatsappCategory}
                  onChange={(e) => {
                    setWhatsappCategory(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                >
                  <option>IT Services</option>
                  <option>Retail</option>
                  <option>Manufacturing</option>
                  <option>Trading</option>
                  <option>Consulting</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Auto Reply Settings</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={whatsappAutoReply}
                onChange={(e) => {
                  setWhatsappAutoReply(e.target.checked);
                  setHasUnsavedChanges(true);
                }}
                className="rounded border-[var(--erp-border)] text-[var(--erp-accent)] focus:ring-[var(--erp-accent)]"
              />
              <span className="text-sm text-[var(--erp-text)]">Enable auto-reply for new messages</span>
            </label>
            {whatsappAutoReply && (
              <div className="space-y-1">
                <label className="text-sm text-[var(--erp-text-muted)] font-medium">Auto-Reply Message</label>
                <textarea 
                  className="w-full text-sm border border-[var(--erp-border)] rounded py-2 px-3 h-20 focus:ring-2 focus:ring-[var(--erp-accent)]/20 focus:border-[var(--erp-accent)] outline-none" 
                  value={whatsappAutoReplyMessage}
                  onChange={(e) => {
                    setWhatsappAutoReplyMessage(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Template Manager</h3>
            <button 
              onClick={() => showToast('WhatsApp template manager would open here', 'info')}
              className="text-sm px-4 py-2 bg-[var(--erp-accent)] text-white rounded font-medium flex items-center gap-2 hover:bg-opacity-90"
            >
              <span className="material-symbols-outlined !text-[18px]">add</span>
              Manage WhatsApp Templates
            </button>
          </section>
        </>
      )}
    </div>
  );

  const renderTemplatesContent = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[var(--erp-text)]">Template Management</h1>
        <p className="text-sm text-[var(--erp-text-muted)]">Manage email, WhatsApp, and PDF templates.</p>
      </div>

      {[
        { type: 'Email Templates', icon: 'mail', count: 5 },
        { type: 'WhatsApp Templates', icon: 'chat', count: 3 },
        { type: 'PDF Quote Template', icon: 'picture_as_pdf', count: 2 },
      ].map(category => (
        <section key={category.type} className="space-y-3">
          <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center justify-between">
            <span>{category.type}</span>
            <button className="text-[11px] text-[var(--erp-accent)] font-medium normal-case">+ Add New</button>
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(category.count)].map((_, i) => (
              <div key={i} className="p-3 border border-[var(--erp-border)] rounded hover:border-[var(--erp-accent)] cursor-pointer transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-slate-400">{category.icon}</span>
                  <span className="text-sm font-medium text-[var(--erp-text)]">Template {i + 1}</span>
                </div>
                <p className="text-[11px] text-[var(--erp-text-muted)]">Last edited: 2 days ago</p>
                <div className="flex gap-2 mt-2">
                  <button className="text-[10px] text-[var(--erp-accent)] hover:underline">Edit</button>
                  <button className="text-[10px] text-[var(--erp-accent)] hover:underline">Preview</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  const renderAutomationContent = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[var(--erp-text)]">Automation Rules</h1>
        <p className="text-sm text-[var(--erp-text-muted)]">Create IF-THEN rules for automated actions.</p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest">Active Rules</h3>
        <button className="text-sm px-4 py-1.5 bg-[var(--erp-accent)] text-white rounded font-medium flex items-center gap-2">
          <span className="material-symbols-outlined !text-[16px]">add</span>
          Create Rule
        </button>
      </div>

      <div className="space-y-3">
        {[
          { condition: 'Confidence > 90%', action: 'Auto-send quotation', active: true },
          { condition: 'Missing quantity', action: 'Ask clarification', active: true },
          { condition: 'New RFQ from VIP client', action: 'Notify sales manager', active: true },
          { condition: 'Quote expires in 2 days', action: 'Send reminder', active: false },
        ].map((rule, idx) => (
          <div key={idx} className={`p-4 border rounded flex items-center justify-between ${rule.active ? 'border-[var(--erp-border)]' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-[var(--erp-accent)]">bolt</span>
              <div>
                <p className="text-sm font-medium text-[var(--erp-text)]">
                  <span className="text-blue-600">IF</span> {rule.condition} <span className="text-green-600">THEN</span> {rule.action}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={rule.active} className="sr-only peer"/>
                <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-[var(--erp-accent)]"></div>
              </label>
              <button className="text-[var(--erp-text-muted)] hover:text-[var(--erp-text)]">
                <span className="material-symbols-outlined !text-[18px]">edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotificationsContent = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[var(--erp-text)]">Notification Settings</h1>
        <p className="text-sm text-[var(--erp-text-muted)]">Configure when and how you receive notifications.</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Email Notifications</h3>
        <div className="space-y-3">
          {[
            { label: 'New RFQ received', checked: true },
            { label: 'Quote sent successfully', checked: true },
            { label: 'Quote viewed by client', checked: true },
            { label: 'Quote accepted', checked: true },
            { label: 'Quote declined', checked: true },
            { label: 'Processing failures', checked: true },
            { label: 'Daily summary report', checked: false },
            { label: 'Weekly analytics digest', checked: false },
          ].map((item, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked={item.checked} className="rounded border-[var(--erp-border)] text-[var(--erp-accent)]"/>
              <span className="text-sm text-[var(--erp-text)]">{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Push Notifications</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded border-[var(--erp-border)] text-[var(--erp-accent)]"/>
          <span className="text-sm text-[var(--erp-text)]">Enable browser push notifications</span>
        </label>
      </section>
    </div>
  );

  const renderIntegrationsContent = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[var(--erp-text)]">Integrations</h1>
        <p className="text-sm text-[var(--erp-text-muted)]">Connect with external services and ERPs.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { name: 'Gmail', icon: 'mail', connected: true, lastSync: '5 mins ago' },
          { name: 'Outlook', icon: 'mail', connected: false },
          { name: 'WhatsApp', icon: 'chat', connected: true, lastSync: 'Live' },
          { name: 'Zoho Books', icon: 'calculate', connected: false },
          { name: 'Tally Prime', icon: 'receipt_long', connected: true, lastSync: '1 hour ago' },
          { name: 'Odoo', icon: 'inventory_2', connected: false },
        ].map(app => (
          <div key={app.name} className={`p-4 border rounded ${app.connected ? 'border-green-300 bg-green-50' : 'border-[var(--erp-border)]'}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-2xl text-slate-500">{app.icon}</span>
              <span className="font-medium text-[var(--erp-text)]">{app.name}</span>
            </div>
            {app.connected ? (
              <div className="space-y-2">
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">CONNECTED</span>
                <p className="text-[11px] text-green-600">Last sync: {app.lastSync}</p>
              </div>
            ) : (
              <button className="text-sm px-3 py-1.5 bg-[var(--erp-accent)] text-white rounded font-medium">Connect</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderBillingContent = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[var(--erp-text)]">Billing & Subscription</h1>
        <p className="text-sm text-[var(--erp-text-muted)]">Manage your plan and payment details.</p>
      </div>

      <section className="p-5 border border-emerald-300 bg-emerald-50 rounded">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-emerald-600">verified</span>
              <h3 className="text-lg font-bold text-emerald-700">Pro Plan</h3>
            </div>
            <p className="text-sm text-emerald-600">Valid until: March 31, 2027</p>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700">Upgrade Plan</button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Usage Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'RFQs This Month', used: 2450, limit: 5000 },
            { label: 'Quotes Generated', used: 1820, limit: 5000 },
            { label: 'Storage Used', used: 12, limit: 50, unit: 'GB' },
          ].map(metric => (
            <div key={metric.label} className="p-4 border border-[var(--erp-border)] rounded">
              <p className="text-sm text-[var(--erp-text-muted)]">{metric.label}</p>
              <p className="text-xl font-bold text-[var(--erp-text)]">{metric.used.toLocaleString()} / {metric.limit.toLocaleString()}{metric.unit || ''}</p>
              <div className="w-full bg-slate-200 h-1.5 rounded mt-2">
                <div className="bg-[var(--erp-accent)] h-full rounded" style={{ width: `${(metric.used / metric.limit) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Recent Invoices</h3>
        <div className="border border-[var(--erp-border)] rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-[var(--erp-text-muted)]">Invoice</th>
                <th className="text-left px-4 py-2 font-medium text-[var(--erp-text-muted)]">Date</th>
                <th className="text-right px-4 py-2 font-medium text-[var(--erp-text-muted)]">Amount</th>
                <th className="text-center px-4 py-2 font-medium text-[var(--erp-text-muted)]">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--erp-border)]">
              {[
                { id: 'INV-2026-003', date: 'Mar 01, 2026', amount: '₹29,999', status: 'Paid' },
                { id: 'INV-2026-002', date: 'Feb 01, 2026', amount: '₹29,999', status: 'Paid' },
                { id: 'INV-2026-001', date: 'Jan 01, 2026', amount: '₹29,999', status: 'Paid' },
              ].map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-[var(--erp-accent)]">{inv.id}</td>
                  <td className="px-4 py-2">{inv.date}</td>
                  <td className="px-4 py-2 text-right">{inv.amount}</td>
                  <td className="px-4 py-2 text-center">
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">{inv.status}</span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-[var(--erp-accent)] text-[12px] hover:underline">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderSecurityContent = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[var(--erp-text)]">Security Settings</h1>
        <p className="text-sm text-[var(--erp-text-muted)]">API keys, team access, and session management.</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">API Keys</h3>
        <div className="space-y-3">
          <div className="p-3 border border-[var(--erp-border)] rounded flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--erp-text)]">Production API Key</p>
              <p className="text-[12px] text-[var(--erp-text-muted)] font-mono">qb_live_••••••••••••K9mX</p>
            </div>
            <div className="flex gap-2">
              <button className="text-[12px] px-3 py-1 border border-[var(--erp-border)] rounded hover:bg-slate-50">Show</button>
              <button className="text-[12px] px-3 py-1 border border-[var(--erp-border)] rounded hover:bg-slate-50">Regenerate</button>
            </div>
          </div>
        </div>
        <button className="text-sm px-4 py-1.5 border border-[var(--erp-border)] rounded hover:bg-slate-50 font-medium flex items-center gap-2">
          <span className="material-symbols-outlined !text-[16px]">add</span>
          Create New API Key
        </button>
      </section>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Active Sessions</h3>
        <div className="space-y-2">
          {[
            { device: 'Chrome on Windows', location: 'Mumbai, IN', current: true, time: 'Active now' },
            { device: 'Safari on iPhone', location: 'Pune, IN', current: false, time: '2 hours ago' },
          ].map((session, idx) => (
            <div key={idx} className="p-3 border border-[var(--erp-border)] rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">computer</span>
                <div>
                  <p className="text-sm font-medium text-[var(--erp-text)]">{session.device}</p>
                  <p className="text-[11px] text-[var(--erp-text-muted)]">{session.location} • {session.time}</p>
                </div>
              </div>
              {session.current ? (
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">CURRENT</span>
              ) : (
                <button className="text-[12px] text-red-600 hover:underline">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[12px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-slate-200 pb-2">Two-Factor Authentication</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded border-[var(--erp-border)] text-[var(--erp-accent)]"/>
          <span className="text-sm text-[var(--erp-text)]">Require 2FA for all users</span>
        </label>
      </section>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company': return renderCompanyContent();
      case 'communication': return renderCommunicationContent();
      case 'whatsapp': return renderWhatsAppContent();
      case 'templates': return renderTemplatesContent();
      case 'automation': return renderAutomationContent();
      case 'notifications': return renderNotificationsContent();
      case 'integrations': return renderIntegrationsContent();
      case 'billing': return renderBillingContent();
      case 'security': return renderSecurityContent();
      default: return renderCompanyContent();
    }
  };

  return (
    <PageLayout>
      <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        <div className="h-11 border-b border-[var(--erp-border)] flex items-center px-3 bg-slate-50 shrink-0 gap-0.5 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[var(--erp-accent)] shadow-sm border border-[var(--erp-border)]'
                  : 'text-[var(--erp-text-muted)] hover:text-[var(--erp-text)] hover:bg-white/50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="material-symbols-outlined !text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-4xl">
            {renderTabContent()}
          </div>
        </div>

        <div className="h-12 border-t border-[var(--erp-border)] bg-slate-50 flex items-center justify-between px-5 shrink-0">
          <span className="text-[11px] text-[var(--erp-text-muted)]">Last saved: just now</span>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 text-sm font-medium text-[var(--erp-text-muted)] hover:text-[var(--erp-text)]">Discard</button>
            <button className="px-5 py-1.5 bg-[var(--erp-accent)] text-white text-sm font-bold rounded hover:bg-opacity-90 flex items-center gap-2">
              <span className="material-symbols-outlined !text-[16px]">save</span>
              Save
            </button>
          </div>
        </div>
      </main>
    </PageLayout>
  );
};

export default SystemConfig;
