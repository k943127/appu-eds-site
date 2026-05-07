import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM This is needed to move the content of the fragment into the block, otherwise the styles won't apply
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

 const p =footer.querySelector('.default-content-wrapper p');
 if(p){
  const socialDiv = document.createElement('div');
  socialDiv.className = 'social-links';
  socialDiv.innerHTML = `
    <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fhpp.kaiserpermanente.org%2Ffailover%2Ffaqs-es.htm" target="_blank" rel="noopener noreferrer">
      <img src="/icons/facebook.svg" alt="Facebook">
    </a>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fhpp.kaiserpermanente.org%2Ffailover%2Ffaqs-es.htm" target="_blank" rel="noopener noreferrer">
      <img src="/icons/linkedin.svg" alt="LinkedIn">
    </a>
    <a href="https://www.instagram.com/sharer.php?u=https%3A%2F%2Fhpp.kaiserpermanente.org%2Ffailover%2Ffaqs-es.htm" target="_blank" rel="noopener noreferrer">
          <img src="/icons/instagram.svg" alt="Instagram">
        </a>
  `;
  p.insertAdjacentElement("afterend",socialDiv);

  }

  block.append(footer);
}
