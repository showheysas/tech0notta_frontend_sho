/**
 * Allowed audio file MIME types
 * Supports: WAV, MP3, M4A, AAC, FLAC, OGG
 */
export const ALLOWED_AUDIO_FORMATS = [
  'audio/wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/flac',
  'audio/ogg'
] as const;

/**
 * Allowed video file MIME types
 * Supports: MP4, MOV, AVI, WebM, MKV
 */
export const ALLOWED_VIDEO_FORMATS = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/x-matroska'
] as const;

/**
 * Maximum file size in bytes (200MB)
 */
export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

/**
 * File extension to MIME type mapping for audio files
 */
export const AUDIO_EXTENSIONS: Record<string, string> = {
  'wav': 'audio/wav',
  'mp3': 'audio/mpeg',
  'm4a': 'audio/mp4',
  'aac': 'audio/aac',
  'flac': 'audio/flac',
  'ogg': 'audio/ogg'
};

/**
 * File extension to MIME type mapping for video files
 */
export const VIDEO_EXTENSIONS: Record<string, string> = {
  'mp4': 'video/mp4',
  'mov': 'video/quicktime',
  'avi': 'video/x-msvideo',
  'webm': 'video/webm',
  'mkv': 'video/x-matroska'
};
