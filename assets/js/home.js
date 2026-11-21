/* To Lead — landing page behaviour. */
(function () {
  'use strict';

  var ECRU = window.ECRU;
  var UI = window.UI;
  var activeFilter = 'all';

  function applySettings() {
    var settings = ECRU.getSettings();
    var cta = document.querySelector('[data-hero-cta]');

    UI.applyContent(document);

    if (cta) cta.innerHTML = UI.esc(settings.heroCta) + ' <span aria-hidden="true">→</span>';

    var heroLink = document.querySelector('[data-hero-product]');
    if (heroLink) {
      var heroId = settings.heroProductId || 'iris-cotton-dress';
      var heroProduct = ECRU.getProduct(heroId);
      heroLink.setAttribute('href', 'product.html?id=' + encodeURIComponent(heroProduct ? heroProduct.id : heroId));
      if (heroProduct) {
        var nameNode = document.querySelector('[data-content="heroCaptionName"]');
        if (nameNode) nameNode.textContent = heroProduct.name;
      }
    }

    document.querySelectorAll('[data-nav-label]').forEach(function (node) {
      var key = node.getAttribute('data-nav-label');
      if (settings[key]) node.textContent = settings[key];
    });

    var seoTitle = settings.seoTitle || (settings.siteName + ' — ' + settings.brandTagline);
    document.title = seoTitle;
    var meta = document.querySelector('meta[name="description"]');
    if (meta && settings.seoDescription) meta.setAttribute('content', settings.seoDescription);
  }

  function setCategoryCounts() {
    var products = ECRU.products();
    var settings = ECRU.getSettings();
    var labels = { women: settings.catWomenMeta, men: settings.catMenMeta, accessories: settings.catAccMeta };
    ['women', 'men', 'accessories'].forEach(function (gender) {
      var node = document.querySelector('[data-category-count="' + gender + '"]');
      if (!node) return;
      var count = products.filter(function (p) { return p.gender === gender; }).length;
      node.textContent = count + '개 · ' + (labels[gender] || '');
    });
  }

  function sortedNew() {
    return ECRU.products().slice().sort(function (a, b) {
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  function renderNew(filter) {
    activeFilter = filter || 'all';
    var grid = document.getElementById('new-grid');
    if (!grid) return;
    var pool = sortedNew();
    if (activeFilter !== 'all') {
      pool = pool.filter(function (p) { return p.gender === activeFilter; });
    }
    pool = pool.slice(0, 8);
    grid.innerHTML = pool.map(UI.productCard).join('');
    document.querySelectorAll('[data-new-filter]').forEach(function (btn) {
      var on = btn.getAttribute('data-new-filter') === activeFilter;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on);
    });
  }

  document.addEventListener('click', function (event) {
    var tab = event.target.closest('[data-new-filter]');
    if (tab) renderNew(tab.getAttribute('data-new-filter'));
  });

  var form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var existingError = form.querySelector('.form-error');
      if (existingError) existingError.remove();
      var result = ECRU.subscribe(input.value);
      if (!result.ok) {
        var error = document.createElement('p');
        error.className = 'form-error';
        error.style.color = '#dca291';
        error.textContent = result.message;
        form.appendChild(error);
        input.focus();
        return;
      }
      var section = document.getElementById('newsletter');
      if (section) section.classList.add('is-done');
      UI.toast('조용한 리스트에 등록되었습니다.');
    });
  }

  document.addEventListener('ecru:ready', function () {
    applySettings();
    setCategoryCounts();
    renderNew(activeFilter);
  });

  applySettings();
  setCategoryCounts();
  renderNew('all');
  UI.observeReveals();
})();
