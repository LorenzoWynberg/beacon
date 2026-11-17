import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEME_STORAGE_KEY, nextTheme, readStoredTheme, resolveTheme, writeStoredTheme } from '../src/theme.js';

const memory = (init = {}) => {
  const d = { ...init };
  return { d, getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = v; } };
};
const throwing = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };

test('storage key', () => {
  assert.equal(THEME_STORAGE_KEY, 'beacon-theme');
});

test('stored choice wins over OS preference; otherwise OS decides', () => {
  for (const p of [true, false]) {
    assert.equal(resolveTheme('dark', p), 'dark');
    assert.equal(resolveTheme('light', p), 'light');
  }
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme(null, false), 'light');
});

test('readStoredTheme accepts only light/dark', () => {
  assert.equal(readStoredTheme(memory({ 'beacon-theme': 'dark' })), 'dark');
  assert.equal(readStoredTheme(memory({ 'beacon-theme': 'light' })), 'light');
  assert.equal(readStoredTheme(memory({ 'beacon-theme': 'purple' })), null);
  assert.equal(readStoredTheme(memory()), null);
});

test('blocked or missing storage never throws', () => {
  assert.equal(readStoredTheme(throwing), null);
  assert.equal(readStoredTheme(null), null);
  assert.equal(writeStoredTheme(throwing, 'dark'), false);
  assert.equal(writeStoredTheme(null, 'dark'), false);
});

test('writeStoredTheme stores under the key', () => {
  const s = memory();
  assert.equal(writeStoredTheme(s, 'dark'), true);
  assert.equal(s.d['beacon-theme'], 'dark');
});

test('nextTheme flips both ways', () => {
  assert.equal(nextTheme('dark'), 'light');
  assert.equal(nextTheme('light'), 'dark');
});
