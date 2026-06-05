const TOKEN_KEY = 'arigatours_admin_token';

const API_BASE_URL = (() => {
  const { protocol, hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:3000`;
  }
  return `${protocol}//${hostname}`;
})();

const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const adminUserInfo = document.getElementById('admin-user-info');
const toursList = document.getElementById('tours-list');
const toursError = document.getElementById('tours-error');
const tourForm = document.getElementById('tour-form');
const tourFormError = document.getElementById('tour-form-error');
const tourFormSuccess = document.getElementById('tour-form-success');
const tourSubmitBtn = document.getElementById('tour-submit-btn');

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (typeof token !== 'string' || token.trim() === '') {
    clearToken();
    return;
  }
  localStorage.setItem(TOKEN_KEY, token.trim());
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function showMessage(element, message) {
  element.textContent = message;
  element.classList.remove('hidden');
}

function hideMessage(element) {
  element.textContent = '';
  element.classList.add('hidden');
}

function showLogin() {
  loginSection.classList.remove('hidden');
  adminPanel.classList.add('hidden');
  logoutBtn.classList.add('hidden');
  adminUserInfo.textContent = '';
}

function showPanel(usuario) {
  loginSection.classList.add('hidden');
  adminPanel.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
  adminUserInfo.textContent = `${usuario.email} · ${usuario.rol}`;
}

async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  // Only set Content-Type for JSON payloads; let the browser handle FormData boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401) {
    clearToken();
    showLogin();
    throw new Error(data?.error || 'Sesión expirada. Inicia sesión de nuevo.');
  }

  if (!response.ok) {
    throw new Error(data?.error || `Error ${response.status}`);
  }

  return data;
}

async function validateSession() {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    clearToken();
    showLogin();
    return false;
  }

  try {
    const data = await apiFetch('/api/auth/me');
    showPanel(data.usuario);
    return true;
  } catch {
    clearToken();
    showLogin();
    return false;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  hideMessage(loginError);

  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;

  try {
    const data = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || 'Credenciales inválidas');
      }
      return body;
    });

    setToken(data.token);
    loginForm.reset();
    showPanel(data.usuario);
    await loadTours();
  } catch (error) {
    clearToken();
    showMessage(loginError, error.message);
  }
}

function handleLogout() {
  clearToken();
  loginForm.reset();
  tourForm.reset();
  hideMessage(toursError);
  hideMessage(tourFormError);
  hideMessage(tourFormSuccess);
  showLogin();
}

function parseLines(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function renderTours(tours) {
  if (!tours.length) {
    toursList.innerHTML = '<p class="tour-meta">No hay tours registrados aún.</p>';
    return;
  }

  toursList.innerHTML = tours
    .map(
      (tour) => `
        <article class="tour-item">
          <div class="tour-item-info">
            <strong>${escapeHtml(tour.titulo)}</strong>
            <div class="tour-meta">
              <span class="tour-badge">${escapeHtml(tour.ciudad)}</span>
              <span class="tour-badge">${escapeHtml(tour.tematica)}</span>
              ${escapeHtml(tour.duracion)} · ${escapeHtml(tour.precio)}
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadTours() {
  hideMessage(toursError);
  toursList.innerHTML = '<p class="tour-meta">Cargando tours...</p>';

  try {
    const tours = await fetch(`${API_BASE_URL}/api/tours`).then(async (response) => {
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'No se pudieron cargar los tours');
      }
      return response.json();
    });

    renderTours(tours);
  } catch (error) {
    toursList.innerHTML = '';
    showMessage(toursError, error.message);
  }
}

async function handleCreateTour(event) {
  event.preventDefault();
  hideMessage(tourFormError);
  hideMessage(tourFormSuccess);

  tourSubmitBtn.disabled = true;
  tourSubmitBtn.innerHTML = '<span class="spinner"></span> Guardando…';

  try {
    // Build FormData so files are included automatically
    const fd = new FormData();
    fd.append('id', tourForm.id.value.trim());
    fd.append('ciudad', tourForm.ciudad.value.trim());
    fd.append('tematica', tourForm.tematica.value.trim());
    fd.append('titulo', tourForm.titulo.value.trim());
    fd.append('imagen', tourForm.imagen.value.trim());
    fd.append('duracion', tourForm.duracion.value.trim());
    fd.append('precio', tourForm.precio.value.trim());
    fd.append('puntoEncuentro', tourForm.puntoEncuentro.value.trim());
    fd.append('descripcion', tourForm.descripcion.value.trim());
    fd.append('galeria', tourForm.galeria.value);
    fd.append('incluye', tourForm.incluye.value);
    fd.append('noIncluye', tourForm.noIncluye.value);

    // Attach image file if provided
    const imagenFile = document.getElementById('tour-imagen-file').files[0];
    if (imagenFile) fd.append('imagenFile', imagenFile);

    // Attach gallery files if provided
    const galeriaFiles = document.getElementById('tour-galeria-files').files;
    for (const file of galeriaFiles) {
      fd.append('galeriaFiles', file);
    }

    await apiFetch('/api/tours', { method: 'POST', body: fd });

    tourForm.reset();
    document.getElementById('imagen-preview').innerHTML = '';
    document.getElementById('galeria-preview').innerHTML = '';
    showMessage(tourFormSuccess, '✓ Tour creado correctamente.');
    await loadTours();
  } catch (error) {
    showMessage(tourFormError, error.message);
  } finally {
    tourSubmitBtn.disabled = false;
    tourSubmitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Crear tour';
  }
}

function setupFilePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;

  input.addEventListener('change', () => {
    preview.innerHTML = '';
    for (const file of input.files) {
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  loginForm.addEventListener('submit', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  tourForm.addEventListener('submit', handleCreateTour);

  setupFilePreview('tour-imagen-file', 'imagen-preview');
  setupFilePreview('tour-galeria-files', 'galeria-preview');

  const isValid = await validateSession();
  if (isValid) {
    await loadTours();
  }
});
