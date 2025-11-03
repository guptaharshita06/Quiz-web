const loginForm = document.getElementById('login-form');
const toast = document.getElementById('toast');

function showToast(msg, duration=2000){
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'), duration);
}

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if(res.ok && data.token){
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast('Login successful! Redirecting...', 1500);
      setTimeout(()=>window.location.href='index.html', 1500);
    } else {
      showToast(data.message || 'Login failed', 2500);
    }
  } catch(err){
    console.error(err);
    showToast('Login error', 2500);
  }
});
