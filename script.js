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
    if (el) el.textContent = t[key];
  });
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
