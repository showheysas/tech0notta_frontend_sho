import { DealStatus } from './customer';

export type { DealStatus };

export interface Deal {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  amount?: number;
  probability?: number;
  expectedCloseDate?: string;
  status: DealStatus;
  closeDate?: string;
  notionPageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealCreate {
  customerId: string;
  name: string;
  amount?: number;
  probability?: number;
  expectedCloseDate?: string;
  status?: DealStatus;
}

export interface DealUpdate {
  name?: string;
  amount?: number;
  probability?: number;
  expectedCloseDate?: string;
  status?: DealStatus;
}
