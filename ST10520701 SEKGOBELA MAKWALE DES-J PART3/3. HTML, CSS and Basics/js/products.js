/* =========================================================================
   DES-LUX PLAY | js/products.js   (products.html only)
   -------------------------------------------------------------------------
   Builds the catalogue from window.DLP_PRODUCTS (js/products-data.js) and
   lets visitors search, filter by category, filter by price, and sort.
   Also drives the quick-view modal and the "recently viewed" sidebar card.

   Contents
   1. State and setup
   2. Building a product card
   3. Filtering, sorting, rendering
   4. Controls (header search, chips, sidebar links, sort, price)
   5. Quick-view modal
   6. Recently viewed
   ========================================================================= */
(function () {
  'use strict';

  var DLP = window.DLP;
  var h = DLP.h, $ = DLP.$, $$ = DLP.$$;
  var products = window.DLP_PRODUCTS || [];

  var grid = $('#product-grid');
  if (!grid) return;

  var CATEGORY_LABEL = { standard: 'Standard', custom: 'Custom', limited: 'Limited Edition' };

  /* -----------------------------------------------------------------------
     1. State and setup
     ----------------------------------------------------------------------- */
  var params = new URLSearchParams(window.location.search);
  var state = {
    q: (params.get('q') || '').trim(),
    category: CATEGORY_LABEL[params.get('category')] ? params.get('category') : 'all',
    sort: 'featured',
    maxPrice: 1200
  };

  var searchInput = $('#site-search');
  var searchForm = $('.site-search');
  var countEl = $('#result-count');
  var sortSelect = $('#sort-by');
  var priceInput = $('#price-max');
  var priceOut = $('#price-out');
  var clearBtn = $('#clear-filters');

  /* -----------------------------------------------------------------------
     2. Building a product card
     ----------------------------------------------------------------------- */
  function mediaFor(p) {
    if (p.image) {
      return h('img', {
        src: p.image.src, alt: p.image.alt,
        width: p.image.width, height: p.image.height, loading: 'lazy'
      });
    }
    /* No photograph yet: a labelled tile rather than a wrong picture */
    return h('div', { class: 'product-placeholder', role: 'img', 'aria-label': p.name + ': photograph coming soon' },
      h('span', { 'aria-hidden': 'true' }, p.name.replace(/^The /, '').charAt(0)),
      h('small', { 'aria-hidden': 'true' }, 'Photo coming soon'));
  }

  function card(p) {
    var actions = h('div', { class: 'product-actions' },
      h('button', { type: 'button', class: 'btn-quiet', 'data-view': p.id }, 'Quick view'));
    if (p.category === 'custom') {
      actions.appendChild(h('a', { class: 'card-link', href: 'enquiry.html?toy=' + p.enquiryToy }, 'Start customizing'));
    }
    return h('article', { class: 'product-card', 'data-category': p.category },
      h('div', { class: 'product-media' }, mediaFor(p)),
      h('div', { class: 'product-body' },
        h('span', { class: 'badge badge-' + p.category }, CATEGORY_LABEL[p.category]),
        h('h3', null, p.name),
        h('p', { class: 'product-price' }, p.priceLabel),
        h('p', { class: 'product-note' }, p.status),
        h('p', { class: 'product-summary' }, p.summary),
        actions));
  }

  /* -----------------------------------------------------------------------
     3. Filtering, sorting, rendering
     ----------------------------------------------------------------------- */
  function matches(p) {
    if (state.category !== 'all' && p.category !== state.category) return false;
    /* Items without a price yet (coming soon) are never hidden by the slider */
    if (p.price !== null && p.price > state.maxPrice) return false;
    if (!state.q) return true;
    var haystack = [p.name, p.summary, p.status, CATEGORY_LABEL[p.category]].concat(p.tags).join(' ').toLowerCase();
    return state.q.toLowerCase().split(/\s+/).every(function (word) { return haystack.indexOf(word) !== -1; });
  }

  function compare(a, b) {
    if (state.sort === 'name') return a.name.localeCompare(b.name);
    if (state.sort === 'price-asc' || state.sort === 'price-desc') {
      /* Unpriced items always sink to the bottom */
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return state.sort === 'price-asc' ? a.price - b.price : b.price - a.price;
    }
    return products.indexOf(a) - products.indexOf(b);
  }

  function isFiltered() {
    return state.q || state.category !== 'all' || state.maxPrice < 1200 || state.sort !== 'featured';
  }

  function render() {
    var list = products.filter(matches).sort(compare);
    var fragment = document.createDocumentFragment();
    list.forEach(function (p) { fragment.appendChild(card(p)); });
    grid.replaceChildren(fragment);

    if (!list.length) {
      grid.appendChild(h('p', { class: 'empty-state' },
        'No toys match those filters. Try a different word or press "Clear filters".'));
    }

    var text = 'Showing ' + list.length + ' of ' + products.length + ' toys';
    if (state.q) text += ' for \u201C' + state.q + '\u201D';
    countEl.textContent = text;
    clearBtn.hidden = !isFiltered();

    /* Reflect the active category on the chips and the sidebar links */
    $$('[data-category]').forEach(function (el) {
      var on = el.dataset.category === state.category;
      if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', on ? 'true' : 'false');
      else if (on) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current');
    });

    syncUrl();
  }

  /* Keep the address bar shareable: products.html?category=limited&q=lion */
  function syncUrl() {
    var next = new URLSearchParams();
    if (state.q) next.set('q', state.q);
    if (state.category !== 'all') next.set('category', state.category);
    var qs = next.toString();
    history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
  }

  /* -----------------------------------------------------------------------
     4. Controls
     ----------------------------------------------------------------------- */
  function setCategory(value) {
    state.category = value;
    render();
  }

  /* One delegated listener handles every chip and sidebar category link */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-category]');
    if (!trigger || trigger.closest('.product-card')) return;
    e.preventDefault();
    setCategory(trigger.dataset.category);
  });

  searchInput.value = state.q;
  searchInput.addEventListener('input', function () {
    state.q = searchInput.value.trim();
    render();
  });
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    state.q = searchInput.value.trim();
    render();
  });

  sortSelect.addEventListener('change', function () {
    state.sort = sortSelect.value;
    render();
  });

  priceInput.addEventListener('input', function () {
    state.maxPrice = Number(priceInput.value);
    priceOut.textContent = 'R' + state.maxPrice.toLocaleString('en-US') + (state.maxPrice >= 1200 ? '+' : '');
    render();
  });

  clearBtn.addEventListener('click', function () {
    state.q = '';
    state.category = 'all';
    state.sort = 'featured';
    state.maxPrice = 1200;
    searchInput.value = '';
    sortSelect.value = 'featured';
    priceInput.value = 1200;
    priceOut.textContent = 'R1,200+';
    render();
    searchInput.focus();
  });

  /* -----------------------------------------------------------------------
     5. Quick-view modal
     ----------------------------------------------------------------------- */
  var dialog = $('#product-dialog');

  function openQuickView(id) {
    var p = products.filter(function (item) { return item.id === id; })[0];
    if (!p) return;

    $('#pd-media').replaceChildren(mediaFor(p));
    $('#pd-badge').textContent = CATEGORY_LABEL[p.category];
    $('#pd-badge').className = 'badge badge-' + p.category;
    $('#pd-title').textContent = p.name;
    $('#pd-price').textContent = p.priceLabel;
    $('#pd-note').textContent = p.status;
    $('#pd-desc').textContent = p.description;
    $('#pd-details').replaceChildren.apply($('#pd-details'), p.details.map(function (line) {
      return h('li', null, line);
    }));
    $('#pd-cta').href = 'enquiry.html' + (p.enquiryToy ? '?toy=' + p.enquiryToy : '');
    $('#pd-cta').textContent = p.category === 'custom' ? 'Start customizing' : 'Enquire about this toy';

    dialog.showModal();
    remember(id);
  }

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-view]');
    if (btn) openQuickView(btn.dataset.view);
  });

  $('.modal-close', dialog).addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close(); /* click on the backdrop */
  });

  /* -----------------------------------------------------------------------
     6. Recently viewed (kept in localStorage; fails quietly if blocked)
     ----------------------------------------------------------------------- */
  var KEY = 'desluxplay.recent';
  var recentCard = $('#recent-card');
  var recentList = $('#recent-list');

  function readRecent() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (err) { return []; }
  }

  function remember(id) {
    var ids = readRecent().filter(function (x) { return x !== id; });
    ids.unshift(id);
    try { localStorage.setItem(KEY, JSON.stringify(ids.slice(0, 3))); } catch (err) { /* private mode */ }
    showRecent();
  }

  function showRecent() {
    var ids = readRecent().filter(function (id) {
      return products.some(function (p) { return p.id === id; });
    });
    recentCard.hidden = !ids.length;
    recentList.replaceChildren.apply(recentList, ids.map(function (id) {
      var p = products.filter(function (item) { return item.id === id; })[0];
      return h('li', null, h('button', { type: 'button', class: 'link-button', 'data-view': p.id }, p.name));
    }));
  }

  recentList.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-view]');
    if (btn) openQuickView(btn.dataset.view);
  });

  render();
  showRecent();
})();
