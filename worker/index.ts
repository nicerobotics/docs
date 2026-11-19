// Cloudflare Worker entry. Static pages are served straight from Workers Static Assets;
// this code only runs for /api/* (see run_worker_first in wrangler.jsonc) and for the cron trigger.
import { GET as locale } from '../api/locale.js';
import { GET as availability, POST as submitApplication } from '../api/applications.js';
import { GET as applicationStatus } from '../api/application-status.js';
import { GET as retryOverHttp, retryDue } from '../api/retry-applications.js';
import { useDatabase } from '../server/applications.js';
import type { D1Database } from '../server/applications.js';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  DB: D1Database;
}
interface ExecutionContext { waitUntil(promise: Promise<unknown>): void }
type Handler = (request: Request) => Response | Promise<Response>;

const routes: Record<string, Record<string, Handler>> = {
  '/api/locale': { GET: locale },
  '/api/applications': { GET: availability, POST: submitApplication },
  '/api/application-status': { GET: applicationStatus },
  '/api/retry-applications': { GET: retryOverHttp },
};

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
}

// The visitor's country comes from Cloudflare's own request metadata, never from a client-supplied header.
function withEdgeCountry(request: Request): Request {
  const headers = new Headers(request.headers);
  const country = (request as Request & { cf?: { country?: unknown } }).cf?.country;
  if (typeof country === 'string') headers.set('cf-ipcountry', country);
  else headers.delete('cf-ipcountry');
  return new Request(request, { headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname !== '/api' && !pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    const methods = routes[pathname];
    if (!methods) return json({ code: 'not_found' }, 404);
    const handler = Object.hasOwn(methods, request.method) ? methods[request.method] : undefined;
    if (!handler) return json({ code: 'method_not_allowed' }, 405, { Allow: Object.keys(methods).join(', ') });
    useDatabase(env.DB);
    try { return await handler(withEdgeCountry(request)); }
    catch { console.error('api_request_failed'); return json({ code: 'unavailable' }, 503); }
  },

  // Every five minutes: retry submissions that have not reached Feishu yet, then apply the retention cleanup.
  async scheduled(_controller: unknown, env: Env, ctx: ExecutionContext): Promise<void> {
    useDatabase(env.DB);
    const run = retryDue().then((processed) => { if (processed) console.log(JSON.stringify({ event: 'application_retry', processed })); });
    ctx.waitUntil(run);
    await run;
  },
};
