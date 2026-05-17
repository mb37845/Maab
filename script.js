const yearNode = document.getElementById('year');
const shareButton = document.getElementById('shareButton');
const toast = document.getElementById('toast');
const logo = document.querySelector('.logo');
const fallback = document.querySelector('.logo-fallback');

yearNode.textContent = new Date().getFullYear();

logo.addEventListener('error', () => {
  logo.style.display = 'none';
  fallback.style.display = 'grid';
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
}

shareButton.addEventListener('click', async () => {
  const shareData = {
    title: 'Amlaak Energy Resources L.L.C.',
    text: 'Official links for Amlaak Energy Resources L.L.C.',
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    showToast('Page link copied');
  } catch (error) {
    showToast('Share cancelled');
  }
});

// ── Language Toggle ──
let currentLang = 'en';

function applyTranslations(lang) {
  const t = translations[lang];
  Object.keys(t).forEach(key => {
    const el = document.getElementById('t-' + key);
    if (!el) return;
    // For select options, update textContent but preserve value attribute
    el.textContent = t[key];
  });

  // Reset degree selection to placeholder when language switches
  const degreeEl = document.getElementById('degree');
  if (degreeEl) degreeEl.value = '';
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  const isAr = currentLang === 'ar';

  document.documentElement.lang = currentLang;
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';

  document.getElementById('lang-en').classList.toggle('active', !isAr);
  document.getElementById('lang-ar').classList.toggle('active', isAr);

  applyTranslations(currentLang);
}

// ── CV File Upload ──
const cvInput = document.getElementById('cvUpload');
const fileDropLabel = document.getElementById('fileDropLabel');
const fileTextEl = document.getElementById('t-cvDrop');

cvInput.addEventListener('change', () => {
  const file = cvInput.files[0];
  if (file) {
    fileTextEl.textContent = file.name;
    fileDropLabel.classList.add('has-file');
  }
});

// ── Apply Form Submit ──
async function handleApply(e) {
  e.preventDefault();
  const t = translations[currentLang];
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const civilId = document.getElementById('civilId').value.trim();
  const phonePrefix = document.getElementById('phonePrefix').value;
  const phoneNumber = document.getElementById('phone').value.trim();
  const phone = phonePrefix + ' ' + phoneNumber;
  const degree = document.getElementById('degree').value;
  const major = document.getElementById('major').value.trim();
  const cv = cvInput.files[0];

  if (!firstName || !lastName || !civilId || !phoneNumber || !degree || !major || !cv) {
    showToast(t.applyError);
    return;
  }

  const formData = new FormData();
  formData.append('firstName', firstName);
  formData.append('lastName', lastName);
  formData.append('civilId', civilId);
  formData.append('phone', phone);
  formData.append('phonePrefix', phonePrefix);
  formData.append('degree', degree);
  formData.append('major', major);
  formData.append('cvUpload', cv);

  const btn = document.querySelector('.apply-btn');
  btn.disabled = true;
  btn.style.opacity = '0.6';

  try {
    const res = await fetch('upload.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      showToast(t.applySuccess);
      e.target.reset();
      fileTextEl.textContent = t.cvDrop;
      fileDropLabel.classList.remove('has-file');
    } else {
      showToast(data.message || t.applyError);
    }
  } catch (err) {
    showToast(t.applyNetworkError);
  } finally {
    btn.disabled = false;
    btn.style.opacity = '';
  }
}