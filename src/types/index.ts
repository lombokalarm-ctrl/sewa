export type RentalType = 'daily' | 'monthly';
export type TransactionStatus = 'active' | 'completed';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface RentalItem {
  id: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
}

export interface Extension {
  id: string;
  duration: number; // in days or months
  additionalCost: number;
  dateAdded: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string; // 'cash' | 'transfer'
}

export interface Transaction {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: RentalItem[];
  rentalType: RentalType;
  duration: number;
  startDate: string;
  endDate: string;
  depositAmount: number;
  totalCost: number;
  status: TransactionStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  extensions: Extension[];
  payments: Payment[];
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  totalStock: number;
  availableStock: number;
  dailyRate: number;
  monthlyRate: number;
}

export interface CompanySettings {
  name: string;
  address: string;
  city: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  termsAndConditions: string;
}
