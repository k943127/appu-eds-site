import { readBlockConfig } from '../../scripts/aem.js';

function getCellText(cell) {
  return cell?.textContent?.trim() || '';
}

/**
 * Loads and decorates the warning block.
 * Authoring supports either key/value rows (title/body/icon)
 * or simple rows where row 1 is title and row 2 is body.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  const rows = Array.from(block.querySelectorAll(':scope > div')).map((row) => Array.from(row.querySelectorAll(':scope > div')));

  let title = (config.title || '').trim();
  let bodyHtml = '';

  const firstIcon = block.querySelector('picture, img');

  if (config.body) {
    bodyHtml = `<p>${config.body}</p>`;
  } else if (config.description) {
    bodyHtml = `<p>${config.description}</p>`;
  }

  if (!title && rows[0]?.[0]) {
    title = getCellText(rows[0][0]);
  }

  if (!bodyHtml && rows[1]?.[0]) {
    bodyHtml = rows[1][0].innerHTML;
  }

  const card = document.createElement('div');
  card.className = 'warning-card';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'warning-icon';

  if (firstIcon) {
    iconWrap.append(firstIcon.cloneNode(true));
  } else {
    const img = document.createElement('img');
    img.src = `${window.hlx.codeBasePath}/icons/alertsolid.svg`;
    img.alt = '';
    img.loading = 'eager';
    img.width = 44;
    img.height = 44;
    iconWrap.append(img);
  }

  const content = document.createElement('div');
  content.className = 'warning-content';

  const heading = document.createElement('p');
  heading.className = 'warning-title';
  heading.textContent = title || 'In case of an emergency';

  const body = document.createElement('div');
  body.className = 'warning-body';
  body.innerHTML = bodyHtml || '<p>If you think you or someone you care for is having a medical or mental health emergency, call 911 or go to the nearest hospital.</p>';

  content.append(heading, body);
  card.append(iconWrap, content);

  block.textContent = '';
  block.append(card);
}
