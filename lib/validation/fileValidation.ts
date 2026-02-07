import {
  ALLOWED_AUDIO_FORMATS,
  ALLOWED_VIDEO_FORMATS,
  MAX_FILE_SIZE,
  AUDIO_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from '../constants/upload';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  fileType?: 'audio' | 'video';
}

/**
 * Get file extension from filename (lowercase, without dot)
 */
function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if MIME type matches a supported audio format
 */
function isAllowedAudioMime(mime: string): boolean {
  return (ALLOWED_AUDIO_FORMATS as readonly string[]).includes(mime);
}

/**
 * Check if MIME type matches a supported video format
 */
function isAllowedVideoMime(mime: string): boolean {
  return (ALLOWED_VIDEO_FORMATS as readonly string[]).includes(mime);
}

/**
 * Check if file extension matches a supported audio format
 */
function isAllowedAudioExtension(ext: string): boolean {
  return ext.toLowerCase() in AUDIO_EXTENSIONS;
}

/**
 * Check if file extension matches a supported video format
 */
function isAllowedVideoExtension(ext: string): boolean {
  return ext.toLowerCase() in VIDEO_EXTENSIONS;
}

/**
 * Check if a file extension is supported (audio or video)
 */
export function isSupportedExtension(ext: string): boolean {
  const lower = ext.toLowerCase();
  return lower in AUDIO_EXTENSIONS || lower in VIDEO_EXTENSIONS;
}

/**
 * Get the expected MIME type for a given file extension
 */
export function getExpectedMimeType(ext: string): string | undefined {
  const lower = ext.toLowerCase();
  return AUDIO_EXTENSIONS[lower] ?? VIDEO_EXTENSIONS[lower] ?? undefined;
}

/**
 * Return a human-readable string listing all supported formats
 */
export function getSupportedFormatsText(): string {
  const audioExts = Object.keys(AUDIO_EXTENSIONS).map(e => e.toUpperCase());
  const videoExts = Object.keys(VIDEO_EXTENSIONS).map(e => e.toUpperCase());
  return `音声: ${audioExts.join(', ')} / 動画: ${videoExts.join(', ')}`;
}

/**
 * Validate a file for upload.
 * Checks file size (max 200MB) and format (MIME type + extension).
 *
 * Requirements: 3.2.1, 3.2.2, 3.2.3, 3.2.4, 3.2.5, 3.2.6
 */
export function validateFile(file: File): ValidationResult {
  // Size check
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'ファイルサイズが200MBを超えています' };
  }

  const mime = file.type;
  const ext = getExtension(file.name);

  // Extension must exist
  if (!ext) {
    return { valid: false, error: 'ファイル拡張子が見つかりません' };
  }

  // Dual validation: both MIME type and extension must be supported
  const mimeIsAudio = isAllowedAudioMime(mime);
  const mimeIsVideo = isAllowedVideoMime(mime);
  const extIsAudio = isAllowedAudioExtension(ext);
  const extIsVideo = isAllowedVideoExtension(ext);

  // MIME type must be recognised
  if (!mimeIsAudio && !mimeIsVideo) {
    return {
      valid: false,
      error: `サポートされていないファイル形式です: ${mime || '不明'}`,
    };
  }

  // Extension must be recognised
  if (!extIsAudio && !extIsVideo) {
    return {
      valid: false,
      error: `サポートされていないファイル拡張子です: .${ext}`,
    };
  }

  // MIME type and extension must agree on category (both audio or both video)
  if (mimeIsAudio && extIsAudio) {
    return { valid: true, fileType: 'audio' };
  }
  if (mimeIsVideo && extIsVideo) {
    return { valid: true, fileType: 'video' };
  }

  return {
    valid: false,
    error: 'ファイルのMIMEタイプと拡張子が一致しません',
  };
}
