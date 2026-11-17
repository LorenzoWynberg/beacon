import { groupServices, parseStatus } from './status.js';
import { computeFreshness, startFreshnessClock } from './freshness.js';

const list = document.getElementById('services');
const notices = document.getElementById('notices');
const updatedEl = document.getElementById('updated');

function serviceItem(s) {
  const li = document.createElement('li');
  li.className = 'service';
  const name = document.createElement('span');
  name.className = 'service__name';
  name.textContent = s.name.trim() || 'Unnamed service';
  const badge = document.createElement('span');
  badge.className = `badge badge--${s.status}`;
  badge.textContent = s.status === 'up' ? 'Up' : s.status === 'down' ? 'Down' : 'Unknown';
  li.append(name, badge);
  if (s.note) {
    const note = document.createElement('p');
    note.className = 'service__note';
    note.textContent = s.note;
    li.append(note);
  }
  return li;
}

let bannerEl = null;

function renderFreshness(updated) {
  const { age, future, bannerText } = computeFreshness(updated, Date.now());
  if (age === 'unknown' && !future) {
    updatedEl.textContent = 'Updated time unknown';
  } else {
    updatedEl.textContent = 'Updated ';
    const time = document.createElement('time');
    time.setAttribute('datetime', String(updated));
    time.title = new Date(updated).toLocaleString();
    time.textContent = future ? 'time unknown' : age;
    updatedEl.append(time);
  }

  if (bannerText === null) {
    if (bannerEl) bannerEl.remove();
    bannerEl = null;
  } else if (!bannerEl) {
    bannerEl = document.createElement('p');
    bannerEl.className = 'banner';
    bannerEl.textContent = bannerText;
    notices.append(bannerEl);
  } else if (bannerEl.textContent !== bannerText) {
    bannerEl.textContent = bannerText;
  }
}

function render({ updated, services }) {
  renderFreshness(updated);

  const { grouped, groups } = groupServices(services);
  if (!grouped) {
    list.append(...services.map(serviceItem));
    startFreshnessClock(() => renderFreshness(updated));
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
    ul.append(...g.services.map(serviceItem));
    section.append(h, ul);
    list.before(section);
  });
  list.remove();
  startFreshnessClock(() => renderFreshness(updated));
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

try {
  const res = await fetch(`status.json?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  render(parseStatus(await res.text()));
} catch (err) {
  console.warn('status.json could not be loaded:', err);
  showError();
}
