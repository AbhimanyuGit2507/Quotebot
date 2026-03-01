import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import UserPermissions from './pages/UserPermissions';
import Quotations from './pages/Quotations';
import Products from './pages/Products';
import Analytics from './pages/Analytics';
import RFQInbox from './pages/RFQInbox';
import ClientLedger from './pages/ClientLedger';
import SystemConfig from './pages/SystemConfig';
import Inbox from './pages/Inbox';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/user-permissions" element={<UserPermissions />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/products" element={<Products />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/rfq-inbox" element={<RFQInbox />} />
          <Route path="/client-ledger" element={<ClientLedger />} />
          <Route path="/system-config" element={<SystemConfig />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
