import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatRelativeAge, formatSince, isFutureTimestamp, isStale, groupServices, normaliseStatus, parseStatus } from '../src/status.js';

const now = new Date('2026-11-16T18:00:00Z');
const ago = (s) => new Date(now.getTime() - s * 1000).toISOString();
const ahead = (s) => new Date(now.getTime() + s * 1000).toISOString();

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
    services: [{ name: 'A', status: { state: 'up' } }, { name: 'B', status: { state: 'down' }, note: 'x' }],
  }));
  assert.equal(r.updated, '2026-11-16T18:00:00+00:00');
  assert.deepEqual(r.services[0], { name: 'A', status: 'up' });
  assert.equal('note' in r.services[0], false);
  assert.equal(r.services[1].note, 'x');
});

test('isStale uses a strict 24 h threshold', () => {
  assert.equal(isStale(ago(24 * 3600 - 60), now), false);
  assert.equal(isStale(ago(24 * 3600), now), false);
  assert.equal(isStale(ago(24 * 3600 + 1), now), true);
  assert.equal(isStale(ago(24 * 3600 + 60), now), true);
  assert.equal(isStale(undefined, now), true);
  assert.equal(isStale('nope', now), true);
});

test('normaliseStatus maps unrecognised values to unknown', () => {
  assert.equal(normaliseStatus('up'), 'up');
  assert.equal(normaliseStatus('UP'), 'up');
  assert.equal(normaliseStatus(' Down '), 'down');
  for (const v of ['degraded', '', null, undefined, 5]) assert.equal(normaliseStatus(v), 'unknown');
});

test('parseStatus rejects malformed documents and normalises status', () => {
  assert.throws(() => parseStatus('{nope'), /valid JSON/);
  assert.throws(() => parseStatus('[]'), /object/);
  assert.throws(() => parseStatus('"x"'), /object/);
  assert.throws(() => parseStatus('{"services":{}}'), /array/);
  const r = parseStatus('{"updated":"x","services":[{"name":"A","status":{"state":"degraded"}},5]}');
  assert.equal(r.services[0].status, 'unknown');
  assert.deepEqual(r.services[1], { name: '', status: 'unknown' });
});

const svc = (name, group) => ({ name, status: 'up', ...(group === undefined ? {} : { group }) });

test('groupServices is flat when no service has a group', () => {
  const services = [svc('A'), svc('B')];
  assert.deepEqual(groupServices(services), { grouped: false, groups: [{ name: null, services }] });
});

test('groupServices orders by first appearance and merges case/whitespace', () => {
  const r = groupServices([svc('1', 'Web'), svc('2', 'API'), svc('3', 'web'), svc('4', 'api')]);
  assert.equal(r.grouped, true);
  assert.deepEqual(r.groups.map((g) => [g.name, g.services.map((s) => s.name)]), [['Web', ['1', '3']], ['API', ['2', '4']]]);
  const padded = groupServices([svc('1', 'Web'), svc('2', '  WEB ')]);
  assert.deepEqual(padded.groups.map((g) => [g.name, g.services.map((s) => s.name)]), [['Web', ['1', '2']]]);
});

test('groupServices puts ungrouped and explicit other last', () => {
  const r = groupServices([svc('1'), svc('2', 'Other'), svc('3', 'Web'), svc('4', '  '), svc('5', 'other'), svc('6', 7)]);
  assert.deepEqual(r.groups.map((g) => g.name), ['Web', 'Other']);
  assert.deepEqual(r.groups[1].services.map((s) => s.name), ['1', '2', '4', '5', '6']);
});

test('groupServices omits Other when all are grouped', () => {
  assert.deepEqual(groupServices([svc('1', 'A'), svc('2', 'B')]).groups.map((g) => g.name), ['A', 'B']);
});

test('parseStatus keeps trimmed group and omits blank or non-string', () => {
  const r = parseStatus(JSON.stringify({ services: [
    { name: 'a', group: ' Web ' }, { name: 'b', group: '  ' }, { name: 'c', group: 5 }, { name: 'd' },
  ] }));
  assert.equal(r.services[0].group, 'Web');
  for (const s of r.services.slice(1)) assert.equal('group' in s, false);
});

