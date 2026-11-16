import { formatRelativeAge, parseStatus } from './status.js';

const list = document.getElementById('services');
const updatedEl = document.getElementById('updated');

function render({ updated, services }) {
  updatedEl.textContent = 'Updated ';
  const time = document.createElement('time');
  time.setAttribute('datetime', String(updated));
  time.title = new Date(updated).toLocaleString();
  time.textContent = formatRelativeAge(updated, Date.now());
  updatedEl.append(time);

  for (const s of services) {
    const li = document.createElement('li');
    li.className = 'service';
    const name = document.createElement('span');
    name.className = 'service__name';
    name.textContent = s.name;
    const badge = document.createElement('span');
    const down = s.status === 'down';
    badge.className = `badge badge--${down ? 'down' : 'up'}`;
    badge.textContent = down ? 'Down' : 'Up';
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

try {
  const res = await fetch('status.json');
  render(parseStatus(await res.text()));
} catch {
  updatedEl.textContent = 'Status is unavailable right now.';
}
