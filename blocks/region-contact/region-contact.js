function toKey(value) {
  return (value || '')
    .toLowerCase()
    .trim()
    .replace(/[^0-9a-z]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isConfigRow(name) {
  return ['label', 'region-label', 'default-region', 'default'].includes(name);
}

/**
 * Builds an authorable region selector and region-specific contact content.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div')).map((row) => Array.from(row.querySelectorAll(':scope > div')));

  let selectLabel = 'Select a region';
  let defaultRegion = '';
  const regions = [];

  rows.forEach((cells) => {
    const first = cells[0]?.textContent?.trim() || '';
    const second = cells[1];
    const third = cells[2]?.textContent?.trim() || '';

    if (!first) return;

    const firstKey = toKey(first);
    if (isConfigRow(firstKey) && second) {
      const configValue = second.textContent.trim();
      if (firstKey === 'label' || firstKey === 'region-label') {
        selectLabel = configValue || selectLabel;
      }
      if (firstKey === 'default-region' || firstKey === 'default') {
        defaultRegion = toKey(configValue);
      }
      return;
    }

    if (!second) return;

    const regionLabel = first;
    const regionKey = toKey(third || regionLabel);
    const regionContent = second.innerHTML.trim();

    if (!regionContent) return;

    regions.push({
      key: regionKey,
      label: regionLabel,
      content: regionContent,
    });
  });

  if (!regions.length) {
    block.textContent = '';
    return;
  }

  if (regions.length === 1) {
    block.classList.add('single-region');
  }

  const selectedIndex = Math.max(
    regions.findIndex((region) => region.key === defaultRegion),
    0,
  );

  let currentIndex = selectedIndex;

  const container = document.createElement('div');
  container.className = 'region-contact-container';

  const control = document.createElement('div');
  control.className = 'region-contact-control';

  const label = document.createElement('span');
  label.className = 'region-contact-label';
  label.textContent = selectLabel;

  const trigger = document.createElement('button');
  trigger.className = 'region-contact-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const triggerText = document.createElement('span');
  triggerText.className = 'region-contact-trigger-text';

  const triggerIcon = document.createElement('span');
  triggerIcon.className = 'region-contact-trigger-icon';
  triggerIcon.setAttribute('aria-hidden', 'true');

  trigger.append(triggerText, triggerIcon);

  const menu = document.createElement('ul');
  menu.className = 'region-contact-menu';
  menu.setAttribute('role', 'listbox');

  const panel = document.createElement('div');
  panel.className = 'region-contact-panel';

  const closeMenu = () => {
    menu.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    menu.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
  };

  const updateSelection = (index) => {
    currentIndex = index;
    const selected = regions[currentIndex];
    triggerText.textContent = selected.label;
    panel.innerHTML = selected.content;

    menu.querySelectorAll('.region-contact-option').forEach((option, optionIndex) => {
      const isSelected = optionIndex === currentIndex;
      option.classList.toggle('selected', isSelected);
      option.setAttribute('aria-selected', String(isSelected));
    });
  };

  regions.forEach((region, index) => {
    const item = document.createElement('li');
    item.className = 'region-contact-menu-item';

    const option = document.createElement('button');
    option.className = 'region-contact-option';
    option.type = 'button';
    option.textContent = region.label;
    option.setAttribute('role', 'option');

    option.addEventListener('click', () => {
      updateSelection(index);
      closeMenu();
      trigger.focus();
    });

    item.append(option);
    menu.append(item);
  });

  trigger.addEventListener('click', () => {
    if (menu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!container.contains(event.target)) {
      closeMenu();
    }
  });

  updateSelection(currentIndex);

  control.append(label, trigger, menu);
  container.append(control, panel);

  block.textContent = '';
  block.append(container);
}
