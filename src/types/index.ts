// Auth Types
export interface User {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

// OTP Authentication Types
export interface SendOtpRequest {
  identifier: string;
  identifierType: 'email' | 'phone';
  channel: 'email' | 'sms' | 'whatsapp';
}

export interface VerifyOtpRequest {
  identifier: string;
  identifierType: 'email' | 'phone';
  otp: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  expiresInSeconds: number;
  sessionId?: string;
}

// Business Types
export interface Business {
  id: string;
  name: string;
  type?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  panNumber?: string;
  currency: string;
  isActive: boolean;
  userRole: string;
  canDeleteEntries?: boolean;
  createdAt: string;
}

export interface BusinessSummary {
  id: string;
  name: string;
  currency: string;
  userRole: string;
  canDeleteEntries?: boolean;
}

export interface CreateBusinessRequest {
  name: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  taxId?: string;
  currency: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  type: 'CashIn' | 'CashOut' | 'Both' | 'Income' | 'Expense';
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
}

// Cash Entry Types
export interface CashEntry {
  id: string;
  type: 'CashIn' | 'CashOut' | 'Income' | 'Expense';
  amount: number;
  date: string;
  entryDate?: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  reference?: string;
  paymentMode?: string;
  partyName?: string;
  partyId?: string;
  attachmentUrl?: string;
  dueDate?: string;
  isDue?: boolean;
  runningBalance: number;
  createdBy: string;
  createdByUserName?: string;
  createdAt: string;
  updatedByUserName?: string;
  updatedAt?: string;
  modificationReason?: string;
  isModified?: boolean;
}

export interface CreateCashEntryRequest {
  type: 'Income' | 'Expense';
  amount: number;
  entryDate: string;
  categoryId?: string;
  description?: string;
  reference?: string;
  partyName?: string;
  partyId?: string;
  dueDate?: string;
}

export interface UpdateCashEntryRequest {
  type: 'Income' | 'Expense';
  amount: number;
  entryDate: string;
  categoryId?: string;
  description?: string;
  reference?: string;
  partyName?: string;
  partyId?: string;
  dueDate?: string;
  modificationReason: string;
}

export interface CashbookSummary {
  cashBalance: number;
  todayIncome: number;
  todayExpense: number;
  monthIncome: number;
  monthExpense: number;
  totalEntries: number;
}

// Bank Types
export interface BankAccount {
  id: string;
  bankName: string;
  accountName?: string;
  accountNumber: string;
  accountType?: string;
  ifscCode?: string;
  openingBalance?: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBankAccountRequest {
  bankName: string;
  accountNumber: string;
  accountType: string;
  ifscCode?: string;
  openingBalance: number;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer' | 'CashToBank' | 'BankToCash' | 'BankTransfer';
  amount: number;
  date?: string;
  transactionDate?: string;
  description?: string;
  reference?: string;
  balanceAfter: number;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
}

export interface CreateBankTransactionRequest {
  bankAccountId: string;
  type: 'Deposit' | 'Withdrawal' | 'CashToBank' | 'BankToCash' | 'BankTransfer';
  amount: number;
  transactionDate: string;
  description?: string;
  reference?: string;
  targetBankAccountId?: string;
}

export interface CashBankTransferRequest {
  bankAccountId: string;
  amount: number;
  transactionDate: string;
  description?: string;
  isCashToBank: boolean;
}

// Staff Types
export interface Staff {
  id: string; // BusinessUser ID - used for API calls
  userId: string; // User ID
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  role: 'Owner' | 'Accountant' | 'Viewer';
  isActive: boolean;
  canDeleteEntries?: boolean;
  joinedAt?: string;
  createdAt?: string;
}

export interface InviteStaffRequest {
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  role: 'Accountant' | 'Viewer';
  canDeleteEntries?: boolean;
}

// Report Types
export interface Dashboard {
  cashBalance: number;
  totalBankBalance: number;
  todayIncome: number;
  todayExpense: number;
  monthIncome: number;
  monthExpense: number;
  weekIncome: number;
  weekExpense: number;
  bankBalances: BankBalance[];
  last7DaysTransactions: DailyTransaction[];
  topIncomeCategories: CategorySummary[];
  topExpenseCategories: CategorySummary[];
  recentCashEntries: RecentEntry[];
  recentBankTransactions: RecentEntry[];
}

// Dashboard Data for frontend components
export interface DashboardData {
  cashBalance: number;
  totalCashIn: number;
  totalCashOut: number;
  bankBalance: number;
  cashFlowTrend: CashFlowTrendItem[];
  categoryBreakdown: CategoryBreakdownItem[];
  monthlyComparison: MonthlyComparisonItem[];
  recentTransactions: RecentTransactionItem[];
}

export interface CashFlowTrendItem {
  date: string;
  cashIn: number;
  cashOut: number;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
}

export interface MonthlyComparisonItem {
  month: string;
  income: number;
  expense: number;
}

export interface RecentTransactionItem {
  id: string;
  type: 'CashIn' | 'CashOut';
  amount: number;
  description?: string;
  categoryName?: string;
  date: string;
}

export interface BankBalance {
  bankAccountId: string;
  bankName: string;
  accountName: string;
  balance: number;
}

export interface DailyTransaction {
  date: string;
  income: number;
  expense: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  type: string;
  totalAmount: number;
  entryCount: number;
  percentage: number;
}

export interface RecentEntry {
  id: string;
  type: string;
  amount: number;
  description?: string;
  date: string;
  categoryName?: string;
}

export interface CashbookReport {
  startDate: string;
  endDate: string;
  openingBalance: number;
  closingBalance: number;
  totalIncome: number;
  totalExpense: number;
  entries: CashEntryReportItem[];
  categorySummary: CategorySummary[];
}

export interface CashEntryReportItem {
  date: string;
  type: string;
  categoryName?: string;
  description?: string;
  partyName?: string;
  amount: number;
  balance: number;
  createdBy: string;
}

// Common Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
  searchTerm?: string;
}
