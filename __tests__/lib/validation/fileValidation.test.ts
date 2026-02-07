/**
 * Unit tests for file validation
 * Tests specific examples and edge cases for file validation logic
 */

import { validateFile, getSupportedFormatsText, isSupportedExtension, getExpectedMimeType } from '../../../lib/validation/fileValidation';
import { MAX_FILE_SIZE } from '../../../lib/constants/upload';

/**
 * Helper function to create a mock File object for testing
 */
function createMockFile(
  size: number,
  name: string,
  type: string
): File {
  const blob = new Blob([new ArrayBuffer(size)], { type });
  return new File([blob], name, { type });
}

describe('File Validation - Unit Tests', () => {
  describe('validateFile - Size Validation', () => {
    it('should accept file exactly at 200MB', () => {
      const file = createMockFile(MAX_FILE_SIZE, 'test.mp3', 'audio/mpeg');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('audio');
    });

    it('should reject file at 200MB + 1 byte', () => {
      const file = createMockFile(MAX_FILE_SIZE + 1, 'test.mp3', 'audio/mpeg');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ファイルサイズが200MBを超えています');
    });

    it('should accept small file (1MB)', () => {
      const file = createMockFile(1024 * 1024, 'test.mp3', 'audio/mpeg');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('should accept empty file (edge case)', () => {
      const file = createMockFile(0, 'test.mp3', 'audio/mpeg');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateFile - Audio Format Validation', () => {
    it('should accept WAV file', () => {
      const file = createMockFile(1024, 'test.wav', 'audio/wav');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('audio');
    });

    it('should accept MP3 file', () => {
      const file = createMockFile(1024, 'test.mp3', 'audio/mpeg');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('audio');
    });

    it('should accept M4A file', () => {
      const file = createMockFile(1024, 'test.m4a', 'audio/mp4');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('audio');
    });

    it('should accept AAC file', () => {
      const file = createMockFile(1024, 'test.aac', 'audio/aac');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('audio');
    });

    it('should accept FLAC file', () => {
      const file = createMockFile(1024, 'test.flac', 'audio/flac');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('audio');
    });

    it('should accept OGG file', () => {
      const file = createMockFile(1024, 'test.ogg', 'audio/ogg');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('audio');
    });
  });

  describe('validateFile - Video Format Validation', () => {
    it('should accept MP4 file', () => {
      const file = createMockFile(1024, 'test.mp4', 'video/mp4');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('video');
    });

    it('should accept MOV file', () => {
      const file = createMockFile(1024, 'test.mov', 'video/quicktime');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('video');
    });

    it('should accept AVI file', () => {
      const file = createMockFile(1024, 'test.avi', 'video/x-msvideo');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('video');
    });

    it('should accept WebM file', () => {
      const file = createMockFile(1024, 'test.webm', 'video/webm');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('video');
    });

    it('should accept MKV file', () => {
      const file = createMockFile(1024, 'test.mkv', 'video/x-matroska');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('video');
    });
  });

  describe('validateFile - Unsupported Format Rejection', () => {
    it('should reject PDF file', () => {
      const file = createMockFile(1024, 'test.pdf', 'application/pdf');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('サポートされていないファイル形式です');
    });

    it('should reject text file', () => {
      const file = createMockFile(1024, 'test.txt', 'text/plain');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('サポートされていないファイル形式です');
    });

    it('should reject image file', () => {
      const file = createMockFile(1024, 'test.jpg', 'image/jpeg');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('サポートされていないファイル形式です');
    });
  });

  describe('validateFile - Extension Validation', () => {
    it('should reject file without extension', () => {
      const file = createMockFile(1024, 'testfile', 'audio/mpeg');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('ファイル拡張子が見つかりません');
    });

    it('should handle uppercase extensions', () => {
      const file = createMockFile(1024, 'test.MP3', 'audio/mpeg');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('audio');
    });

    it('should handle mixed case extensions', () => {
      const file = createMockFile(1024, 'test.Mp4', 'video/mp4');
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('video');
    });
  });

  describe('validateFile - MIME Type and Extension Mismatch', () => {
    it('should reject file with audio extension but video MIME type', () => {
      const file = createMockFile(1024, 'test.mp3', 'video/mp4');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
    });

    it('should reject file with video extension but audio MIME type', () => {
      const file = createMockFile(1024, 'test.mp4', 'audio/mpeg');
      const result = validateFile(file);
      expect(result.valid).toBe(false);
    });
  });

  describe('getSupportedFormatsText', () => {
    it('should return formatted list of supported formats', () => {
      const text = getSupportedFormatsText();
      expect(text).toContain('WAV');
      expect(text).toContain('MP3');
      expect(text).toContain('MP4');
      expect(text).toContain('MOV');
    });
  });

  describe('isSupportedExtension', () => {
    it('should return true for supported audio extensions', () => {
      expect(isSupportedExtension('mp3')).toBe(true);
      expect(isSupportedExtension('wav')).toBe(true);
      expect(isSupportedExtension('m4a')).toBe(true);
    });

    it('should return true for supported video extensions', () => {
      expect(isSupportedExtension('mp4')).toBe(true);
      expect(isSupportedExtension('mov')).toBe(true);
      expect(isSupportedExtension('avi')).toBe(true);
    });

    it('should return false for unsupported extensions', () => {
      expect(isSupportedExtension('pdf')).toBe(false);
      expect(isSupportedExtension('txt')).toBe(false);
      expect(isSupportedExtension('jpg')).toBe(false);
    });

    it('should handle uppercase extensions', () => {
      expect(isSupportedExtension('MP3')).toBe(true);
      expect(isSupportedExtension('MP4')).toBe(true);
    });
  });

  describe('getExpectedMimeType', () => {
    it('should return correct MIME type for audio extensions', () => {
      expect(getExpectedMimeType('mp3')).toBe('audio/mpeg');
      expect(getExpectedMimeType('wav')).toBe('audio/wav');
      expect(getExpectedMimeType('m4a')).toBe('audio/mp4');
    });

    it('should return correct MIME type for video extensions', () => {
      expect(getExpectedMimeType('mp4')).toBe('video/mp4');
      expect(getExpectedMimeType('mov')).toBe('video/quicktime');
      expect(getExpectedMimeType('avi')).toBe('video/x-msvideo');
    });

    it('should return undefined for unsupported extensions', () => {
      expect(getExpectedMimeType('pdf')).toBeUndefined();
      expect(getExpectedMimeType('txt')).toBeUndefined();
    });

    it('should handle uppercase extensions', () => {
      expect(getExpectedMimeType('MP3')).toBe('audio/mpeg');
      expect(getExpectedMimeType('MP4')).toBe('video/mp4');
    });
  });
});
