import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Customer } from '../types';

export const CreateCustomer: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { customers, addCustomer, updateCustomer } = useData();
  const { user } = useAuth();
  
  const isOwner = user?.role === 'Owner';
  const [isBusiness, setIsBusiness] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    suburb: '',
    postalCode: '',
    vatNumber: ''
  });

  // Load Data for Edit
  useEffect(() => {
    if (id) {
        const existing = customers.find(c => c.id === id);
        if (existing) {
            setIsBusiness(existing.isBusiness);
            setFormData({
                firstName: existing.firstName,
                lastName: existing.lastName,
                companyName: existing.companyName || '',
                phone: existing.phone,
                email: existing.email,
                address: existing.address || '',
                suburb: existing.suburb || '',
                postalCode: existing.postalCode || '',
                vatNumber: existing.vatNumber || ''
            });
        }
    }
  }, [id, customers]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSave = () => {
    const payload: Customer = {
        id: id || Math.random().toString(36).substr(2, 9),
        firstName: formData.firstName || 'Unknown',
        lastName: formData.lastName || 'Customer',
        companyName: isBusiness ? formData.companyName : undefined,
        isBusiness,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        suburb: formData.suburb,
        postalCode: formData.postalCode,
        vatNumber: formData.vatNumber,
        balance: id ? (customers.find(c => c.id === id)?.balance || 0) : 0,
        status: id ? (customers.find(c => c.id === id)?.status || 'Active') : 'Active',
        vehicles: id ? (customers.find(c => c.id === id)?.vehicles || []) : []
    };

    if (id) {
        updateCustomer(payload);
    } else {
        addCustomer(payload);
    }
    navigate('/customers');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background-light p-4 md:p-8 pb-20">
      <div className="mx-auto max-w-5xl">
        {/* BREADCRUMBS */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="hover:text-primary transition-colors">Home</a>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/customers'); }} className="hover:text-primary transition-colors">Customers</a>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="font-medium text-text-main">{id ? 'Edit Customer' : 'New Customer'}</span>
        </div>

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-main">{id ? 'Edit Customer Details' : 'Add New Customer'}</h1>
            <p className="mt-2 text-text-muted">{id ? 'Update profile information and contact details.' : 'Create a new profile for invoicing, quotes, and job cards.'}</p>
          </div>
        </div>

        {/* FORM CONTENT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* MAIN FORM COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* BASIC INFO CARD */}
            <div className="rounded-xl border border-border-light bg-surface-card p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-text-main border-b border-border-light pb-3">
                <span className="material-symbols-outlined text-primary">person</span>
                Personal & Business Info
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Toggle for Business */}
                <div className="md:col-span-2 flex items-center gap-3 rounded-lg bg-background-light p-3">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      className="peer absolute block w-5 h-5 rounded-full bg-surface-card border-4 border-slate-300 appearance-none cursor-pointer checked:right-0 checked:border-primary" 
                      id="is_business" 
                      name="is_business" 
                      type="checkbox"
                      checked={isBusiness}
                      onChange={(e) => setIsBusiness(e.target.checked)}
                    />
                    <label 
                      className="block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer peer-checked:bg-primary/50" 
                      htmlFor="is_business"
                    ></label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main cursor-pointer" htmlFor="is_business">Register as Business Customer?</label>
                    <p className="text-xs text-text-muted">Enable this to add VAT number and Company Name.</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-text-main" htmlFor="first_name">First Name</label>
                  <input 
                    className="w-full rounded-lg border-border-light bg-background-light px-3 py-2 text-sm placeholder-text-muted shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card text-text-main" 
                    id="first_name" 
                    placeholder="e.g. Johan" 
                    type="text"
                    value={formData.firstName}
                    onChange={e => updateField('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-text-main" htmlFor="last_name">Surname</label>
                  <input 
                    className="w-full rounded-lg border-border-light bg-background-light px-3 py-2 text-sm placeholder-text-muted shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card text-text-main" 
                    id="last_name" 
                    placeholder="e.g. Smit" 
                    type="text"
                    value={formData.lastName}
                    onChange={e => updateField('lastName', e.target.value)}
                  />
                </div>
                
                {isBusiness && (
                  <>
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-sm font-medium text-text-main" htmlFor="company_name">Company Name <span className="text-xs font-normal text-text-muted">(Optional)</span></label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                          <span className="material-symbols-outlined text-[18px]">apartment</span>
                        </span>
                        <input 
                            className="w-full rounded-lg border-border-light bg-background-light pl-10 px-3 py-2 text-sm placeholder-text-muted shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card text-text-main" 
                            id="company_name" 
                            placeholder="e.g. Rapid Logistics PTY (Ltd)" 
                            type="text"
                            value={formData.companyName}
                            onChange={e => updateField('companyName', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="md:col-span-1 space-y-1">
                      <label className="block text-sm font-medium text-text-main" htmlFor="vat_number">VAT Number</label>
                      <input 
                        className="w-full rounded-lg border-border-light bg-background-light px-3 py-2 text-sm placeholder-text-muted shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card text-text-main" 
                        id="vat_number" 
                        placeholder="4000..." 
                        type="text"
                        value={formData.vatNumber}
                        onChange={e => updateField('vatNumber', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* CONTACT & ADDRESS CARD */}
            <div className="rounded-xl border border-border-light bg-surface-card p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-text-main border-b border-border-light pb-3">
                <span className="material-symbols-outlined text-primary">contact_mail</span>
                Contact & Address
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-text-main" htmlFor="phone">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </span>
                    <input 
                        className="w-full rounded-lg border-border-light bg-background-light pl-10 px-3 py-2 text-sm placeholder-text-muted shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card text-text-main" 
                        id="phone" 
                        placeholder="082 123 4567" 
                        type="tel"
                        value={formData.phone}
                        onChange={e => updateField('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-text-main" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </span>
                    <input 
                        className="w-full rounded-lg border-border-light bg-background-light pl-10 px-3 py-2 text-sm placeholder-text-muted shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card text-text-main" 
                        id="email" 
                        placeholder="name@example.co.za" 
                        type="email"
                        value={formData.email}
                        onChange={e => updateField('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-sm font-medium text-text-main" htmlFor="address">Street Address</label>
                  <input 
                    className="w-full rounded-lg border-border-light bg-background-light px-3 py-2 text-sm placeholder-text-muted shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card text-text-main" 
                    id="address" 
                    placeholder="123 Main Road" 
                    type="text"
                    value={formData.address}
                    onChange={e => updateField('address', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-text-main" htmlFor="suburb">Suburb / City</label>
                  <input 
                    className="w-full rounded-lg border-border-light bg-background-light px-3 py-2 text-sm placeholder-text-muted shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card text-text-main" 
                    id="suburb" 
                    placeholder="e.g. Centurion" 
                    type="text"
                    value={formData.suburb}
                    onChange={e => updateField('suburb', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-text-main" htmlFor="postal_code">Postal Code</label>
                  <input 
                    className="w-full rounded-lg border-border-light bg-background-light px-3 py-2 text-sm placeholder-text-muted shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-card text-text-main" 
                    id="postal_code" 
                    placeholder="e.g. 0157" 
                    type="text"
                    value={formData.postalCode}
                    onChange={e => updateField('postalCode', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SIDE COLUMN (ACTIONS & TIPS) */}
          <div className="lg:col-span-1 space-y-6">
            {/* ACTION CARD */}
            <div className="sticky top-6 rounded-xl border border-border-light bg-surface-card p-6 shadow-sm">
              <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">Actions</h4>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-hover transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  {id ? 'Update Customer' : 'Save Customer'}
                </button>
                <button 
                  onClick={() => navigate('/customers')}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border-light bg-background-light px-4 py-3 text-sm font-bold text-text-main hover:bg-surface-card transition-colors"
                >
                  Cancel
                </button>
              </div>
              <hr className="my-6 border-border-light"/>
              
              {isOwner && id && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex flex-col gap-2">
                     <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Account Status</p>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-red-900 font-medium">Balance:</span>
                        <span className="text-sm font-black text-red-700">R {customers.find(c => c.id === id)?.balance.toLocaleString()}</span>
                     </div>
                  </div>
              )}

              <div className="flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 p-4 mt-4">
                <span className="material-symbols-outlined text-primary mt-0.5">directions_car</span>
                <div>
                  <p className="text-sm font-semibold text-primary">Tip</p>
                  <p className="text-xs text-text-muted mt-1">
                    Vehicles are managed within the specific job card or quote creation process for this customer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};