import { fetchWithTimeout, hasChanged, startPoller } from './refresh.js';
import { sortLeastReliableFirst } from './sort.js';
import { formatRelativeAge, formatSince, formatUptime, groupServices, isFutureTimestamp, isStale, parseStatus, uptimeOverWindow } from './status.js';

const list = document.getElementById('services');
const notices = document.getElementById('notices');
const updatedEl = document.getElementById('updated');

function uptimeText(s, now) {
  return formatUptime(uptimeOverWindow(s, now));
}

function uptimeSpan(text) {
  const span = document.createElement('span');
  span.className = 'service__uptime';
  span.textContent = text;
  return span;
}

function serviceItem(s, now) {
  const li = document.createElement('li');
  li.className = 'service';
  const name = document.createElement('span');
  name.className = 'service__name';
  name.textContent = s.name.trim() || 'Unnamed service';
  const badge = document.createElement('span');
  badge.className = `badge badge--${s.status}`;
  badge.textContent = { up: 'Up', down: 'Down', invalid: 'Invalid status' }[s.status] ?? 'Unknown';
  const sinceAge = formatSince(s.since, now);
  if (sinceAge === null) {
    li.append(name, badge);
  } else {
    const status = document.createElement('span');
    status.className = 'service__status';
    const since = document.createElement('span');
    since.className = 'service__since';
    const time = document.createElement('time');
    time.setAttribute('datetime', s.since);
    time.title = new Date(s.since).toLocaleString();
    time.textContent = sinceAge;
    since.append('· since ', time);
    status.append(badge, ' ', since);
    const uptime = uptimeText(s, now);
    if (uptime !== null) status.append(' ', uptimeSpan(uptime));
    li.append(name, status);
  }
  if (s.note) {
    const note = document.createElement('p');
    note.className = 'service__note';
    note.textContent = s.note;
    li.append(note);
  }
  return li;
}

function renderHeader(updated, now) {
  const updatedAge = formatRelativeAge(updated, now);
  if (updatedAge === 'unknown' && isFutureTimestamp(updated, now)) {
    updatedEl.textContent = 'Updated ';
    const time = document.createElement('time');
    time.setAttribute('datetime', String(updated));
    time.title = new Date(updated).toLocaleString();
    time.textContent = 'time unknown';
    updatedEl.append(time);
  } else if (updatedAge === 'unknown') {
    updatedEl.textContent = 'Updated time unknown';
  } else {
    updatedEl.textContent = 'Updated ';
    const time = document.createElement('time');
    time.setAttribute('datetime', String(updated));
    time.title = new Date(updated).toLocaleString();
    time.textContent = updatedAge;
    updatedEl.append(time);
  }

  const existing = notices.querySelector('p.banner');
  if (!isStale(updated, now)) {
    if (existing) existing.remove();
    return;
  }
  const text = updatedAge === 'unknown'
    ? 'This status may be stale — last updated time unknown'
    : `This status may be stale — last updated ${updatedAge}`;
  if (existing && existing.textContent === text) return;
  const banner = document.createElement('p');
  banner.className = 'banner';
  banner.textContent = text;
  if (existing) existing.replaceWith(banner);
  else notices.append(banner);
}

let sortOn = false;
let lastOrder = [];

function orderedGroups(services, now) {
  const { grouped, groups } = groupServices(services);
  if (!sortOn) return { grouped, groups };
  return { grouped, groups: groups.map((g) => ({ ...g, services: sortLeastReliableFirst(g.services, now) })) };
}

// Flat list in rendered order, so cards pair with services by index.
function displayOrder(services, now) {
  return orderedGroups(services, now).groups.flatMap((g) => g.services);
}

function renderServices(services, now) {
  document.querySelectorAll('main > section.group').forEach((el) => el.remove());
  if (!list.isConnected) notices.after(list);
  list.replaceChildren();
  const { grouped, groups } = orderedGroups(services, now);
  lastOrder = groups.flatMap((g) => g.services);
  if (!grouped) {
    list.append(...groups[0].services.map((s) => serviceItem(s, now)));
    return;
  }
  groups.forEach((g, i) => {
    const section = document.createElement('section');
    section.className = 'group';
    const h = document.createElement('h2');
    h.id = `group-${i}`;
    h.className = 'group__title';
    h.textContent = g.name;
    const ul = document.createElement('ul');
    ul.className = 'services';
    ul.setAttribute('aria-labelledby', h.id);
    ul.append(...g.services.map((s) => serviceItem(s, now)));
    section.append(h, ul);
    list.before(section);
  });
  list.remove();
}

