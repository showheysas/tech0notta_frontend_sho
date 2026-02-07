import { MeetingStatus } from '../../../lib/types/meeting';

const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

/** Flush all pending microtasks */
async function flushPromises() {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
}

describe('Job Status Polling - Unit Tests', () => {
  it('should start polling and call onUpdate', async () => {
    const { pollJobStatus } = require('../../../lib/api/jobs');
    const meeting = { id: '1', title: 'Test', date: '2026-01-01', status: MeetingStatus.TRANSCRIBING };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(meeting) });

    const onUpdate = jest.fn();
    const stop = pollJobStatus('1', onUpdate, 5000);

    jest.advanceTimersByTime(5000);
    await flushPromises();

    expect(onUpdate).toHaveBeenCalledWith(meeting);
    stop();
  });

  it('should stop polling when job reaches PENDING status', async () => {
    const { pollJobStatus } = require('../../../lib/api/jobs');
    const meeting = { id: '1', title: 'Test', date: '2026-01-01', status: MeetingStatus.PENDING };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(meeting) });

    const onUpdate = jest.fn();
    pollJobStatus('1', onUpdate, 5000);

    jest.advanceTimersByTime(5000);
    await flushPromises();
    expect(onUpdate).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(5000);
    await flushPromises();
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('should stop polling when job reaches SYNCED status', async () => {
    const { pollJobStatus } = require('../../../lib/api/jobs');
    const meeting = { id: '1', title: 'Test', date: '2026-01-01', status: MeetingStatus.SYNCED };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(meeting) });

    const onUpdate = jest.fn();
    pollJobStatus('1', onUpdate, 5000);

    jest.advanceTimersByTime(5000);
    await flushPromises();
    expect(onUpdate).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(5000);
    await flushPromises();
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('should stop polling when job reaches FAILED status', async () => {
    const { pollJobStatus } = require('../../../lib/api/jobs');
    const meeting = { id: '1', title: 'Test', date: '2026-01-01', status: MeetingStatus.FAILED };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(meeting) });

    const onUpdate = jest.fn();
    pollJobStatus('1', onUpdate, 5000);

    jest.advanceTimersByTime(5000);
    await flushPromises();
    expect(onUpdate).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(5000);
    await flushPromises();
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});
