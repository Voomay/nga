
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { InventoryItem } from '../types';

export const CreateInventoryPart: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    inventory, addInventoryItem, updateInventoryItem, 
    inventoryCategories, addInventoryCategory, jobCards, bookOutInventory 
  } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    partNumber: '',
    category: '',
    supplier: '',
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    lowStockAlert: 5,
    binLocation: '',
    images: [],
    transactions: []
  });

  // Book Out State
  const [isBookingOut, setIsBookingOut] = useState(false);
  const [bookOutData, setBookOutData] = useState({ qty: 1, destination: '', jobId: '' });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Load Data for Edit
  useEffect(() => {
    if (id) {
        const existing = inventory.find(i => i.id === id);
        if (existing) {
            setFormData({
                ...existing,
                images: existing.images || [],
                transactions: existing.transactions || []
            });
        }
    }
  }, [id, inventory]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const remainingSlots = 2 - (formData.images?.length || 0);
      const filesToProcess = files.slice(0, remainingSlots);

      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), base64String]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const payload: InventoryItem = {
      id: id || Math.random().toString(36).substr(2, 9),
      name: formData.name || 'Unknown Part',
      partNumber: formData.partNumber || `SKU-${Math.floor(Math.random() * 10000)}`,
      category: formData.category || 'General',
      supplier: formData.supplier || 'N/A',
      costPrice: Number(formData.costPrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      stock: Number(formData.stock) || 0,
      lowStockAlert: Number(formData.lowStockAlert) || 5,
      binLocation: formData.binLocation,
      images: formData.images || [],
      transactions: formData.transactions || []
    };

    if (id) {
        updateInventoryItem(payload);
    } else {
        addInventoryItem(payload);
    }
    navigate('/inventory');
  };

  const handleBookOutSubmit = () => {
    if (!id || !user) return;
    const dest = bookOutData.jobId ? `Job Card: ${bookOutData.jobId}` : bookOutData.destination;
    if (!dest) {
        alert("Please provide a destination or select a job card.");
        return;
    }
    bookOutInventory(id, bookOutData.qty, user.name, dest);
    setIsBookingOut(false);
    setBookOutData({ qty: 1, destination: '', jobId: '' });
  };

  const handleAddCategory = () => {
      if (newCategoryName.trim()) {
          addInventoryCategory(newCategoryName.trim());
          updateField('category', newCategoryName.trim());
          setNewCategoryName('');
          setIsAddingCategory(false);
      }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-4 md:p-8 pb-20">
      <div className="max-w-5xl mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/inventory'); }} className="hover:text-primary transition-colors font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            Inventory
          </a>
          <span className="material-symbols-outlined text-text-muted text-[16px]">chevron_right</span>
          <span className="text-text-main font-semibold">{id ? 'Edit Part' : 'Add New Part'}</span>
        </div>

        {/* Page Title & Booking Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-text-main text-3xl md:text-4xl font-extrabold tracking-tight">{id ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h1>
            <p className="text-text-muted text-base">Enter part details to track stock levels and transactions.</p>
          </div>
          {id && (
              <button 
                type="button"
                onClick={() => setIsBookingOut(!isBookingOut)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-lg transition-all ${isBookingOut ? 'bg-slate-900 text-white' : 'bg-primary text-white hover:bg-primary-hover shadow-primary/20'}`}
              >
                <span className="material-symbols-outlined text-[20px]">{isBookingOut ? 'close' : 'remove_shopping_cart'}</span>
                {isBookingOut ? 'Cancel Booking' : 'Issue / Book Out'}
              </button>
          )}
        </div>

        {/* Booking Out Drawer/Section */}
        {isBookingOut && (
            <div className="mb-8 p-6 rounded-2xl bg-slate-900 text-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined">output</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Issue Parts from Stock</h2>
                        <p className="text-xs text-slate-400">Record who is using this part and where it's being installed.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Quantity to Issue</label>
                        <input 
                            type="number" 
                            className="w-full h-12 px-4 rounded-xl bg-slate-800 border-none text-white focus:ring-2 focus:ring-primary"
                            value={bookOutData.qty}
                            onChange={e => setBookOutData({...bookOutData, qty: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Link to Job Card</label>
                        <select 
                            className="w-full h-12 px-4 rounded-xl bg-slate-800 border-none text-white focus:ring-2 focus:ring-primary cursor-pointer"
                            value={bookOutData.jobId}
                            onChange={e => setBookOutData({...bookOutData, jobId: e.target.value, destination: ''})}
                        >
                            <option value="">Select Job Card #</option>
                            {jobCards.filter(j => j.status !== 'Completed').map(job => (
                                <option key={job.id} value={job.jobId}>{job.jobId} - {job.vehicleReg}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Other Destination</label>
                        <input 
                            placeholder="e.g., Internal Maintenance"
                            className="w-full h-12 px-4 rounded-xl bg-slate-800 border-none text-white focus:ring-2 focus:ring-primary"
                            value={bookOutData.destination}
                            disabled={!!bookOutData.jobId}
                            onChange={e => setBookOutData({...bookOutData, destination: e.target.value})}
                        />
                    </div>
                </div>
                <div className="mt-8 flex justify-end items-center gap-4">
                    <p className="text-xs text-slate-400 italic">Authorizing as: <span className="text-white font-bold">{user?.name}</span></p>
                    <button 
                        onClick={handleBookOutSubmit}
                        className="bg-primary hover:bg-primary-hover px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-primary/20"
                    >Confirm Transaction</button>
                </div>
            </div>
        )}

        <div className="flex flex-col gap-8">
            {/* Form Card */}
            <form className="bg-surface-card rounded-xl border border-border-light shadow-sm overflow-hidden" onSubmit={(e) => e.preventDefault()}>
            {/* Section 1: Basic Info */}
            <div className="p-6 md:p-8 border-b border-border-light">
                <div className="flex items-center gap-3 mb-6">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xl">label</span>
                </div>
                <h2 className="text-lg font-bold text-text-main">Part Identity</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-text-main mb-2">Part Name</label>
                    <input 
                    className="w-full h-12 px-4 rounded-lg bg-background-light border border-transparent text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card transition-all" 
                    placeholder="e.g., Oil Filter - Toyota Hilux 2.4 GD-6" 
                    type="text"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">SKU / Part Number</label>
                    <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">qr_code_2</span>
                    <input 
                        className="w-full h-12 pl-10 pr-4 rounded-lg bg-background-light border border-transparent text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card transition-all font-mono" 
                        placeholder="e.g., OF-TOY-001" 
                        type="text"
                        value={formData.partNumber}
                        onChange={e => updateField('partNumber', e.target.value)}
                    />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Category</label>
                    <div className="relative">
                    {!isAddingCategory ? (
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <select 
                                    className="w-full h-12 px-4 rounded-lg bg-background-light border border-transparent text-text-main focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card transition-all appearance-none cursor-pointer"
                                    value={formData.category}
                                    onChange={e => updateField('category', e.target.value)}
                                >
                                    <option disabled value="">Select a category</option>
                                    {inventoryCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsAddingCategory(true)}
                                className="h-12 w-12 flex items-center justify-center rounded-lg bg-background-light text-primary hover:bg-border-light border border-transparent transition-colors"
                                title="Add New Category"
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 h-12 px-4 rounded-lg bg-background-light border border-transparent text-text-main focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card transition-all"
                                placeholder="New category name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                autoFocus
                            />
                            <button 
                                type="button" 
                                onClick={handleAddCategory}
                                className="h-12 w-12 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors"
                            >
                                <span className="material-symbols-outlined">check</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsAddingCategory(false)}
                                className="h-12 w-12 flex items-center justify-center rounded-lg bg-background-light border border-transparent text-text-muted hover:bg-border-light transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    )}
                    </div>
                </div>
                </div>
            </div>

            {/* Images Section */}
            <div className="p-6 md:p-8 border-b border-border-light">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">perm_media</span>
                    </div>
                    <h2 className="text-lg font-bold text-text-main">Equipment Photos</h2>
                    </div>
                    <p className="text-xs text-text-muted font-medium">Max 2 photos per item</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(formData.images || []).map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border-light bg-background-light shadow-sm">
                        <img src={img} alt={`Equipment ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                            type="button"
                            onClick={() => removeImage(idx)} 
                            className="p-2 bg-white/20 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                        </div>
                    </div>
                    ))}
                    
                    {(formData.images?.length || 0) < 2 && (
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-border-light bg-background-light/50 flex flex-col items-center justify-center gap-2 hover:bg-background-light hover:border-primary/50 transition-all group"
                    >
                        <div className="size-10 rounded-full bg-surface-card flex items-center justify-center text-text-muted group-hover:text-primary transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
                        </div>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Upload Photo</span>
                    </button>
                    )}
                    
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    multiple={(formData.images?.length || 0) === 0}
                    />
                </div>
            </div>

            {/* Pricing Section */}
            <div className="p-6 md:p-8 border-b border-border-light bg-background-light/30">
                <div className="flex items-center gap-3 mb-6">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xl">payments</span>
                    </div>
                    <h2 className="text-lg font-bold text-text-main">Pricing & Valuation (ZAR)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Cost Price (Excl. VAT)</label>
                    <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">R</span>
                    <input 
                        className="w-full h-12 pl-10 pr-4 rounded-lg bg-surface-card border border-border-light text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                        placeholder="0.00" 
                        step="0.01" 
                        type="number"
                        value={formData.costPrice}
                        onChange={e => updateField('costPrice', e.target.value)}
                    />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">Selling Price (Excl. VAT)</label>
                    <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">R</span>
                    <input 
                        className="w-full h-12 pl-10 pr-4 rounded-lg bg-surface-card border border-border-light text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                        placeholder="0.00" 
                        step="0.01" 
                        type="number"
                        value={formData.sellingPrice}
                        onChange={e => updateField('sellingPrice', e.target.value)}
                    />
                    </div>
                </div>
                </div>
            </div>

            {/* Stock Control */}
            <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl">warehouse</span>
                    </div>
                    <h2 className="text-lg font-bold text-text-main">Inventory Control</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-semibold text-text-main mb-2">Current Stock</label>
                        <input 
                        className="w-full h-12 px-4 rounded-lg bg-background-light border border-transparent text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card transition-all" 
                        placeholder="0" 
                        type="number"
                        value={formData.stock}
                        onChange={e => updateField('stock', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-semibold text-text-main mb-2">Low Stock Alert</label>
                        <input 
                        className="w-full h-12 px-4 rounded-lg bg-background-light border border-transparent text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card transition-all" 
                        placeholder="5" 
                        type="number"
                        value={formData.lowStockAlert}
                        onChange={e => updateField('lowStockAlert', e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-text-main mb-2">Bin Location</label>
                        <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">shelves</span>
                        <input 
                            className="w-full h-12 pl-10 pr-4 rounded-lg bg-background-light border border-transparent text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card transition-all" 
                            placeholder="e.g., Aisle 3, Shelf B" 
                            type="text"
                            value={formData.binLocation}
                            onChange={e => updateField('binLocation', e.target.value)}
                        />
                        </div>
                    </div>
                    </div>
                </div>

                {/* Supplier Info */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl">local_shipping</span>
                    </div>
                    <h2 className="text-lg font-bold text-text-main">Supplier Info</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-text-main mb-2">Primary Supplier</label>
                        <div className="relative">
                        <select 
                            className="w-full h-12 px-4 rounded-lg bg-background-light border border-transparent text-text-main focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card transition-all appearance-none cursor-pointer"
                            value={formData.supplier}
                            onChange={e => updateField('supplier', e.target.value)}
                        >
                            <option disabled value="">Select supplier</option>
                            <option value="GUD Filters SA">GUD Filters SA</option>
                            <option value="Goldwagen">Goldwagen</option>
                            <option value="Masterparts">Masterparts</option>
                            <option value="AutoZone">AutoZone</option>
                            <option value="Other">Other</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>

            {/* Transaction Log Table */}
            {id && (
                <div className="p-6 md:p-8 bg-slate-50 border-t border-border-light">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xl">history</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Transaction History</h2>
                    </div>
                    <div className="rounded-xl border border-border-light bg-white overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-border-light">
                                        <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Timestamp</th>
                                        <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Qty</th>
                                        <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Type</th>
                                        <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Booked By</th>
                                        <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Used At / Destination</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light">
                                    {formData.transactions && formData.transactions.length > 0 ? (
                                        formData.transactions.map(tx => (
                                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">{tx.timestamp}</td>
                                                <td className="px-4 py-3 font-black text-slate-900">-{tx.qty}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-block px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wide">Issue</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700 font-bold">{tx.userName}</td>
                                                <td className="px-4 py-3 text-slate-600 font-medium">{tx.destination}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">No transactions recorded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Actions */}
            <div className="p-6 md:p-8 border-t border-border-light bg-background-light/30 flex justify-end gap-3 sticky bottom-0 z-10">
                <button 
                className="px-6 py-3 rounded-lg border border-border-light text-text-muted font-bold text-sm hover:bg-surface-card transition-colors" 
                type="button"
                onClick={() => navigate('/inventory')}
                >
                Cancel
                </button>
                <button 
                className="px-6 py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary-hover transition-colors flex items-center gap-2" 
                type="button"
                onClick={handleSave}
                >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {id ? 'Update Part' : 'Save Part'}
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};