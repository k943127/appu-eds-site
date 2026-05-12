/**
 * Injects left-nav items into the kp-header mobile menu
 * @param {Array} navItems Array of {title, url, active} objects
 */
function injectIntoMobileMenu(navItems) {
  // Wait for kp-header mobile menu to be ready
  const checkMobileMenu = setInterval(() => {
    const mobileMenu = document.querySelector('.kp-mobile-menu');
    const mobileLanguageSection = document.querySelector('.kp-mobile-language-section');

    if (mobileMenu && mobileLanguageSection) {
      clearInterval(checkMobileMenu);

      // Check if nav section already exists
      if (mobileMenu.querySelector('.kp-mobile-nav-section')) {
        return;
      }

      // Create mobile nav section (insert before language section)
      const navSection = document.createElement('div');
      navSection.className = 'kp-mobile-nav-section';

      const navList = document.createElement('ul');
      navList.className = 'kp-mobile-nav-list';

      navItems.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'kp-mobile-nav-item';

        const a = document.createElement('a');
        a.href = item.url;
        a.textContent = item.title;

        if (item.active) {
          li.classList.add('active');
          a.setAttribute('aria-current', 'page');
        }

        li.appendChild(a);
        navList.appendChild(li);
      });

      navSection.appendChild(navList);

      // Insert before language section
      mobileMenu.insertBefore(navSection, mobileLanguageSection);
    }
  }, 100);

  // Timeout to prevent infinite loop
  setTimeout(() => clearInterval(checkMobileMenu), 5000);
}

/**
 * Loads and decorates the left-nav block
 * Desktop: displays as a vertical sidebar navigation
 * Mobile: injects items into the kp-header mobile menu
 * Authoring: third column indicates active/selected item
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Parse authoring: each row is title | link | active
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  const navItems = [];

  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll(':scope > div'));
    if (cells.length >= 2) {
      const titleText = cells[0]?.textContent?.trim() || '';
      const linkEl = cells[1]?.querySelector('a');
      const linkUrl = linkEl?.href || cells[1]?.textContent?.trim() || '#';

     const activeIndicator = cells[2]?.textContent?.trim().toLowerCase() || '';
     const authoredActive = ['yes', 'true', 'active', 'x', '1', 'y'].includes(activeIndicator);


      if (titleText && linkUrl !== '#') {
        navItems.push({
          title: titleText,
          url: linkUrl,
          authoredActive,
          active: false,
        });
      }
    }
  });

const normalizePath = (url) => {
  try {
    const u = new URL(url, window.location.origin);
    return (u.pathname.replace(/\/$/, '') || '/');
  } catch (e) {
    return '';
  }
};

const currentPath = normalizePath(window.location.href);
let activeIndex = navItems.findIndex((item) => normalizePath(item.url) === currentPath);
if (activeIndex === -1) {
  activeIndex = navItems.findIndex((item) => item.authoredActive);
}
navItems.forEach((item, index) => {
  item.active = index === activeIndex;
});

  // Clear block and rebuild
  block.textContent = '';
  block.className = 'left-nav';

  // Create desktop navigation
  const nav = document.createElement('nav');
  nav.className = 'left-nav-container';
  nav.setAttribute('aria-label', 'Main navigation');

  const ul = document.createElement('ul');
  ul.className = 'left-nav-list';

  navItems.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'left-nav-item';

    const a = document.createElement('a');
    a.className = 'left-nav-link';
    a.href = item.url;
    a.textContent = item.title;

    // Set active state based on authored indicator
    if (item.active) {
      li.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }

    li.appendChild(a);
    ul.appendChild(li);
  });

  nav.appendChild(ul);
  block.appendChild(nav);

  // On mobile: inject items into kp-header mobile menu
  injectIntoMobileMenu(navItems);
}
