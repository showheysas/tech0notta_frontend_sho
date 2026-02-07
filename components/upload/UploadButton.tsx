'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import UploadModal from './UploadModal';

interface UploadButtonProps {
  onUploadComplete?: (jobId?: string) => void;
}

export default function UploadButton({ onUploadComplete }: UploadButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadSuccess = (jobId: string) => {
    setIsModalOpen(false);
    onUploadComplete?.(jobId);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg transition-all hover:-translate-y-0.5"
        aria-label="録音をアップロード"
      >
        <Upload size={18} />
        録音をアップロード
      </button>
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadComplete={handleUploadSuccess}
      />
    </>
  );
}
