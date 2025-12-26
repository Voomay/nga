
import React, { useRef, useState, useEffect } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { useData } from '../context/DataContext';
import { useAuth, User } from '../context/AuthContext';
import { Technician } from '../types';

export const Settings: React.FC = () => {
  const { user, updateUserProfile, addStaffMember, deleteStaffMember, getStaffMembers } = useAuth();
  const { 
    logo, name, email, phone, address, vat,
    bankName, accountName, accountNumber, branchCode,
    brandColor, theme,
    updateLogo, updateName, updateEmail, updatePhone, updateAddress, updateVat,
    updateBankName, updateAccountName, updateAccountNumber, updateBranchCode,
    updateBrandColor, toggleTheme
  } = useWorkshop();
  const { 
    resetData, inventoryCategories, addInventoryCategory, deleteInventoryCategory, 
    technicians, addTechnician, deleteTechnician 
  } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newCategory, setNewCategory] = useState('');
  const [newTechName, setNewTechName] = useState('');
  const [newTechRole, setNewTechRole] = useState('');
  
  // Team Management State
  const [staffList, setStaffList] = useState<User[]>([]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'Staff' as User['role'] });
  const [staffError, setStaffError] = useState('');

  useEffect(() => {
    if (user?.role === 'Owner') {
      setStaffList(getStaffMembers());
    }
  }, [user]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
      if (newCategory.trim()) {
          addInventoryCategory(newCategory.trim());
          setNewCategory('');
      }
  };

  const handleAddTechnician = () => {
      if (newTechName.trim()) {
          const tech: Technician = {
              id: Math.random().toString(36).substr(2, 9),
              name: newTechName.trim(),
              role: newTechRole.trim() || 'Technician'
          };
          addTechnician(tech);
          setNewTechName('');
          setNewTechRole('');
      }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    if (!staffForm.name || !staffForm.email || !staffForm.password) {
      setStaffError('Please fill in all fields.');
      return;
    }
    const success = await addStaffMember(staffForm.name, staffForm.email, staffForm.password, staffForm.role);
    if (success) {
      setStaffList(getStaffMembers());
      setIsAddingStaff(false);
      setStaffForm({ name: '', email: '', password: '', role: 'Staff' });
    } else {
      setStaffError('User with this email already exists.');
    }
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm('Are you sure you want to remove this staff member? They will no longer be able to log in.')) {
      deleteStaffMember(id);
      setStaffList(getStaffMembers());
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1000px] mx-auto w-full pb-20">
      <h1 className="text-3xl font-black text-text-main mb-8">Settings</h1>

      <div className="bg-surface-card rounded-2xl border border-border-light shadow-sm p-6 md:p-8 flex flex-col gap-10 transition-colors duration-200">
        
        {/* Account Profile Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">account_circle</span>
            </div>
            <h2 className="text-xl font-bold text-text-main">Account Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background-light p-6 rounded-xl border border-border-light">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">Account Holder Name</label>
              <input 
                type="text" 
                value={user?.name || ''}
                onChange={(e) => updateUserProfile({ name: e.target.value })}
                className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card text-text-main focus:ring-primary focus:border-primary font-semibold"
                placeholder="Enter your full name"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="w-full h-12 px-4 rounded-lg border border-border-light bg-slate-100 text-text-muted cursor-not-allowed font-medium"
                  placeholder="your@email.com"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted text-[18px]">lock</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border-light w-full"></div>

        {/* Technician Registry - NEW SECTION */}
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <span className="material-symbols-outlined">engineering</span>
                </div>
                <h2 className="text-xl font-bold text-text-main">Technician Registry</h2>
            </div>
            <div className="flex flex-col gap-6">
                <div className="p-5 rounded-xl border border-border-light bg-background-light/50 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Register New Technician</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input 
                            type="text"
                            placeholder="Full Name"
                            value={newTechName}
                            onChange={(e) => setNewTechName(e.target.value)}
                            className="h-11 px-4 rounded-lg border border-border-light bg-surface-card text-text-main focus:ring-primary focus:border-primary"
                        />
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                placeholder="Specialty (e.g. Electrical)"
                                value={newTechRole}
                                onChange={(e) => setNewTechRole(e.target.value)}
                                className="flex-1 h-11 px-4 rounded-lg border border-border-light bg-surface-card text-text-main focus:ring-primary focus:border-primary"
                            />
                            <button 
                                onClick={handleAddTechnician}
                                className="px-6 h-11 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors shadow-sm"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {technicians.length === 0 ? (
                        <p className="text-sm text-text-muted italic p-4 text-center border border-dashed border-border-light rounded-lg">No technicians registered yet.</p>
                    ) : (
                        technicians.map(tech => (
                            <div key={tech.id} className="flex items-center justify-between p-4 rounded-xl border border-border-light bg-surface-card hover:border-primary/30 transition-all group shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                                        {tech.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-text-main">{tech.name}</span>
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{tech.role}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => deleteTechnician(tech.id)}
                                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all p-1"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <p className="text-[11px] text-text-muted italic px-1">Registered technicians appear in the "Assign Technician" dropdown when creating job cards.</p>
            </div>
        </div>

        <div className="h-px bg-border-light w-full"></div>

        {/* Team Management Section - Only for Owners */}
        {user?.role === 'Owner' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <h2 className="text-xl font-bold text-text-main">System Access (Staff)</h2>
              </div>
              <button 
                onClick={() => setIsAddingStaff(!isAddingStaff)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-hover transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">{isAddingStaff ? 'close' : 'add'}</span>
                {isAddingStaff ? 'Cancel' : 'Add Login Staff'}
              </button>
            </div>

            {isAddingStaff && (
              <form onSubmit={handleCreateStaff} className="mb-8 p-6 rounded-xl border-2 border-primary/20 bg-primary/5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Create Staff Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="h-10 px-3 rounded-lg border border-border-light text-sm bg-surface-card"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="h-10 px-3 rounded-lg border border-border-light text-sm bg-surface-card"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  />
                  <input 
                    type="password" 
                    placeholder="Login Password" 
                    className="h-10 px-3 rounded-lg border border-border-light text-sm bg-surface-card"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  />
                  <select 
                    className="h-10 px-3 rounded-lg border border-border-light text-sm bg-surface-card"
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                  >
                    <option value="Staff">General Staff</option>
                    <option value="Service Advisor">Service Advisor</option>
                    <option value="Technician">Technician</option>
                  </select>
                </div>
                {staffError && <p className="text-xs text-red-600 font-bold">{staffError}</p>}
                <button type="submit" className="self-end px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:shadow-md transition-all">Create Account</button>
              </form>
            )}

            <div className="grid grid-cols-1 gap-3">
              {staffList.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border-light rounded-xl bg-background-light/50">
                  <span className="material-symbols-outlined text-4xl text-slate-300">person_add</span>
                  <p className="text-sm text-text-muted mt-2">No staff logins created yet.</p>
                </div>
              ) : (
                staffList.map(staff => (
                  <div key={staff.id} className="flex items-center justify-between p-4 rounded-xl border border-border-light bg-surface-card hover:bg-background-light transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full border border-border-light bg-slate-100 flex items-center justify-center overflow-hidden">
                        <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-main">{staff.name}</span>
                        <span className="text-xs text-text-muted">{staff.role} • {staff.email}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Remove Access"
                    >
                      <span className="material-symbols-outlined text-[20px]">person_remove</span>
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="h-px bg-border-light w-full mt-10"></div>
          </div>
        )}

        {/* Workshop Branding Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">palette</span>
            </div>
            <h2 className="text-xl font-bold text-text-main">Workshop Branding</h2>
          </div>
          <div className="flex flex-col gap-8">
            {/* Logo Section */}
            <div className="flex flex-col gap-4">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Company Logo</label>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="h-24 w-auto min-w-[96px] max-w-[300px] p-2 rounded-2xl bg-background-light border border-border-light shadow-inner flex items-center justify-center">
                  <img 
                    src={logo} 
                    alt="Current Logo" 
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                    >
                      Upload Logo
                    </button>
                    <button 
                      onClick={() => updateLogo("https://lh3.googleusercontent.com/aida-public/AB6AXuB0pgWqppCcwgb2FFTg0_b2OYAW5IGj6R26nRfi8pXyppAJB84DnZXzw1h7EAaXYNgIajnQwR6gbHfFwxu7Vr4Wv8Txnsj2qTT7T-FSsgwBjKbNFAQQ_WudlDIcbDJ-xACxNHvSebY5mthRol38dwgVbW8MFHIezfjxlFB8lQgEV7MJrPPKhBZIsHX005Zapbk0PPR5ugnw0ws-27rKs_bp4M7WL1eTr4yEEBWNQ7As9jSQssBjyGerqS3O6uP5_X1dUHkngSyvXPo")}
                      className="px-4 py-2 bg-surface-card border border-border-light text-text-muted text-sm font-bold rounded-lg hover:bg-background-light transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div className="flex flex-col gap-4">
               <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Appearance</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Color Picker */}
                   <div className="flex items-center gap-4 p-4 rounded-xl border border-border-light bg-background-light/50">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={brandColor}
                          onChange={(e) => updateBrandColor(e.target.value)}
                          className="size-12 p-1 rounded-lg border border-border-light bg-surface-card cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-sm font-bold text-text-main">Brand Color</span>
                         <p className="text-xs text-text-muted">Used for PDFs and buttons.</p>
                      </div>
                   </div>

                   {/* Dark Mode Toggle */}
                   <div className="flex items-center justify-between p-4 rounded-xl border border-border-light bg-background-light/50">
                      <div className="flex items-center gap-3">
                         <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-indigo-900 text-indigo-300' : 'bg-amber-100 text-amber-600'}`}>
                            <span className="material-symbols-outlined">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-sm font-bold text-text-main">Dark Mode</span>
                             <p className="text-xs text-text-muted">{theme === 'dark' ? 'On' : 'Off'}</p>
                         </div>
                      </div>
                      <button 
                        onClick={toggleTheme}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50 ${theme === 'dark' ? 'bg-primary' : 'bg-slate-300'}`}
                      >
                        <span 
                            className={`absolute top-1 left-1 bg-white size-6 rounded-full shadow transition-transform duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}
                        />
                      </button>
                   </div>
               </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border-light w-full"></div>

        {/* Banking Details Section */}
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined">account_balance</span>
                </div>
                <h2 className="text-xl font-bold text-text-main">Banking Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background-light p-6 rounded-xl border border-border-light">
                <div>
                    <label className="block text-sm font-bold text-text-main mb-2">Bank Name</label>
                    <input 
                        type="text" 
                        value={bankName}
                        onChange={(e) => updateBankName(e.target.value)}
                        className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card text-text-main focus:ring-primary focus:border-primary"
                        placeholder="e.g. Standard Bank"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-text-main mb-2">Account Name</label>
                    <input 
                        type="text" 
                        value={accountName}
                        onChange={(e) => updateAccountName(e.target.value)}
                        className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card text-text-main focus:ring-primary focus:border-primary"
                        placeholder="e.g. AutoFix Pro"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-text-main mb-2">Account Number</label>
                    <input 
                        type="text" 
                        value={accountNumber}
                        onChange={(e) => updateAccountNumber(e.target.value)}
                        className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card text-text-main focus:ring-primary focus:border-primary font-mono"
                        placeholder="123456789"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-text-main mb-2">Branch Code</label>
                    <input 
                        type="text" 
                        value={branchCode}
                        onChange={(e) => updateBranchCode(e.target.value)}
                        className="w-full h-12 px-4 rounded-lg border border-border-light bg-surface-card text-text-main focus:ring-primary focus:border-primary font-mono"
                        placeholder="051001"
                    />
                </div>
            </div>
        </div>

        <div className="h-px bg-border-light w-full"></div>

        {/* Data Management Section */}
        <div>
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <span className="material-symbols-outlined">database</span>
              </div>
              <h2 className="text-xl font-bold text-text-main">Database Management</h2>
           </div>
           <div className="flex flex-col gap-4">
              <div className="p-5 rounded-xl bg-red-50/30 border border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                    <h3 className="text-sm font-bold text-red-900">Demo Content Reset</h3>
                    <p className="text-xs text-red-700/80 mt-1">This will permanently delete all your existing jobs, quotes, and customers and replace them with the sample dataset.</p>
                 </div>
                 <button 
                  onClick={resetData}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white text-sm font-bold rounded-lg transition-all shadow-sm whitespace-nowrap"
                 >
                   <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                   Reset to Demo Data
                 </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
