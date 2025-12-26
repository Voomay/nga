
import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import { Quote, JobCard, Invoice, InventoryItem, Customer, InventoryTransaction, Technician, Activity, SupportTicket, PaymentVerification, AdminBankDetails, PlatformInvoice } from '../types';
import { useAuth, User } from './AuthContext';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  duration: 'Monthly' | 'Yearly' | '3-Year';
  description: string;
  features: string[];
  popular: boolean;
  status: 'Active' | 'Inactive';
}

interface AdminConfig {
  showPricingOnLanding: boolean;
  showPricingInConsole: boolean;
}

interface BillingAlert {
  type: 'info' | 'warning' | 'critical';
  message: string;
  status: string;
  isLocked: boolean;
}

interface DataContextType {
  quotes: Quote[];
  addQuote: (quote: Quote) => void;
  updateQuote: (quote: Quote) => void;
  deleteQuote: (id: string) => void;

  jobCards: JobCard[];
  addJobCard: (job: JobCard) => void;
  updateJobCard: (job: JobCard) => void;
  deleteJobCard: (id: string) => void;

  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;

  inventory: InventoryItem[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  bookOutInventory: (itemId: string, qty: number, userName: string, destination: string) => void;

  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;

  technicians: Technician[];
  addTechnician: (tech: Technician) => void;
  deleteTechnician: (id: string) => void;

  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;

  inventoryCategories: string[];
  addInventoryCategory: (category: string) => void;
  deleteInventoryCategory: (category: string) => void;

  tickets: SupportTicket[];
  addTicket: (ticket: SupportTicket) => void;
  updateTicket: (ticket: SupportTicket) => void;
  deleteTicket: (id: string) => void;

  systemBankDetails: AdminBankDetails;
  updateSystemBankDetails: (details: AdminBankDetails) => void;
  paymentVerifications: PaymentVerification[];
  submitPaymentVerification: (pop: Omit<PaymentVerification, 'id' | 'status' | 'timestamp'>) => void;
  updatePaymentVerificationStatus: (id: string, status: 'Approved' | 'Rejected', notes?: string) => void;
  
  availablePlans: SubscriptionPlan[];
  updateAvailablePlans: (plans: SubscriptionPlan[]) => void;

  platformInvoices: PlatformInvoice[];
  
  // Admin Config
  adminConfig: AdminConfig;
  updateAdminConfig: (updates: Partial<AdminConfig>) => void;

  // Billing Cycle Logic
  billingAlert: BillingAlert | null;
  getWorkshopSubscriptionStatus: (targetUser: User) => string;

  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultPlans: SubscriptionPlan[] = [
  { id: 'plan-monthly', name: 'Monthly Plan', price: '450', duration: 'Monthly', description: 'Perfect for regular cash-flow management.', features: ['Full Access', 'Unlimited Jobs', 'Unlimited Invoices'], popular: false, status: 'Active' },
  { id: 'plan-yearly', name: 'Annual Precision', price: '4500', duration: 'Yearly', description: 'Save 15% with annual billing.', features: ['Full Access', 'Priority Support', 'Cloud Backup'], popular: true, status: 'Active' },
  { id: 'plan-3year', name: 'Enterprise Legend', price: '12000', duration: '3-Year', description: 'Lock in price for 3 years.', features: ['Full Access', 'Dedicated Manager', 'Beta Access'], popular: false, status: 'Active' }
];

const defaultBankDetails: AdminBankDetails = {
  bankName: 'FNB Business',
  accountName: 'AutoFix Pro Solutions',
  accountNumber: '62012345678',
  branchCode: '250655',
  paymentInstructions: 'Please use your Workshop ID as the payment reference. Upload your POP below for immediate verification.'
};

const initialCategories = ['Engine', 'Filters', 'Braking', 'Electrical', 'Body', 'Suspension', 'Fluids', 'General', 'Tyres'];

const getOwnerData = () => {
  const now = new Date();
  const getRelativeDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const seedCustomers: Customer[] = [
    { id: 'c1', firstName: 'John', lastName: 'Smit', isBusiness: true, companyName: 'Cape Logistics', email: 'john@capelog.co.za', phone: '021 555 1234', address: '12 Industrial Way, Paarden Eiland', balance: 0, status: 'Active', vehicles: ['Isuzu NPR 400', 'Toyota Hilux'] },
    { id: 'c2', firstName: 'Sarah', lastName: 'Williams', isBusiness: false, email: 'sarah.w@gmail.com', phone: '082 991 0022', address: '42 Oak Street, Constantia', balance: 8500, status: 'Active', vehicles: ['BMW X5 xDrive'] },
    { id: 'c3', firstName: 'Michael', lastName: 'Chen', isBusiness: true, companyName: 'Mobi-Rent South', email: 'm.chen@mobirent.com', phone: '011 442 8899', address: 'Unit 4, Sandton Square', balance: 0, status: 'Active', vehicles: ['VW Polo Vivo', 'VW Golf 8 GTI'] },
    { id: 'c4', firstName: 'David', lastName: 'Muller', isBusiness: false, email: 'david.m@outlook.com', phone: '071 555 6677', address: '18 Beach Rd, Sea Point', balance: 0, status: 'Active', vehicles: ['Mercedes C200'] },
    { id: 'c5', firstName: 'Nomvula', lastName: 'Khumalo', isBusiness: true, companyName: 'Bright Spark Electrical', email: 'info@brightspark.co.za', phone: '031 222 3344', address: '88 West St, Durban', balance: 1250, status: 'Active', vehicles: ['Ford Ranger'] },
    { id: 'c6', firstName: 'Pieter', lastName: 'Botha', isBusiness: false, email: 'pieterb@mweb.co.za', phone: '083 445 1122', address: '10 Mountain View, Stellenbosch', balance: 0, status: 'Active', vehicles: ['Toyota Land Cruiser 300'] },
    { id: 'c7', firstName: 'Fleet', lastName: 'Manager', isBusiness: true, companyName: 'DHL Express Paarl', email: 'paarl.fleet@dhl.com', phone: '021 887 9000', address: 'Main Rd, Paarl', balance: 45000, status: 'Active', vehicles: ['Mercedes Sprinter 515', 'Mercedes Sprinter 313'] }
  ];

  const categoriesList = ['Engine', 'Filters', 'Braking', 'Electrical', 'Fluids', 'Suspension'];
  const suppliers = ['GUD Filters', 'Goldwagen', 'Masterparts', 'AutoZone', 'TotalEnergies'];
  const seedInventory: InventoryItem[] = [];

  for (let i = 1; i <= 55; i++) {
    const cat = categoriesList[i % categoriesList.length];
    const sup = suppliers[i % suppliers.length];
    const cost = Math.floor(Math.random() * 2000) + 100;
    seedInventory.push({
      id: `inv-${i}`,
      partNumber: `${cat.substring(0, 3).toUpperCase()}-${1000 + i}`,
      name: `${cat} Component Part #${i} (${sup})`,
      category: cat,
      supplier: sup,
      costPrice: cost,
      sellingPrice: cost * 1.6,
      stock: Math.floor(Math.random() * 20) + 1,
      lowStockAlert: 5,
      binLocation: `Shelf-${String.fromCharCode(65 + (i % 6))}${i % 10}`,
      transactions: []
    });
  }

  seedInventory[0] = { id: 'oil-1', partNumber: 'TOT-5W40-20L', name: 'Total Quartz 9000 5W40 (20L)', category: 'Fluids', supplier: 'TotalEnergies', costPrice: 1800, sellingPrice: 3200, stock: 4, lowStockAlert: 5, binLocation: 'Bulk-01' };
  seedInventory[1] = { id: 'filt-1', partNumber: 'GUD-Z122', name: 'Oil Filter Z122 (GUD)', category: 'Filters', supplier: 'GUD Filters', costPrice: 85, sellingPrice: 145, stock: 2, lowStockAlert: 10, binLocation: 'A-12' };
  seedInventory[2] = { id: 'brake-1', partNumber: 'ATE-6027', name: 'Front Brake Pads (ATE)', category: 'Braking', supplier: 'Masterparts', costPrice: 650, sellingPrice: 1150, stock: 8, lowStockAlert: 4, binLocation: 'B-04' };

  const seedQuotes: Quote[] = [];
  for (let i = 1; i <= 20; i++) {
    const cust = seedCustomers[i % seedCustomers.length];
    seedQuotes.push({
      id: `q-seed-${i}`,
      number: `Q-24-${900 + i}`,
      date: getRelativeDate(i),
      customerName: cust.isBusiness ? cust.companyName! : `${cust.firstName} ${cust.lastName}`,
      customerPhone: cust.phone,
      vehicle: cust.vehicles![0],
      regNo: `CA ${100 + i}-${999 - i}`,
      amount: Math.floor(Math.random() * 15000) + 2000,
      status: i % 3 === 0 ? 'Accepted' : i % 5 === 0 ? 'Rejected' : 'Draft'
    });
  }

  const seedInvoices: Invoice[] = [
    { id: 'inv-s1', number: 'INV-24-001', date: getRelativeDate(2), customerName: 'Cape Logistics', vehicleReg: 'CA 882-901', vehicleMake: 'Isuzu NPR', amount: 12500, balance: 0, paidAmount: 12500, status: 'Paid' },
    { id: 'inv-s2', number: 'INV-24-002', date: getRelativeDate(5), customerName: 'Sarah Williams', vehicleReg: 'CY 123-999', vehicleMake: 'BMW X5', amount: 8500, balance: 8500, paidAmount: 0, status: 'Overdue' },
    { id: 'inv-s3', number: 'INV-24-003', date: getRelativeDate(8), customerName: 'Bright Spark Electrical', vehicleReg: 'ND 442-110', vehicleMake: 'Ford Ranger', amount: 4500, balance: 1250, paidAmount: 3250, status: 'Partial' },
    { id: 'inv-s4', number: 'INV-24-004', date: getRelativeDate(12), customerName: 'DHL Express Paarl', vehicleReg: 'CJ 991-001', vehicleMake: 'Mercedes Sprinter', amount: 45000, balance: 45000, paidAmount: 0, status: 'Outstanding' }
  ];

  const seedJobs: JobCard[] = [
    { 
      id: 'job-s1', jobId: 'JC-24-401', vehicleReg: 'CA 882-901', vehicleName: 'Toyota Hilux 2.8 GD-6', 
      customerName: 'John Smit', customerInitials: 'JS', customerPhone: '021 555 1234', technicianName: 'Mike Tech', technicianAvatar: '', 
      status: 'In Progress', progress: 65, statusText: '4/6 Tasks', statusColor: 'blue', priority: 'High', jobType: 'Major Service',
      customerRequest: 'Oil change, check rear brakes, and inspect air conditioner noise.',
      estCompletion: getRelativeDate(-1),
      tasks: [
        { id: 't1', description: 'Drain engine oil and replace filter', completed: true },
        { id: 't2', description: 'Inspect brake pads and discs', completed: true },
        { id: 't3', description: 'Replace cabin and air filters', completed: true },
        { id: 't4', description: 'Diagnostic scan for AC font codes', completed: true },
        { id: 't5', description: 'Flush braking system', completed: false },
        { id: 't6', description: 'Wheel alignment and balancing', completed: false }
      ],
      images: [
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800'
      ]
    },
    { 
      id: 'job-s2', jobId: 'JC-24-402', vehicleReg: 'CY 123-999', vehicleName: 'BMW X5 xDrive30d', 
      customerName: 'Sarah Williams', customerInitials: 'SW', customerPhone: '082 991 0022', technicianName: 'Sarah J.', technicianAvatar: '', 
      status: 'Waiting Parts', progress: 30, statusText: '1/4 Tasks', statusColor: 'amber', priority: 'Urgent', jobType: 'Repair',
      customerRequest: 'Air suspension failure warning on dashboard. Vehicle sagging at rear.',
      estCompletion: getRelativeDate(-2),
      tasks: [
        { id: 't1', description: 'Vehicle health check & diagnostics', completed: true },
        { id: 't2', description: 'Remove rear air bags and inspect for leaks', completed: false },
        { id: 't3', description: 'Replace air suspension compressor relay', completed: false },
        { id: 't4', description: 'Calibration of ride height sensors', completed: false }
      ]
    },
    { 
      id: 'job-s3', jobId: 'JC-24-403', vehicleReg: 'ND 442-110', vehicleName: 'Ford Ranger 2.2 XL', 
      customerName: 'Nomvula Khumalo', customerInitials: 'NK', customerPhone: '031 222 3344', technicianName: 'David Muller', technicianAvatar: '', 
      status: 'Completed', progress: 100, statusText: '3/3 Tasks', statusColor: 'emerald', priority: 'Normal', jobType: 'Inspection',
      customerRequest: 'Pre-holiday inspection and safety check.',
      estCompletion: getRelativeDate(1), // Completed recently to show in monthly stats
      tasks: [
        { id: 't1', description: 'Check all fluid levels', completed: true },
        { id: 't2', description: 'Brake performance test', completed: true },
        { id: 't3', description: 'Tyre pressure and depth check', completed: true }
      ]
    }
  ];

  return {
    quotes: seedQuotes,
    jobs: seedJobs,
    invoices: seedInvoices,
    inventory: seedInventory,
    customers: seedCustomers,
    technicians: [
      { id: 'tech-1', name: 'Mike Tech', role: 'Senior Mechanic' },
      { id: 'tech-2', name: 'Sarah J.', role: 'Electrical Specialist' },
      { id: 'tech-3', name: 'David Muller', role: 'Diagnostic Tech' }
    ],
    activities: [
      { id: 'a1', type: 'Support' as const, title: 'Welcome to AutoFix Pro!', description: 'Your workshop environment is now active.', timestamp: new Date().toISOString(), icon: 'celebration', color: 'bg-emerald-50 text-emerald-600' }
    ]
  };
};

const getSeedTickets = (user: any): SupportTicket[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'TR-1001',
      workshopId: user.id,
      workshopName: user.workshopName,
      userName: user.name,
      subject: 'Billing Question regarding Pro Plan',
      category: 'Billing',
      priority: 'Medium',
      status: 'Pending Response',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updatedAt: now,
      description: 'Hi Admin, I noticed the Pro plan is R450. Is there a discount for multiple branches?',
      messages: [
        { id: 'm1', senderName: user.name, role: 'Owner', content: 'Hi Admin, I noticed the Pro plan is R450. Is there a discount for multiple branches?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
        { id: 'm2', senderName: 'Platform Support', role: 'Admin', content: 'Hello! Yes, for 5+ branches we offer a 20% discount on the total subscription. Would you like a custom quote?', timestamp: now }
      ]
    },
    {
      id: 'TR-1002',
      workshopId: user.id,
      workshopName: user.workshopName,
      userName: user.name,
      subject: 'Feature Request: WhatsApp Invoicing',
      category: 'Feature',
      priority: 'Low',
      status: 'Open',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      description: 'Would love to see an option to send quotes directly via WhatsApp API.',
      messages: [
        { id: 'm1', senderName: user.name, role: 'Owner', content: 'Would love to see an option to send quotes directly via WhatsApp API.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() }
      ]
    }
  ];
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [inventoryCategories, setInventoryCategories] = useState<string[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const [systemBankDetails, setSystemBankDetails] = useState<AdminBankDetails>(defaultBankDetails);
  const [paymentVerifications, setPaymentVerifications] = useState<PaymentVerification[]>([]);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>(defaultPlans);
  const [platformInvoices, setPlatformInvoices] = useState<PlatformInvoice[]>([]);
  
  const [adminConfig, setAdminConfig] = useState<AdminConfig>({
    showPricingOnLanding: true,
    showPricingInConsole: true
  });

  const getDatabaseId = () => user?.ownerId || user?.id || 'guest';
  const getDataKey = (type: string) => `autofix_${type}_${getDatabaseId()}`;
  
  const GLOBAL_TICKETS_KEY = 'autofix_global_support_tickets';
  const GLOBAL_BANK_KEY = 'autofix_global_bank_details';
  const GLOBAL_PAYMENTS_KEY = 'autofix_global_payment_verifications';
  const GLOBAL_PLANS_KEY = 'autofix_global_subscription_plans';
  const GLOBAL_PLATFORM_INVOICES_KEY = 'autofix_global_platform_invoices';
  const GLOBAL_ADMIN_CONFIG_KEY = 'autofix_global_admin_config';
  const GLOBAL_USERS_KEY = 'autofix_users_db';

  useEffect(() => {
    // Initial seeding logic
    const existingUsers = localStorage.getItem(GLOBAL_USERS_KEY);
    if (!existingUsers) {
      const demoUsers = [
        {
          id: 'demo-owner-1',
          name: 'John Owner',
          email: 'owner@demo.com',
          password: 'demo',
          role: 'Owner',
          avatar: 'https://ui-avatars.com/api/?name=John+Owner&background=0d51b0&color=fff',
          workshopName: 'Supreme Auto Works',
          workshopLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0pgWqppCcwgb2FFTg0_b2OYAW5IGj6R26nRfi8pXyppAJB84DnZXzw1h7EAaXYNgIajnQwR6gbHfFwxu7Vr4Wv8Txnsj2qTT7T-FSsgwBjKbNFAQQ_WudlDIcbDJ-xACxNHvSebY5mthRol38dwgVbW8MFHIezfjxlFB8lQgEV7MJrPPKhBZIsHX005Zapbk0PPR5ugnw0ws-27rKs_bp4M7WL1eTr4yEEBWNQ7As9jSQssBjyGerqS3O6uP5_X1dUHkngSyvXPo',
          subscriptionPlanId: 'plan-monthly',
          workshopPhone: '021 555 0101'
        },
        {
          id: 'demo-advisor-1',
          name: 'Sarah Advisor',
          email: 'sarah@autocare.com',
          password: 'demo',
          role: 'Service Advisor',
          avatar: 'https://ui-avatars.com/api/?name=Sarah+Advisor&background=6366f1&color=fff',
          workshopName: 'City Center Motors',
          workshopLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0pgWqppCcwgb2FFTg0_b2OYAW5IGj6R26nRfi8pXyppAJB84DnZXzw1h7EAaXYNgIajnQwR6gbHfFwxu7Vr4Wv8Txnsj2qTT7T-FSsgwBjKbNFAQQ_WudlDIcbDJ-xACxNHvSebY5mthRol38dwgVbW8MFHIezfjxlFB8lQgEV7MJrPPKhBZIsHX005Zapbk0PPR5ugnw0ws-27rKs_bp4M7WL1eTr4yEEBWNQ7As9jSQssBjyGerqS3O6uP5_X1dUHkngSyvXPo',
          subscriptionPlanId: 'plan-yearly',
          workshopPhone: '031 222 9988'
        }
      ];
      localStorage.setItem(GLOBAL_USERS_KEY, JSON.stringify(demoUsers));
      localStorage.setItem('autofix_seed_pending_demo-owner-1', 'true');
      localStorage.setItem('autofix_seed_pending_demo-advisor-1', 'true');
    }

    if (!user) {
        setQuotes([]); setJobCards([]); setInvoices([]); setInventory([]); setCustomers([]); setInventoryCategories([]); setTechnicians([]); setActivities([]);
        return;
    }

    const savedQuotes = localStorage.getItem(getDataKey('quotes'));
    setQuotes(savedQuotes ? JSON.parse(savedQuotes) : []);
    const savedJobs = localStorage.getItem(getDataKey('jobs'));
    setJobCards(savedJobs ? JSON.parse(savedJobs) : []);
    const savedInvoices = localStorage.getItem(getDataKey('invoices'));
    setInvoices(savedInvoices ? JSON.parse(savedInvoices) : []);
    const savedInventory = localStorage.getItem(getDataKey('inventory'));
    setInventory(savedInventory ? JSON.parse(savedInventory) : []);
    const savedCustomers = localStorage.getItem(getDataKey('customers'));
    setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
    const savedTechs = localStorage.getItem(getDataKey('technicians'));
    setTechnicians(savedTechs ? JSON.parse(savedTechs) : []);
    const savedActs = localStorage.getItem(getDataKey('activities'));
    setActivities(savedActs ? JSON.parse(savedActs) : []);
    const savedCategories = localStorage.getItem(getDataKey('categories'));
    setInventoryCategories(savedCategories ? JSON.parse(savedCategories) : initialCategories);

    const savedTickets = localStorage.getItem(GLOBAL_TICKETS_KEY);
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    } else if (user.role === 'Owner') {
      const initialTickets = getSeedTickets(user);
      setTickets(initialTickets);
      localStorage.setItem(GLOBAL_TICKETS_KEY, JSON.stringify(initialTickets));
    }

    const savedBank = localStorage.getItem(GLOBAL_BANK_KEY);
    if (savedBank) setSystemBankDetails(JSON.parse(savedBank));
    const savedPayments = localStorage.getItem(GLOBAL_PAYMENTS_KEY);
    if (savedPayments) setPaymentVerifications(JSON.parse(savedPayments));
    const savedPlans = localStorage.getItem(GLOBAL_PLANS_KEY);
    if (savedPlans) setAvailablePlans(JSON.parse(savedPlans));
    const savedPlatformInvoices = localStorage.getItem(GLOBAL_PLATFORM_INVOICES_KEY);
    if (savedPlatformInvoices) setPlatformInvoices(JSON.parse(savedPlatformInvoices));
    const savedAdminConfig = localStorage.getItem(GLOBAL_ADMIN_CONFIG_KEY);
    if (savedAdminConfig) setAdminConfig(JSON.parse(savedAdminConfig));

    const seedKey = `autofix_seed_pending_${user.id}`;
    if (localStorage.getItem(seedKey) && (user.role === 'Owner' || user.role === 'Service Advisor')) {
        const initialData = getOwnerData();
        setQuotes(initialData.quotes);
        setJobCards(initialData.jobs);
        setInvoices(initialData.invoices);
        setInventory(initialData.inventory);
        setCustomers(initialData.customers);
        setTechnicians(initialData.technicians);
        setActivities(initialData.activities);
        localStorage.removeItem(seedKey);
    }
  }, [user]);

  // Sync state to storage
  useEffect(() => { if (user) localStorage.setItem(getDataKey('quotes'), JSON.stringify(quotes)); }, [quotes, user]);
  useEffect(() => { if (user) localStorage.setItem(getDataKey('jobs'), JSON.stringify(jobCards)); }, [jobCards, user]);
  useEffect(() => { if (user) localStorage.setItem(getDataKey('invoices'), JSON.stringify(invoices)); }, [invoices, user]);
  useEffect(() => { if (user) localStorage.setItem(getDataKey('inventory'), JSON.stringify(inventory)); }, [inventory, user]);
  useEffect(() => { if (user) localStorage.setItem(getDataKey('customers'), JSON.stringify(customers)); }, [customers, user]);
  useEffect(() => { if (user) localStorage.setItem(getDataKey('technicians'), JSON.stringify(technicians)); }, [technicians, user]);
  useEffect(() => { if (user) localStorage.setItem(getDataKey('activities'), JSON.stringify(activities)); }, [activities, user]);
  useEffect(() => { if (user) localStorage.setItem(getDataKey('categories'), JSON.stringify(inventoryCategories)); }, [inventoryCategories, user]);
  useEffect(() => { localStorage.setItem(GLOBAL_TICKETS_KEY, JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem(GLOBAL_BANK_KEY, JSON.stringify(systemBankDetails)); }, [systemBankDetails]);
  useEffect(() => { localStorage.setItem(GLOBAL_PAYMENTS_KEY, JSON.stringify(paymentVerifications)); }, [paymentVerifications]);
  useEffect(() => { localStorage.setItem(GLOBAL_PLANS_KEY, JSON.stringify(availablePlans)); }, [availablePlans]);
  useEffect(() => { localStorage.setItem(GLOBAL_PLATFORM_INVOICES_KEY, JSON.stringify(platformInvoices)); }, [platformInvoices]);
  useEffect(() => { localStorage.setItem(GLOBAL_ADMIN_CONFIG_KEY, JSON.stringify(adminConfig)); }, [adminConfig]);

  // --- START BILLING ENGINE LOGIC ---
  
  const getWorkshopSubscriptionStatus = (targetUser: User): string => {
    const now = new Date();

    // 1. Check for Active Paid Invoices (Overrides all other logic for the current month)
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const hasPaidInvoiceThisMonth = platformInvoices.some(inv => 
      inv.workshopId === (targetUser.ownerId || targetUser.id) && 
      inv.status === 'Paid' && 
      inv.date.startsWith(currentMonthYear)
    );
    if (hasPaidInvoiceThisMonth) return 'Paid';

    // 2. 7-Day Trial Logic for New Users (Check trial clock before monthly cycles)
    if (targetUser.trialStartDate) {
        const start = new Date(targetUser.trialStartDate).getTime();
        const diffDays = (now.getTime() - start) / (1000 * 60 * 60 * 24);
        
        if (diffDays < 7) {
            return 'Trial'; // Trial takes priority over suspension for first 7 days
        }
        // If past 7 days and NO plan selected -> Trial Expired
        if (!targetUser.subscriptionPlanId) return 'Trial Expired';
    }

    // 3. Subscription Management for Users with Plans (Existing or Post-Trial)
    if (!targetUser.subscriptionPlanId) return 'Inactive';

    const plan = availablePlans.find(p => p.id === targetUser.subscriptionPlanId);
    // Yearly/3-Year plans are generally considered paid for their duration
    if (plan && plan.duration !== 'Monthly') return 'Paid';

    const day = now.getDate();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Monthly cycle logic (for existing users past their 7-day trial)
    if (day >= lastDay - 2 && day <= lastDay) return 'Outstanding';
    if (day === 1 || day === 2) return 'Grace Period';
    if (day >= 3 && day < lastDay - 2) return 'Suspended';

    return 'Paid';
  };

  const billingAlert = useMemo((): BillingAlert | null => {
    if (!user || (user.role !== 'Owner' && user.role !== 'Service Advisor')) return null;
    
    const status = getWorkshopSubscriptionStatus(user);
    
    // Do not show any alerts if currently in the active Trial window
    if (status === 'Trial') return null;

    if (status === 'Trial Expired') {
        return { type: 'critical', status: 'Trial Expired', isLocked: true, message: 'Your 7-day free trial has come to an end. Please select a subscription plan to reactivate your workspace.' };
    }
    if (status === 'Suspended') {
        return { type: 'critical', status: 'Suspended', isLocked: true, message: 'Service Suspended due to non-payment. Please settle the outstanding balance via manual EFT to regain access.' };
    }
    if (status === 'Outstanding') {
        return { type: 'info', status: 'Outstanding', isLocked: false, message: 'Current monthly cycle is ending. Please complete payment to avoid service suspension.' };
    }
    if (status === 'Grace Period') {
        return { type: 'warning', status: 'Grace Period', isLocked: false, message: 'Account is in a 2-day Grace Period. Payment is overdue and access will be suspended on the 3rd.' };
    }
    
    return null;
  }, [user, availablePlans, platformInvoices]);

  // --- END BILLING ENGINE LOGIC ---

  const addActivity = (act: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = { ...act, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() };
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
  };

  const updateSystemBankDetails = (details: AdminBankDetails) => setSystemBankDetails(details);
  const updateAvailablePlans = (plans: SubscriptionPlan[]) => setAvailablePlans(plans);
  const updateAdminConfig = (updates: Partial<AdminConfig>) => setAdminConfig(prev => ({ ...prev, ...updates }));

  const submitPaymentVerification = (pop: Omit<PaymentVerification, 'id' | 'status' | 'timestamp'>) => {
    const newRecord: PaymentVerification = { ...pop, id: `PV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, status: 'Pending', timestamp: new Date().toISOString() };
    setPaymentVerifications(prev => [newRecord, ...prev]);
  };

  const updatePaymentVerificationStatus = (id: string, status: 'Approved' | 'Rejected', notes?: string) => {
    setPaymentVerifications(prev => prev.map(pv => {
      if (pv.id === id) {
        if (status === 'Approved') {
           const usersStr = localStorage.getItem(GLOBAL_USERS_KEY);
           if (usersStr) {
             const allUsers = JSON.parse(usersStr);
             const index = allUsers.findIndex((u: any) => u.id === pv.workshopId);
             if (index !== -1) {
                const plan = availablePlans.find(p => p.id === pv.planId);
                allUsers[index].subscriptionPlanId = pv.planId;
                allUsers[index].trialStartDate = undefined; // Trial over once paid
                localStorage.setItem(GLOBAL_USERS_KEY, JSON.stringify(allUsers));
                
                const invId = `S-INV-${Math.floor(10000 + Math.random() * 90000)}`;
                const newPlatformInvoice: PlatformInvoice = { 
                    id: invId, 
                    workshopId: pv.workshopId, 
                    number: invId, 
                    date: new Date().toISOString().split('T')[0], 
                    planName: plan?.name || 'Plan', 
                    duration: plan?.duration || 'Monthly', 
                    amount: pv.amount, 
                    status: 'Paid' 
                };
                
                setPlatformInvoices(prevInvs => [newPlatformInvoice, ...prevInvs]);
                addActivity({
                    type: 'Payment',
                    title: 'Subscription Activated',
                    description: `Plan: ${plan?.name} cycle verified. Account access fully restored.`,
                    icon: 'verified',
                    color: 'bg-emerald-50 text-emerald-600',
                    link: '/billing'
                });
             }
           }
        }
        return { ...pv, status, notes };
      }
      return pv;
    }));
  };

  const addTicket = (ticket: SupportTicket) => setTickets(prev => [ticket, ...prev]);
  const updateTicket = (updated: SupportTicket) => setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
  const deleteTicket = (id: string) => setTickets(prev => prev.filter(t => t.id !== id));

  const addQuote = (quote: Quote) => setQuotes(prev => [quote, ...prev]);
  const updateQuote = (updated: Quote) => setQuotes(prev => prev.map(q => q.id === updated.id ? updated : q));
  const deleteQuote = (id: string) => setQuotes(prev => prev.filter(q => q.id !== id));

  const addJobCard = (job: JobCard) => setJobCards(prev => [job, ...prev]);
  const updateJobCard = (updated: JobCard) => setJobCards(prev => prev.map(j => j.id === updated.id ? updated : j));
  const deleteJobCard = (id: string) => setJobCards(prev => prev.filter(j => j.id !== id));

  const addInvoice = (inv: Invoice) => setInvoices(prev => [inv, ...prev]);
  const updateInvoice = (updated: Invoice) => setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
  const deleteInvoice = (id: string) => setInvoices(prev => prev.filter(i => i.id !== id));

  const addInventoryItem = (item: InventoryItem) => setInventory(prev => [item, ...prev]);
  const updateInventoryItem = (updated: InventoryItem) => setInventory(prev => prev.map(i => i.id === updated.id ? updated : i));
  const deleteInventoryItem = (id: string) => setInventory(prev => prev.filter(i => i.id !== id));

  const bookOutInventory = (itemId: string, qty: number, userName: string, destination: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.stock - qty);
        const tx: InventoryTransaction = { id: Math.random().toString(36).substr(2, 9), type: 'Issue', qty, userName, destination, timestamp: new Date().toLocaleString() };
        return { ...item, stock: newStock, transactions: [tx, ...(item.transactions || [])] };
      }
      return item;
    }));
  };

  const addCustomer = (customer: Customer) => setCustomers(prev => [customer, ...prev]);
  const updateCustomer = (updated: Customer) => setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
  const deleteCustomer = (id: string) => setCustomers(prev => prev.filter(c => c.id !== id));

  const addTechnician = (tech: Technician) => setTechnicians(prev => [...prev, tech]);
  const deleteTechnician = (id: string) => setTechnicians(prev => prev.filter(t => t.id !== id));

  const addInventoryCategory = (category: string) => { if(!inventoryCategories.includes(category)) setInventoryCategories(prev => [...prev, category].sort()); };
  const deleteInventoryCategory = (category: string) => setInventoryCategories(prev => prev.filter(c => c !== category));

  const resetData = () => {
    if (window.confirm("Reset to deep demo data?")) {
      const initialData = getOwnerData();
      setQuotes(initialData.quotes);
      setJobCards(initialData.jobs);
      setInvoices(initialData.invoices);
      setInventory(initialData.inventory);
      setCustomers(initialData.customers);
      setTechnicians(initialData.technicians);
      setActivities(initialData.activities);
      setInventoryCategories(initialCategories);
      if (user) setTickets(getSeedTickets(user));
    }
  };

  return (
    <DataContext.Provider value={{
      quotes, addQuote, updateQuote, deleteQuote,
      jobCards, addJobCard, updateJobCard, deleteJobCard,
      invoices, addInvoice, updateInvoice, deleteInvoice,
      inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, bookOutInventory,
      customers, addCustomer, updateCustomer, deleteCustomer,
      technicians, addTechnician, deleteTechnician,
      activities, addActivity,
      inventoryCategories, addInventoryCategory, deleteInventoryCategory,
      tickets, addTicket, updateTicket, deleteTicket,
      systemBankDetails, updateSystemBankDetails, paymentVerifications, submitPaymentVerification, updatePaymentVerificationStatus,
      availablePlans, updateAvailablePlans,
      platformInvoices,
      adminConfig, updateAdminConfig,
      billingAlert,
      getWorkshopSubscriptionStatus,
      resetData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
