
let myEvents = [];

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('dashboard');
  requireAuth();
  requireRole('organizer', 'admin');

  setupTabs();
  setupModal();
  loadStats();
  loadMyEvents();
});


function setupTabs() {
  const links = document.querySelectorAll('.sidebar a[data-tab]');
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      links.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');

      const tab = link.dataset.tab;
      document.getElementById('overviewTab').classList.toggle('hidden', tab !== 'overview');
      document.getElementById('eventsTab').classList.toggle('hidden', tab !== 'events');
      document.getElementById('dashboardTitle').textContent = tab === 'overview' ? 'Organizer Overview' : 'My Events';
    });
  });

  document.getElementById('createEventLink').addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });
  document.getElementById('newEventBtn').addEventListener('click', () => openModal());
}


async function loadStats() {
  try {
    const { stats } = await api.get('/dashboard/stats');

    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Total Events</div>
        <div class="stat-value">${stats.totalEvents}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Bookings</div>
        <div class="stat-value accent">${stats.totalBookings}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value gold">${formatCurrency(stats.totalRevenue)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Seats Booked</div>
        <div class="stat-value green">${stats.totalSeatsBooked}</div>
      </div>
    `;

    const perfBody = document.getElementById('perfTableBody');
    if (stats.bookingsPerEvent.length === 0) {
      perfBody.innerHTML = `<tr><td colspan="4" class="empty-state">No events yet.</td></tr>`;
    } else {
      perfBody.innerHTML = stats.bookingsPerEvent.map((e) => `
        <tr>
          <td>${e.eventTitle}</td>
          <td>${e.seatsBooked}</td>
          <td>${e.totalSeats}</td>
          <td>${formatCurrency(e.revenue)}</td>
        </tr>
      `).join('');
    }
  } catch (error) {
    document.getElementById('statsGrid').innerHTML = `<div class="empty-state">Couldn't load stats.</div>`;
  }
}


async function loadMyEvents() {
  const tbody = document.getElementById('myEventsTableBody');
  try {
    const { events } = await api.get('/events/organizer/mine');
    myEvents = events;

    if (events.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No events created yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = events.map((e) => `
      <tr>
        <td>${e.title}</td>
        <td>${e.category}</td>
        <td>${formatDate(e.date)}</td>
        <td>${e.bookedSeats}/${e.totalSeats}</td>
        <td>${formatCurrency(e.price)}</td>
        <td>
          <button class="icon-btn" title="Edit" data-edit="${e._id}">✎</button>
          <button class="icon-btn danger" title="Delete" data-delete="${e._id}">🗑</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-edit]').forEach((btn) =>
      btn.addEventListener('click', () => openModal(btn.dataset.edit))
    );
    tbody.querySelectorAll('[data-delete]').forEach((btn) =>
      btn.addEventListener('click', () => deleteEvent(btn.dataset.delete))
    );
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Couldn't load events.</td></tr>`;
  }
}

async function deleteEvent(id) {
  if (!confirm('Delete this event permanently? This cannot be undone.')) return;
  try {
    await api.delete(`/events/${id}`);
    showToast('Event deleted', 'success');
    loadMyEvents();
    loadStats();
  } catch (error) {
    showToast(error.message, 'error');
  }
}


function setupModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('eventModal').addEventListener('click', (e) => {
    if (e.target.id === 'eventModal') closeModal();
  });
  document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);
}

function openModal(eventId = null) {
  const form = document.getElementById('eventForm');
  form.reset();
  document.getElementById('modalError').classList.remove('show');
  document.getElementById('eventId').value = '';

  if (eventId) {
    const event = myEvents.find((e) => e._id === eventId);
    if (event) {
      document.getElementById('modalTitle').textContent = 'Edit Event';
      document.getElementById('eventSubmitBtn').textContent = 'Save Changes';
      document.getElementById('eventId').value = event._id;
      document.getElementById('title').value = event.title;
      document.getElementById('description').value = event.description;
      document.getElementById('category').value = event.category;
      document.getElementById('banner').value = event.banner;
      document.getElementById('venue').value = event.venue;
      document.getElementById('date').value = event.date.split('T')[0];
      document.getElementById('time').value = event.time;
      document.getElementById('price').value = event.price;
      document.getElementById('totalSeats').value = event.totalSeats;
    }
  } else {
    document.getElementById('modalTitle').textContent = 'Create New Event';
    document.getElementById('eventSubmitBtn').textContent = 'Create Event';
  }

  document.getElementById('eventModal').classList.add('open');
}

function closeModal() {
  document.getElementById('eventModal').classList.remove('open');
}

async function handleEventSubmit(e) {
  e.preventDefault();
  const errorBox = document.getElementById('modalError');
  errorBox.classList.remove('show');

  const id = document.getElementById('eventId').value;
  const payload = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    category: document.getElementById('category').value,
    banner: document.getElementById('banner').value.trim() || undefined,
    venue: document.getElementById('venue').value.trim(),
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    price: Number(document.getElementById('price').value),
    totalSeats: Number(document.getElementById('totalSeats').value)
  };

  const submitBtn = document.getElementById('eventSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving…';

  try {
    if (id) {
      await api.put(`/events/${id}`, payload);
      showToast('Event updated successfully', 'success');
    } else {
      await api.post('/events', payload);
      showToast('Event created successfully', 'success');
    }
    closeModal();
    loadMyEvents();
    loadStats();
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.add('show');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = id ? 'Save Changes' : 'Create Event';
  }
}
