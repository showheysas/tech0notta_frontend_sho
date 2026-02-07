'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Deal, DealCreate, DealStatus } from '@/lib/types/deal';
import { getDeals, createDeal, updateDeal } from '@/lib/api/deals';
import DealPipeline from '@/components/crm/DealPipeline';
import DealForm from '@/components/crm/DealForm';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchDeals = useCallback(async () => {
    try {
      setDeals(await getDeals());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const handleCreate = async (data: DealCreate) => {
    await createDeal(data);
    setShowForm(false);
    fetchDeals();
  };

  const handleStatusChange = async (dealId: string, newStatus: DealStatus) => {
    await updateDeal(dealId, { status: newStatus });
    fetchDeals();
  };

  if (loading) return <div className="p-8 text-slate-500">読み込み中...</div>;

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">商談パイプライン</h2>
          <p className="text-slate-500 mt-1 text-sm">商談ステータスの管理・可視化</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20">
          <Plus size={18} /> 新規商談
        </button>
      </div>

      <DealPipeline deals={deals} onDealClick={() => {}} onStatusChange={handleStatusChange} />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">新規商談登録</h3>
            <DealForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
