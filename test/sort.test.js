import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortLeastReliableFirst } from '../src/sort.js';

const now = new Date('2026-11-16T18:00:00Z');
const ago = (h) => new Date(now.getTime() - h * 3600_000).toISOString();

const perfect = (name) => ({ name, status: 'up', since: ago(100) });
const noData = (name) => ({ name, status: 'up', since: ago(1) });
const names = (l) => l.map((s) => s.name);

test('orders ascending by 24 h uptime', () => {
  const a = perfect('a');
  const b = { name: 'b', status: 'down', since: ago(12), history: [{ state: 'up', since: ago(100) }] }; // 50%
  const c = { name: 'c', status: 'down', since: ago(2), history: [{ state: 'up', since: ago(100) }] }; // ~91%
  assert.deepEqual(names(sortLeastReliableFirst([a, c, b], now)), ['b', 'c', 'a']);
});

test('ties keep input order', () => {
  assert.deepEqual(names(sortLeastReliableFirst([perfect('x'), perfect('y'), perfect('z')], now)), ['x', 'y', 'z']);
});

test('no-data services go last, in input order', () => {
  const bad = { name: 'bad', status: 'down', since: ago(12), history: [{ state: 'up', since: ago(100) }] };
  const out = sortLeastReliableFirst([noData('n1'), perfect('ok'), noData('n2'), bad], now);
  assert.deepEqual(names(out), ['bad', 'ok', 'n1', 'n2']);
});

test('does not mutate input and returns a new array', () => {
  const input = [noData('n'), perfect('p')];
  const out = sortLeastReliableFirst(input, now);
  assert.notEqual(out, input);
  assert.deepEqual(names(input), ['n', 'p']);
  assert.deepEqual(names(out), ['p', 'n']);
});

test('empty list', () => {
  assert.deepEqual(sortLeastReliableFirst([], now), []);
});
