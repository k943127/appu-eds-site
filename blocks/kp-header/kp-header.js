export default async function decorate(block) {
  // IMPORTANT: Check if already decorated to prevent running twice
  if (block.querySelector('.kp-header-container')) {
    console.log('Block already decorated, skipping');
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
    return clone;
  };

  // Detect if it's a table or divs
  const table = block.querySelector('table');
  let rows = [];

  if (table) {
    // Handle TABLE structure
    console.log('Processing TABLE structure');
    const trs = table.querySelectorAll('tbody tr');
    rows = Array.from(trs).map((tr) => Array.from(tr.querySelectorAll('td')));
    // Skip header row (first row with colspan)
    rows = rows.slice(1);
  } else {
    // Handle DIV structure
    console.log('Processing DIV structure');
    rows = Array.from(block.querySelectorAll(':scope > div')).map((row) =>
      Array.from(row.querySelectorAll(':scope > div'))
    );
  }

  console.log('Total rows:', rows.length);

  rows.forEach((cells, index) => {
    console.log(`=== Row ${index} ===`);
    console.log(`Cells count: ${cells.length}`);

    // First row: logos and link
    if (index === 0) {
      desktopLogo = getImage(cells[0]);
      mobileLogo = getImage(cells[1]);

      // Extract link from third cell
      if (cells[2]) {
        console.log('Cell 2 innerHTML:', cells[2].innerHTML);
        console.log('Cell 2 textContent:', cells[2].textContent);

        // Method 1: Direct <a> tag
        let linkEl = cells[2].querySelector('a');
        if (linkEl) {
          logoLink = linkEl.getAttribute('href');
          console.log('✓ Method 1 - Found <a> tag:', logoLink);
        }

        // Method 2: Text content is URL
        if (logoLink === '#') {
          const linkText = getText(cells[2]);
          if (linkText && (linkText.startsWith('http://') || linkText.startsWith('https://'))) {
            logoLink = linkText;
            console.log('✓ Method 2 - Found URL text:', logoLink);
          }
        }

        // Method 3: All links in cell
        if (logoLink === '#') {
          const allLinks = cells[2].querySelectorAll('a');
          if (allLinks.length > 0) {
            logoLink = allLinks[0].getAttribute('href');
            console.log('✓ Method 3 - Found link in children:', logoLink);
          }
        }

        // Method 4: Check for <p> > <a>
        if (logoLink === '#') {
          const pTag = cells[2].querySelector('p');
          if (pTag) {
            const linkInP = pTag.querySelector('a');
            if (linkInP) {
              logoLink = linkInP.getAttribute('href');
              console.log('✓ Method 4 - Found <a> in <p>:', logoLink);
            }
          }
        }
      }
      console.log('Final logo link:', logoLink);
    } else {
      // Subsequent rows: languages
      const name = getText(cells[0]);
      const code = getText(cells[1]);
      const label = getText(cells[2]);

      console.log(`Language row - name: "${name}", code: "${code}", label: "${label}"`);

      if (name && code) {
        languages.push({ name, code, label: label || 'Language' });
      }
    }
  });

  console.log('Final languages array:', languages);

  // Default if no languages
  if (!languages.length) {
    languages.push(
      { name: 'English', code: 'en', label: 'Language' },
      { name: 'Español', code: 'es', label: 'Idioma' }
    );
  }

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

  let current = languages[0];

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
    const opt = document.createElement('button');
    opt.className = 'kp-language-option';
    opt.textContent = lang.name;
    opt.dataset.code = lang.code;
    opt.setAttribute('role', 'option');
    opt.setAttribute('aria-selected', lang.code === current.code);

    opt.onclick = (e) => {
      e.stopPropagation();
      current = lang;
      updateUI(lang);
      menu.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      button.focus();
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
  closeButton.setAttribute('aria-label', 'Close menu');

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
    const opt = document.createElement('button');
    opt.className = 'kp-language-option';
    opt.textContent = lang.name;
    opt.dataset.code = lang.code;
    opt.setAttribute('role', 'option');
    opt.setAttribute('aria-selected', lang.code === current.code);

    opt.onclick = (e) => {
      e.stopPropagation();
      current = lang;
      mobileButton.textContent = lang.name;
      mobileLabel.textContent = lang.label || 'Language';
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
  hamburger.setAttribute('aria-label', 'Open menu');

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