test('future timestamps beyond 5 min tolerance are untrustworthy', () => {
  for (const s of [240, 300]) {
    assert.equal(isStale(ahead(s), now), false);
    assert.equal(formatRelativeAge(ahead(s), now), 'just now');
  }
  for (const s of [301, 360, 86400]) {
    assert.equal(isStale(ahead(s), now), true);
    assert.equal(formatRelativeAge(ahead(s), now), 'unknown');
  }
});

test('isFutureTimestamp', () => {
  assert.equal(isFutureTimestamp(ahead(301), now), true);
  assert.equal(isFutureTimestamp(ahead(300), now), false);
  assert.equal(isFutureTimestamp(ago(100), now), false);
  for (const v of [undefined, null, 'nope', 5]) assert.equal(isFutureTimestamp(v, now), false);
  assert.equal(isFutureTimestamp(ahead(61), now, 60_000), true);
  assert.equal(isFutureTimestamp(ahead(60), now, 60_000), false);
  assert.equal(isFutureTimestamp(ahead(1000), 'x'), false);
});

const svcText = (services) => JSON.stringify({ updated: '2026-11-16T18:00:00+00:00', services });

test('parseStatus reads state and since from an object status', () => {
  const since = '2026-11-16T15:00:00+00:00';
  const r = parseStatus(svcText([{ name: 'A', status: { state: 'down', since } }]));
  assert.equal(r.services[0].status, 'down');
  assert.equal(r.services[0].since, since);
});

test('parseStatus maps plain-string statuses to invalid without affecting other rows', () => {
  const r = parseStatus(svcText([
    { name: 'A', status: 'up' }, { name: 'B', status: 'down' }, { name: 'C', status: 'UP' },
    { name: 'D', status: { state: 'up' } },
  ]));
  assert.deepEqual(r.services.map((s) => s.status), ['invalid', 'invalid', 'invalid', 'up']);
});

test('parseStatus maps unusable states and statuses to unknown', () => {
  const r = parseStatus(svcText([
    { name: 'a', status: { state: 'degraded' } }, { name: 'b', status: {} }, { name: 'c', status: { state: 5 } },
    { name: 'd', status: { state: ' UP ' } },
    { name: 'e' }, { name: 'f', status: null }, { name: 'g', status: 3 }, { name: 'h', status: [] },
  ]));
  assert.deepEqual(r.services.map((s) => s.status), ['unknown', 'unknown', 'unknown', 'up', 'unknown', 'unknown', 'unknown', 'unknown']);
});

test('parseStatus omits since when missing, non-string or unparseable', () => {
  const r = parseStatus(svcText([
    { name: 'a', status: { state: 'up' } },
    { name: 'b', status: { state: 'up', since: 123 } },
    { name: 'c', status: { state: 'up', since: 'garbage' } },
    { name: 'd', status: { state: 'up', since: null } },
    { name: 'e', status: 'up', },
  ]));
  for (const s of r.services) assert.equal('since' in s, false);
});

test('formatSince mirrors formatRelativeAge and returns null when unusable', () => {
  assert.equal(formatSince(ago(3 * 3600), now), '3 h ago');
  assert.equal(formatSince(ago(3 * 3600), now), formatRelativeAge(ago(3 * 3600), now));
  assert.equal(formatSince(undefined, now), null);
  assert.equal(formatSince('nope', now), null);
  assert.equal(formatSince(ahead(301), now), null);
  assert.equal(formatSince(ahead(300), now), 'just now');
});

import { uptimeOverWindow, formatUptime } from '../src/status.js';

const histJson = (status, extra = {}) => JSON.stringify({ services: [{ name: 'A', status: { state: 'up', since: ago(3600), ...status } }, { name: 'B', status: { state: 'up' } }], ...extra });

