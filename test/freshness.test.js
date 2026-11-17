import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeFreshness, startFreshnessClock } from '../src/freshness.js';

const now = new Date('2026-11-16T18:00:00Z').getTime();
const ago = (s) => new Date(now - s * 1000).toISOString();
const ahead = (s) => new Date(now + s * 1000).toISOString();

test('same updated value ages as now advances', () => {
  const updated = ago(0);
  assert.equal(computeFreshness(updated, now).age, 'just now');
  assert.equal(computeFreshness(updated, now + 5 * 60_000).age, '5 min ago');
});

test('stale boundary at 24 h with banner wording', () => {
  const fresh = computeFreshness(ago(86400), now);
  assert.equal(fresh.stale, false);
  assert.equal(fresh.bannerText, null);
  const stale = computeFreshness(ago(86401), now);
  assert.equal(stale.stale, true);
  assert.equal(stale.bannerText, 'This status may be stale — last updated 1 day ago');
});

test('future beyond tolerance is unknown and stale', () => {
  assert.deepEqual(computeFreshness(ahead(600), now), {
    age: 'unknown',
    future: true,
    stale: true,
    bannerText: 'This status may be stale — last updated time unknown',
  });
});

test('non-string updated is unknown, stale, not future', () => {
  const r = computeFreshness(undefined, now);
  assert.equal(r.age, 'unknown');
  assert.equal(r.stale, true);
  assert.equal(r.future, false);
});

test('startFreshnessClock schedules the interval', () => {
  const calls = [];
  const doc = { visibilityState: 'visible', addEventListener() {} };
  const tick = () => {};
  startFreshnessClock(tick, { setIntervalFn: (f, ms) => calls.push([f, ms]), doc });
  startFreshnessClock(tick, { intervalMs: 5, setIntervalFn: (f, ms) => calls.push([f, ms]), doc });
  assert.deepEqual(calls, [[tick, 60000], [tick, 5]]);
});

test('visibilitychange ticks only when visible', () => {
  let handler;
  const doc = { visibilityState: 'hidden', addEventListener: (type, h) => { assert.equal(type, 'visibilitychange'); handler = h; } };
  let ticks = 0;
  startFreshnessClock(() => { ticks++; }, { setIntervalFn: () => {}, doc });
  handler();
  assert.equal(ticks, 0);
  doc.visibilityState = 'visible';
  handler();
  assert.equal(ticks, 1);
});
