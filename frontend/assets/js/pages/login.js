if (Session.get()) window.location.href = 'pages/dashboard.html';

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const { user } = await API.login(form.get('email'), form.get('password'));
    Session.set(user);
    window.location.href = 'pages/dashboard.html';
  } catch (err) {
    UI.toast(err.message, 'err');
  }
});