test('parseStatus keeps valid history with normalised state', () => {
  const h = [{ state: 'UP', since: ago(7200) }, { state: 'junk', since: ago(5400) }];
  const s = parseStatus(histJson({ history: h })).services;
  assert.deepEqual(s[0].history, [{ state: 'up', since: ago(7200) }, { state: 'unknown', since: ago(5400) }]);
  assert.equal('history' in s[1], false);
  assert.deepEqual(parseStatus(histJson({ history: [] })).services[0].history, []);
});

test('parseStatus drops invalid history as a whole', () => {
  const ok = { state: 'up', since: ago(7200) };
  const bad = [
    [null], ['x'], [[]], [{ state: 'up' }], [{ state: 'up', since: 'nope' }],
    [{ state: 'up', since: ago(5000) }, ok], [ok, ok], [{ state: 'up', since: ago(3600) }], [{ state: 'up', since: ago(60) }], 'nope',
  ];
  for (const history of bad) {
    const s = parseStatus(histJson({ history })).services;
    assert.equal('history' in s[0], false);
    assert.equal(s[0].status, 'up');
    assert.equal(s[0].since, ago(3600));
  }
  const noSince = parseStatus(JSON.stringify({ services: [{ name: 'A', status: { state: 'up', history: [ok] } }] })).services[0];
  assert.equal('history' in noSince, false);
  assert.equal(parseStatus(JSON.stringify({ services: [{ name: 'A', status: 'up', history: [ok] }] })).services[0].status, 'invalid');
});

test('uptimeOverWindow computes exact percentages and nulls', () => {
  const H = 3600;
  const svc = (o) => ({ name: 'A', status: 'up', since: ago(2 * H), ...o });
  const hist = [{ state: 'up', since: ago(30 * H) }, { state: 'down', since: ago(10 * H) }];
  assert.ok(Math.abs(uptimeOverWindow(svc({ history: hist, since: ago(9 * H) }), now) - 100 * 23 / 24) < 1e-9);
  assert.equal(uptimeOverWindow(svc({ since: ago(30 * H) }), now), 100);
  assert.equal(uptimeOverWindow(svc({ status: 'down', since: ago(30 * H) }), now), 0);
  assert.equal(uptimeOverWindow(svc({ since: ago(2 * H) }), now), null);
  assert.equal(uptimeOverWindow(svc({ history: [{ state: 'up', since: ago(10 * H) }] }), now), null);
  const unk = [{ state: 'up', since: ago(30 * H) }, { state: 'unknown', since: ago(12 * H) }];
  assert.ok(Math.abs(uptimeOverWindow(svc({ history: unk, since: ago(6 * H), status: 'down' }), now) - 100 * 12 / 18) < 1e-9);
  assert.equal(uptimeOverWindow(svc({ status: 'unknown', since: ago(30 * H) }), now), null);
  assert.equal(uptimeOverWindow(svc({ status: 'invalid', since: ago(30 * H) }), now), null);
  assert.equal(uptimeOverWindow({ name: 'A', status: 'up' }, now), null);
  assert.equal(uptimeOverWindow(svc({ since: ahead(H) }), now), null);
  assert.equal(uptimeOverWindow(svc({ since: ago(30 * H) }), 'bad'), null);
  assert.equal(uptimeOverWindow(svc({ since: ago(30 * H) }), now.getTime()), 100);
  assert.equal(uptimeOverWindow(svc({ since: ago(2 * H) }), now, H * 1000), 100);
  const frozen = Object.freeze(svc({ history: Object.freeze(hist), since: ago(9 * H) }));
  assert.doesNotThrow(() => uptimeOverWindow(frozen, now));
});

test('formatUptime rounds down to one decimal', () => {
  assert.equal(formatUptime(null), null);
  assert.equal(formatUptime(NaN), null);
  assert.equal(formatUptime(99.96), '99.9% up · 24 h');
  assert.equal(formatUptime(100), '100.0% up · 24 h');
  assert.equal(formatUptime(99.8), '99.8% up · 24 h');
  assert.equal(formatUptime(0), '0.0% up · 24 h');
  assert.equal(formatUptime(100 * 23 / 24), '95.8% up · 24 h');
});
