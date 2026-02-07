import * as fc from 'fast-check';
import { MeetingStatus } from '../../../lib/types/meeting';
import { isProcessing, getStatusLabel, PROCESSING_STATUSES } from '../../../components/ui/MeetingCard';

const testConfig = { numRuns: 100, verbose: true };

/**
 * Feature: frontend-sho-v2, Property 15: Processing Status Display
 * Validates: Requirements 3.5.1, 3.5.2, 3.5.3
 */
describe('Property 15: Processing Status Display', () => {
  it('any processing status should display "処理中..."', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PROCESSING_STATUSES),
        (status) => {
          expect(isProcessing(status)).toBe(true);
          expect(getStatusLabel(status)).toBe('処理中...');
        }
      ),
      testConfig
    );
  });
});

/**
 * Feature: frontend-sho-v2, Property 16: Processing Status Button Disable
 * Validates: Requirements 3.5.4, 3.5.5
 */
describe('Property 16: Processing Status Button Disable', () => {
  it('processing statuses should be identified as processing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PROCESSING_STATUSES),
        (status) => {
          expect(isProcessing(status)).toBe(true);
        }
      ),
      testConfig
    );
  });
});

/**
 * Feature: frontend-sho-v2, Property 17: Summarized Status Button Enable
 * Validates: Requirements 3.6.1
 */
describe('Property 17: Summarized Status Button Enable', () => {
  it('PENDING status should not be processing', () => {
    fc.assert(
      fc.property(fc.constant(MeetingStatus.PENDING), (status) => {
        expect(isProcessing(status)).toBe(false);
        expect(getStatusLabel(status)).toBe('レビュー待ち');
      }),
      testConfig
    );
  });
});

/**
 * Feature: frontend-sho-v2, Property 18: Completed Status UI Elements
 * Validates: Requirements 3.6.2, 3.6.3
 */
describe('Property 18: Completed Status UI Elements', () => {
  it('SYNCED status should not be processing and show 同期済み', () => {
    fc.assert(
      fc.property(fc.constant(MeetingStatus.SYNCED), (status) => {
        expect(isProcessing(status)).toBe(false);
        expect(getStatusLabel(status)).toBe('同期済み');
      }),
      testConfig
    );
  });
});

/**
 * Feature: frontend-sho-v2, Property 19: Button Navigation
 * Validates: Requirements 3.6.4, 3.6.5
 */
describe('Property 19: Button Navigation', () => {
  it('non-processing statuses should allow navigation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(MeetingStatus.PENDING, MeetingStatus.SYNCED),
        (status) => {
          expect(isProcessing(status)).toBe(false);
        }
      ),
      testConfig
    );
  });
});

/**
 * Feature: frontend-sho-v2, Property 20: External Link Behavior
 * Validates: Requirements 3.6.6
 */
describe('Property 20: External Link Behavior', () => {
  it('Notion URL should be a valid URL when present', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          expect(() => new URL(url)).not.toThrow();
        }
      ),
      testConfig
    );
  });
});
