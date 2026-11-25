// ============ BROD — Admin Control Room JavaScript ============

let currentData = null;
let originalData = null;
let isDirty = false;

// Credentials
let adminPassword = sessionStorage.getItem('brod_admin_pass') || '';
let githubToken = sessionStorage.getItem('brod_gh_token') || '';
let repoOwner = 'martinc1994';
let repoName = 'brodDj';

// DOM Elements
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const adminPassInput = document.getElementById('admin-pass');
const githubTokenInput = document.getElementById('github-token-input');
const githubOwnerInput = document.getElementById('github-owner-input');
const githubRepoInput = document.getElementById('github-repo-input');
const loginError = document.getElementById('login-error');
const appContainer = document.getElementById('app-container');
const logoutBtn = document.getElementById('logout-btn');

// Status Modal
const statusModal = document.getElementById('status-modal');
const modalSpinner = document.getElementById('modal-spinner');
const modalTitle = document.getElementById('modal-title');
const modalMsg = document.getElementById('modal-msg');
const modalActions = document.getElementById('modal-actions');
const modalCloseBtn = document.getElementById('modal-close-btn');

// Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Tracks Tab
const tracksList = document.getElementById('tracks-list');
const addTrackBtn = document.getElementById('add-track-btn');
const trackFormCard = document.getElementById('track-form-card');
const trackForm = document.getElementById('track-form');
const trackFormTitle = document.getElementById('track-form-title');
const trackEditIndex = document.getElementById('track-edit-index');
const trackTitleInput = document.getElementById('track-title-input');
const trackDateInput = document.getElementById('track-date-input');
const trackUrlInput = document.getElementById('track-url-input');
const trackPreviewBox = document.getElementById('track-preview-box');
const cancelTrackBtn = document.getElementById('cancel-track-btn');

// Sticky Bar
const saveStatusText = document.getElementById('save-status-text');
const publishBtn = document.getElementById('publish-btn');
const discardChangesBtn = document.getElementById('discard-changes-btn');

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  // If already logged in this session
  if (adminPassword || githubToken) {
    authenticateAndLoad();
  }

  setupEventListeners();
});

function setupEventListeners() {
  // Login submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    adminPassword = adminPassInput.value.trim();
    githubToken = githubTokenInput.value.trim();
    repoOwner = githubOwnerInput.value.trim() || 'martinc1994';
    repoName = githubRepoInput.value.trim() || 'brodDj';

    sessionStorage.setItem('brod_admin_pass', adminPassword);
    if (githubToken) sessionStorage.setItem('brod_gh_token', githubToken);

    authenticateAndLoad();
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('brod_admin_pass');
    sessionStorage.removeItem('brod_gh_token');
    window.location.reload();
  });

  // Tabs switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Tracks Form Toggle
  addTrackBtn.addEventListener('click', () => {
    openTrackForm();
  });

  cancelTrackBtn.addEventListener('click', () => {
    closeTrackForm();
  });

  // Live SoundCloud Preview while typing
  trackUrlInput.addEventListener('input', () => {
    updateSoundCloudPreview(trackUrlInput.value.trim());
  });

  // Track Form Submit
  trackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveTrackFromForm();
  });

  // Media File Uploads
  setupImageUploads();

  // Publish / Save Changes
  publishBtn.addEventListener('click', () => {
    publishChanges();
  });

  // Discard changes
  discardChangesBtn.addEventListener('click', () => {
    if (confirm('¿Estás seguro de descartar todos los cambios no guardados?')) {
      currentData = JSON.parse(JSON.stringify(originalData));
      populateFormFields(currentData);
      renderTracksList();
      setDirty(false);
    }
  });

  modalCloseBtn.addEventListener('click', () => {
    statusModal.classList.remove('active');
  });
}

// ============ AUTH & LOAD DATA ============
async function authenticateAndLoad() {
  loginError.classList.add('hidden');

  try {
    const res = await fetch('../data/content.json?v=' + Date.now());
    if (!res.ok) throw new Error('No se pudo cargar data/content.json');

    const data = await res.json();
    currentData = JSON.parse(JSON.stringify(data));
    originalData = JSON.parse(JSON.stringify(data));

    // Show App
    loginModal.classList.remove('active');
    appContainer.classList.remove('hidden');

    // Populate UI
    populateFormFields(currentData);
    renderTracksList();
    setDirty(false);
  } catch (err) {
    loginError.textContent = 'Error al cargar los datos: ' + err.message;
    loginError.classList.remove('hidden');
  }
}

