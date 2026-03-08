import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      
      // Prevent shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Ctrl+K even in inputs for global search
        if (!(ctrl && e.key === 'k')) {
          return;
        }
      }

      // Global shortcuts
      if (ctrl && e.key === ',') {
        e.preventDefault();
        navigate('/system-config');
      }

      if (ctrl && e.key === '/') {
        e.preventDefault();
        showShortcutsHelp();
      }

      // Page-specific shortcuts
      const currentPage = location.pathname;

      // Quotations page shortcuts
      if (currentPage === '/quotations') {
        if (ctrl && e.key === 'n') {
          e.preventDefault();
          document.querySelector<HTMLButtonElement>('[data-action="new-quote"]')?.click();
        }
        if (ctrl && e.key === 'p') {
          e.preventDefault();
          document.querySelector<HTMLButtonElement>('[data-action="print"]')?.click();
        }
        if (ctrl && e.key === 'e') {
          e.preventDefault();
          document.querySelector<HTMLButtonElement>('[data-action="email"]')?.click();
        }
        if (ctrl && e.key === 'd') {
          e.preventDefault();
          document.querySelector<HTMLButtonElement>('[data-action="duplicate"]')?.click();
        }
      }

      // Products page shortcuts
      if (currentPage === '/products') {
        if (ctrl && e.key === 'n') {
          e.preventDefault();
          document.querySelector<HTMLButtonElement>('[data-action="new-product"]')?.click();
        }
        if (ctrl && e.key === 'f') {
          e.preventDefault();
          document.querySelector<HTMLInputElement>('[data-search="products"]')?.focus();
        }
        if (ctrl && e.shiftKey && e.key === 'E') {
          e.preventDefault();
          document.querySelector<HTMLButtonElement>('[data-action="export-csv"]')?.click();
        }
      }

      // Dashboard shortcuts
      if (currentPage === '/dashboard' || currentPage === '/') {
        if (ctrl && e.key === 'r') {
          e.preventDefault();
          window.location.reload();
        }
      }

      // Navigation shortcuts (work everywhere)
      if (ctrl && e.shiftKey) {
        if (e.key === 'D') {
          e.preventDefault();
          navigate('/dashboard');
        }
        if (e.key === 'I') {
          e.preventDefault();
          navigate('/inbox');
        }
        if (e.key === 'R') {
          e.preventDefault();
          navigate('/rfq-inbox');
        }
        if (e.key === 'Q') {
          e.preventDefault();
          navigate('/quotations');
        }
        if (e.key === 'P') {
          e.preventDefault();
          navigate('/products');
        }
        if (e.key === 'C') {
          e.preventDefault();
          navigate('/client-ledger');
        }
        if (e.key === 'A') {
          e.preventDefault();
          navigate('/analytics');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location]);
};

const showShortcutsHelp = () => {
  const helpText = `
KEYBOARD SHORTCUTS:

Global:
  Ctrl/Cmd + K         Open search
  Ctrl/Cmd + ,         Open settings
  Ctrl/Cmd + /         Show this help

Navigation:
  Ctrl+Shift+D         Dashboard
  Ctrl+Shift+I         Inbox
  Ctrl+Shift+R         RFQ Management
  Ctrl+Shift+Q         Quotations
  Ctrl+Shift+P         Products
  Ctrl+Shift+C         Clients
  Ctrl+Shift+A         Analytics

Quotations Page:
  Ctrl/Cmd + N         New quote
  Ctrl/Cmd + P         Print
  Ctrl/Cmd + E         Email
  Ctrl/Cmd + D         Duplicate
  Delete               Delete selected

Products Page:
  Ctrl/Cmd + N         New product
  Ctrl/Cmd + F         Focus search
  Ctrl+Shift+E         Export CSV

Dashboard:
  Ctrl/Cmd + R         Refresh
  `;

  alert(helpText);
};
