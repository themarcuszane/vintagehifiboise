const fileInput = document.querySelector('#open-file');
const downloadButton = document.querySelector('#download');
const form = document.querySelector('#gear-form');
const formHeading = document.querySelector('#form-heading');
const cancelButton = document.querySelector('#cancel-edit');
const message = document.querySelector('#message');
const list = document.querySelector('#gear-list');
const count = document.querySelector('#item-count');
const emptyList = document.querySelector('#empty-list');

let inventory = [];
let editingIndex = -1;

function showMessage(text, type = '') {
  message.textContent = text;
  message.className = type;
}

function resetForm() {
  form.reset();
  form.elements.date_added.value = new Date().toISOString().slice(0, 10);
  editingIndex = -1;
  formHeading.textContent = 'Add gear';
  cancelButton.hidden = true;
}

function makeId(brand, model) {
  const base = `${brand}-${model}`.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'gear';
  let candidate = base;
  let suffix = 2;
  while (inventory.some((item) => item.id === candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function renderList() {
  list.replaceChildren();
  count.textContent = `(${inventory.length})`;
  emptyList.hidden = inventory.length > 0;

  inventory.forEach((item, index) => {
    const row = document.createElement('li');
    const description = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = `${item.brand || 'Unknown brand'} ${item.model || 'Unknown model'}`;
    const details = document.createElement('small');
    details.textContent = `${item.status || 'No status'}${item.price ? ` · ${item.price}` : ''}${item.featured ? ' · Featured' : ''}`;
    description.append(name, details);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'secondary';
    editButton.textContent = 'Edit';
    editButton.setAttribute('aria-label', `Edit ${name.textContent}`);
    editButton.addEventListener('click', () => editItem(index));
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'danger';
    removeButton.textContent = 'Remove';
    removeButton.setAttribute('aria-label', `Remove ${name.textContent}`);
    removeButton.addEventListener('click', () => removeItem(index));
    actions.append(editButton, removeButton);
    row.append(description, actions);
    list.append(row);
  });
}

function editItem(index) {
  const item = inventory[index];
  editingIndex = index;
  for (const field of ['brand', 'model', 'category', 'price', 'status', 'date_added', 'image', 'condition', 'notes']) {
    form.elements[field].value = item[field] || '';
  }
  form.elements.featured.checked = Boolean(item.featured);
  formHeading.textContent = `Edit ${item.brand} ${item.model}`;
  cancelButton.hidden = false;
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  form.elements.brand.focus();
}

function removeItem(index) {
  const item = inventory[index];
  if (!window.confirm(`Remove ${item.brand} ${item.model} from this editing session?`)) return;
  inventory.splice(index, 1);
  resetForm();
  renderList();
  showMessage('Item removed. Download the file to keep this change.', 'success');
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed) || parsed.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) {
      throw new Error('Inventory must be a JSON array of gear objects.');
    }
    inventory = parsed;
    resetForm();
    renderList();
    showMessage(`Loaded ${inventory.length} item${inventory.length === 1 ? '' : 's'} from ${file.name}.`, 'success');
  } catch (error) {
    showMessage(`Could not open file: ${error.message}`, 'error');
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const brand = form.elements.brand.value.trim();
  const model = form.elements.model.value.trim();
  if (!brand || !model) {
    showMessage('Brand and model are required.', 'error');
    return;
  }
  const previous = editingIndex >= 0 ? inventory[editingIndex] : {};
  const item = { ...previous,
    id: previous.id || makeId(brand, model),
    brand,
    model,
    category: form.elements.category.value.trim(),
    price: form.elements.price.value.trim(),
    condition: form.elements.condition.value.trim(),
    notes: form.elements.notes.value.trim(),
    image: form.elements.image.value.trim(),
    status: form.elements.status.value,
    featured: form.elements.featured.checked,
    date_added: form.elements.date_added.value
  };
  if (editingIndex >= 0) inventory[editingIndex] = item;
  else inventory.push(item);
  resetForm();
  renderList();
  showMessage('Item saved in this editing session. Download the file to keep your changes.', 'success');
});

cancelButton.addEventListener('click', () => {
  resetForm();
  showMessage('Edit canceled.');
});

downloadButton.addEventListener('click', () => {
  if (inventory.some((item) => !item.id || !item.brand || !item.model || !['available', 'sold'].includes(item.status))) {
    showMessage('Every item needs an ID, brand, model, and available or sold status before download.', 'error');
    return;
  }
  if (new Set(inventory.map((item) => item.id)).size !== inventory.length) {
    showMessage('Item IDs must be unique before download.', 'error');
    return;
  }
  const file = new Blob([`${JSON.stringify(inventory, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'inventory.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showMessage(`Downloaded ${inventory.length} item${inventory.length === 1 ? '' : 's'}. Replace the repo's inventory.json with this file.`, 'success');
});

resetForm();
renderList();
