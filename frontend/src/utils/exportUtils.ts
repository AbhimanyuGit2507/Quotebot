// Utility functions for export/import operations

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

export const exportToJSON = (data: any, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importFromCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          throw new Error('Empty file');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Parse CSV line handling quoted values with commas
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
};

export const importFromJSON = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Format date for filename
export const getDateStamp = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

// Format for CSV export
export const prepareQuotesForExport = (quotes: any[]) => {
  return quotes.map(q => ({
    'Quote Number': q.number,
    'Date': q.date,
    'Client': q.client,
    'Status': q.status,
    'Items': q.items?.length || 0,
    'Subtotal': q.subtotal || 0,
    'Tax': q.tax || 0,
    'Total': q.total || 0,
    'Valid Until': q.validUntil,
  }));
};

export const prepareProductsForExport = (products: any[]) => {
  return products.map(p => ({
    'SKU': p.sku,
    'Name': p.name,
    'Category': p.category,
    'Price': p.price,
    'Stock': p.stock,
    'Unit': p.unit,
    'HSN': p.hsn || '',
    'GST %': p.gst,
    'Status': p.status,
  }));
};

export const prepareClientsForExport = (clients: any[]) => {
  return clients.map(c => ({
    'Name': c.name,
    'Type': c.type,
    'Email': c.email,
    'Phone': c.phone,
    'GST': c.gst || '',
    'City': c.city,
    'State': c.state,
    'Tier': c.tier,
    'Total Orders': c.totalOrders,
    'Total Value': c.totalValue,
  }));
};

export const prepareRFQsForExport = (rfqs: any[]) => {
  return rfqs.map(r => ({
    'RFQ Number': r.number,
    'Date': r.date,
    'Client': r.client,
    'Items': r.items,
    'Value': r.value,
    'Status': r.status,
    'Channel': r.channel,
    'Priority': r.priority,
    'Due Date': r.dueDate || '',
  }));
};

export const prepareInboxMessagesForExport = (messages: any[]) => {
  return messages.map(m => ({
    'Date': m.date,
    'Time': m.time,
    'Sender': m.sender,
    'Channel': m.channel,
    'Subject': m.subject,
    'Status': m.status,
    'Is Read': m.isRead ? 'Yes' : 'No',
    'Extracted Items': m.extractedItems || 0,
    'Confidence': m.confidence || '',
  }));
};
