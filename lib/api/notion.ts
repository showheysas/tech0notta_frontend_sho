const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface NotionUpdateResponse {
  job_id: string;
  notion_page_url: string;
  updated_at: string;
}

/**
 * Update a Notion page with modified summary.
 * Requirements: 3.8.5, 3.8.6, 3.8.7
 */
export async function updateNotionPage(
  jobId: string,
  summary: string
): Promise<NotionUpdateResponse> {
  const res = await fetch(`${API_URL}/api/notion/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, summary }),
  });

  if (!res.ok) {
    let message = 'Notionの更新に失敗しました';
    try {
      const body = await res.json();
      if (body.detail) message = body.detail;
    } catch {
      // use default
    }
    throw new Error(message);
  }

  return res.json();
}
