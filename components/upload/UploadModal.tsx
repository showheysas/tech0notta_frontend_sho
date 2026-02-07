'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, File as FileIcon, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const ALLOWED_FORMATS = [
  'audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/aac', 'audio/flac',
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'
];
const ALLOWED_EXTENSIONS = ['.wav', '.mp3', '.mp4', '.m4a', '.ogg', '.aac', '.flac', '.mov', '.avi', '.webm', '.mkv'];
const MAX_FILE_SIZE = 200 * 1024 * 1024;

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (jobId: string) => void;
}

export default function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null); setUploading(false); setProgress(0);
      setError(null); setSuccess(false); setIsDragging(false);
    }
  }, [isOpen]);

  const validateFile = useCallback((f: File): string | null => {
    if (f.size > MAX_FILE_SIZE) return `ファイルサイズが200MBを超えています。（${(f.size / 1024 / 1024).toFixed(1)}MB）`;
    if (!ALLOWED_FORMATS.includes(f.type)) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return '対応していないファイル形式です。音声ファイル（WAV, MP3, M4A, AAC, FLAC, OGG）または動画ファイル（MP4, MOV, AVI, WebM, MKV）を選択してください。';
      }
    }
    return null;
  }, []);

  const handleFileSelect = useCallback((f: File) => {
    setError(null); setSuccess(false);
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setFile(f);
  }, [validateFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError(null); setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.addEventListener('load', async () => {
        setUploading(false);
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            setSuccess(true); setProgress(100);
            
            // アップロード成功後、自動的に文字起こしを開始
            try {
              const transcribeRes = await fetch(`${API_URL}/api/transcribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_id: data.job_id })
              });
              if (!transcribeRes.ok) {
                console.error('Failed to start transcription:', await transcribeRes.text());
              }
            } catch (e) {
              console.error('Failed to start transcription:', e);
            }
            
            setTimeout(() => { onUploadComplete?.(data.job_id); handleClose(); }, 1500);
          } catch { setError('レスポンスの解析に失敗しました。'); }
        } else {
          try { setError(JSON.parse(xhr.responseText).detail || 'アップロードに失敗しました。'); }
          catch { setError(`アップロードに失敗しました。（ステータス: ${xhr.status}）`); }
        }
      });
      xhr.addEventListener('error', () => { setError('ネットワークエラーが発生しました。'); setUploading(false); });
      xhr.addEventListener('timeout', () => { setError('アップロードがタイムアウトしました。'); setUploading(false); });
      xhr.open('POST', `${API_URL}/api/upload`);
      xhr.timeout = 300000;
      xhr.send(formData);
    } catch { setError('アップロードに失敗しました。もう一度お試しください。'); setUploading(false); }
  };

  const handleClose = () => {
    if (!uploading) { setFile(null); setError(null); setSuccess(false); setProgress(0); onClose(); }
  };

  const handleRemoveFile = () => {
    setFile(null); setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">録音ファイルをアップロード</h2>
          <button onClick={handleClose} disabled={uploading} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!file && !success && (
            <div
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'}`}
              onClick={() => fileInputRef.current?.click()}
              role="button" tabIndex={0} aria-label="ファイルをドラッグ&ドロップまたはクリックして選択"
              onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
              data-testid="drop-zone"
            >
              <Upload size={48} className="mx-auto mb-4 text-slate-400" />
              <p className="text-slate-700 font-medium mb-2">ファイルをドラッグ&ドロップ</p>
              <p className="text-slate-500 text-sm mb-4">または</p>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">ファイルを選択</button>
              <p className="text-xs text-slate-400 mt-4">
                対応形式: WAV, MP3, M4A, AAC, FLAC, OGG, MP4, MOV, AVI, WebM, MKV<br />最大サイズ: 200MB
              </p>
              <input ref={fileInputRef} type="file" accept="audio/*,video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} className="hidden" />
            </div>
          )}

          {file && !success && (
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FileIcon size={40} className="text-emerald-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                {!uploading && (
                  <button onClick={handleRemoveFile} className="p-1 text-slate-400 hover:text-red-600 transition-colors"><X size={20} /></button>
                )}
              </div>
              {uploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                    <span>アップロード中...</span><span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-800 font-medium">アップロードが完了しました！</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button onClick={handleClose} disabled={uploading} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors disabled:opacity-50">キャンセル</button>
          <button onClick={handleUpload} disabled={!file || uploading || success} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {uploading && <Loader size={16} className="animate-spin" />}
            {uploading ? 'アップロード中...' : 'アップロード'}
          </button>
        </div>
      </div>
    </div>
  );
}
