'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Customer, CustomerCreate } from '@/lib/types/customer';
import { getCustomers, createCustomer } from '@/lib/api/customers';
import CustomerList from '@/components/crm/CustomerList';
import CustomerForm from '@/components/crm/CustomerForm';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter((c) =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: CustomerCreate) => {
    await createCustomer(data);
    setShowForm(false);
    fetchCustomers();
  };

  if (loading) return <div className="p-8 text-slate-500">読み込み中...</div>;

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">顧客管理</h2>
          <p className="text-slate-500 mt-1 text-sm">顧客情報の一覧・管理</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all">
          <Plus size={18} /> 新規顧客
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="会社名・担当者で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
        />
      </div>

      <CustomerList
        customers={filtered}
        onCustomerClick={(id) => router.push(`/customers/${id}`)}
        onCreateClick={() => setShowForm(true)}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">新規顧客登録</h3>
            <CustomerForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
