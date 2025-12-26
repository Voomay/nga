
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export interface User {
  id: string;
  ownerId?: string; // Links staff to their workshop owner
  name: string;
  role: 'Owner' | 'Staff' | 'Service Advisor' | 'Technician';
  email: string;
  avatar: string;
  workshopName: string;
  workshopLogo: string;
  workshopEmail?: string;
  workshopPhone?: string;
  workshopAddress?: string;
  workshopVat?: string;
  // Trial & Subscription
  trialStartDate?: string;
  subscriptionPlanId?: string;
  // Banking Details
  workshopBankName?: string;
  workshopAccountName?: string;
  workshopAccountNumber?: string;
  workshopBranchCode?: string;
  // Branding
  workshopBrandColor?: string;
  themePreference?: 'light' | 'dark';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, workshopName: string, selectedPlanId: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (updates: Partial<User>) => void;
  addStaffMember: (name: string, email: string, pass: string, role: User['role']) => Promise<boolean>;
  deleteStaffMember: (staffId: string) => void;
  getStaffMembers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCKOUT_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 minutes

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem('autofix_session');
    if (storedSession) {
      setUser(JSON.parse(storedSession));
    }
    setLoading(false);
  }, []);

  const saveUserSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem('autofix_session', JSON.stringify(userData));
  };

  const getLockoutStatus = (email: string) => {
    const data = localStorage.getItem(`autofix_lockout_${email.toLowerCase()}`);
    if (!data) return { attempts: 0, lockedUntil: 0 };
    return JSON.parse(data);
  };

  const updateLockoutStatus = (email: string, attempts: number, lockedUntil: number) => {
    localStorage.setItem(`autofix_lockout_${email.toLowerCase()}`, JSON.stringify({ attempts, lockedUntil }));
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const status = getLockoutStatus(email);
    
    if (status.lockedUntil > Date.now()) {
      const remainingSecs = Math.ceil((status.lockedUntil - Date.now()) / 1000);
      return { 
        success: false, 
        error: `Account locked. Please try again in ${remainingSecs} seconds.` 
      };
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    const usersStr = localStorage.getItem('autofix_users_db');
    const users = usersStr ? JSON.parse(usersStr) : [];
    
    const foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);

    if (foundUser) {
      updateLockoutStatus(email, 0, 0);
      const { password, ...safeUser } = foundUser;
      saveUserSession(safeUser);
      return { success: true };
    } else {
      const newAttempts = status.attempts + 1;
      let lockedUntil = 0;
      let error = 'Invalid email or password.';

      if (newAttempts >= LOCKOUT_ATTEMPTS) {
        lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        error = 'Too many failed attempts. You are locked out for 2 minutes.';
      } else {
        error = `Invalid credentials. ${LOCKOUT_ATTEMPTS - newAttempts} attempts remaining.`;
      }
      
      updateLockoutStatus(email, newAttempts, lockedUntil);
      return { success: false, error };
    }
  };

  const signup = async (name: string, email: string, password: string, workshopName: string, selectedPlanId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const usersStr = localStorage.getItem('autofix_users_db');
    const users = usersStr ? JSON.parse(usersStr) : [];

    if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return false; 
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password,
      role: 'Owner' as const,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d51b0&color=fff`,
      workshopName,
      workshopLogo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0pgWqppCcwgb2FFTg0_b2OYAW5IGj6R26nRfi8pXyppAJB84DnZXzw1h7EAaXYNgIajnQwR6gbHfFwxu7Vr4Wv8Txnsj2qTT7T-FSsgwBjKbNFAQQ_WudlDIcbDJ-xACxNHvSebY5mthRol38dwgVbW8MFHIezfjxlFB8lQgEV7MJrPPKhBZIsHX005Zapbk0PPR5ugnw0ws-27rKs_bp4M7WL1eTr4yEEBWNQ7As9jSQssBjyGerqS3O6uP5_X1dUHkngSyvXPo",
      workshopAddress: "123 Workshop Lane, Industrial Area, Cape Town, 8001",
      workshopPhone: "021 555 0123",
      workshopEmail: "service@autofix.pro",
      workshopVat: "4500123456",
      workshopBrandColor: "#0d51b0",
      themePreference: 'light' as const,
      workshopBankName: "Standard Bank",
      workshopAccountName: workshopName,
      workshopAccountNumber: "123456789",
      workshopBranchCode: "051001",
      trialStartDate: new Date().toISOString(),
      subscriptionPlanId: selectedPlanId
    };

    users.push(newUser);
    localStorage.setItem('autofix_users_db', JSON.stringify(users));
    localStorage.setItem(`autofix_seed_pending_${newUser.id}`, 'true');

    const { password: p, ...safeUser } = newUser;
    saveUserSession(safeUser);
    return true;
  };

  const addStaffMember = async (name: string, email: string, pass: string, role: User['role']): Promise<boolean> => {
    if (!user || user.role !== 'Owner') return false;

    const usersStr = localStorage.getItem('autofix_users_db');
    const users = usersStr ? JSON.parse(usersStr) : [];

    if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }

    const newStaff = {
      id: Math.random().toString(36).substr(2, 9),
      ownerId: user.id,
      name,
      email,
      password: pass,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
      workshopName: user.workshopName,
      workshopLogo: user.workshopLogo,
      workshopEmail: user.workshopEmail,
      workshopPhone: user.workshopPhone,
      workshopAddress: user.workshopAddress,
      workshopVat: user.workshopVat,
      workshopBrandColor: user.workshopBrandColor,
      themePreference: user.themePreference,
      workshopBankName: user.workshopBankName,
      workshopAccountName: user.workshopAccountName,
      workshopAccountNumber: user.workshopAccountNumber,
      workshopBranchCode: user.workshopBranchCode,
      trialStartDate: user.trialStartDate,
      subscriptionPlanId: user.subscriptionPlanId
    };

    users.push(newStaff);
    localStorage.setItem('autofix_users_db', JSON.stringify(users));
    return true;
  };

  const deleteStaffMember = (staffId: string) => {
    const usersStr = localStorage.getItem('autofix_users_db');
    if (!usersStr) return;
    const users = JSON.parse(usersStr);
    const updated = users.filter((u: any) => u.id !== staffId);
    localStorage.setItem('autofix_users_db', JSON.stringify(updated));
  };

  const getStaffMembers = (): User[] => {
    if (!user || user.role !== 'Owner') return [];
    const usersStr = localStorage.getItem('autofix_users_db');
    if (!usersStr) return [];
    const users = JSON.parse(usersStr);
    return users.filter((u: any) => u.ownerId === user.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('autofix_session');
    document.documentElement.style.setProperty('--color-primary', '13 81 176');
    document.documentElement.classList.remove('dark');
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    saveUserSession(updatedUser);

    const usersStr = localStorage.getItem('autofix_users_db');
    if (usersStr) {
      const users = JSON.parse(usersStr);
      const index = users.findIndex((u: any) => u.id === user.id);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem('autofix_users_db', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, signup, logout, isAuthenticated: !!user, 
      updateUserProfile, addStaffMember, deleteStaffMember, getStaffMembers 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
