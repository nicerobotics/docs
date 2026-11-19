import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { questions, validateAnswers, version } from '../src/forms/frc.ts';
import { Store, configured, payloadHash, processSubmission, submit, useDatabase } from '../server/applications.ts';
import { GET as retryOverHttp, retryDue } from '../api/retry-applications.ts';
import worker from '../worker/index.ts';
import { memoryD1 } from './d1-memory.mjs';

function env() {
  Object.assign(process.env, { FEISHU_APP_ID: 'test', FEISHU_APP_SECRET: 'test', FEISHU_BASE_TOKEN: 'test', FEISHU_TABLE_ID: 'test', FEISHU_SUBMISSION_ID_FIELD: 'fld_submission', RECEIPT_SIGNING_SECRET: 'a'.repeat(64), CRON_SECRET: 'b'.repeat(64), APPLICATIONS_OPEN: 'true', APPLICATION_DEADLINE: '' });
}
function answers() {
  const a = Object.fromEntries(questions.filter(q => q.required).map(q => [q.id, q.type === 'number' ? 2020 : q.type === 'checkbox' || q.type === 'ranking' ? q.choices.map(c => c.value) : q.type === 'radiogroup' ? q.choices[0].value : 'Valid answer']));
  Object.assign(a, { q1: 'FRC', q4: '是', q5: '否', q18: 'test@example.com' });
  return validateAnswers(a).answers;
}
const payload = () => ({ version, locale: 'en', answers: answers() });
const stamp = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{6}Z$/;
function request(body, headers = {}) {
  return new Request('https://example.test/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://example.test', ...headers }, body: JSON.stringify(body) });
}

test('a staged application round-trips its payload, hash and timestamps; IDs are case-insensitive', async () => {
  const store = new Store(memoryD1()); const id = randomUUID(); const body = payload();
  const row = await store.stage(id.toUpperCase(), body);
  assert.equal(row.id, id); assert.equal(row.state, 'pending'); assert.equal(row.attempts, 0);
  assert.deepEqual(row.payload, body); assert.equal(row.hash, payloadHash(body));
  assert.match(row.created_at, stamp); assert.ok(Number.isFinite(Date.parse(row.created_at)));
  // A second stage with different content keeps the first row.
  assert.equal((await store.stage(id, { ...body, locale: 'zh-Hant' })).hash, payloadHash(body));
  assert.equal(await store.get(randomUUID()), undefined);
});

test('claim is an exclusive 60-second lease; done and fail settle it', async () => {
  const db = memoryD1(); const store = new Store(db); const id = randomUUID();
  await store.stage(id, payload());
  const claimed = await store.claim(id);
  assert.equal(claimed.state, 'syncing'); assert.equal(claimed.attempts, 1); assert.deepEqual(claimed.payload, payload());
  assert.equal(await store.claim(id), undefined, 'a held lease cannot be claimed again');
  assert.deepEqual(await store.due(), []);
  // An expired lease is due again and can be re-claimed.
  db.raw.prepare("UPDATE nice_applications SET lease_until='2000-01-01T00:00:00.000000Z' WHERE id=?").run(id);
  assert.deepEqual((await store.due()).map(r => r.id), [id]);
  assert.equal((await store.claim(id)).attempts, 2);
  // A failure backs off: the row is pending but not yet due.
  await store.fail(id, 'feishu_500', false, 2);
  let row = await store.get(id);
  assert.equal(row.state, 'pending'); assert.equal(row.last_error, 'feishu_500'); assert.equal(row.lease_until, null);
  assert.ok(row.retry_at > row.created_at); assert.equal(await store.claim(id), undefined); assert.deepEqual(await store.due(), []);
  db.raw.prepare("UPDATE nice_applications SET retry_at='2000-01-01T00:00:00.000000Z' WHERE id=?").run(id);
  assert.equal((await store.claim(id)).attempts, 3);
  await store.done(id, 'rec_1');
  row = await store.get(id);
  assert.equal(row.state, 'synced'); assert.equal(row.record_id, 'rec_1'); assert.equal(row.last_error, null); assert.match(row.synced_at, stamp);
  assert.equal(await store.claim(id), undefined);
  // A late failure report never downgrades a synced row; permanent failures block.
  await store.fail(id, 'late', true, 3); assert.equal((await store.get(id)).state, 'synced');
  const other = randomUUID(); await store.stage(other, payload()); await store.claim(other); await store.fail(other, 'schema_q1', true, 1);
  assert.equal((await store.get(other)).state, 'blocked'); assert.deepEqual(await store.due(), []);
});

