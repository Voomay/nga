import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface WorkshopContextType {
  logo: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  vat: string;
  // Banking
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  // Branding
  brandColor: string;
  theme: 'light' | 'dark';
  
  updateLogo: (logo: string) => void;
  updateName: (name: string) => void;
  updateEmail: (email: string) => void;
  updatePhone: (phone: string) => void;
  updateAddress: (address: string) => void;
  updateVat: (vat: string) => void;
  // Banking Updaters
  updateBankName: (val: string) => void;
  updateAccountName: (val: string) => void;
  updateAccountNumber: (val: string) => void;
  updateBranchCode: (val: string) => void;
  updateBrandColor: (val: string) => void;
  toggleTheme: () => void;
}

const defaultLogo = "https://lh3.googleusercontent.com/aida-public/AB6AXuB0pgWqppCcwgb2FFTg0_b2OYAW5IGj6R26nRfi8pXyppAJB84DnZXzw1h7EAaXYNgIajnQwR6gbHfFwxu7Vr4Wv8Txnsj2qTT7T-FSsgwBjKbNFAQQ_WudlDIcbDJ-xACxNHvSebY5mthRol38dwgVbW8MFHIezfjxlFB8lQgEV7MJrPPKhBZIsHX005Zapbk0PPR5ugnw0ws-27rKs_bp4M7WL1eTr4yEEBWNQ7As9jSQssBjyGerqS3O6uP5_X1dUHkngSyvXPo";

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

// Helper to convert hex to RGB triplet for Tailwind CSS variables
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '13 81 176'; // Default Fallback
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
};

export const WorkshopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUserProfile } = useAuth();
  
  // Local state
  const [logo, setLogo] = useState<string>(defaultLogo);
  const [name, setName] = useState<string>("AutoFix Pro");
  const [email, setEmail] = useState<string>("service@autofix.pro");
  const [phone, setPhone] = useState<string>("021 555 0123");
  const [address, setAddress] = useState<string>("123 Workshop Lane, Cape Town");
  const [vat, setVat] = useState<string>("");
  
  const [bankName, setBankName] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [branchCode, setBranchCode] = useState<string>("");
  const [brandColor, setBrandColor] = useState<string>("#0d51b0");
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (user) {
      setLogo(user.workshopLogo || defaultLogo);
      setName(user.workshopName || "My Workshop");
      setEmail(user.workshopEmail || "");
      setPhone(user.workshopPhone || "");
      setAddress(user.workshopAddress || "");
      setVat(user.workshopVat || "");
      
      setBankName(user.workshopBankName || "Standard Bank");
      setAccountName(user.workshopAccountName || user.workshopName || "");
      setAccountNumber(user.workshopAccountNumber || "");
      setBranchCode(user.workshopBranchCode || "");
      
      const color = user.workshopBrandColor || "#0d51b0";
      setBrandColor(color);
      // Apply color to CSS variable
      document.documentElement.style.setProperty('--color-primary', hexToRgb(color));

      // Theme
      const userTheme = user.themePreference || 'light';
      setTheme(userTheme);
      applyTheme(userTheme);
    }
  }, [user]);

  const applyTheme = (currentTheme: 'light' | 'dark') => {
      if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  };

  const updateLogo = (newLogo: string) => {
    setLogo(newLogo);
    updateUserProfile({ workshopLogo: newLogo });
  };

  const updateName = (newName: string) => {
    setName(newName);
    updateUserProfile({ workshopName: newName });
  };

  const updateEmail = (newEmail: string) => {
    setEmail(newEmail);
    updateUserProfile({ workshopEmail: newEmail });
  };

  const updatePhone = (newPhone: string) => {
    setPhone(newPhone);
    updateUserProfile({ workshopPhone: newPhone });
  };

  const updateAddress = (newAddress: string) => {
    setAddress(newAddress);
    updateUserProfile({ workshopAddress: newAddress });
  };

  const updateVat = (newVat: string) => {
    setVat(newVat);
    updateUserProfile({ workshopVat: newVat });
  };

  const updateBankName = (val: string) => { setBankName(val); updateUserProfile({ workshopBankName: val }); };
  const updateAccountName = (val: string) => { setAccountName(val); updateUserProfile({ workshopAccountName: val }); };
  const updateAccountNumber = (val: string) => { setAccountNumber(val); updateUserProfile({ workshopAccountNumber: val }); };
  const updateBranchCode = (val: string) => { setBranchCode(val); updateUserProfile({ workshopBranchCode: val }); };
  
  const updateBrandColor = (val: string) => { 
      setBrandColor(val); 
      updateUserProfile({ workshopBrandColor: val });
      document.documentElement.style.setProperty('--color-primary', hexToRgb(val));
  };

  const toggleTheme = () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      applyTheme(newTheme);
      updateUserProfile({ themePreference: newTheme });
  };

  return (
    <WorkshopContext.Provider value={{ 
      logo, name, email, phone, address, vat,
      bankName, accountName, accountNumber, branchCode,
      brandColor, theme,
      updateLogo, updateName, updateEmail, updatePhone, updateAddress, updateVat,
      updateBankName, updateAccountName, updateAccountNumber, updateBranchCode,
      updateBrandColor, toggleTheme
    }}>
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (!context) throw new Error('useWorkshop must be used within a WorkshopProvider');
  return context;
};