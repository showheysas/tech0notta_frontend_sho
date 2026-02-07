'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import { Customer, CustomerCreate } from '@/lib/types/customer';
import { Deal } from '@/lib/types/deal';
import { getCustomer, updateCustomer, deleteCustomer } from '@/lib/api/customers';
import { getDeals } from '@/lib/api/deals';
import CustomerDetail from '@/components/crm/CustomerDetail';
import CustomerForm from '@/components/crm/CustomerForm';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!customerId) return;
    try {
      const [c, d] = await Promise.all([
        getCustomer(customerId),
        getDeals(customerId),
      ]);
      setCustomer(c);
      setDeals(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (data: CustomerCreate) => {
    await updateCustomer(customerId, data);
    setEditing(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!confirm('この顧客を削除しますか？')) return;
    await deleteCustomer(customerId);
    router.push('/customers');
  };

  if (loading) return <div className="p-8 text-slate-500">読み込み中...</div>;
  if (!customer) return <div className="p-8 text-red-500">顧客が見つかりません</div>;

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/customers')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={18} /> 顧客一覧に戻る
        </button>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm">
            <Edit3 size={14} /> 編集
          </button>
          <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm">
            <Trash2 size={14} /> 削除
          </button>
        </div>
      </div>

      <CustomerDetail customer={customer} />

      {/* 関連商談 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-4">関連商談 ({deals.length}件)</h3>
        {deals.length === 0 ? (
          <p className="text-slate-500 text-sm">商談がありません</p>
        ) : (
          <div className="space-y-2">
            {deals.map((deal) => (
              <div key={deal.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{deal.name}</p>
                  <p className="text-xs text-slate-500">{deal.status}</p>
                </div>
                {deal.amount && <span className="text-sm font-medium">¥{deal.amount.toLocaleString()}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">顧客情報編集</h3>
            <CustomerForm initialData={customer} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
