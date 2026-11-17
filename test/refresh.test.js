import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REFETCH_TIMEOUT_MS, REFRESH_INTERVAL_MS, fetchWithTimeout, hasChanged, startPoller } from '../src/refresh.js';

function setup(runImpl) {
  const t = { cb: null, delay: null, intervals: 0, cleared: [] };
  const timer = {
    setInterval(cb, d) { t.cb = cb; t.delay = d; t.intervals++; return 42; },
    clearInterval(id) { t.cleared.push(id); },
  };
  const doc = {
    visibilityState: 'visible', listener: null, removed: false,
    addEventListener(_e, l) { this.listener = l; },
    removeEventListener(_e, l) { if (l === this.listener) this.removed = true; },
  };
  const clock = { t: 0 };
  const calls = { n: 0 };
  const run = runImpl || (() => { calls.n++; });
  const wrapped = () => { calls.n++; return runImpl ? runImpl() : undefined; };
  return { t, timer, doc, clock, calls, wrapped, now: () => clock.t };
}
const flush = () => new Promise((r) => setImmediate(r));

test('schedules one interval at 5 minutes, custom honoured', () => {
  const s = setup();
  startPoller({ run: s.wrapped, timer: s.timer, doc: s.doc, now: s.now });
  assert.equal(s.t.intervals, 1);
  assert.equal(s.t.delay, REFRESH_INTERVAL_MS);
  assert.equal(REFRESH_INTERVAL_MS, 300000);
  const s2 = setup();
  startPoller({ run: s2.wrapped, intervalMs: 10, timer: s2.timer, doc: s2.doc, now: s2.now });
  assert.equal(s2.t.delay, 10);
});

test('tick runs; hidden tick is skipped', async () => {
  const s = setup();
  startPoller({ run: s.wrapped, timer: s.timer, doc: s.doc, now: s.now });
  s.t.cb();
  await flush();
  assert.equal(s.calls.n, 1);
  s.doc.visibilityState = 'hidden';
  s.t.cb();
  assert.equal(s.calls.n, 1);
});

test('visibility catch-up only when interval elapsed', () => {
  const s = setup();
  startPoller({ run: s.wrapped, timer: s.timer, doc: s.doc, now: s.now });
  s.clock.t = REFRESH_INTERVAL_MS - 1;
  s.doc.listener();
  assert.equal(s.calls.n, 0);
  s.clock.t = REFRESH_INTERVAL_MS;
  s.doc.listener();
  assert.equal(s.calls.n, 1);
  s.clock.t += 1;
  s.doc.listener();
  assert.equal(s.calls.n, 1);
});

test('in-flight run skips tick and catch-up, then resumes', async () => {
  let resolve;
  const s = setup(() => new Promise((r) => { resolve = r; }));
  startPoller({ run: s.wrapped, timer: s.timer, doc: s.doc, now: s.now });
  s.t.cb();
  s.t.cb();
  s.clock.t = REFRESH_INTERVAL_MS * 2;
  s.doc.listener();
  assert.equal(s.calls.n, 1);
  resolve();
  await flush();
  s.t.cb();
  assert.equal(s.calls.n, 2);
});

test('rejecting or throwing run does not stop later ticks', async () => {
  const s = setup(() => Promise.reject(new Error('x')));
  startPoller({ run: s.wrapped, timer: s.timer, doc: s.doc, now: s.now });
  s.t.cb();
  await flush();
  s.t.cb();
  await flush();
  assert.equal(s.calls.n, 2);
  const s2 = setup(() => { throw new Error('sync'); });
  startPoller({ run: s2.wrapped, timer: s2.timer, doc: s2.doc, now: s2.now });
  s2.t.cb();
  await flush();
  s2.t.cb();
  assert.equal(s2.calls.n, 2);
});

test('stop clears interval, removes listener, silences events', () => {
  const s = setup();
  const p = startPoller({ run: s.wrapped, timer: s.timer, doc: s.doc, now: s.now });
  p.stop();
  assert.deepEqual(s.t.cleared, [42]);
  assert.equal(s.doc.removed, true);
  s.t.cb();
  s.clock.t = REFRESH_INTERVAL_MS * 3;
  s.doc.listener();
  assert.equal(s.calls.n, 0);
});

test('lastFetch updates when a run starts', async () => {
  const s = setup();
  startPoller({ run: s.wrapped, timer: s.timer, doc: s.doc, now: s.now });
  s.clock.t = REFRESH_INTERVAL_MS;
  s.t.cb();
  await flush();
  s.clock.t = REFRESH_INTERVAL_MS + 10;
  s.doc.listener();
  assert.equal(s.calls.n, 1);
});

test('hasChanged', () => {
  assert.equal(hasChanged('a', 'a'), false);
  assert.equal(hasChanged('a', 'b'), true);
  assert.equal(hasChanged('a', 'a '), true);
});

function stubTimer() {
  const t = { cb: null, delay: null, cleared: [] };
  return Object.assign(t, {
    setTimeout(cb, d) { t.cb = cb; t.delay = d; return 7; },
    clearTimeout(id) { t.cleared.push(id); },
  });
}

test('fetchWithTimeout aborts and rejects on timeout even if fetch ignores the signal', async () => {
  const timer = stubTimer();
  let sig;
  const p = fetchWithTimeout((_u, init) => { sig = init.signal; return new Promise(() => {}); }, 'x', { cache: 'no-store' }, { timer });
  assert.equal(sig.aborted, false);
  assert.equal(timer.delay, REFETCH_TIMEOUT_MS);
  assert.ok(REFETCH_TIMEOUT_MS < REFRESH_INTERVAL_MS);
  timer.cb();
  await assert.rejects(p, /timed out/);
  assert.equal(sig.aborted, true);
});

test('fetchWithTimeout passes through, keeps init, clears the timer', async () => {
  const timer = stubTimer();
  let seen;
  const res = await fetchWithTimeout((u, init) => { seen = init; return Promise.resolve({ ok: true }); }, 'x', { cache: 'no-store' }, { timer });
  assert.deepEqual(res, { ok: true });
  assert.equal(seen.cache, 'no-store');
  assert.deepEqual(timer.cleared, [7]);
  const t2 = stubTimer();
  await assert.rejects(fetchWithTimeout(() => Promise.reject(new Error('boom')), 'x', {}, { timer: t2 }), /boom/);
  assert.deepEqual(t2.cleared, [7]);
});

test('poller recovers after a hung refetch times out', async () => {
  const s = setup();
  const timer = stubTimer();
  const run = () => { s.calls.n++; return fetchWithTimeout(() => new Promise(() => {}), 'x', {}, { timer }); };
  startPoller({ run, timer: s.timer, doc: s.doc, now: s.now });
  s.t.cb();
  s.t.cb();
  assert.equal(s.calls.n, 1);
  timer.cb();
  await flush();
  s.t.cb();
  assert.equal(s.calls.n, 2);
});

test('refresh.js stays DOM-free', () => {
  const src = readFileSync(new URL('../src/refresh.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /document|window|(?<![.\w])setInterval\(|(?<![.\w])fetch\(/);
});
