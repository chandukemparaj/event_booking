/* ==========================================================================
   EVENT DETAIL PAGE — view event + book tickets (Module 3)
   ========================================================================== */
let currentEvent = null;
let selectedSeats = 1;

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('events');
  renderFooter();
  loadEvent();
});

function getEventIdFromURL() {
  return new URLSearchParams(window.location.search).get('id');
}

async function loadEvent() {
  const id = getEventIdFromURL();
  const container = document.getElementById('eventDetailContainer');

  if (!id) {
    container.innerHTML = `<div class="empty-state">No event specified.</div>`;
    return;
  }

  try {
    const { event } = await api.get(`/events/${id}`);
    currentEvent = event;
    renderEvent(event);
  } catch (error) {
    container.innerHTML = `<div class="empty-state">Event not found.</div>`;
  }
}

function renderEvent(event) {
  const container = document.getElementById('eventDetailContainer');
  const available = event.availableSeats;
  const isFree = event.price === 0;
  const isSoldOut = available <= 0;

  container.innerHTML = `
    <div>
      <img src="${event.banner}" alt="${event.title}" class="event-detail-banner">
      <h1 class="event-detail-title">${event.title}</h1>
      <div class="event-detail-tags">
        <span class="tag">${event.category}</span>
        <span class="tag">📅 ${formatDate(event.date)}</span>
        <span class="tag">🕐 ${event.time}</span>
        <span class="tag">📍 ${event.venue}</span>
        <span class="tag">Organized by ${event.organizer?.name || 'EventIQ'}</span>
      </div>
      <p class="event-detail-desc">${event.description}</p>
    </div>

    <div class="booking-panel">
      <div class="booking-price ${isFree ? 'free' : ''}">${formatCurrency(event.price)} <span style="font-size:13px;color:var(--text-muted);font-weight:400;">/ seat</span></div>
      <div class="booking-seats-left">${isSoldOut ? '❌ Sold out' : `💺 ${available} of ${event.totalSeats} seats available`}</div>

      ${!isSoldOut ? `
        <div class="qty-control">
          <button class="qty-btn" id="qtyMinus">−</button>
          <span class="qty-value" id="qtyValue">1</span>
          <button class="qty-btn" id="qtyPlus">+</button>
        </div>
        <div class="booking-total">
          <span>Total Amount</span>
          <span id="totalAmount">${formatCurrency(event.price)}</span>
        </div>
        <button class="btn-highlight btn-full" id="bookBtn" style="margin-top:20px;">🎟 Confirm Booking</button>
      ` : `<button class="btn-ghost btn-full" disabled style="margin-top:10px;opacity:0.5;">Sold Out</button>`}
    </div>
  `;

  if (!isSoldOut) {
    document.getElementById('qtyMinus').addEventListener('click', () => updateQty(-1, available));
    document.getElementById('qtyPlus').addEventListener('click', () => updateQty(1, available));
    document.getElementById('bookBtn').addEventListener('click', handleBooking);
  }
}

function updateQty(delta, max) {
  selectedSeats = Math.min(max, Math.max(1, selectedSeats + delta));
  document.getElementById('qtyValue').textContent = selectedSeats;
  document.getElementById('totalAmount').textContent = formatCurrency(selectedSeats * currentEvent.price);
}

async function handleBooking() {
  if (!isLoggedIn()) {
    showToast('Please sign in to book tickets', 'error');
    setTimeout(() => (window.location.href = 'login.html'), 1000);
    return;
  }

  const bookBtn = document.getElementById('bookBtn');
  bookBtn.disabled = true;
  bookBtn.textContent = 'Processing…';

  try {
    const { booking } = await api.post('/bookings', {
      eventId: currentEvent._id,
      seats: selectedSeats
    });

    window.location.href = `booking-confirmation.html?id=${booking._id}`;
  } catch (error) {
    showToast(error.message, 'error');
    bookBtn.disabled = false;
    bookBtn.textContent = '🎟 Confirm Booking';
  }
}
