(() => {
  const translations = {
    en: {
      title: 'Thank you · Sandra & Benjamin',
      date: 'Beitostølen · September 19, 2026',
      heading: 'Thank you!',
      thanks: 'Thank you for celebrating our wedding with us.',
      photosTitle: 'Photos',
      photosBody: 'Please share your photos and videos from the wedding with us.',
      share: 'Share your photos ↗',
      albumNote: 'Google Photo · Opens in a new tab.',
      original: 'Original wedding website',
      photoAlt: 'Sandra and Benjamin kissing in the mountains on their wedding day',
      photoCredit: 'Photo: Geir Hagen',
    },
    no: {
      title: 'Tusen takk · Sandra & Benjamin',
      date: 'Beitostølen · 19. september 2026',
      heading: 'Tusen takk!',
      thanks: 'Takk for at dere feiret bryllupet vårt med oss.',
      photosTitle: 'Bilder',
      photosBody: 'Del gjerne bilder og videoer fra bryllupet med oss.',
      share: 'Del bildene deres ↗',
      albumNote: 'Google Photo · Åpnes i en ny fane.',
      original: 'Den opprinnelige bryllupssiden',
      photoAlt: 'Sandra og Benjamin kysser på fjellet på bryllupsdagen sin',
      photoCredit: 'Foto: Geir Hagen',
    },
  };
  const setLanguage = (language) => {
    const copy = translations[language];
    document.documentElement.lang = language;
    document.title = copy.title;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = copy[element.dataset.i18n];
    });
    document.querySelector('.portrait img').alt = copy.photoAlt;
    document.querySelectorAll('[data-lang]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === language));
    });
    try { localStorage.setItem('wedding_lang', language); } catch { /* Storage is optional. */ }
  };
  let storedLanguage;
  try { storedLanguage = localStorage.getItem('wedding_lang'); } catch { /* Use browser language. */ }
  const browserLanguage = /^(no|nb|nn)/i.test(navigator.language || '') ? 'no' : 'en';
  setLanguage(translations[storedLanguage] ? storedLanguage : browserLanguage);
  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.lang));
  });

  const shareButton = document.getElementById('share-photos');
  shareButton.addEventListener('click', (event) => {
    // Deters basic link crawlers, not a security boundary: a capable bot can decode this.
    // isTrusted accepts real pointer and keyboard activation, but ignores scripted clicks.
    if (!event.isTrusted) return;
    const album = atob('aHR0cHM6Ly9waG90b3MuYXBwLmdvby5nbC94a2E4M1o3cVpzNmlWbTl4Ng==');
    window.open(album, '_blank', 'noopener,noreferrer');
  });
  shareButton.hidden = false;
  document.getElementById('album-note').hidden = false;
})();
