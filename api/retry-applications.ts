import { timingSafeEqual } from 'node:crypto';
import { configured, processSubmission, response, Store } from '../server/applications.js';

/** Retry up to five due submissions, then run the retention cleanup. Called by the Worker's cron trigger. */
export async function retryDue(store = new Store()) {
  const rows = await store.due();
  for (const row of rows) await processSubmission(store, row.id);
  await store.cleanup();
  return rows.length;
}

export async function GET(request: Request) {
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  const supplied = request.headers.get('authorization') ?? '';
  if (!process.env.CRON_SECRET || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return response({ code: 'forbidden' }, 403);
  if (!configured()) return response({ code: 'unavailable' }, 503);
  try { return response({ processed: await retryDue() }); }
  catch { console.error('application_retry_failed'); return response({ code: 'unavailable' }, 503); }
}
