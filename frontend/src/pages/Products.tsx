import React, { useState, useMemo } from 'react';
import PageLayout from '../components/common/PageLayout';
import { useApp, Product } from '../context/AppContext';
import { exportToCSV, prepareProductsForExport, getDateStamp } from '../utils/exportUtils';

const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, showConfirmModal } = useApp();
  
  const [selectedId, setSelectedId] = useState<string | null>(products[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return cats.sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const selectedProduct = products.find(p => p.id === selectedId);

  const handleDelete = (product: Product) => {
    showConfirmModal(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      () => deleteProduct(product.id)
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700 border-green-200',
      inactive: 'bg-slate-100 text-slate-600 border-slate-200',
      low_stock: 'bg-red-100 text-red-700 border-red-200',
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  // Handle Export to CSV
  const handleExportProducts = () => {
    const exportData = prepareProductsForExport(filteredProducts);
    exportToCSV(exportData, `products_${getDateStamp()}.csv`);
  };

  return (
    <PageLayout>
      {/* Left Panel - Product List */}
      <aside className="w-80 bg-white border-r border-[var(--erp-border)] flex flex-col shrink-0">
        <div className="p-3 border-b border-[var(--erp-border)] space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--erp-text)] uppercase">Products</h2>
            <div className="flex gap-1">
              <button 
                onClick={handleExportProducts}
                className="px-2 py-1 border border-[var(--erp-border)] bg-white text-[11px] font-medium rounded hover:bg-slate-50"
                title="Export to CSV"
                data-action="export-csv"
              >
                <span className="material-symbols-outlined !text-[14px]">download</span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 px-2 py-1 bg-[var(--erp-accent)] text-white text-[11px] font-bold rounded hover:bg-opacity-90"
                data-action="new-product"
              >
                <span className="material-symbols-outlined !text-[14px]">add</span>
                ADD
              </button>
            </div>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 !text-[16px]">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-7 pr-2 py-1.5 text-[12px] border border-[var(--erp-border)] rounded focus:ring-1 focus:ring-[var(--erp-accent)]"
              data-search="products"
            />
          </div>
          <div className="flex gap-1">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 text-[11px] border border-[var(--erp-border)] rounded px-1.5 py-1"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 text-[11px] border border-[var(--erp-border)] rounded px-1.5 py-1"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="low_stock">Low Stock</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => setSelectedId(product.id)}
              className={`px-3 py-2.5 border-b border-[var(--erp-border)] cursor-pointer transition-colors ${
                selectedId === product.id ? 'bg-blue-50 border-l-2 border-l-[var(--erp-accent)]' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-[var(--erp-text)] truncate">{product.name}</p>
                  <p className="text-[11px] text-[var(--erp-accent)] font-mono">{product.sku}</p>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(product.status)}`}>
                  {product.status === 'low_stock' ? 'LOW' : product.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-[var(--erp-text-muted)]">
                <span>{product.category}</span>
                <span className="font-medium">₹{product.price.toLocaleString()}</span>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="p-4 text-center text-sm text-slate-400">
              <span className="material-symbols-outlined text-3xl mb-2">inventory_2</span>
              <p>No products found</p>
            </div>
          )}
        </div>
        <div className="p-2 border-t border-[var(--erp-border)] bg-slate-50 text-[11px] text-[var(--erp-text-muted)]">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </aside>

      {/* Main Content - Product Details */}
      <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        {selectedProduct ? (
          <>
            <div className="h-14 border-b border-[var(--erp-border)] flex items-center justify-between px-5 shrink-0 bg-slate-50">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold text-[var(--erp-text)]">{selectedProduct.name}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(selectedProduct.status)}`}>
                  {selectedProduct.status === 'low_stock' ? 'LOW STOCK' : selectedProduct.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setEditingProduct(selectedProduct)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-[var(--erp-border)] bg-white rounded text-[12px] font-medium hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined !text-[16px]">edit</span> Edit
                </button>
                <button 
                  onClick={() => handleDelete(selectedProduct)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-red-200 bg-white rounded text-[12px] font-medium text-red-600 hover:bg-red-50"
                >
                  <span className="material-symbols-outlined !text-[16px]">delete</span> Delete
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1">General Information</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Product Name', value: selectedProduct.name },
                      { label: 'SKU', value: selectedProduct.sku, accent: true },
                      { label: 'Category', value: selectedProduct.category },
                      { label: 'HSN Code', value: selectedProduct.hsn || '-' },
                      { label: 'GST Rate', value: `${selectedProduct.gst}%` },
                    ].map(item => (
                      <div key={item.label} className="flex text-[13px]">
                        <span className="w-28 text-[var(--erp-text-muted)]">{item.label}:</span>
                        <span className={`font-medium ${item.accent ? 'text-[var(--erp-accent)]' : 'text-[var(--erp-text)]'}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1">Inventory</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Current Stock', value: `${selectedProduct.stock} ${selectedProduct.unit}`, highlight: selectedProduct.stock <= selectedProduct.minStock },
                      { label: 'Min Stock', value: `${selectedProduct.minStock} ${selectedProduct.unit}` },
                      { label: 'Unit', value: selectedProduct.unit },
                      { label: 'Status', value: selectedProduct.status === 'low_stock' ? 'Low Stock Alert' : 'In Stock' },
                    ].map(item => (
                      <div key={item.label} className="flex text-[13px]">
                        <span className="w-28 text-[var(--erp-text-muted)]">{item.label}:</span>
                        <span className={`font-medium ${item.highlight ? 'text-red-600' : 'text-[var(--erp-text)]'}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1 mb-3">Pricing</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-3 rounded border border-[var(--erp-border)]">
                    <p className="text-[11px] text-[var(--erp-text-muted)] mb-1">Base Price</p>
                    <p className="text-lg font-bold text-[var(--erp-text)]">₹{selectedProduct.price.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-[var(--erp-border)]">
                    <p className="text-[11px] text-[var(--erp-text-muted)] mb-1">GST ({selectedProduct.gst}%)</p>
                    <p className="text-lg font-bold text-[var(--erp-text)]">₹{(selectedProduct.price * selectedProduct.gst / 100).toLocaleString()}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                    <p className="text-[11px] text-emerald-700 mb-1">Final Price</p>
                    <p className="text-lg font-bold text-emerald-700">₹{(selectedProduct.price * (1 + selectedProduct.gst / 100)).toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="text-[11px] text-blue-700 mb-1">Stock Value</p>
                    <p className="text-lg font-bold text-blue-700">₹{(selectedProduct.price * selectedProduct.stock).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold text-[var(--erp-text-muted)] uppercase tracking-widest border-b border-[var(--erp-border)] pb-1 mb-3">Quick Actions</h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-[var(--erp-accent)] text-white text-[12px] font-medium rounded hover:bg-opacity-90">
                    <span className="material-symbols-outlined !text-[16px]">add_shopping_cart</span>
                    Add to Quote
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-[var(--erp-border)] text-[12px] font-medium rounded hover:bg-slate-50">
                    <span className="material-symbols-outlined !text-[16px]">inventory</span>
                    Adjust Stock
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-[var(--erp-border)] text-[12px] font-medium rounded hover:bg-slate-50">
                    <span className="material-symbols-outlined !text-[16px]">history</span>
                    View History
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl mb-3">package_2</span>
              <p className="text-sm">Select a product to view details</p>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {(showAddModal || editingProduct) && (
        <ProductModal
          product={editingProduct}
          onClose={() => { setShowAddModal(false); setEditingProduct(null); }}
          onSave={(data) => {
            if (editingProduct) {
              updateProduct(editingProduct.id, data);
            } else {
              addProduct(data as Omit<Product, 'id'>);
            }
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </PageLayout>
  );
};

// Product Modal Component
interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    category: product?.category || '',
    price: product?.price?.toString() || '',
    stock: product?.stock?.toString() || '0',
    minStock: product?.minStock?.toString() || '5',
    unit: product?.unit || 'Unit',
    hsn: product?.hsn || '',
    gst: product?.gst?.toString() || '18',
    status: product?.status || 'active',
  });

  const handleSubmit = () => {
    if (!formData.sku || !formData.name || !formData.price) return;
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      gst: parseFloat(formData.gst),
      status: parseInt(formData.stock) <= parseInt(formData.minStock) ? 'low_stock' : formData.status as Product['status'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--erp-border)] bg-slate-50">
          <h3 className="text-lg font-bold text-[var(--erp-text)]">{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">SKU *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2"
                placeholder="e.g., PRD-001"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2"
                placeholder="e.g., Electronics"
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2"
              placeholder="Enter product name"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Price *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">GST %</label>
              <select
                value={formData.gst}
                onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2 bg-white"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">HSN Code</label>
              <input
                type="text"
                value={formData.hsn}
                onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2"
                placeholder="e.g., 8471"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Min Stock</label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--erp-text-muted)] mb-1">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full text-sm border border-[var(--erp-border)] rounded px-3 py-2 bg-white"
              >
                <option value="Unit">Unit</option>
                <option value="Box">Box</option>
                <option value="Kg">Kg</option>
                <option value="Meter">Meter</option>
                <option value="Liter">Liter</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-[var(--erp-border)] bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--erp-text-muted)] hover:text-[var(--erp-text)]">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-5 py-2 text-sm font-bold text-white bg-[var(--erp-accent)] rounded hover:bg-opacity-90">
            {product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Products;