test('due returns at most five rows, oldest first', async () => {
  const db = memoryD1(); const store = new Store(db); const ids = [];
  for (let i = 0; i < 7; i++) { const id = randomUUID(); ids.push(id); await store.stage(id, payload()); db.raw.prepare('UPDATE nice_applications SET created_at=? WHERE id=?').run(`2026-01-0${i + 1}T00:00:00.000000Z`, id); }
  assert.deepEqual((await store.due()).map(r => r.id), ids.slice(0, 5));
});

test('cleanup drops payloads 24 hours after sync and expired rate buckets only', async () => {
  const db = memoryD1(); const store = new Store(db); const old = randomUUID(), fresh = randomUUID(), pending = randomUUID();
  for (const id of [old, fresh, pending]) await store.stage(id, payload());
  for (const id of [old, fresh]) { await store.claim(id); await store.done(id, 'rec'); }
  db.raw.prepare("UPDATE nice_applications SET synced_at='2000-01-01T00:00:00.000000Z' WHERE id=?").run(old);
  const bucket = Math.floor(Date.now() / 600000);
  for (const b of [bucket, bucket - 2, bucket - 3]) db.raw.prepare('INSERT INTO nice_application_rate (key,bucket,count) VALUES (?,?,1)').run('k', b);
  await store.cleanup();
  assert.equal((await store.get(old)).payload, null); assert.equal((await store.get(old)).state, 'synced');
  assert.ok((await store.get(fresh)).payload); assert.ok((await store.get(pending)).payload);
  assert.deepEqual(db.raw.prepare('SELECT bucket FROM nice_application_rate ORDER BY bucket').all().map(r => r.bucket), [bucket - 2, bucket]);
});

test('rate limit allows twenty submissions per address in a ten-minute bucket and stores no raw address', async () => {
  env(); const db = memoryD1(); const store = new Store(db);
  for (let i = 0; i < 20; i++) assert.equal(await store.allow('203.0.113.7'), true);
  assert.equal(await store.allow('203.0.113.7'), false);
  assert.equal(await store.allow('203.0.113.8'), true);
  for (const row of db.raw.prepare('SELECT key FROM nice_application_rate').all()) assert.match(row.key, /^[0-9a-f]{64}$/);
});

test('submission through the real store: one upstream write for concurrent duplicates, conflict, retry and rate limit by edge address', async () => {
  env(); const db = memoryD1(); useDatabase(db); assert.equal(configured(), true);
  let writes = 0; const write = async () => { writes++; return 'rec_test'; };
  const body = { id: randomUUID(), version, locale: 'en', answers: answers() };
  const first = await submit(request(body), new Store(), write);
  assert.equal(first.status, 200); assert.equal((await first.json()).state, 'synced');
  assert.equal((await submit(request(body), new Store(), write)).status, 200); assert.equal(writes, 1);
  assert.equal((await submit(request({ ...body, answers: { ...body.answers, q7: 'changed' } }), new Store(), write)).status, 409);
  // Upstream failure stays durable; the scheduled retry delivers it later.
  const failed = { id: randomUUID(), version, locale: 'zh-Hant', answers: answers() };
  const pending = await submit(request(failed), new Store(), async () => { throw new Error('timeout'); });
  assert.equal(pending.status, 202);
  db.raw.prepare("UPDATE nice_applications SET retry_at='2000-01-01T00:00:00.000000Z' WHERE id=?").run(failed.id);
  await processSubmission(new Store(), failed.id, async () => 'rec_recovered');
  assert.equal((await new Store().get(failed.id)).record_id, 'rec_recovered');
  // The limiter keys on Cloudflare's connecting address.
  for (let i = 0; i < 21; i++) await new Store().allow('198.51.100.9');
  assert.equal((await submit(request(body, { 'cf-connecting-ip': '198.51.100.9' }), new Store(), write)).status, 429);
  assert.equal((await submit(request(body, { 'cf-connecting-ip': '198.51.100.10' }), new Store(), write)).status, 200);
});

