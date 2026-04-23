import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, InventoryItem, RentalItem, Extension, RentalType, Payment, PaymentStatus, CompanySettings } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addMonths, parseISO, format } from 'date-fns';

interface AppState {
  transactions: Transaction[];
  inventory: InventoryItem[];
  companySettings: CompanySettings;
  passcode: string;
  isAuthenticated: boolean;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'status' | 'extensions' | 'endDate' | 'totalCost' | 'paymentStatus' | 'amountPaid' | 'payments'> & { initialPayment?: number; initialPaymentMethod?: string }) => string;
  completeTransaction: (id: string) => void;
  extendTransaction: (id: string, additionalDuration: number) => void;
  addPayment: (id: string, amount: number, method: string) => void;
  updateInventoryStock: (id: string, quantityChange: number) => void;
  updateCompanySettings: (settings: CompanySettings) => void;
  login: (code: string) => boolean;
  logout: () => void;
  updatePasscode: (code: string) => void;
}

const initialInventory: InventoryItem[] = [
  { id: '1', name: 'Scaffolding Main Frame 1.9m', totalStock: 100, availableStock: 100, dailyRate: 10000, monthlyRate: 150000 },
  { id: '2', name: 'Scaffolding Main Frame 1.7m', totalStock: 50, availableStock: 50, dailyRate: 9000, monthlyRate: 130000 },
  { id: '3', name: 'Cross Brace 220cm', totalStock: 200, availableStock: 200, dailyRate: 3000, monthlyRate: 45000 },
  { id: '4', name: 'Joint Pin', totalStock: 300, availableStock: 300, dailyRate: 1000, monthlyRate: 15000 },
  { id: '5', name: 'Catwalk (Papan)', totalStock: 80, availableStock: 80, dailyRate: 15000, monthlyRate: 200000 },
  { id: '6', name: 'Jack Base', totalStock: 150, availableStock: 150, dailyRate: 5000, monthlyRate: 75000 },
  { id: '7', name: 'U-Head', totalStock: 150, availableStock: 150, dailyRate: 5000, monthlyRate: 75000 },
];

