import { formatRelativeAge, isStale, parseStatus } from './status.js';

const list = document.getElementById('services');
const notices = document.getElementById('notices');
const updatedEl = document.getElementById('updated');

function render({ updated, services }) {
  const updatedAge = formatRelativeAge(updated, Date.now());
  if (updatedAge === 'unknown') {
    updatedEl.textContent = 'Updated time unknown';
  } else {
    updatedEl.textContent = 'Updated ';
    const time = document.createElement('time');
    time.setAttribute('datetime', String(updated));
    time.title = new Date(updated).toLocaleString();
    time.textContent = updatedAge;
    updatedEl.append(time);
  }

  if (isStale(updated, Date.now())) {
    const age = formatRelativeAge(updated, Date.now());
    const banner = document.createElement('p');
    banner.className = 'banner';
    banner.textContent = age === 'unknown'
      ? 'This status may be stale — last updated time unknown'
      : `This status may be stale — last updated ${age}`;
    notices.append(banner);
  }

  for (const s of services) {
    const li = document.createElement('li');
    li.className = 'service';
    const name = document.createElement('span');
    name.className = 'service__name';
    name.textContent = s.name || 'Unnamed service';
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
    list.append(li);
  }
}

function showError() {
  updatedEl.textContent = '';
  notices.replaceChildren();
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
