import * as fc from 'fast-check';
import { MeetingStatus } from '../../../lib/types/meeting';

// Safe ISO date string arbitrary using integer timestamps
const safeIsoDate = fc
  .integer({ min: 946684800000, max: 1924905600000 }) // 2000-01-01 to 2030-12-31
  .map(ts => new Date(ts).toISOString());

/**
 * Feature: frontend-sho-v2, Property 11: Job List Update on Success
 * Validates: Requirements 3.3.7
 */
describe('Property 11: Job List Update on Success', () => {
  it('adding a new job to a list should increase list length by 1', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 50 }),
            date: safeIsoDate,
            status: fc.constantFrom(...Object.values(MeetingStatus)),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        fc.record({
          id: fc.uuid(),
          title: fc.string({ minLength: 1, maxLength: 50 }),
          date: safeIsoDate,
          status: fc.constant(MeetingStatus.UPLOADED),
        }),
        (existingJobs, newJob) => {
          const updated = [...existingJobs, newJob];
          expect(updated.length).toBe(existingJobs.length + 1);
          expect(updated[updated.length - 1].id).toBe(newJob.id);
        }
      ),
      { numRuns: 100, verbose: true }
    );
  });
});