const defaultCompanySettings: CompanySettings = {
  name: 'SewaScaffolding CV',
  address: 'Jl. Raya Konstruksi No. 123',
  city: 'Jakarta Selatan, 12345',
  phone: '0812-3456-7890',
  bankName: 'BCA',
  bankAccount: '1234567890',
  bankAccountName: 'SewaScaffolding CV',
  termsAndConditions: 'Uang jaminan akan dikembalikan utuh jika barang kembali dalam kondisi baik dan lengkap.\nKerusakan atau kehilangan barang selama masa sewa menjadi tanggung jawab penyewa.\nKeterlambatan pengembalian tanpa pemberitahuan perpanjangan akan dikenakan denda sesuai tarif harian.',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      transactions: [],
      inventory: initialInventory,
      companySettings: defaultCompanySettings,
      passcode: '123456',
      isAuthenticated: false,
      login: (code) => {
        const isValid = get().passcode === code;
        if (isValid) set({ isAuthenticated: true });
        return isValid;
      },
      logout: () => set({ isAuthenticated: false }),
      updatePasscode: (code) => set({ passcode: code }),
      addTransaction: (txData) => {
        const id = uuidv4();
        const createdAt = new Date().toISOString();
        
        let totalCost = 0;
        txData.items.forEach(item => {
          totalCost += item.quantity * item.pricePerUnit * txData.duration;
        });

        const startDateObj = parseISO(txData.startDate);
        const endDateObj = txData.rentalType === 'daily' 
          ? addDays(startDateObj, txData.duration)
          : addMonths(startDateObj, txData.duration);
        
        const initialPaymentAmount = txData.initialPayment || 0;
        const totalRequired = totalCost + txData.depositAmount;
        let paymentStatus: PaymentStatus = 'unpaid';
        if (initialPaymentAmount >= totalRequired) paymentStatus = 'paid';
        else if (initialPaymentAmount > 0) paymentStatus = 'partial';

        const payments: Payment[] = [];
        if (initialPaymentAmount > 0) {
          payments.push({
            id: uuidv4(),
            amount: initialPaymentAmount,
            date: createdAt,
            method: txData.initialPaymentMethod || 'cash'
          });
        }

        const { initialPayment, initialPaymentMethod, ...restTxData } = txData;

        const newTx: Transaction = {
          ...restTxData,
          id,
          createdAt,
          status: 'active',
          extensions: [],
          payments,
          paymentStatus,
          amountPaid: initialPaymentAmount,
          endDate: format(endDateObj, 'yyyy-MM-dd'),
          totalCost,
        };

        set((state) => {
          // Update inventory stock
          const newInventory = [...state.inventory];
          newTx.items.forEach(item => {
            const invItem = newInventory.find(i => i.name === item.name);
            if (invItem) {
              invItem.availableStock -= item.quantity;
            }
          });

          return {
            transactions: [newTx, ...state.transactions],
            inventory: newInventory
          };
        });

        return id;
      },
      completeTransaction: (id) => {
        set((state) => {
          const txIndex = state.transactions.findIndex(t => t.id === id);
          if (txIndex === -1) return state;

          const tx = state.transactions[txIndex];
          if (tx.status === 'completed') return state;

          const updatedTransactions = [...state.transactions];
          updatedTransactions[txIndex] = { ...tx, status: 'completed' };

          // Return items to inventory
          const newInventory = [...state.inventory];
          tx.items.forEach(item => {
            const invItem = newInventory.find(i => i.name === item.name);
            if (invItem) {
              invItem.availableStock += item.quantity;
            }
          });

          return {
            transactions: updatedTransactions,
            inventory: newInventory
          };
        });
      },
      extendTransaction: (id, additionalDuration) => {
        set((state) => {
          const txIndex = state.transactions.findIndex(t => t.id === id);
          if (txIndex === -1) return state;

          const tx = state.transactions[txIndex];
          if (tx.status === 'completed') return state;

          let additionalCost = 0;
          tx.items.forEach(item => {
            additionalCost += item.quantity * item.pricePerUnit * additionalDuration;
          });

          const newExtension: Extension = {
            id: uuidv4(),
            duration: additionalDuration,
            additionalCost,
            dateAdded: new Date().toISOString()
          };

          const endDateObj = parseISO(tx.endDate);
          const newEndDateObj = tx.rentalType === 'daily'
            ? addDays(endDateObj, additionalDuration)
            : addMonths(endDateObj, additionalDuration);

          const newTotalCost = tx.totalCost + additionalCost;
          const totalRequired = newTotalCost + tx.depositAmount;
          let newPaymentStatus: PaymentStatus = 'unpaid';
          if (tx.amountPaid >= totalRequired) newPaymentStatus = 'paid';
          else if (tx.amountPaid > 0) newPaymentStatus = 'partial';

          const updatedTransactions = [...state.transactions];
          updatedTransactions[txIndex] = {
            ...tx,
            duration: tx.duration + additionalDuration,
            endDate: format(newEndDateObj, 'yyyy-MM-dd'),
            totalCost: newTotalCost,
            paymentStatus: newPaymentStatus,
            extensions: [...(tx.extensions || []), newExtension]
          };

          return { transactions: updatedTransactions };
        });
      },
      addPayment: (id, amount, method) => {
        set((state) => {
          const txIndex = state.transactions.findIndex(t => t.id === id);
          if (txIndex === -1) return state;

          const tx = state.transactions[txIndex];
          const newAmountPaid = tx.amountPaid + amount;
          const totalRequired = tx.totalCost + tx.depositAmount;
          
          let newPaymentStatus: PaymentStatus = 'partial';
          if (newAmountPaid >= totalRequired) newPaymentStatus = 'paid';
          else if (newAmountPaid === 0) newPaymentStatus = 'unpaid';

          const newPayment: Payment = {
            id: uuidv4(),
            amount,
            date: new Date().toISOString(),
            method
          };

          const updatedTransactions = [...state.transactions];
          updatedTransactions[txIndex] = {
            ...tx,
            amountPaid: newAmountPaid,
            paymentStatus: newPaymentStatus,
            payments: [...(tx.payments || []), newPayment]
          };

          return { transactions: updatedTransactions };
        });
      },
      updateInventoryStock: (id, quantityChange) => {
        set((state) => ({
          inventory: state.inventory.map(item => 
            item.id === id ? { ...item, totalStock: item.totalStock + quantityChange, availableStock: item.availableStock + quantityChange } : item
          )
        }));
      },
      updateCompanySettings: (settings) => {
        set({ companySettings: settings });
      }
    }),
    {
      name: 'scaffolding-rental-storage',
    }
  )
);