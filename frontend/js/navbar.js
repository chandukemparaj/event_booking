
function renderNavbar(activePage = '') {
  const mount = document.getElementById('navbar-mount');
  if (!mount) return;

  const user = getCurrentUser();

  const navLinks = `
    <a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a>
    <a href="events.html" class="${activePage === 'events' ? 'active' : ''}">Browse Events</a>
    ${user && (user.role === 'organizer' || user.role === 'admin')
      ? `<a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Organizer Studio</a>`
      : ''}
    ${user ? `<a href="my-bookings.html" class="${activePage === 'bookings' ? 'active' : ''}">My Bookings</a>` : ''}
  `;

  const rightSide = user
    ? `
      <div class="user-menu">
        <div class="avatar-badge" id="avatarToggle">${getInitials(user.name)}</div>
        <div class="dropdown" id="userDropdown">
          <a href="my-bookings.html">🎟 My Bookings</a>
          ${user.role !== 'user' ? '<a href="dashboard.html">📊 Dashboard</a>' : ''}
          <button id="logoutBtn">↪ Logout</button>
        </div>
      </div>
    `
    : `
      <a href="login.html" class="btn-ghost">Sign In</a>
      <a href="register.html" class="btn-solid">Sign Up</a>
    `;

  mount.innerHTML = `
    <nav class="navbar" id="mainNavbar">
      <div class="nav-left">
        <a href="index.html" class="logo">Event<span>IQ</span></a>
        <div class="nav-links">${navLinks}</div>
      </div>
      <div class="nav-right">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" id="navSearchInput" placeholder="Search events...">
        </div>
        ${rightSide}
      </div>
    </nav>
  `;

  // Dropdown toggle
  const avatarToggle = document.getElementById('avatarToggle');
  const dropdown = document.getElementById('userDropdown');
  if (avatarToggle) {
    avatarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Search redirect
  const searchInput = document.getElementById('navSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = `events.html?search=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }
}


function renderFooter() {
  const mount = document.getElementById('footer-mount');
  if (!mount) return;

  mount.innerHTML = `
    <footer class="footer">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="logo">Event<span>IQ</span></a>
          <p style="margin-top:14px;">Discover, book, and manage events effortlessly. Built as a full-stack web development capstone project.</p>
        </div>
        <div>
          <h4>Platform</h4>
          <a href="events.html">Browse Events</a>
          <a href="dashboard.html">Organizer Studio</a>
          <a href="my-bookings.html">My Bookings</a>
        </div>
        <div>
          <h4>Account</h4>
          <a href="login.html">Sign In</a>
          <a href="register.html">Create Account</a>
        </div>
        <div>
          <h4>Project</h4>
          <a href="#">Source Code (GitHub)</a>
          <a href="#">Documentation</a>
        </div>
      </div>
      <div class="footer-bottom">© 2026 EventIQ — Web Development Capstone Project.</div>
    </footer>
  `;
}
