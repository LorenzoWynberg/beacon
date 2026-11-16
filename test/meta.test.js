import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const html = readFileSync(fileURLToPath(new URL('../index.html', import.meta.url)), 'utf8');
const head = /<head>([\s\S]*?)<\/head>/.exec(html)[1];
const tags = head.match(/<(?:meta|link)\b[^>]*>/g) ?? [];

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) out[m[1]] = m[2];
  return out;
}

function find(attr, key) {
  return tags.map(attrs).filter((a) => a[attr] === key);
}

function one(attr, key, valueAttr, expected) {
  const found = find(attr, key);
  assert.equal(found.length, 1, `${key} must occur exactly once`);
  assert.equal(found[0][valueAttr], expected);
}

const URL_ = 'https://lorenzowynberg.github.io/beacon/';
const DESC = 'Live up/down status for every Beacon service, at a glance.';
const title = /<title>([^<]*)<\/title>/.exec(head)[1];

test('canonical link', () => {
  one('rel', 'canonical', 'href', URL_);
});

test('open graph tags', () => {
  one('property', 'og:type', 'content', 'website');
  one('property', 'og:site_name', 'content', 'Beacon');
  one('property', 'og:title', 'content', title);
  one('property', 'og:description', 'content', DESC);
  one('property', 'og:url', 'content', URL_);
});

test('twitter tags', () => {
  one('name', 'twitter:card', 'content', 'summary');
  one('name', 'twitter:title', 'content', title);
  one('name', 'twitter:description', 'content', DESC);
});

test('titles match <title> and descriptions match', () => {
  assert.equal(title, 'beacon — service status');
});

test('no image tags', () => {
  assert.equal(find('property', 'og:image').length, 0);
  assert.equal(find('name', 'twitter:image').length, 0);
});
