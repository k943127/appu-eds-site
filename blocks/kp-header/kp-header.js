export default async function decorate(block) {
  // IMPORTANT: Check if already decorated to prevent running twice
  if (block.querySelector('.kp-header-container')) {
    return;
  }

  let desktopLogo = null;
  let mobileLogo = null;
  let logoLink = '#';
  const languages = [];

  const getText = (el) => el?.textContent?.trim() || '';

  const fixImageUrls = (element) => {
    if (!element) return;

    const img = element.querySelector('img');
    if (img && img.getAttribute('src')?.startsWith('./')) {
      img.src = new URL(img.getAttribute('src'), window.location.href).href;
    }

    element.querySelectorAll('source').forEach((source) => {
      const srcset = source.getAttribute('srcset');
      if (srcset && srcset.startsWith('./')) {
        source.srcset = new URL(srcset, window.location.href).href;
      }
    });
  };

  const getImage = (cell) => {
    if (!cell) return null;

    let el = cell.querySelector('picture');
    if (!el) el = cell.querySelector('img:not(.ProseMirror-separator)');
    if (!el) return null;

    const clone = el.cloneNode(true);
    fixImageUrls(clone);

    // Logo images must load eagerly — they are always in the visible header area.
    // When the block is loaded as a nav fragment the images start life in a
    // detached DOM, so lazy-loaded images never fire and remain blank.
    let img = null;
    if (clone.querySelector) {
      img = clone.querySelector('img');
    } else if (clone.tagName === 'IMG') {
      img = clone;
    }
    if (img) img.loading = 'eager';

    return clone;
  };

  // Detect if it's a table or divs
  const table = block.querySelector('table');
  let rows = [];

  if (table) {
    // Handle TABLE structure
    const trs = table.querySelectorAll('tbody tr');
    rows = Array.from(trs).map((tr) => Array.from(tr.querySelectorAll('td')));
    // Skip header row (first row with colspan)
    rows = rows.slice(1);
  } else {
    // Handle DIV structure
    rows = Array.from(block.querySelectorAll(':scope > div')).map((row) => Array.from(row.querySelectorAll(':scope > div')));
  }

  rows.forEach((cells, index) => {
    // First row: logos and link
    if (index === 0) {
      desktopLogo = getImage(cells[0]);
      mobileLogo = getImage(cells[1]);

      // Extract link from third cell
      if (cells[2]) {
        // Method 1: Direct <a> tag
        const linkEl = cells[2].querySelector('a');
        if (linkEl) {
          logoLink = linkEl.getAttribute('href');
        }

        // Method 2: Text content is URL
        if (logoLink === '#') {
          const linkText = getText(cells[2]);
          if (linkText && (linkText.startsWith('http://') || linkText.startsWith('https://'))) {
            logoLink = linkText;
          }
        }

        // Method 3: All links in cell
        if (logoLink === '#') {
          const allLinks = cells[2].querySelectorAll('a');
          if (allLinks.length > 0) {
            logoLink = allLinks[0].getAttribute('href');
          }
        }

        // Method 4: Check for <p> > <a>
        if (logoLink === '#') {
          const pTag = cells[2].querySelector('p');
          if (pTag) {
            const linkInP = pTag.querySelector('a');
            if (linkInP) {
              logoLink = linkInP.getAttribute('href');
            }
          }
        }
      }
    } else {
      // Subsequent rows: languages
      const name = getText(cells[0]);
      const code = getText(cells[1]);
      const label = getText(cells[2]);
      const menuLabel = getText(cells[3]);
      const closeLabel = getText(cells[4]);

      if (name && code) {
        languages.push({
          name,
          code,
          label: label || 'Language',
          menuLabel: menuLabel || 'Menu',
          closeLabel: closeLabel || 'Close',
        });
      }
    }
  });

  // Default if no languages
  if (!languages.length) {
    languages.push(
      {
        name: 'English', code: 'en', label: 'Language', menuLabel: 'Menu', closeLabel: 'Close',
      },
      {
        name: 'Español', code: 'es', label: 'Idioma', menuLabel: 'Menú', closeLabel: 'Cerca',
      },
    );
  }

  // Detect current language from URL path
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const currentLangCode = languages.find((l) => pathParts[0] === l.code)?.code || languages[0].code;
  let current = languages.find((l) => l.code === currentLangCode) || languages[0];

  // Build language navigation URL by replacing the first path segment (language code)
  const buildLangUrl = (code) => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const knownCodes = languages.map((l) => l.code);
    if (parts.length > 0 && knownCodes.includes(parts[0])) {
      parts[0] = code;
    } else {
      parts.unshift(code);
    }
    return `/${parts.join('/')}`;
  };

  // Clear and rebuild - AFTER extracting data
  block.textContent = '';
  block.className = 'kp-header';

  const header = document.createElement('div');
  header.className = 'kp-header-container';

  /* ===== LOGO ===== */
  const brand = document.createElement('div');
  brand.className = 'kp-header-brand';

  const logoLinkEl = document.createElement('a');
  logoLinkEl.href = logoLink;

  if (desktopLogo) {
    desktopLogo.classList.add('kp-logo-desktop');
    logoLinkEl.appendChild(desktopLogo);
  }

  if (mobileLogo) {
    mobileLogo.classList.add('kp-logo-mobile');
    logoLinkEl.appendChild(mobileLogo);
  }

  brand.appendChild(logoLinkEl);

  /* ===== LANGUAGE DROPDOWN (DESKTOP) ===== */
  const langWrapper = document.createElement('div');
  langWrapper.className = 'kp-language-wrapper';

  const label = document.createElement('span');
  label.className = 'kp-language-label';

  const button = document.createElement('button');
  button.className = 'kp-language-button';
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');

  const menu = document.createElement('div');
  menu.className = 'kp-language-menu';
  menu.setAttribute('role', 'listbox');

  function updateUI(lang) {
    button.textContent = lang.name;
    label.textContent = lang.label || 'Language';
    button.setAttribute('aria-label', `${lang.label || 'Language'}: ${lang.name}`);

    menu.querySelectorAll('.kp-language-option').forEach((opt) => {
      const isActive = opt.dataset.code === lang.code;
      opt.classList.toggle('active', isActive);
      opt.setAttribute('aria-selected', isActive);
    });
  }

  // Create language options for desktop dropdown
  languages.forEach((lang) => {
    const opt = document.createElement('a');
    opt.className = 'kp-language-option';
    opt.textContent = lang.name;
    opt.dataset.code = lang.code;
    opt.href = buildLangUrl(lang.code);
    opt.setAttribute('role', 'option');
    opt.setAttribute('aria-selected', lang.code === current.code);

    opt.onclick = (e) => {
      e.stopPropagation();
      menu.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    };

    menu.appendChild(opt);
  });

  button.onclick = (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.toggle('open');
    button.setAttribute('aria-expanded', isOpen);
  };

  document.addEventListener('click', () => {
    if (menu.classList.contains('open')) {
      menu.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    }
  });

  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      button.click();
    } else if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    }
  });

  updateUI(current);

  langWrapper.append(label, button, menu);

  /* ===== MOBILE MENU ===== */
  const mobileMenuOverlay = document.createElement('div');
  mobileMenuOverlay.className = 'kp-mobile-menu-overlay';

  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'kp-mobile-menu';

  const mobileMenuHeader = document.createElement('div');
  mobileMenuHeader.className = 'kp-mobile-menu-header';

  const mobileMenuLogo = document.createElement('a');
  mobileMenuLogo.href = logoLink;
  if (mobileLogo) {
    const logoClone = mobileLogo.cloneNode(true);
    logoClone.classList.remove('kp-logo-mobile');
    mobileMenuLogo.appendChild(logoClone);
  }

  const closeButton = document.createElement('button');
  closeButton.className = 'kp-mobile-menu-close';
  closeButton.innerHTML = '✕';
  closeButton.setAttribute('aria-label', current.closeLabel || 'Close');
  closeButton.dataset.label = current.closeLabel || 'Close';

  mobileMenuHeader.append(mobileMenuLogo, closeButton);

  const mobileLanguageSection = document.createElement('div');
  mobileLanguageSection.className = 'kp-mobile-language-section';

  const mobileLabel = document.createElement('span');
  mobileLabel.className = 'kp-mobile-language-label';
  mobileLabel.textContent = current.label || 'Language';

  const mobileButton = document.createElement('button');
  mobileButton.className = 'kp-language-button';
  mobileButton.setAttribute('aria-haspopup', 'listbox');
  mobileButton.setAttribute('aria-expanded', 'false');
  mobileButton.textContent = current.name;

  const mobileMenu2 = document.createElement('div');
  mobileMenu2.className = 'kp-language-menu';

  languages.forEach((lang) => {
    const opt = document.createElement('a');
    opt.className = 'kp-language-option';
    opt.textContent = lang.name;
    opt.dataset.code = lang.code;
    opt.href = buildLangUrl(lang.code);
    opt.setAttribute('role', 'option');
    opt.setAttribute('aria-selected', lang.code === current.code);

    opt.onclick = (e) => {
      e.stopPropagation();
      mobileMenu2.classList.remove('open');
      mobileButton.setAttribute('aria-expanded', 'false');
    };

    mobileMenu2.appendChild(opt);
  });

  mobileButton.onclick = (e) => {
    e.stopPropagation();
    const isOpen = mobileMenu2.classList.toggle('open');
    mobileButton.setAttribute('aria-expanded', isOpen);
  };

  mobileLanguageSection.append(mobileLabel, mobileButton, mobileMenu2);
  mobileMenu.append(mobileMenuHeader, mobileLanguageSection);
  mobileMenuOverlay.appendChild(mobileMenu);

  /* ===== HAMBURGER BUTTON ===== */
  const hamburger = document.createElement('button');
  hamburger.className = 'kp-hamburger';
  hamburger.innerHTML = '☰';
  hamburger.setAttribute('aria-label', current.menuLabel || 'Menu');
  hamburger.dataset.label = current.menuLabel || 'Menu';

  hamburger.onclick = () => {
    mobileMenuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  closeButton.onclick = () => {
    mobileMenuOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  mobileMenuOverlay.onclick = (e) => {
    if (e.target === mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  /* ===== ASSEMBLE HEADER ===== */
  const desktopLangWrapper = document.createElement('div');
  desktopLangWrapper.className = 'kp-header-language';
  desktopLangWrapper.appendChild(langWrapper);

  // Order: brand (logo), desktop language, hamburger (mobile menu)
  header.append(brand, desktopLangWrapper, hamburger);
  block.append(header, mobileMenuOverlay);
}
