
if (isLoggedIn() && (window.location.pathname.includes('login') || window.location.pathname.includes('register'))) {
  window.location.href = 'index.html';
}


document.addEventListener('DOMContentLoaded', () => {
  const roleRadios = document.querySelectorAll('input[name="role"]');
  roleRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      document.getElementById('labelUser').classList.toggle('selected', radio.value === 'user' && radio.checked);
      document.getElementById('labelOrganizer').classList.toggle('selected', radio.value === 'organizer' && radio.checked);
    });
  });
});

function showFormError(message) {
  const errorBox = document.getElementById('formError');
  errorBox.textContent = message;
  errorBox.classList.add('show');
}

function hideFormError() {
  document.getElementById('formError').classList.remove('show');
}


const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account…';

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    try {
      const data = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast(`Welcome to EventIQ, ${data.user.name.split(' ')[0]}!`, 'success');
      setTimeout(() => (window.location.href = 'index.html'), 600);
    } catch (error) {
      showFormError(error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}


const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success');
      setTimeout(() => (window.location.href = 'index.html'), 500);
    } catch (error) {
      showFormError(error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
}
