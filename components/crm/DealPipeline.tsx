'use client';

import { Deal, DealStatus } from '@/lib/types/deal';

interface DealPipelineProps {
  deals: Deal[];
  onDealClick: (dealId: string) => void;
  onStatusChange: (dealId: string, newStatus: DealStatus) => void;
}

const STATUSES: DealStatus[] = ['リード', '商談中', '提案済み', '交渉中', '成約', '失注'];

export default function DealPipeline({ deals, onDealClick, onStatusChange }: DealPipelineProps) {
  const grouped = STATUSES.reduce((acc, status) => {
    acc[status] = deals.filter((d) => d.status === status);
    return acc;
  }, {} as Record<DealStatus, Deal[]>);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status) => (
        <div key={status} className="min-w-[250px] bg-slate-50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">{status}</h3>
            <span className="text-xs text-slate-400">{grouped[status].length}</span>
          </div>
          {grouped[status].map((deal) => (
            <div key={deal.id} onClick={() => onDealClick(deal.id)} className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow">
              <p className="font-medium text-sm text-slate-900">{deal.name}</p>
              <p className="text-xs text-slate-500 mt-1">{deal.customerName}</p>
              {deal.amount && <p className="text-xs text-slate-600 mt-1">¥{deal.amount.toLocaleString()}</p>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
