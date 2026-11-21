/* To Lead — collection filtering and sorting. */
(function () {
  'use strict';

  var ECRU = window.ECRU;
  var UI = window.UI;

  function metaFor(filter) {
    var s = ECRU.getSettings();
    var map = {
      all: { eyebrow: s.shopAllEyebrow, title: s.shopAllTitle, italic: s.shopAllItalic, desc: s.shopAllDesc, index: s.shopAllIndex },
      new: { eyebrow: s.shopNewEyebrow, title: s.shopNewTitle, italic: s.shopNewItalic, desc: s.shopNewDesc, index: s.shopNewIndex },
      women: { eyebrow: s.shopWomenEyebrow, title: s.shopWomenTitle, italic: s.shopWomenItalic, desc: s.shopWomenDesc, index: s.shopWomenIndex },
      men: { eyebrow: s.shopMenEyebrow, title: s.shopMenTitle, italic: s.shopMenItalic, desc: s.shopMenDesc, index: s.shopMenIndex },
      accessories: { eyebrow: s.shopAccEyebrow, title: s.shopAccTitle, italic: s.shopAccItalic, desc: s.shopAccDesc, index: s.shopAccIndex },
      sale: { eyebrow: s.shopSaleEyebrow, title: s.shopSaleTitle, italic: s.shopSaleItalic, desc: s.shopSaleDesc, index: s.shopSaleIndex }
    };
    return map[filter] || map.all;
  }

  var params = new URLSearchParams(window.location.search);
  var state = {
    filter: params.get('collection') === 'new' ? 'new' : params.get('gender') || (params.get('sale') ? 'sale' : 'all'),
    sort: params.get('sort') || 'featured',
    q: params.get('q') || ''
  };

  if (!['all', 'new', 'women', 'men', 'accessories', 'sale'].includes(state.filter)) state.filter = 'all';

  function setMeta() {
    var data = metaFor(state.filter);
    var eyebrow = document.querySelector('[data-collection-eyebrow]');
    var title = document.querySelector('[data-collection-title]');
    var desc = document.querySelector('[data-collection-desc]');
    var index = document.querySelector('.page-hero__index');
    if (eyebrow) eyebrow.textContent = data.eyebrow;
    if (title) title.innerHTML = UI.esc(data.title) + ' <em>' + UI.esc(data.italic) + '</em>';
    if (desc) desc.textContent = data.desc;
    if (index) index.textContent = data.index;
    document.title = data.eyebrow + ' — ' + ECRU.getSettings().siteName;
  }

  function filteredProducts() {
    var pool = ECRU.products().slice();
    if (state.filter === 'new') pool = pool.filter(function (p) { return p.isNew; });
    else if (state.filter === 'sale') pool = pool.filter(function (p) { return p.compareAt; });
    else if (state.filter !== 'all') pool = pool.filter(function (p) { return p.gender === state.filter; });

    if (state.q) {
      var term = state.q.toLowerCase();
      pool = pool.filter(function (p) {
        return [p.name, p.type, p.gender, p.description, p.colors.map(function (c) { return c.name; }).join(' ')].join(' ').toLowerCase().indexOf(term) > -1;
      });
    }

    if (state.sort === 'new') {
      pool.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    } else if (state.sort === 'price-asc') {
      pool.sort(function (a, b) { return a.price - b.price; });
    } else if (state.sort === 'price-desc') {
      pool.sort(function (a, b) { return b.price - a.price; });
    } else if (state.sort === 'name') {
      pool.sort(function (a, b) { return a.name.localeCompare(b.name, 'ko'); });
    } else {
      pool.sort(function (a, b) {
        if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }
    return pool;
  }

  function syncURL() {
    var next = new URLSearchParams();
    if (state.filter === 'new') next.set('collection', 'new');
    else if (state.filter === 'sale') next.set('sale', '1');
    else if (state.filter !== 'all') next.set('gender', state.filter);
    if (state.sort !== 'featured') next.set('sort', state.sort);
    if (state.q) next.set('q', state.q);
    var query = next.toString();
    history.replaceState(null, '', window.location.pathname + (query ? '?' + query : ''));
  }

  function renderTags() {
    var holder = document.querySelector('[data-active-tags]');
    if (!holder) return;
    var tags = [];
    if (state.q) tags.push({ label: '검색: “' + state.q + '”', action: 'q' });
    if (state.filter === 'sale') tags.push({ label: '아카이브만 보기', action: 'sale' });
    holder.innerHTML = tags.map(function (tag) {
      return '<span class="active-tag">' + UI.esc(tag.label) + '<button type="button" data-clear-tag="' + tag.action + '" aria-label="필터 해제">' + UI.icon('close') + '</button></span>';
    }).join('');
  }

  function render() {
    setMeta();
    var grid = document.getElementById('shop-grid');
    var empty = document.getElementById('shop-empty');
    var list = filteredProducts();
    var count = document.querySelector('[data-result-count]');
    if (count) count.textContent = list.length + '개 아이템';
    if (grid) grid.innerHTML = list.map(UI.productCard).join('');
    if (empty) empty.classList.toggle('hide', list.length > 0);
    document.querySelectorAll('[data-shop-filter]').forEach(function (btn) {
      var on = btn.getAttribute('data-shop-filter') === state.filter;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on);
    });
    var sort = document.getElementById('sort-select');
    if (sort) sort.value = state.sort;
    renderTags();
    syncURL();
  }

  document.addEventListener('click', function (event) {
    var filter = event.target.closest('[data-shop-filter]');
    if (filter) {
      state.filter = filter.getAttribute('data-shop-filter');
      state.q = '';
      render();
      return;
    }
    var clear = event.target.closest('[data-clear-tag]');
    if (clear) {
      var action = clear.getAttribute('data-clear-tag');
      if (action === 'q') state.q = '';
      if (action === 'sale' && state.filter === 'sale') state.filter = 'all';
      render();
      return;
    }
    if (event.target.closest('[data-shop-reset]')) {
      state = { filter: 'all', sort: 'featured', q: '' };
      render();
    }
  });

  document.addEventListener('change', function (event) {
    if (event.target.id === 'sort-select') {
      state.sort = event.target.value;
      render();
    }
  });

  window.addEventListener('popstate', function () {
    var next = new URLSearchParams(window.location.search);
    state.filter = next.get('collection') === 'new' ? 'new' : next.get('gender') || (next.get('sale') ? 'sale' : 'all');
    state.sort = next.get('sort') || 'featured';
    state.q = next.get('q') || '';
    if (!['all', 'new', 'women', 'men', 'accessories', 'sale'].includes(state.filter)) state.filter = 'all';
    render();
  });

  function applyNavLabels() {
    document.querySelectorAll('[data-nav-label]').forEach(function (node) {
      var key = node.getAttribute('data-nav-label');
      var value = ECRU.getSettings()[key];
      if (value) node.textContent = value;
    });
  }

  document.addEventListener('ecru:ready', function () {
    UI.applyContent(document);
    applyNavLabels();
    render();
  });

  UI.applyContent(document);
  applyNavLabels();
  render();
  UI.observeReveals();
})();
