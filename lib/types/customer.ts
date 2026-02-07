export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  meetingCount: number;
  taskCount: number;
  latestDealStatus?: DealStatus;
  notionPageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreate {
  companyName: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface CustomerUpdate {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export type DealStatus = 'リード' | '商談中' | '提案済み' | '交渉中' | '成約' | '失注';
