'use client';

import { useState } from 'react';
import { DealCreate, DealStatus } from '@/lib/types/deal';

interface DealFormProps {
  customerId?: string;
  onSubmit: (data: DealCreate) => Promise<void>;
  onCancel: () => void;
}

const STATUSES: DealStatus[] = ['リード', '商談中', '提案済み', '交渉中', '成約', '失注'];

export default function DealForm({ customerId, onSubmit, onCancel }: DealFormProps) {
  const [form, setForm] = useState<DealCreate>({
    customerId: customerId || '',
    name: '',
    amount: undefined,
    probability: undefined,
    expectedCloseDate: undefined,
    status: 'リード',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">商談名 *</label>
        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">ステータス</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DealStatus })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">金額</label>
        <input type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: e.target.value ? Number(e.target.value) : undefined })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-lg text-sm">キャンセル</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">保存</button>
      </div>
    </form>
  );
}
