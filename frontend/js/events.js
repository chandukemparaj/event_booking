
const CATEGORIES = ['All', 'Music', 'Tech', 'Sports', 'Workshop', 'Conference', 'Comedy', 'Other'];
let activeCategory = 'All';
let activeSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('events');
  renderFooter();

  const params = new URLSearchParams(window.location.search);
  activeSearch = params.get('search') || '';

  renderCategoryChips();
  loadEvents();
});

function renderCategoryChips() {
  const container = document.getElementById('categoryChips');
  container.innerHTML = CATEGORIES.map(
    (cat) => `<button class="chip ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');

  container.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      activeCategory = chip.dataset.cat;
      renderCategoryChips();
      loadEvents();
    });
  });
}

async function loadEvents() {
  const grid = document.getElementById('eventsGrid');
  grid.innerHTML = '<div class="loader">Loading events…</div>';

  try {
    let query = '?';
    if (activeCategory !== 'All') query += `category=${activeCategory}&`;
    if (activeSearch) query += `search=${encodeURIComponent(activeSearch)}&`;

    const { events, count } = await api.get(`/events${query}`);

    document.getElementById('resultsCount').textContent =
      activeSearch ? `${count} result(s) for "${activeSearch}"` : `${count} event(s) available`;

    if (!events || events.length === 0) {
      grid.innerHTML = `<div class="empty-state"><h3>No events found</h3><p>Try a different category or search term.</p></div>`;
      return;
    }

    grid.innerHTML = events.map(eventCardHTML).join('');
  } catch (error) {
    grid.innerHTML = `<div class="empty-state">Couldn't load events. Is the backend server running?</div>`;
    console.error(error);
  }
}
function eventCardHTML(event) {
  const pct = Math.min(100, Math.round((event.bookedSeats / event.totalSeats) * 100));
  return `
    <a href="event-detail.html?id=${event._id}" class="event-card">
      <img src="${event.banner}" alt="${event.title}" class="event-card-img" loading="lazy">
      <div class="event-card-body">
        <span class="event-card-cat">${event.category}</span>
        <div class="event-card-title">${event.title}</div>
        <div class="event-card-meta">
          <span>${formatDate(event.date)}</span>
          <span class="event-card-price">${formatCurrency(event.price)}</span>
        </div>
        <div class="seats-bar"><div class="seats-bar-fill" style="width:${pct}%"></div></div>
      </div>
    </a>
  `;
}