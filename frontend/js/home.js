
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('home');
  renderFooter();
  loadHomeData();
});

async function loadHomeData() {
  try {
    const { events } = await api.get('/events');

    if (!events || events.length === 0) {
      document.getElementById('heroFeatured').innerHTML = `<div class="loader">No events yet</div>`;
      document.getElementById('railsContainer').innerHTML = `
        <div class="empty-state">
          <h3>No events yet</h3>
          <p>Be the first to create an event as an organizer.</p>
        </div>`;
      return;
    }

    renderFeaturedCard(events[0]);
    renderSections(events);
  } catch (error) {
    document.getElementById('heroFeatured').innerHTML = `<div class="loader">Couldn't load event</div>`;
    document.getElementById('railsContainer').innerHTML = `<div class="empty-state">Couldn't load events. Is the backend server running?</div>`;
    console.error(error);
  }
}

function renderFeaturedCard(event) {
  document.getElementById('heroFeatured').outerHTML = `
    <a href="event-detail.html?id=${event._id}" class="hero-card" id="heroFeatured">
      <img src="${event.banner}" alt="${event.title}">
      <div class="hero-card-body">
        <span class="hero-card-cat">${event.category} · Featured</span>
        <div class="hero-card-title">${event.title}</div>
        <div class="hero-card-meta">
          <span>${formatDate(event.date)}</span>
          <span>${formatCurrency(event.price)}</span>
        </div>
      </div>
    </a>
  `;
}

function renderSections(events) {
  const categories = [...new Set(events.map((e) => e.category))];
  const container = document.getElementById('railsContainer');
  container.innerHTML = '';

  container.appendChild(buildSection('Upcoming Events', events));

  categories.forEach((cat) => {
    const catEvents = events.filter((e) => e.category === cat);
    if (catEvents.length > 0) {
      container.appendChild(buildSection(`${cat}`, catEvents));
    }
  });
}

function buildSection(title, events) {
  const section = document.createElement('section');
  section.className = 'section';
  section.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">${title}</h2>
      <a href="events.html" class="section-link">View all →</a>
    </div>
    <div class="rail-track">
      ${events.map(eventCardHTML).join('')}
    </div>
  `;
  return section;
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
