'use client';

import { Customer } from '@/lib/types/customer';

interface CustomerListProps {
  customers: Customer[];
  onCustomerClick: (customerId: string) => void;
  onCreateClick: () => void;
}

export default function CustomerList({ customers, onCustomerClick, onCreateClick }: CustomerListProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-slate-100">
        <span className="text-sm text-slate-500">全{customers.length}件</span>
        <button onClick={onCreateClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          新規顧客
        </button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">会社名</th>
            <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">担当者</th>
            <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">会議数</th>
            <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">タスク数</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.map((c) => (
            <tr key={c.id} onClick={() => onCustomerClick(c.id)} className="hover:bg-slate-50 cursor-pointer">
              <td className="px-6 py-4 font-medium text-slate-900">{c.companyName}</td>
              <td className="px-6 py-4 text-slate-600">{c.contactPerson}</td>
              <td className="px-6 py-4 text-slate-500">{c.meetingCount}</td>
              <td className="px-6 py-4 text-slate-500">{c.taskCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
