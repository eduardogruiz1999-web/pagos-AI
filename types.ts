
export type LotStatus = 'disponible' | 'vendido' | 'reservado';

export interface Lot {
  id: string;
  number: string;
  price: number;
  status: LotStatus;
  x: number;
  y: number;
}

export interface ClientFile {
  id: string;
  name: string;
  type: string;
  content: string;
  date: string;
}

export interface PaymentSchedule {
  id: string;
  amount: number;
  dueDate: string;
  status: 'pagado' | 'pendiente' | 'atrasado';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  division: string;
  lotId: string;
  payments: PaymentSchedule[];
  files: ClientFile[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Payment {
  id: string;
  concept: string;
  amount: number;
  date: string;
  status: 'pendiente' | 'completado' | 'atrasado';
  category: string;
}

export interface UserFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatar: string;
  email: string;
  files: UserFile[];
  personalPaymentGoal: number;
}
