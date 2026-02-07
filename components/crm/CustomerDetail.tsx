'use client';

import { Customer } from '@/lib/types/customer';

interface CustomerDetailProps {
  customer: Customer;
}

export default function CustomerDetail({ customer }: CustomerDetailProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">{customer.companyName}</h2>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><span className="text-sm text-slate-500">担当者</span><p className="font-medium">{customer.contactPerson}</p></div>
          <div><span className="text-sm text-slate-500">メール</span><p className="font-medium">{customer.email || '-'}</p></div>
          <div><span className="text-sm text-slate-500">電話</span><p className="font-medium">{customer.phone || '-'}</p></div>
          <div><span className="text-sm text-slate-500">住所</span><p className="font-medium">{customer.address || '-'}</p></div>
        </div>
        {customer.notes && <div><span className="text-sm text-slate-500">備考</span><p>{customer.notes}</p></div>}
      </div>
      {/* TODO: 関連議事録・タスク・商談の表示 */}
    </div>
  );
}