test('the cron run delivers a pending application to Feishu exactly once; the HTTP trigger needs the cron secret', async () => {
  env(); const db = memoryD1(); useDatabase(db);
  const fields = questions.map(q => ({ field_id: q.fieldId, field_name: `stored_${q.id}`, type: q.type === 'radiogroup' ? 3 : q.type === 'checkbox' ? 4 : q.type === 'number' ? 2 : 1, property: { options: (q.choices ?? []).map(c => ({ name: c.value })) } }));
  fields.push({ field_id: 'fld_submission', field_name: '提交唯一标识', type: 1 });
  const calls = []; const realFetch = globalThis.fetch;
  // A minimal stand-in for the Feishu endpoints the sync uses; no network.
  globalThis.fetch = async (url, init = {}) => {
    const path = new URL(String(url)).pathname; calls.push(`${init.method ?? 'GET'} ${path}`);
    if (path.endsWith('/tenant_access_token/internal')) return Response.json({ code: 0, tenant_access_token: 't', expire: 7200 });
    if (path.endsWith('/fields')) return Response.json({ code: 0, data: { items: fields, has_more: false } });
    if (path.endsWith('/records/search')) return Response.json({ code: 0, data: { items: [] } });
    if (path.endsWith('/records')) return Response.json({ code: 0, data: { record: { record_id: 'rec_cron' } } });
    return Response.json({ code: 404 }, { status: 404 });
  };
  try {
    const id = randomUUID(); await new Store().stage(id, payload());
    assert.equal(await retryDue(), 1);
    const row = await new Store().get(id); assert.equal(row.state, 'synced'); assert.equal(row.record_id, 'rec_cron'); assert.equal(row.attempts, 1);
    assert.equal(calls.filter(c => c.startsWith('POST') && c.endsWith('/records')).length, 1);
    assert.equal(await retryDue(), 0);
    assert.equal(calls.filter(c => c.startsWith('POST') && c.endsWith('/records')).length, 1);
  } finally { globalThis.fetch = realFetch; }
  const call = (authorization) => retryOverHttp(new Request('https://example.test/api/retry-applications', { headers: authorization ? { authorization } : {} }));
  assert.equal((await call()).status, 403); assert.equal((await call('Bearer wrong')).status, 403);
  const ok = await call(`Bearer ${'b'.repeat(64)}`); assert.equal(ok.status, 200); assert.deepEqual(await ok.json(), { processed: 0 });
  useDatabase(undefined); assert.equal(configured(), false); assert.equal((await call(`Bearer ${'b'.repeat(64)}`)).status, 503);
});

test('worker routes the API, passes everything else to static assets and takes the country from Cloudflare only', async () => {
  env(); const db = memoryD1();
  const seen = []; const assets = { async fetch(req) { seen.push(new URL(req.url).pathname); return new Response('asset'); } };
  const workerEnv = { ASSETS: assets, DB: db };
  const call = (path, init = {}, cf) => { const req = new Request(`https://docs.nicerobotics.hk${path}`, init); if (cf) Object.defineProperty(req, 'cf', { value: cf }); return worker.fetch(req, workerEnv); };
  assert.equal(await (await call('/hardware/shim/')).text(), 'asset'); assert.deepEqual(seen, ['/hardware/shim/']);
  assert.equal((await call('/api/unknown')).status, 404); assert.equal((await call('/api')).status, 404);
  const wrong = await call('/api/locale', { method: 'POST' }); assert.equal(wrong.status, 405); assert.equal(wrong.headers.get('allow'), 'GET');
  assert.deepEqual(await (await call('/api/locale', {}, { country: 'TW' })).json(), { locale: 'zh-Hant' });
  assert.deepEqual(await (await call('/api/locale', { headers: { 'cf-ipcountry': 'CN' } }, { country: 'US' })).json(), { locale: 'en' });
  assert.deepEqual(await (await call('/api/locale', { headers: { 'cf-ipcountry': 'CN' } })).json(), { locale: null });
  assert.deepEqual(await (await call('/api/applications')).json(), { open: true, preview: false });
  assert.equal((await call('/api/application-status?id=not-a-uuid')).status, 404);
  assert.equal((await call('/api/retry-applications')).status, 403);
  assert.equal(seen.length, 1, 'API paths never fall through to assets');
  await worker.scheduled({}, workerEnv, { waitUntil() {} });
});
