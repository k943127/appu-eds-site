let faqId = 0;

function isTruthy(value) {
  return ['true', 'yes', '1', 'open'].includes((value || '').trim().toLowerCase());
}

/**
 * Builds an accessible FAQ accordion.
 * Optional config rows:
 * - Open First | true
 * - Single Expand | true
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div')).map((row) => Array.from(row.querySelectorAll(':scope > div')));
  const items = [];

  let openFirst = false;
  let singleExpand = false;

  rows.forEach((cells) => {
    const key = cells[0]?.textContent?.trim() || '';
    const value = cells[1]?.textContent?.trim() || '';

    if (!key || cells.length < 2) return;

    if (key.toLowerCase() === 'open first') {
      openFirst = isTruthy(value);
      return;
    }

    if (key.toLowerCase() === 'single expand') {
      singleExpand = isTruthy(value);
      return;
    }

    items.push({
      question: key,
      answerHtml: cells[1].innerHTML,
    });
  });

  if (!items.length) {
    block.textContent = '';
    return;
  }

  faqId += 1;
  const accordion = document.createElement('div');
  accordion.className = 'faq-accordion';

  const closeOthers = (currentButton) => {
    if (!singleExpand) return;

    accordion.querySelectorAll('.faq-item-button[aria-expanded="true"]').forEach((button) => {
      if (button === currentButton) return;
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      button.setAttribute('aria-expanded', 'false');
      button.closest('.faq-item')?.classList.remove('is-open');
      if (panel) panel.hidden = true;
    });
  };

  items.forEach((item, index) => {
    const itemId = `faq-${faqId}-${index}`;
    const isOpen = openFirst && index === 0;

    const wrapper = document.createElement('div');
    wrapper.className = `faq-item${isOpen ? ' is-open' : ''}`;

    const button = document.createElement('button');
    button.className = 'faq-item-button';
    button.type = 'button';
    button.setAttribute('aria-expanded', String(isOpen));
    button.setAttribute('aria-controls', `${itemId}-panel`);
    button.id = `${itemId}-button`;

    const icon = document.createElement('span');
    icon.className = 'faq-item-icon';
    icon.setAttribute('aria-hidden', 'true');

    const plusIcon = document.createElement('img');
    plusIcon.className = 'faq-item-icon-image faq-item-icon-plus';
    plusIcon.src = `${window.hlx.codeBasePath}/icons/faq-plus.svg`;
    plusIcon.alt = '';
    plusIcon.width = 20;
    plusIcon.height = 20;

    const minusIcon = document.createElement('img');
    minusIcon.className = 'faq-item-icon-image faq-item-icon-minus';
    minusIcon.src = `${window.hlx.codeBasePath}/icons/faq-minus.svg`;
    minusIcon.alt = '';
    minusIcon.width = 24;
    minusIcon.height = 24;

    icon.append(plusIcon, minusIcon);

    const text = document.createElement('span');
    text.className = 'faq-item-text';
    text.textContent = item.question;

    button.append(icon, text);

    const panel = document.createElement('div');
    panel.className = `faq-item-panel${isOpen ? ' is-open' : ''}`;
    panel.id = `${itemId}-panel`;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', button.id);
    panel.hidden = !isOpen;
    panel.innerHTML = item.answerHtml;

    button.addEventListener('click', () => {
      const willOpen = button.getAttribute('aria-expanded') !== 'true';
      if (willOpen) closeOthers(button);
      button.setAttribute('aria-expanded', String(willOpen));
      wrapper.classList.toggle('is-open', willOpen);
      panel.classList.toggle('is-open', willOpen);
      panel.hidden = !willOpen;
    });

    wrapper.append(button, panel);
    accordion.append(wrapper);
  });

  block.textContent = '';
  block.append(accordion);
}
