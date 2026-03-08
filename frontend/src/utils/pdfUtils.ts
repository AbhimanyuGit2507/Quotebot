// PDF Generation using browser print
// This creates a printable HTML page that can be saved as PDF

interface QuotePDFData {
  number: string;
  date: string;
  client: string;
  clientId: string;
  validUntil: string;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit: string;
    rate: number;
    total: number;
  }>;
  notes?: string;
}

interface CompanyInfo {
  name: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
}

export const generateQuotePDF = (quote: QuotePDFData, company?: CompanyInfo) => {
  const subtotal = quote.items.reduce((sum, item) => sum + item.total, 0);
  const gst = subtotal * 0.18; // 18% GST
  const total = subtotal + gst;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Quotation ${quote.number}</title>
  <style>
    @media print {
      @page { margin: 0.5in; }
      body { margin: 0; }
      .no-print { display: none !important; }
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    
    .header h1 {
      color: #2563eb;
      font-size: 28px;
      margin: 0 0 10px 0;
    }
    
    .header p {
      margin: 3px 0;
      color: #666;
    }
    
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    
    .info-box {
      flex: 1;
    }
    
    .info-box h3 {
      font-size: 14px;
      color: #2563eb;
      margin: 0 0 10px 0;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 5px;
    }
    
    .info-box p {
      margin: 5px 0;
    }
    
    .quote-details {
      background: #f9fafb;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    
    .quote-details strong {
      color: #2563eb;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    thead {
      background: #2563eb;
      color: white;
    }
    
    th, td {
      padding: 12px 8px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    
    th {
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    tbody tr:hover {
      background: #f9fafb;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-center {
      text-align: center;
    }
    
    .totals {
      margin-left: auto;
      width: 300px;
      border-top: 2px solid #e5e7eb;
      padding-top: 15px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 13px;
    }
    
    .totals-row.grand-total {
      font-weight: bold;
      font-size: 16px;
      color: #2563eb;
      border-top: 2px solid #2563eb;
      padding-top: 12px;
    }
    
    .notes {
      margin-top: 30px;
      padding: 15px;
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
    }
    
    .notes h4 {
      margin: 0 0 10px 0;
      color: #f59e0b;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .print-button:hover {
      background: #1d4ed8;
    }

    @media print {
      .print-button { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>

  <div class="header">
    <h1>QUOTATION</h1>
    ${company ? `
      <p><strong>${company.name}</strong></p>
      ${company.gstin ? `<p>GSTIN: ${company.gstin}</p>` : ''}
      ${company.address ? `<p>${company.address}, ${company.city}, ${company.state}</p>` : ''}
      ${company.email ? `<p>Email: ${company.email} | Phone: ${company.phone || ''}</p>` : ''}
    ` : ''}
  </div>

  <div class="info-section">
    <div class="info-box">
      <h3>Bill To:</h3>
      <p><strong>${quote.client}</strong></p>
      <p>Client ID: ${quote.clientId}</p>
    </div>
    
    <div class="info-box">
      <div class="quote-details">
        <p><strong>Quote No:</strong> ${quote.number}</p>
        <p><strong>Date:</strong> ${quote.date}</p>
        <p><strong>Valid Until:</strong> ${quote.validUntil}</p>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%">#</th>
        <th style="width: 35%">Item Description</th>
        <th style="width: 12%" class="text-center">Quantity</th>
        <th style="width: 10%" class="text-center">Unit</th>
        <th style="width: 15%" class="text-right">Rate</th>
        <th style="width: 18%" class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${quote.items.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <strong>${item.name}</strong>
            ${item.description ? `<br><small style="color: #666">${item.description}</small>` : ''}
          </td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-center">${item.unit}</td>
          <td class="text-right">₹${item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td class="text-right">₹${item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span>₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="totals-row">
      <span>GST (18%):</span>
      <span>₹${gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="totals-row grand-total">
      <span>Grand Total:</span>
      <span>₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>
  </div>

  ${quote.notes ? `
    <div class="notes">
      <h4>Notes:</h4>
      <p>${quote.notes}</p>
    </div>
  ` : ''}

  <div class="footer">
    <p><strong>Terms & Conditions:</strong></p>
    <p>1. Payment due within 30 days from quote date.</p>
    <p>2. Prices are inclusive of GST @ 18%.</p>
    <p>3. This is a computer-generated quote and does not require a signature.</p>
    <br>
    <p>Thank you for your business!</p>
  </div>

  <script>
    // Auto-print when opened (optional)
    // window.onload = () => window.print();
  </script>
</body>
</html>
  `;

  // Open in new window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};

export const generateInvoicePDF = (invoice: any, company?: CompanyInfo) => {
  // Similar to quotation but with "INVOICE" title and additional fields
  console.log('Invoice PDF generation - Coming soon');
};
