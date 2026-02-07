import * as fc from 'fast-check';
import { validateFile } from '../../../lib/validation/fileValidation';
import {
  AUDIO_EXTENSIONS,
  VIDEO_EXTENSIONS,
  MAX_FILE_SIZE,
} from '../../../lib/constants/upload';

const testConfig = { numRuns: 100, verbose: true };

function createMockFile(size: number, name: string, type: string): File {
  const content = new ArrayBuffer(0);
  const file = new File([content], name, { type });
  Object.defineProperty(file, 'size', { value: size, writable: false });
  return file;
}

const audioEntries = Object.entries(AUDIO_EXTENSIONS);
const videoEntries = Object.entries(VIDEO_EXTENSIONS);

/**
 * Feature: frontend-sho-v2, Property 5: Audio Format Acceptance
 * Validates: Requirements 3.2.1
 */
describe('Property 5: Audio Format Acceptance', () => {
  it('should accept any valid audio file with matching MIME and extension', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: audioEntries.length - 1 }),
        fc.integer({ min: 1, max: MAX_FILE_SIZE }),
        (idx, size) => {
          const [ext, mime] = audioEntries[idx];
          const file = createMockFile(size, `test.${ext}`, mime);
          const result = validateFile(file);
          expect(result.valid).toBe(true);
          expect(result.fileType).toBe('audio');
        }
      ),
      testConfig
    );
  });
});

/**
 * Feature: frontend-sho-v2, Property 6: Video Format Acceptance
 * Validates: Requirements 3.2.2
 */
describe('Property 6: Video Format Acceptance', () => {
  it('should accept any valid video file with matching MIME and extension', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: videoEntries.length - 1 }),
        fc.integer({ min: 1, max: MAX_FILE_SIZE }),
        (idx, size) => {
          const [ext, mime] = videoEntries[idx];
          const file = createMockFile(size, `test.${ext}`, mime);
          const result = validateFile(file);
          expect(result.valid).toBe(true);
          expect(result.fileType).toBe('video');
        }
      ),
      testConfig
    );
  });
});

/**
 * Feature: frontend-sho-v2, Property 7: Unsupported Format Rejection
 * Validates: Requirements 3.2.5
 */
describe('Property 7: Unsupported Format Rejection', () => {
  const unsupportedMimes = [
    'application/pdf', 'text/plain', 'image/jpeg', 'image/png',
    'application/zip', 'text/html', 'application/json',
  ];

  it('should reject any file with unsupported MIME type', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...unsupportedMimes),
        fc.constantFrom('pdf', 'txt', 'jpg', 'png', 'zip', 'html', 'json'),
        fc.integer({ min: 1, max: MAX_FILE_SIZE }),
        (mime, ext, size) => {
          const file = createMockFile(size, `test.${ext}`, mime);
          const result = validateFile(file);
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      testConfig
    );
  });
});

/**
 * Feature: frontend-sho-v2, Property 8: Dual Validation Criteria
 * Validates: Requirements 3.2.6
 */
describe('Property 8: Dual Validation Criteria', () => {
  it('should reject files where MIME type and extension category disagree', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: audioEntries.length - 1 }),
        fc.integer({ min: 0, max: videoEntries.length - 1 }),
        fc.boolean(),
        (audioIdx, videoIdx, audioMimeWithVideoExt) => {
          const [audioExt, audioMime] = audioEntries[audioIdx];
          const [videoExt, videoMime] = videoEntries[videoIdx];

          let file: File;
          if (audioMimeWithVideoExt) {
            file = createMockFile(1024, `test.${videoExt}`, audioMime);
          } else {
            file = createMockFile(1024, `test.${audioExt}`, videoMime);
          }
          const result = validateFile(file);
          expect(result.valid).toBe(false);
        }
      ),
      testConfig
    );
  });

  it('should reject files with oversized content regardless of valid format', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: audioEntries.length - 1 }),
        fc.integer({ min: MAX_FILE_SIZE + 1, max: MAX_FILE_SIZE * 2 }),
        (idx, size) => {
          const [ext, mime] = audioEntries[idx];
          const file = createMockFile(size, `test.${ext}`, mime);
          const result = validateFile(file);
          expect(result.valid).toBe(false);
          expect(result.error).toBe('ファイルサイズが200MBを超えています');
        }
      ),
      testConfig
    );
  });
});
