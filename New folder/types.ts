
export enum UserRole {
  DSO = 'DSO',
  ADMIN = 'ADMIN',
  MASTER = 'MASTER'
}

export enum TransactionType {
  CASH_GIVEN = 'CASH_GIVEN',
  CASH_RECEIVED = 'CASH_RECEIVED',
  B2B_SEND = 'B2B_SEND',
  B2B_RECEIVE = 'B2B_RECEIVE',
  DUE_ADJUSTMENT = 'DUE_ADJUSTMENT'
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  password?: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'deleted';
  profilePic?: string;
}

export interface Agent {
  id: string;
  name: string;
  mobile: string;
  area: string;
  currentDue: number;
  lastTransactionAt?: string;
  assignedDsoMobile?: string;
  createdAt?: string;
  status: 'active' | 'inactive';
}

export interface Transaction {
  id: string;
  agentId: string;
  dsoId: string;
  type: TransactionType;
  amount: number;
  note: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface HistorySnapshot {
  id: string;
  date: string;
  dsoId: string;
  dsoName: string;
  totalDue: number;
  stats: {
    cashGiven: number;
    cashReceived: number;
    b2bSend: number;
    b2bReceive: number;
  };
  transactions: Transaction[];
}

export interface AppState {
  currentUser: User | null;
  operatingAsDSO: User | null;
  agents: Agent[];
  transactions: Transaction[];
  historySnapshots: HistorySnapshot[];
  chatMessages: ChatMessage[];
}
