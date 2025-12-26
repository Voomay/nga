import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { inventory, deleteInventoryItem, inventoryCategories } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const isOwner = user?.role === 'Owner';

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
        item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full pb-20">
      <div className="flex flex-col gap-6">
        {/* Page Heading & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-text-main text-3xl md:text-4xl font-black tracking-tight">Inventory Management</h1>
            <p className="text-text-muted text-base">Oversee parts catalog, stock levels, and pricing margins.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border-light bg-surface-card text-text-muted text-sm font-semibold hover:bg-background-light transition-colors">
              <span className="material-symbols-outlined text-[20px]">file_upload</span>
              <span>Import</span>
            </button>
            <button 
              onClick={() => navigate('/inventory/create')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md shadow-primary/20 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Add New Part</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isOwner && (
            <div className="flex flex-col gap-1 rounded-xl p-5 bg-surface-card border border-border-light shadow-sm">
              <div className="flex items-center gap-2 text-text-muted">
                <span className="material-symbols-outlined text-[20px]">payments</span>
                <p className="text-sm font-medium uppercase tracking-wide">Total Stock Value</p>
              </div>
              <p className="text-text-main text-2xl font-bold">R {inventory.reduce((acc, i) => acc + (i.stock * i.costPrice), 0).toLocaleString()}</p>
            </div>
          )}
          <div className={`flex flex-col gap-1 rounded-xl p-5 bg-surface-card border border-border-light shadow-sm relative overflow-hidden ${!isOwner ? 'md:col-span-1.5' : ''}`}>
            <div className="absolute right-0 top-0 p-3 opacity-10">
              <span className="material-symbols-outlined text-6xl text-orange-500">warning</span>
            </div>
            <div className="flex items-center gap-2 text-orange-600">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <p className="text-sm font-medium uppercase tracking-wide">Low Stock Alerts</p>
            </div>
            <p className="text-text-main text-2xl font-bold">{inventory.filter(i => i.stock <= i.lowStockAlert && i.stock > 0).length} Items</p>
          </div>
          <div className={`flex flex-col gap-1 rounded-xl p-5 bg-surface-card border border-border-light shadow-sm relative overflow-hidden ${!isOwner ? 'md:col-span-1.5' : ''}`}>
            <div className="absolute right-0 top-0 p-3 opacity-10">
              <span className="material-symbols-outlined text-6xl text-red-500">error</span>
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p className="text-sm font-medium uppercase tracking-wide">Out of Stock</p>
            </div>
            <p className="text-text-main text-2xl font-bold">{inventory.filter(i => i.stock === 0).length} Items</p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col xl:flex-row gap-4 bg-surface-card p-4 rounded-xl border border-border-light shadow-sm">
          {/* Search */}
          <div className="flex-1">
            <label className="relative block w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                <span className="material-symbols-outlined">search</span>
              </span>
              <input 
                className="w-full bg-background-light border-none rounded-lg py-2.5 pl-10 pr-4 text-text-main placeholder-text-muted focus:ring-2 focus:ring-primary focus:bg-surface-card transition-all" 
                placeholder="Search Part Number, Description, or Supplier..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
                <select
                    className="h-10 pl-3 pr-8 rounded-lg bg-background-light border border-transparent text-text-main text-sm font-medium focus:bg-surface-card focus:border-primary focus:ring-primary cursor-pointer appearance-none"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    {inventoryCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[20px]">expand_more</span>
            </div>
            <button 
                className="flex items-center justify-center size-10 rounded-lg bg-background-light hover:bg-surface-card text-text-muted transition-colors" 
                title="Clear Filters" 
                onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
            >
              <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface-card rounded-xl border border-border-light shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-background-light border-b border-border-light">
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Thumbnail</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Part #</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider w-1/4">Description</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider hidden md:table-cell">Supplier</th>
                  {isOwner && <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right hidden md:table-cell">Cost (R)</th>}
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Sell (R)</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider text-center">Stock</th>
                  <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredInventory.map(item => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-background-light transition-colors group cursor-pointer"
                    onClick={() => navigate(`/inventory/${item.id}`)}
                  >
                    <td className="p-4">
                      <div className="size-10 rounded-lg bg-background-light border border-border-light overflow-hidden flex items-center justify-center text-slate-300">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[20px]">image</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-text-main font-mono whitespace-nowrap">{item.partNumber}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text-main">{item.name}</span>
                        <span className="text-xs text-text-muted md:hidden">R {item.sellingPrice.toFixed(2)}</span>
                        <span className="text-xs text-text-muted hidden md:block">{item.binLocation}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-text-muted hidden md:table-cell">{item.category}</td>
                    <td className="p-4 text-sm text-text-muted hidden md:table-cell">{item.supplier}</td>
                    {isOwner && <td className="p-4 text-sm text-text-muted text-right font-mono hidden md:table-cell">{item.costPrice.toFixed(2)}</td>}
                    <td className="p-4 text-sm font-semibold text-text-main text-right font-mono">{item.sellingPrice.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.stock === 0 ? 'bg-red-100 text-red-800' :
                        item.stock <= item.lowStockAlert ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.stock}
                        {item.stock === 0 && <span className="material-symbols-outlined text-[14px]">error</span>}
                        {item.stock > 0 && item.stock <= item.lowStockAlert && <span className="material-symbols-outlined text-[14px]">warning</span>}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            className="text-primary hover:text-primary-hover p-1 rounded hover:bg-primary/10 transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigate(`/inventory/${item.id}`); }}
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        {isOwner && (
                          <button 
                            className="text-text-muted hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                            onClick={(e) => { e.stopPropagation(); deleteInventoryItem(item.id); }}
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                    <tr>
                        <td colSpan={9} className="p-8 text-center text-text-muted">No inventory items found.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};