/* ==========================================================================
   MY BOOKINGS PAGE
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('bookings');
  renderFooter();
  requireAuth();
  loadBookings();
});

async function loadBookings() {
  const tbody = document.getElementById('bookingsTableBody');

  try {
    const { bookings } = await api.get('/bookings/my');

    if (!bookings || bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No bookings yet. <a href="events.html" style="color:var(--accent-bright)">Browse events →</a></td></tr>`;
      return;
    }

    tbody.innerHTML = bookings.map((b) => `
      <tr>
        <td style="font-family:monospace;color:var(--highlight);">${b.bookingCode}</td>
        <td>${b.event?.title || 'Event removed'}</td>
        <td>${b.event ? formatDate(b.event.date) : '-'}</td>
        <td>${b.seats}</td>
        <td>${formatCurrency(b.totalAmount)}</td>
        <td><span class="badge ${b.status}">${b.status}</span></td>
        <td>
          ${b.status === 'confirmed' ? `<button class="icon-btn danger" title="Cancel" data-id="${b._id}">✕</button>` : ''}
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.icon-btn.danger').forEach((btn) => {
      btn.addEventListener('click', () => cancelBooking(btn.dataset.id));
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">Couldn't load bookings.</td></tr>`;
  }
}

async function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;

  try {
    await api.put(`/bookings/${id}/cancel`, {});
    showToast('Booking cancelled successfully', 'success');
    loadBookings();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
