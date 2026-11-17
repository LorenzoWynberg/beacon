import { formatRelativeAge, groupServices, isFutureTimestamp, isStale, parseStatus } from './status.js';

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

function render({ updated, services }) {
  const now = Date.now();
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

  if (isStale(updated, now)) {
    const age = updatedAge;
    const banner = document.createElement('p');
    banner.className = 'banner';
    banner.textContent = age === 'unknown'
      ? 'This status may be stale — last updated time unknown'
      : `This status may be stale — last updated ${age}`;
    notices.append(banner);
  }

  const { grouped, groups } = groupServices(services);
  if (!grouped) {
    list.append(...services.map(serviceItem));
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
