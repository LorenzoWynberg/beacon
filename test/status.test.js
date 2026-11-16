import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatRelativeAge, parseStatus } from '../src/status.js';

const now = new Date('2026-11-16T18:00:00Z');
const ago = (s) => new Date(now.getTime() - s * 1000).toISOString();

test('formatRelativeAge boundaries', () => {
  const cases = [
    [30, 'just now'], [59, 'just now'], [60, '1 min ago'], [300, '5 min ago'],
    [59 * 60, '59 min ago'], [3600, '1 h ago'], [3 * 3600, '3 h ago'],
    [23 * 3600, '23 h ago'],
    [119, '1 min ago'], [3599, '59 min ago'], [7199, '1 h ago'], [86399, '23 h ago'], [172799, '1 day ago'], [86400, '1 day ago'], [2 * 86400, '2 days ago'],
  ];
  for (const [s, want] of cases) assert.equal(formatRelativeAge(ago(s), now), want);
});

test('formatRelativeAge handles future and invalid input', () => {
  assert.equal(formatRelativeAge(ago(-100), now), 'just now');
  assert.equal(formatRelativeAge('nope', now), 'unknown');
  assert.equal(formatRelativeAge(null, now), 'unknown');
  assert.equal(formatRelativeAge(undefined, now), 'unknown');
  assert.equal(formatRelativeAge(ago(0), 'x'), 'unknown');
  assert.equal(formatRelativeAge(ago(300), now.getTime()), '5 min ago');
});

test('parseStatus returns updated and services, note only when present', () => {
  const r = parseStatus(JSON.stringify({
    updated: '2026-11-16T18:00:00+00:00',
    services: [{ name: 'A', status: 'up' }, { name: 'B', status: 'down', note: 'x' }],
  }));
  assert.equal(r.updated, '2026-11-16T18:00:00+00:00');
  assert.deepEqual(r.services[0], { name: 'A', status: 'up' });
  assert.equal('note' in r.services[0], false);
  assert.equal(r.services[1].note, 'x');
});
