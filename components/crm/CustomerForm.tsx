'use client';

import { useState } from 'react';
import { CustomerCreate } from '@/lib/types/customer';

interface CustomerFormProps {
  initialData?: Partial<CustomerCreate>;
  onSubmit: (data: CustomerCreate) => Promise<void>;
  onCancel: () => void;
}

export default function CustomerForm({ initialData, onSubmit, onCancel }: CustomerFormProps) {
  const [form, setForm] = useState<CustomerCreate>({
    companyName: initialData?.companyName || '',
    contactPerson: initialData?.contactPerson || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">会社名 *</label>
        <input type="text" required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">担当者 *</label>
        <input type="text" required value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">メール</label>
        <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">電話</label>
        <input type="tel" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-lg text-sm">キャンセル</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">保存</button>
      </div>
    </form>
  );
}
