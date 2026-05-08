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
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

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