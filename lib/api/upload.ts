import { UploadResponse } from '../types/meeting';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Upload a file to the backend API with progress tracking.
 * Uses XMLHttpRequest for real-time progress updates.
 *
 * Requirements: 3.3.1, 3.3.2, 3.3.4, 3.4.1, 3.4.2
 */
export function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.min(100, Math.max(0, (e.loaded / e.total) * 100));
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data: UploadResponse = JSON.parse(xhr.responseText);
          resolve(data);
        } catch {
          const err = new Error('レスポンスの解析に失敗しました');
          console.error('Upload error:', err);
          reject(err);
        }
      } else {
        let message = 'アップロードに失敗しました';
        try {
          const body = JSON.parse(xhr.responseText);
          if (body.detail) message = body.detail;
        } catch {
          // use default message
        }
        const err = new Error(message);
        console.error('Upload error:', err);
        reject(err);
      }
    });

    xhr.addEventListener('error', () => {
      const err = new Error('ネットワークエラーが発生しました');
      console.error('Upload error:', err);
      reject(err);
    });

    xhr.addEventListener('timeout', () => {
      const err = new Error('アップロードがタイムアウトしました');
      console.error('Upload error:', err);
      reject(err);
    });

    xhr.open('POST', `${API_URL}/api/upload`);
    xhr.timeout = 600000; // 10 minutes
    xhr.send(formData);
  });
}
