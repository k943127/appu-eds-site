import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Decorates the social links table inside the footer fragment.
 * Row format (authored in DA):
 * - col 1: dragged/dropped icon image
 * - col 2: destination URL
 * - col 3: accessible label (optional)
 * @param {Element} socialTable the raw social-links div block inside footer
 */
function decorateSocialLinks(socialTable) {
  const rows = [...socialTable.querySelectorAll(':scope > div')];
  const list = document.createElement('div');
  list.className = 'footer-social-list';

  rows.forEach((row) => {
    const cols = [...row.children];
    if (cols.length < 2) return;

    const iconCell = cols[0];
    const linkCell = cols[1];
    const labelCell = cols[2];

    const href = (
      linkCell.querySelector('a')?.getAttribute('href')
      || linkCell.textContent
      || ''
    ).trim();
    if (!href) return;

    const label = (labelCell?.textContent || '').trim();

    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    if (label) link.setAttribute('aria-label', label);

    // Only use <img> from column 1, skip if not present
    const authoredImg = iconCell.querySelector('img');
    if (authoredImg) {
      if (label) link.append(document.createTextNode(label + ' ')); // Add label text before icon
      const img = authoredImg.cloneNode(true);
      img.alt = label || img.alt || '';
      img.loading = 'lazy';
      link.append(img);
      list.append(link);
    }
    // If no <img>, skip this row (no fallback)
  });

  socialTable.replaceChildren(list);
  socialTable.classList.add('footer-social');
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const languageCode = (() => {
    if (pathParts[0] === 'content' && /^[a-z]{2}$/i.test(pathParts[1] || '')) return pathParts[1].toLowerCase();
    if (/^[a-z]{2}$/i.test(pathParts[0] || '')) return pathParts[0].toLowerCase();
    return '';
  })();

  const footerMeta = getMetadata('footer');
  const footerPaths = footerMeta
    ? [new URL(footerMeta, window.location).pathname]
    : [
      languageCode ? `/footer/${languageCode}/footer` : '',
      languageCode ? `/${languageCode}/footer` : '',
      '/footer',
    ].filter(Boolean);

  let fragment = null;
  for (let i = 0; i < footerPaths.length; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      fragment = await loadFragment(footerPaths[i]);
      if (fragment?.children?.length) break;
    } catch (error) {
      // Try the next candidate path.
      // eslint-disable-next-line no-console
      console.warn(`Failed to load footer fragment: ${footerPaths[i]}`, error);
    }
  }

  block.textContent = '';
  if (!fragment) return;

  const footer = document.createElement('div');
  while (fragment.firstElementChild) {
    footer.append(fragment.firstElementChild);
  }

  // Find and decorate the social-links table authored inside the footer fragment
  const socialTable = footer.querySelector('.social-links');
  if (socialTable) decorateSocialLinks(socialTable);

  block.append(footer);
}