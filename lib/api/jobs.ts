import { Meeting, MeetingStatus } from '../types/meeting';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/** Terminal statuses that stop polling */
const TERMINAL_STATUSES: MeetingStatus[] = [
  MeetingStatus.PENDING,
  MeetingStatus.SYNCED,
  MeetingStatus.FAILED,
];

/**
 * Fetch the current status of a single job.
 * Requirements: 3.5.6
 */
export async function getJobStatus(jobId: string): Promise<Meeting> {
  const res = await fetch(`${API_URL}/api/jobs/${jobId}`);
  if (!res.ok) {
    throw new Error('ジョブステータスの取得に失敗しました');
  }
  return res.json();
}

/**
 * Fetch all jobs from the backend.
 * Requirements: 3.3.7
 */
export async function getJobs(): Promise<Meeting[]> {
  const res = await fetch(`${API_URL}/api/jobs`);
  if (!res.ok) {
    throw new Error('ジョブ一覧の取得に失敗しました');
  }
  return res.json();
}

/**
 * Poll a job's status at a fixed interval.
 * Stops automatically when the job reaches a terminal status.
 * Returns a cleanup function to stop polling manually.
 *
 * Requirements: 3.5.6, 3.3.7
 */
export function pollJobStatus(
  jobId: string,
  onUpdate: (meeting: Meeting) => void,
  interval = 5000
): () => void {
  const id = setInterval(async () => {
    try {
      const meeting = await getJobStatus(jobId);
      onUpdate(meeting);
      if (TERMINAL_STATUSES.includes(meeting.status)) {
        clearInterval(id);
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, interval);

  return () => clearInterval(id);
}
