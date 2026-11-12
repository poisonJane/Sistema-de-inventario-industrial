document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('usuario').value.trim();
  const pass = document.getElementById('password').value.trim();

  const encontrado = USUARIOS.find(u => u.usuario === user && u.password === pass);

  if (encontrado) {
    localStorage.setItem('inv_sesion', JSON.stringify(encontrado));
    window.location.href = 'dashboard.html';
  } else {
    document.getElementById('loginError').textContent = 'Credenciales incorrectas';
  }
});