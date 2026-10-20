const carGrid = document.querySelector('#car-grid');
const carCards = [...carGrid.querySelectorAll('.car-card')];
const brandFilters = [...document.querySelectorAll('.brand-filter')];
const carSearch = document.querySelector('#car-search');
const carSort = document.querySelector('#car-sort');
const catalogCount = document.querySelector('#catalog-count');
const catalogEmpty = document.querySelector('#catalog-empty');
let activeBrand = 'all';

function updateCatalog() {
  const query = carSearch.value.trim().toLocaleLowerCase();
  const visibleCards = carCards.filter((card) => {
    const matchesBrand = activeBrand === 'all' || card.dataset.brand === activeBrand;
    const matchesSearch = !query || (card.dataset.search || '').toLocaleLowerCase().includes(query);
    card.hidden = !(matchesBrand && matchesSearch);
    return matchesBrand && matchesSearch;
  });

  visibleCards.sort((a, b) => {
    if (carSort.value === 'year-asc') return Number(a.dataset.year) - Number(b.dataset.year);
    if (carSort.value === 'name-asc') return a.dataset.name.localeCompare(b.dataset.name);
    return Number(b.dataset.year) - Number(a.dataset.year);
  }).forEach((card) => carGrid.append(card));

  catalogCount.textContent = `${String(visibleCards.length).padStart(2, '0')} ${visibleCards.length === 1 ? 'model' : 'models'} in the collection`;
  catalogEmpty.hidden = visibleCards.length !== 0;
  carGrid.hidden = visibleCards.length === 0;
  const count = document.querySelector('#hero-car-count');
  if (count) count.textContent = `${String(carCards.length).padStart(2, '0')} ${carCards.length === 1 ? 'model' : 'models'}`;
}

brandFilters.forEach((button) => button.addEventListener('click', () => {
  activeBrand = button.dataset.brand;
  brandFilters.forEach((item) => {
    const active = item === button;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  updateCatalog();
}));
carSearch.addEventListener('input', updateCatalog);
carSort.addEventListener('change', updateCatalog);
document.querySelector('#catalog-reset').addEventListener('click', () => {
  activeBrand = 'all';
  carSearch.value = '';
  brandFilters.forEach((item) => {
    const active = item.dataset.brand === 'all';
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  updateCatalog();
});

document.querySelectorAll('.car-card__favorite').forEach((button) => {
  button.addEventListener('click', () => {
    const active = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? '♥' : '♡';
    const carName = button.closest('.car-card').dataset.name;
    button.setAttribute('aria-label', (active ? 'Remove ' : 'Add ') + carName + (active ? ' from' : ' to') + ' favorites');
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('is-open', open);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
}));

updateCatalog();