// ============ TRACKS MANAGEMENT ============
function renderTracksList() {
  if (!currentData || !currentData.tracks) return;

  // Auto-sort newest to oldest
  currentData.tracks.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  tracksList.innerHTML = '';

  if (currentData.tracks.length === 0) {
    tracksList.innerHTML = '<p class="hint text-center" style="padding: 24px;">No hay sets cargados todavía. Hacé click en "Nuevo Set".</p>';
    return;
  }

  currentData.tracks.forEach((track, index) => {
    const item = document.createElement('div');
    item.className = 'track-item';
    item.innerHTML = `
      <div class="track-item-header">
        <div class="track-meta">
          <span class="track-order-badge">#${index + 1}</span>
          <span class="track-date-badge">📅 ${track.date || 'Sin fecha'}</span>
          <span class="status-indicator">
            <span class="status-dot ${track.active !== false ? '' : 'inactive'}"></span>
            ${track.active !== false ? 'Visible en la web' : 'Pausado'}
          </span>
        </div>
        <div class="track-controls">
          <button class="btn btn-ghost btn-sm toggle-track-btn" data-index="${index}">
            ${track.active !== false ? 'Ocultar' : 'Mostrar'}
          </button>
          <button class="btn btn-ghost btn-sm edit-track-btn" data-index="${index}">Editar</button>
          <button class="btn btn-danger btn-sm delete-track-btn" data-index="${index}">Eliminar</button>
        </div>
      </div>
      <div class="track-title">${escapeHtml(track.title)}</div>
      <div class="track-item-iframe">
        <iframe
          width="100%"
          height="166"
          scrolling="no"
          frameborder="no"
          allow="autoplay"
          src="https://w.soundcloud.com/player/?url=${encodeURIComponent(track.url)}&color=%23e11d48&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true"
          loading="lazy"
        ></iframe>
      </div>
    `;

    // Event listeners
    item.querySelector('.toggle-track-btn').addEventListener('click', () => {
      track.active = track.active === false ? true : false;
      renderTracksList();
      setDirty(true);
    });

    item.querySelector('.edit-track-btn').addEventListener('click', () => {
      openTrackForm(index);
    });

    item.querySelector('.delete-track-btn').addEventListener('click', () => {
      if (confirm(`¿Eliminar "${track.title}"?`)) {
        currentData.tracks.splice(index, 1);
        renderTracksList();
        setDirty(true);
      }
    });

    tracksList.appendChild(item);
  });
}

function openTrackForm(index = -1) {
  trackEditIndex.value = index;

  if (index >= 0) {
    const track = currentData.tracks[index];
    trackFormTitle.textContent = 'Editar Set';
    trackTitleInput.value = track.title;
    trackDateInput.value = track.date || '';
    trackUrlInput.value = track.url;
    updateSoundCloudPreview(track.url);
  } else {
    trackFormTitle.textContent = 'Agregar Nuevo Set';
    trackTitleInput.value = '';
    trackDateInput.value = new Date().toISOString().split('T')[0]; // Default today
    trackUrlInput.value = '';
    trackPreviewBox.innerHTML = '<p class="hint">Ingresá el enlace de SoundCloud para previsualizar.</p>';
  }

  trackFormCard.classList.remove('hidden');
  trackFormCard.scrollIntoView({ behavior: 'smooth' });
}

function closeTrackForm() {
  trackFormCard.classList.add('hidden');
}

function updateSoundCloudPreview(url) {
  if (!url || !url.includes('soundcloud.com')) {
    trackPreviewBox.innerHTML = '<p class="hint">Ingresá un enlace válido de SoundCloud.</p>';
    return;
  }

  trackPreviewBox.innerHTML = `
    <iframe
      width="100%"
      height="166"
      scrolling="no"
      frameborder="no"
      allow="autoplay"
      src="https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23e11d48&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true"
    ></iframe>
  `;
}

function saveTrackFromForm() {
  const index = parseInt(trackEditIndex.value, 10);
  const title = trackTitleInput.value.trim();
  const date = trackDateInput.value;
  const url = trackUrlInput.value.trim();

  if (!title || !date || !url) return;

  const trackObj = {
    id: 'set-' + Date.now(),
    title,
    url,
    date,
    active: true
  };

  if (index >= 0) {
    currentData.tracks[index].title = title;
    currentData.tracks[index].date = date;
    currentData.tracks[index].url = url;
  } else {
    currentData.tracks.push(trackObj);
  }

  // Auto-sort newest to oldest
  currentData.tracks.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  closeTrackForm();
  renderTracksList();
  setDirty(true);
}

// ============ FORM FIELDS (TEXTS & SOCIALS) ============
function populateFormFields(data) {
  // Hero
  if (data.hero) {
    setVal('hero-tagline-es', data.hero.tagline_es);
    setVal('hero-tagline-en', data.hero.tagline_en);
    setVal('hero-img-path', data.hero.image);
    setImg('hero-img-preview', data.hero.image);
  }

  // About
  if (data.about) {
    setVal('about-bio1-es', data.about.bio1_es);
    setVal('about-bio1-en', data.about.bio1_en);
    setVal('about-bio2-es', data.about.bio2_es);
    setVal('about-bio2-en', data.about.bio2_en);
    setVal('stat-sets-input', data.about.statSets);
    setVal('stat-followers-input', data.about.statFollowers);
    setVal('stat-groove-input', data.about.statGroove);
    setVal('about-img-path', data.about.image);
    setImg('about-img-preview', data.about.image);
  }

  // Socials
  if (data.socials) {
    setVal('social-instagram', data.socials.instagram);
    setVal('social-soundcloud', data.socials.soundcloud);
    setVal('social-spotify', data.socials.spotify);
    setVal('social-presskit', data.socials.presskit);
    setVal('social-youtube', data.socials.youtube_press);
  }

  // Listen to input changes
  document.querySelectorAll('#tab-texts input, #tab-texts textarea, #tab-socials input').forEach(input => {
    input.addEventListener('input', () => {
      collectFormData();
      setDirty(true);
    });
  });
}