// Unchanged refetch: keep the service nodes, only advance each "since" age in place.
function refreshSinceAges(now) {
  document.querySelectorAll('.service__since time').forEach((time) => {
    const age = formatSince(time.getAttribute('datetime'), now);
    if (age !== null && time.textContent !== age) time.textContent = age;
  });
}

// Unchanged refetch: cards are in groupServices flat order, so pair them by index.
function refreshUptimes(now) {
  const services = displayOrder(lastStatus.services, now);
  const cards = document.querySelectorAll('li.service');
  if (cards.length !== services.length) return;
  cards.forEach((card, i) => {
    const status = card.querySelector('.service__status');
    if (!status) return;
    const text = uptimeText(services[i], now);
    const span = status.querySelector('.service__uptime');
    if (text === null) {
      if (!span) return;
      const prev = span.previousSibling;
      if (prev && prev.nodeType === 3 && prev.textContent === ' ') prev.remove();
      span.remove();
    } else if (span) {
      if (span.textContent !== text) span.textContent = text;
    } else {
      status.append(' ', uptimeSpan(text));
    }
  });
}

function showError() {
  updatedEl.textContent = '';
  notices.replaceChildren();
  document.querySelectorAll('main > section.group').forEach((el) => el.remove());
  list.replaceChildren();
  const box = document.createElement('div');
  box.className = 'error';
  box.setAttribute('role', 'alert');
  const h = document.createElement('h2');
  h.textContent = 'Status unavailable';
  const p = document.createElement('p');
  p.textContent = "The status data couldn't be loaded.";
  box.append(h, p);
  notices.append(box);
}

async function fetchText() {
  const timer = { setTimeout: (cb, ms) => setTimeout(cb, ms), clearTimeout: (id) => clearTimeout(id) };
  // The body is read inside the timed fetch so a stalled body is aborted too.
  return fetchWithTimeout(
    async (url, init) => {
      const res = await fetch(url, init);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    },
    `status.json?t=${Date.now()}`,
    { cache: 'no-store' },
    { timer },
  );
}

const sortToggle = document.getElementById('sort-toggle');
if (sortToggle) {
  sortToggle.addEventListener('click', () => {
    sortOn = !sortOn;
    sortToggle.setAttribute('aria-pressed', String(sortOn));
    sortToggle.textContent = `Least reliable first: ${sortOn ? 'on' : 'off'}`;
    if (lastStatus) renderServices(lastStatus.services, Date.now());
  });
}

let lastText;
let lastStatus;

async function refetch() {
  try {
    const text = await fetchText();
    if (!hasChanged(lastText, text)) {
      const now = Date.now();
      renderHeader(lastStatus.updated, now);
      const order = sortOn ? displayOrder(lastStatus.services, now) : null;
      if (order && order.some((s, i) => s !== lastOrder[i])) {
        renderServices(lastStatus.services, now);
        return;
      }
      refreshSinceAges(now);
      refreshUptimes(now);
      return;
    }
    const status = parseStatus(text);
    const now = Date.now();
    renderHeader(status.updated, now);
    renderServices(status.services, now);
    lastText = text;
    lastStatus = status;
  } catch (err) {
    console.warn('status.json refresh failed:', err);
  }
}

try {
  const text = await fetchText();
  const status = parseStatus(text);
  const now = Date.now();
  renderHeader(status.updated, now);
  renderServices(status.services, now);
  lastText = text;
  lastStatus = status;
  startPoller({
    run: refetch,
    timer: { setInterval: (cb, ms) => setInterval(cb, ms), clearInterval: (id) => clearInterval(id) },
    doc: document,
    now: Date.now,
  });
} catch (err) {
  console.warn('status.json could not be loaded:', err);
  showError();
}
