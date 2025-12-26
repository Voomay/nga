
export interface LineItem {
  id: string;
  type: 'Part' | 'Labor' | 'Repair';
  description: string;
  subText?: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
}

export interface Quote {
  id: string;
  number: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  vehicle: string;
  regNo: string;
  vin?: string;
  odo?: string;
  amount: number;
  items?: LineItem[];
  notes?: string;
  status: 'Draft' | 'Accepted' | 'Rejected';
}

export interface JobCard {
  id: string;
  jobId: string;
  vehicleReg: string;
  vehicleName: string;
  vehicleVin?: string;
  vehicleOdometer?: string;
  fuelLevel?: string;
  fuelType?: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  customerInitials: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  technicianName: string;
  technicianAvatar: string;
  status: 'In Progress' | 'Waiting Parts' | 'Completed' | 'Booked';
  progress: number;
  statusText: string;
  statusColor: 'blue' | 'amber' | 'emerald' | 'slate';
  priority?: string;
  jobType?: string;
  estCompletion?: string;
  customerRequest?: string;
  tasks?: { id: string; description: string; completed: boolean }[];
  images?: string[];
}

export interface Technician {
  id: string;
  name: string;
  role?: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  customerName: string;
  vehicleReg: string;
  vehicleMake: string;
  amount: number;
  balance: number;
  paidAmount: number;
  status: 'Paid' | 'Partial' | 'Overdue' | 'Sent' | 'Outstanding' | 'Pending Verification';
  items?: { id: string; description: string; type: string; qty: number; unitPrice: number }[];
}

export interface InventoryItem {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  supplier: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  lowStockAlert: number;
  binLocation?: string;
  images?: string[];
  transactions?: InventoryTransaction[];
}

export interface InventoryTransaction {
  id: string;
  type: 'Stock In' | 'Issue' | 'Adjustment';
  qty: number;
  userName: string;
  destination: string;
  timestamp: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  isBusiness: boolean;
  email: string;
  phone: string;
  address?: string;
  suburb?: string;
  province?: string;
  postalCode?: string;
  vatNumber?: string;
  vehicles?: string[];
  balance: number;
  status: 'Active' | 'Inactive';
}

export interface Activity {
  id: string;
  type: 'Quote' | 'Job' | 'Invoice' | 'Stock' | 'Customer' | 'Support' | 'Payment';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  link?: string;
}

export interface SupportTicket {
  id: string;
  workshopId: string;
  workshopName: string;
  userName: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Pending Response' | 'In Progress' | 'Resolved';
  createdAt: string;
  updatedAt: string;
  description: string;
  messages: {
    id: string;
    senderName: string;
    role: 'Owner' | 'Admin';
    content: string;
    timestamp: string;
  }[];
}

export interface PaymentVerification {
  id: string;
  workshopId: string;
  workshopName: string;
  planId: string;
  amount: number;
  reference: string;
  popImage: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: string;
  notes?: string;
}

export interface AdminBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  paymentInstructions: string;
}

export interface PlatformInvoice {
  id: string;
  workshopId: string;
  number: string;
  date: string;
  planName: string;
  duration: string;
  amount: number;
  status: 'Paid' | 'Outstanding';
}