function collectFormData() {
  if (!currentData) return;

  // Hero
  currentData.hero = {
    tagline_es: getVal('hero-tagline-es'),
    tagline_en: getVal('hero-tagline-en'),
    image: getVal('hero-img-path')
  };

  // About
  currentData.about = {
    bio1_es: getVal('about-bio1-es'),
    bio1_en: getVal('about-bio1-en'),
    bio2_es: getVal('about-bio2-es'),
    bio2_en: getVal('about-bio2-en'),
    statSets: getVal('stat-sets-input'),
    statFollowers: getVal('stat-followers-input'),
    statGroove: getVal('stat-groove-input'),
    image: getVal('about-img-path')
  };

  // Socials
  currentData.socials = {
    instagram: getVal('social-instagram'),
    soundcloud: getVal('social-soundcloud'),
    spotify: getVal('social-spotify'),
    presskit: getVal('social-presskit'),
    youtube_press: getVal('social-youtube')
  };
}

// ============ IMAGE UPLOAD HANDLER ============
function setupImageUploads() {
  const heroFile = document.getElementById('hero-img-file');
  const aboutFile = document.getElementById('about-img-file');

  if (heroFile) {
    heroFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      handleFileSelected(file, 'hero-img-path', 'hero-img-preview');
    });
  }

  if (aboutFile) {
    aboutFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      handleFileSelected(file, 'about-img-path', 'about-img-preview');
    });
  }
}

async function handleFileSelected(file, pathInputId, previewImgId) {
  // Read base64 for preview
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target.result.split(',')[1];
    document.getElementById(previewImgId).src = e.target.result;

    // Sanitize filename
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const targetPath = `assets/img/${cleanName}`;
    document.getElementById(pathInputId).value = targetPath;

    collectFormData();
    setDirty(true);

    // Save image to upload queue
    window.pendingImageUpload = {
      filename: cleanName,
      base64: base64Data
    };
  };
  reader.readAsDataURL(file);
}

// ============ DIRTY STATE & PUBLISH ============
function setDirty(dirty) {
  isDirty = dirty;
  if (dirty) {
    saveStatusText.textContent = 'Hay cambios sin publicar';
    saveStatusText.style.color = 'var(--warning)';
    publishBtn.classList.add('pulse-btn');
  } else {
    saveStatusText.textContent = 'Todos los cambios están publicados.';
    saveStatusText.style.color = 'var(--text-muted)';
    publishBtn.classList.remove('pulse-btn');
  }
}

async function publishChanges() {
  collectFormData();

  // Show status modal
  statusModal.classList.add('active');
  modalSpinner.classList.remove('hidden');
  modalTitle.textContent = 'Publicando cambios en la web...';
  modalMsg.textContent = 'Enviando actualización a GitHub. Netlify desplegará la nueva versión automáticamente en ~1 minuto.';
  modalActions.classList.add('hidden');

  try {
    // 1. If an image upload is pending, upload it first
    if (window.pendingImageUpload) {
      modalMsg.textContent = 'Subiendo imagen a GitHub...';
      const imgRes = await fetch('/.netlify/functions/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          customToken: githubToken,
          customOwner: repoOwner,
          customRepo: repoName,
          imageUpload: window.pendingImageUpload
        })
      });
      if (!imgRes.ok) {
        const errJson = await imgRes.json();
        throw new Error(errJson.error || 'Error al subir imagen');
      }
      window.pendingImageUpload = null;
    }

    // 2. Save content.json
    modalMsg.textContent = 'Actualizando lista de tracks y textos en GitHub...';
    const res = await fetch('/.netlify/functions/save-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: adminPassword,
        customToken: githubToken,
        customOwner: repoOwner,
        customRepo: repoName,
        content: currentData,
        commitMessage: 'Actualizar sets y contenido desde Panel Admin BROD'
      })
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || 'No se pudo guardar');
    }

    // Success!
    modalSpinner.classList.add('hidden');
    modalTitle.textContent = '¡Publicación Exitosa! 🎉';
    modalMsg.textContent = 'Los cambios se guardaron en el repositorio de GitHub. Netlify está compilando y en ~1 minuto estarán visibles en brodtechno.com.';
    modalActions.classList.remove('hidden');

    originalData = JSON.parse(JSON.stringify(currentData));
    setDirty(false);

  } catch (err) {
    modalSpinner.classList.add('hidden');
    modalTitle.textContent = 'Error al publicar';
    modalMsg.textContent = err.message + ' (Verificá la contraseña o token configurado en Netlify).';
    modalActions.classList.remove('hidden');
  }
}

// Helpers
function getVal(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function setVal(id, val) { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; }
function setImg(id, src) {
  const el = document.getElementById(id);
  if (el && src) {
    el.src = src.startsWith('assets') ? '../' + src : src;
  }
}
function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}
