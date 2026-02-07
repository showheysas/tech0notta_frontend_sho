import { Customer, CustomerCreate, CustomerUpdate } from '../types/customer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_URL}/api/customers`);
  if (!res.ok) throw new Error('顧客一覧の取得に失敗しました');
  return res.json();
}

export async function getCustomer(customerId: string): Promise<Customer> {
  const res = await fetch(`${API_URL}/api/customers/${customerId}`);
  if (!res.ok) throw new Error('顧客情報の取得に失敗しました');
  return res.json();
}

export async function createCustomer(data: CustomerCreate): Promise<Customer> {
  const res = await fetch(`${API_URL}/api/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('顧客の作成に失敗しました');
  return res.json();
}

export async function updateCustomer(customerId: string, data: CustomerUpdate): Promise<Customer> {
  const res = await fetch(`${API_URL}/api/customers/${customerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('顧客情報の更新に失敗しました');
  return res.json();
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/customers/${customerId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('顧客の削除に失敗しました');
}
