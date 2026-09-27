const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
}

async function loadContact() {
  const container = document.querySelector('.contact-items');
  if (!container) return;
  try {
    const response = await fetch('/site-config.json');
    if (!response.ok) return;
    const config = await response.json();
    if (config.email) {
      const link = document.createElement('a');
      link.href = `mailto:${config.email}`;
      link.textContent = config.email;
      container.append(link);
    }
    if (config.phone) {
      const link = document.createElement('a');
      link.href = `tel:${config.phone.replace(/[^+\d]/g, '')}`;
      link.textContent = config.phone;
      container.append(link);
    }
    if (config.address) {
      const address = document.createElement('span');
      address.textContent = config.address;
      container.append(address);
    }
    if (config.hours) {
      const hours = document.createElement('span');
      hours.textContent = config.hours;
      container.append(hours);
    }
  } catch (error) {
    console.error('Could not load contact details.', error);
  }
}

function makeGearCard(item) {
  const card = document.createElement('article');
  card.className = 'gear-card';
  if (item.image) {
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = `${item.brand} ${item.model}`.trim();
    image.loading = 'lazy';
    card.append(image);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'gear-placeholder';
    placeholder.textContent = 'BOISE HI-FI';
    card.append(placeholder);
  }
  const body = document.createElement('div');
  body.className = 'card-body';
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = item.category || 'Vintage audio';
  const title = document.createElement('h2');
  title.textContent = `${item.brand || ''} ${item.model || ''}`.trim();
  body.append(tag, title);
  if (item.price) {
    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = item.price;
    body.append(price);
  }
  for (const detail of [item.condition, item.notes]) {
    if (!detail) continue;
    const paragraph = document.createElement('p');
    paragraph.textContent = detail;
    body.append(paragraph);
  }
  card.append(body);
  return card;
}

async function loadInventory() {
  const grid = document.querySelector('[data-inventory]');
  if (!grid) return;
  const view = grid.dataset.inventory;
  const empty = document.querySelector('.inventory-empty');
  const search = document.querySelector('#gear-search');
  try {
    const response = await fetch('/inventory.json');
    if (!response.ok) throw new Error(`Inventory request failed: ${response.status}`);
    const inventory = await response.json();
    const matching = inventory.filter((item) => view === 'sold' ? item.status === 'sold' : item.status === 'available' && (view !== 'featured' || item.featured));
    matching.sort((first, second) => String(second.date_added || '').localeCompare(String(first.date_added || '')));
    if (view === 'new') matching.length = Math.min(matching.length, 12);
    const render = () => {
      const query = (search?.value || '').toLowerCase().trim();
      const visible = matching.filter((item) => `${item.brand} ${item.model} ${item.category}`.toLowerCase().includes(query));
      grid.replaceChildren(...visible.map(makeGearCard));
      if (empty) empty.hidden = visible.length > 0;
    };
    search?.addEventListener('input', render);
    render();
  } catch (error) {
    console.error('Could not load inventory.', error);
    if (empty) empty.textContent = 'Gear listings are temporarily unavailable. Please check back soon.';
  }
}

loadContact();
loadInventory();
