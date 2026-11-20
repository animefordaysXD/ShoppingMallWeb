/* To Lead — shared storefront chrome, cart, search and interactions. */
(function () {
  'use strict';

  var ECRU = window.ECRU;
  if (!ECRU) throw new Error('To Lead 스토어를 불러오지 못했습니다.');

  var icons = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.8-3.8 3.5-6 7.5-6s6.7 2.2 7.5 6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.4 4.9a5.2 5.2 0 0 0-7.4 0L12 5.9l-1-1a5.2 5.2 0 0 0-7.4 7.4l1 1L12 20.6l7.4-7.3 1-1a5.2 5.2 0 0 0 0-7.4Z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="m5 5 14 14M19 5 5 19"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M14 6l6 6-6 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 12h16"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12.5 5 5L20 6.5"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9L12 2.6Z"/></svg>',
    arrowUpRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M8 6h10v10"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r=".8" fill="currentColor" stroke="none"/></svg>'
  };

  function icon(name, cls) {
    var body = icons[name] || '';
    var klass = cls ? ' class="' + cls + '"' : '';
    return body.replace('<svg ', '<svg' + klass + ' aria-hidden="true" ');
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  function genderLabel(gender) {
    return gender === 'women' ? '여성' : gender === 'men' ? '남성' : '액세서리';
  }

  function productCard(product) {
    if (!product) return '';
    var isWished = ECRU.isWishlisted(product.id);
    var price = product.compareAt
      ? '<span class="sale">' + ECRU.money(product.price) + '</span><s>' + ECRU.money(product.compareAt) + '</s>'
      : ECRU.money(product.price);
    var badge = '';
    if (product.stock < 1) badge = '<span class="badge badge--muted">품절</span>';
    else if (product.compareAt) badge = '<span class="badge badge--sale">세일</span>';
    else if (product.isNew) badge = '<span class="badge badge--dark">신상품</span>';
    else if (product.badge) badge = '<span class="badge badge--dark">' + esc(product.badge) + '</span>';
    var swatches = (product.colors || []).slice(0, 4).map(function (color) {
      return '<span class="swatch-dot" style="background:' + esc(color.hex) + '" title="' + esc(color.name) + '"></span>';
    }).join('');
    var quick = product.stock > 0
      ? '<button class="quick-add-btn" type="button" data-quick-add="' + esc(product.id) + '">' + icon('plus') + '빠른 담기</button>'
      : '';
    return '' +
      '<article class="product-card" data-card-id="' + esc(product.id) + '">' +
        '<div class="product-card__media">' +
          '<a href="product.html?id=' + encodeURIComponent(product.id) + '" aria-label="' + esc(product.name) + ' 보기">' +
            '<img src="' + esc(product.image) + '" alt="' + esc(product.name) + '" loading="lazy">' +
          '</a>' +
          '<div class="product-card__badges">' + badge + '</div>' +
          '<button class="wish-btn' + (isWished ? ' is-active' : '') + '" type="button" data-wish-id="' + esc(product.id) + '" aria-label="' + esc(product.name) + (isWished ? ' 위시리스트에서 삭제' : ' 위시리스트에 저장') + '" aria-pressed="' + isWished + '">' + icon('heart') + '</button>' +
          quick +
        '</div>' +
        '<div class="product-card__info">' +
          '<div class="product-card__meta"><span>' + genderLabel(product.gender) + '</span><span>' + esc(product.type) + '</span></div>' +
          '<h3 class="product-card__name"><a href="product.html?id=' + encodeURIComponent(product.id) + '">' + esc(product.name) + '</a></h3>' +
          '<div class="product-card__bottom"><div class="product-card__price">' + price + '</div><div class="swatches">' + swatches + '</div></div>' +
        '</div>' +
      '</article>';
  }

  function brandHTML(opts) {
    opts = opts || {};
    var settings = ECRU.getSettings();
    var light = !!opts.light;
    var className = opts.className || 'wordmark';
    var href = opts.href || 'index.html';
    var label = (settings.siteName || 'To Lead') + ' 홈';
    var image = light ? (settings.logoLightImage || settings.logoImage) : settings.logoImage;
    if (image) {
      return '<a class="' + className + ' wordmark--image' + (light ? ' is-light' : '') + '" href="' + esc(href) + '" aria-label="' + esc(label) + '"><img src="' + esc(image) + '" alt="' + esc(settings.siteName || 'To Lead') + '"></a>';
    }
    return '<a class="' + className + ' wordmark--script' + (light ? ' is-light' : '') + '" href="' + esc(href) + '" aria-label="' + esc(label) + '"><span class="wordmark__name">' + esc(settings.siteName || 'To Lead') + '</span></a>';
  }

  function syncFavicon() {
    var link = document.querySelector('link[rel="icon"]');
    if (!link) return;
    var mark = ECRU.getSettings().logoMark;
    if (mark) link.setAttribute('href', mark);
  }

  function settingText(value) {
    var settings = ECRU.getSettings();
    return String(value == null ? '' : value).replace(/\{(freeShipping|shippingFee|email|siteName|phone)\}/g, function (all, key) {
      if (key === 'freeShipping') return ECRU.money(settings.freeShipping);
      if (key === 'shippingFee') return ECRU.money(settings.shippingFee);
      if (key === 'email') return settings.supportEmail;
      if (key === 'phone') return settings.supportPhone;
      return settings.siteName;
    });
  }

  function applyContent(root) {
    var settings = ECRU.getSettings();
    var scope = root || document;
    scope.querySelectorAll('[data-content]').forEach(function (node) {
      var value = settings[node.getAttribute('data-content')];
      if (value == null) return;
      if (node.hasAttribute('data-content-breaks')) {
        node.innerHTML = esc(settingText(value)).replace(/\n/g, '<br>');
      } else {
        node.textContent = settingText(value);
      }
    });
    scope.querySelectorAll('[data-content-src]').forEach(function (node) {
      var value = settings[node.getAttribute('data-content-src')];
      if (value) node.setAttribute('src', value);
    });
    scope.querySelectorAll('[data-content-href]').forEach(function (node) {
      var value = settings[node.getAttribute('data-content-href')];
      if (value) node.setAttribute('href', value);
    });
    scope.querySelectorAll('[data-content-alt]').forEach(function (node) {
      var value = settings[node.getAttribute('data-content-alt')];
      if (value) node.setAttribute('alt', value);
    });
    scope.querySelectorAll('[data-content-placeholder]').forEach(function (node) {
      var value = settings[node.getAttribute('data-content-placeholder')];
      if (value) node.setAttribute('placeholder', value);
    });
    syncFavicon();
  }

  function headerHTML() {
    var settings = ECRU.getSettings();
    var page = document.body.dataset.page || '';
    var params = new URLSearchParams(window.location.search);
    var active = '';
    if (page === 'shop') {
      if (params.get('collection') === 'new') active = 'new';
      else if (params.get('gender')) active = params.get('gender');
      else if (params.get('sale')) active = 'sale';
    }
    var links = [
      { key: 'new', label: settings.navNew, href: 'shop.html?collection=new' },
      { key: 'women', label: settings.navWomen, href: 'shop.html?gender=women' },
      { key: 'men', label: settings.navMen, href: 'shop.html?gender=men' },
      { key: 'accessories', label: settings.navAccessories, href: 'shop.html?gender=accessories' },
      { key: 'journal', label: settings.navJournal, href: 'index.html#editorial' }
    ];
    return '' +
      '<div class="announce">' +
        '<span class="announce__side">' + esc(settings.announcementSide) + '</span>' +
        '<span class="announce__main">' + esc(settings.announcement) + '</span>' +
        '<span class="announce__side">' + esc(settings.announcementRight) + '</span>' +
      '</div>' +
      '<header class="site-header" data-site-header>' +
        '<div class="header__inner container-wide">' +
          '<button class="icon-btn header__menu" type="button" data-open-menu aria-label="메뉴 열기">' + icon('menu') + '</button>' +
          brandHTML({ className: 'wordmark' }) +
          '<nav class="header__nav" aria-label="주요 메뉴">' +
            links.map(function (link) {
              return '<a href="' + link.href + '"' + (active === link.key ? ' class="is-active" aria-current="page"' : '') + '>' + link.label + '</a>';
            }).join('') +
          '</nav>' +
          '<div class="header__tools">' +
            '<button class="icon-btn icon-btn--search" type="button" data-open-search aria-label="검색">' + icon('search') + '</button>' +
            '<button class="icon-btn icon-btn--account" type="button" data-open-account aria-label="계정">' + icon('user') + '</button>' +
            '<button class="icon-btn icon-btn--wish" type="button" data-open-wishlist aria-label="위시리스트">' + icon('heart') + '<span class="tool-count" data-wish-count data-empty="true">0</span></button>' +
            '<button class="icon-btn" type="button" data-open-cart aria-label="쇼핑백">' + icon('bag') + '<span class="tool-count" data-cart-count data-empty="true">0</span></button>' +
          '</div>' +
        '</div>' +
      '</header>';
  }

  function footerHTML() {
    var settings = ECRU.getSettings();
    var year = new Date().getFullYear();
    var copyright = String(settings.copyright || '© {year} To Lead.').replace('{year}', year);
    var address = esc(settings.contactAddress || '').replace(/\n/g, '<br>');
    return '' +
      '<footer class="site-footer">' +
        '<div class="footer__top container-wide">' +
          '<div class="footer__brand">' +
            brandHTML({ className: 'wordmark', light: true }) +
            '<p class="footer__blurb">' + esc(settings.footerBlurb) + '</p>' +
            '<div class="footer__social">' +
              '<a href="#" data-soon>' + esc(settings.socialInstagram) + '</a><a href="#" data-soon>' + esc(settings.socialPinterest) + '</a><a href="#" data-soon>' + esc(settings.socialTikTok) + '</a>' +
            '</div>' +
          '</div>' +
          '<div class="footer__cols">' +
            '<div class="footer__col"><h4>' + esc(settings.footerShopTitle) + '</h4>' +
              '<a href="shop.html?collection=new">' + esc(settings.navNew) + '</a><a href="shop.html?gender=women">' + esc(settings.navWomen) + '</a><a href="shop.html?gender=men">' + esc(settings.navMen) + '</a><a href="shop.html?gender=accessories">' + esc(settings.navAccessories) + '</a><a href="shop.html?sale=1">아카이브</a>' +
            '</div>' +
            '<div class="footer__col"><h4>' + esc(settings.footerCareTitle) + '</h4>' +
              '<a href="mailto:' + esc(settings.supportEmail) + '">문의하기</a><a href="#" data-soon>' + esc(settings.footerShippingLabel) + '</a><a href="#" data-size-guide>' + esc(settings.footerSizeLabel) + '</a><a href="#" data-soon>' + esc(settings.footerCareLabel) + '</a><a href="#" data-soon>' + esc(settings.footerFaqLabel) + '</a>' +
            '</div>' +
            '<div class="footer__col"><h4>' + esc(settings.footerStudioTitle) + '</h4>' +
              '<a href="index.html#story">' + esc(settings.footerStoryLabel) + '</a><a href="index.html#editorial">' + esc(settings.footerJournalLabel) + '</a><a href="#" data-soon>' + esc(settings.footerStockistsLabel) + '</a><a href="#" data-soon>' + esc(settings.footerCareersLabel) + '</a>' +
            '</div>' +
            '<div class="footer__col"><h4>' + esc(settings.footerContactTitle) + '</h4>' +
              '<a href="mailto:' + esc(settings.supportEmail) + '">' + esc(settings.supportEmail) + '</a><a href="tel:' + esc(String(settings.supportPhone).replace(/[^0-9+]/g, '')) + '">' + esc(settings.supportPhone) + '</a><a href="#" data-soon>' + address + '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="footer__bottom container-wide">' +
          '<span>' + esc(copyright) + '</span>' +
          '<div class="footer__legal"><a href="#" data-soon>' + esc(settings.footerPrivacyLabel) + '</a><a href="#" data-soon>' + esc(settings.footerTermsLabel) + '</a><a href="#" data-soon>' + esc(settings.footerAccessibilityLabel) + '</a></div>' +
          '<div class="footer__currency"><span>' + esc(settings.currencyLabel) + '</span><div class="pay-marks"><span>VISA</span><span>MC</span><span>AMEX</span><span>PAY</span></div></div>' +
        '</div>' +
      '</footer>';
  }

  function panelsHTML() {
    var settings = ECRU.getSettings();
    return '' +
      '<div class="scrim" data-scrim></div>' +

      '<aside class="mobile-nav" id="mobile-nav" aria-hidden="true" aria-label="메뉴">' +
        '<div class="mobile-nav__head">' + brandHTML({ className: 'wordmark' }) + '<button class="icon-btn" type="button" data-close-layer aria-label="메뉴 닫기">' + icon('close') + '</button></div>' +
        '<nav class="mobile-nav__links">' +
          '<a href="shop.html?collection=new"><span>01</span>' + esc(settings.navNew) + '</a>' +
          '<a href="shop.html?gender=women"><span>02</span>' + esc(settings.navWomen) + '</a>' +
          '<a href="shop.html?gender=men"><span>03</span>' + esc(settings.navMen) + '</a>' +
          '<a href="shop.html?gender=accessories"><span>04</span>' + esc(settings.navAccessories) + '</a>' +
          '<a href="index.html#editorial"><span>05</span>' + esc(settings.navJournal) + '</a>' +
          '<a href="index.html#story"><span>06</span>' + esc(settings.navStory) + '</a>' +
        '</nav>' +
        '<div class="mobile-nav__foot"><a href="mailto:' + esc(settings.supportEmail) + '">' + esc(settings.supportEmail) + '</a><a href="#" data-open-account>계정</a><a href="#" data-open-wishlist>위시리스트</a><span>' + esc(settings.mobileNavNote) + '</span></div>' +
      '</aside>' +

      '<aside class="drawer" id="cart-drawer" aria-hidden="true" aria-labelledby="cart-title">' +
        '<div class="drawer__head"><div><h2 class="drawer__title" id="cart-title">쇼핑백 <span data-cart-title-count></span></h2></div><button class="icon-btn" type="button" data-close-layer aria-label="쇼핑백 닫기">' + icon('close') + '</button></div>' +
        '<div class="drawer__body" data-cart-body></div>' +
        '<div class="drawer__foot" data-cart-foot></div>' +
      '</aside>' +

      '<aside class="drawer drawer--wish" id="wish-drawer" aria-hidden="true" aria-labelledby="wish-title">' +
        '<div class="drawer__head"><h2 class="drawer__title" id="wish-title">위시리스트 <span data-wish-title-count></span></h2><button class="icon-btn" type="button" data-close-layer aria-label="위시리스트 닫기">' + icon('close') + '</button></div>' +
        '<div class="drawer__body" data-wish-body></div>' +
      '</aside>' +

      '<section class="search-panel" id="search-panel" aria-hidden="true" aria-label="검색">' +
        '<div class="search-panel__inner">' +
          '<div class="search-panel__head"><span class="eyebrow eyebrow--plain">컬렉션 검색</span><button class="icon-btn" type="button" data-close-layer aria-label="검색 닫기">' + icon('close') + '</button></div>' +
          '<form class="search-form" data-search-form>' +
            '<input type="search" name="q" placeholder="무엇을 찾고 계신가요?" aria-label="상품 검색" autocomplete="off" data-search-input>' +
            '<button class="icon-btn search-form__clear" type="button" data-search-clear aria-label="검색어 지우기">' + icon('close') + '</button>' +
          '</form>' +
          '<div class="search-suggestions" data-search-suggestions>' +
            '<button type="button" data-search-suggest="울">울</button><button type="button" data-search-suggest="니트">니트</button><button type="button" data-search-suggest="가죽">가죽</button><button type="button" data-search-suggest="가방">가방</button><button type="button" data-search-suggest="주얼리">주얼리</button><button type="button" data-search-suggest="신상품">신상품</button>' +
          '</div>' +
          '<div data-search-results></div>' +
        '</div>' +
      '</section>' +

      '<div class="modal" id="quick-modal" aria-hidden="true" aria-labelledby="quick-title">' +
        '<div class="modal__dialog" role="dialog" aria-modal="true">' +
          '<button class="icon-btn modal__close" type="button" data-close-layer aria-label="닫기">' + icon('close') + '</button>' +
          '<div data-quick-body></div>' +
        '</div>' +
      '</div>' +

      '<div class="modal" id="account-modal" aria-hidden="true" aria-labelledby="account-title">' +
        '<div class="modal__dialog" role="dialog" aria-modal="true">' +
          '<button class="icon-btn modal__close" type="button" data-close-layer aria-label="닫기">' + icon('close') + '</button>' +
          '<div data-account-body></div>' +
        '</div>' +
      '</div>' +

      '<div class="modal" id="size-modal" aria-hidden="true" aria-labelledby="size-title">' +
        '<div class="modal__dialog modal__dialog--wide" role="dialog" aria-modal="true">' +
          '<button class="icon-btn modal__close" type="button" data-close-layer aria-label="닫기">' + icon('close') + '</button>' +
          '<div data-size-body></div>' +
        '</div>' +
      '</div>' +

      '<div class="modal" id="checkout-modal" aria-hidden="true" aria-labelledby="checkout-title">' +
        '<div class="modal__dialog" role="dialog" aria-modal="true">' +
          '<button class="icon-btn modal__close" type="button" data-close-layer aria-label="닫기">' + icon('close') + '</button>' +
          '<div data-checkout-body></div>' +
        '</div>' +
      '</div>' +

      '<div class="modal" id="confirm-modal" aria-hidden="true" aria-labelledby="confirm-title">' +
        '<div class="modal__dialog" role="dialog" aria-modal="true">' +
          '<div data-confirm-body></div>' +
        '</div>' +
      '</div>' +

      '<div class="toast-stack" data-toast-stack role="status" aria-live="polite"></div>';
  }

  var layerMap = {
    menu: 'mobile-nav',
    cart: 'cart-drawer',
    wishlist: 'wish-drawer',
    search: 'search-panel',
    quick: 'quick-modal',
    account: 'account-modal',
    size: 'size-modal',
    checkout: 'checkout-modal',
    confirm: 'confirm-modal'
  };
  var lastFocus = null;
  var currentLayer = null;
  var currentProduct = null;
  var selectedQuickSize = null;

  function scrim() { return $('[data-scrim]'); }

  function openLayer(name) {
    var id = layerMap[name];
    var panel = id ? document.getElementById(id) : null;
    if (!panel) return;
    if (currentLayer && currentLayer !== panel) {
      currentLayer.classList.remove('is-open');
      currentLayer.setAttribute('aria-hidden', 'true');
    }
    lastFocus = document.activeElement;
    currentLayer = panel;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    scrim().classList.add('is-visible');
    document.body.classList.add('no-scroll');
    var focusTarget = panel.querySelector('[data-search-input], input, button, a');
    window.setTimeout(function () {
      if (name === 'search') {
        var input = panel.querySelector('[data-search-input]');
        if (input) input.focus();
      } else if (focusTarget) {
        focusTarget.focus({ preventScroll: true });
      }
    }, 40);
  }

  function closeLayer() {
    if (!currentLayer) return;
    currentLayer.classList.remove('is-open');
    currentLayer.setAttribute('aria-hidden', 'true');
    currentLayer = null;
    scrim().classList.remove('is-visible');
    document.body.classList.remove('no-scroll');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus({ preventScroll: true });
    }
    lastFocus = null;
  }

  function toast(message, type) {
    var stack = $('[data-toast-stack]');
    if (!stack) return;
    while (stack.children.length > 2) stack.removeChild(stack.firstElementChild);
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = icon(type === 'info' ? 'arrow' : 'check') + '<span>' + esc(message) + '</span>';
    stack.appendChild(el);
    window.setTimeout(function () {
      el.classList.add('is-out');
      window.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, 3200);
  }

  function syncCounts() {
    var cartCount = ECRU.cartCount();
    var wishCount = ECRU.wishlist().length;
    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = cartCount;
      el.dataset.empty = cartCount === 0 ? 'true' : 'false';
    });
    $$('[data-wish-count]').forEach(function (el) {
      el.textContent = wishCount;
      el.dataset.empty = wishCount === 0 ? 'true' : 'false';
    });
    $$('[data-cart-title-count]').forEach(function (el) { el.textContent = cartCount ? '(' + cartCount + ')' : ''; });
    $$('[data-wish-title-count]').forEach(function (el) { el.textContent = wishCount ? '(' + wishCount + ')' : ''; });
    var accountBtn = $('[data-open-account]');
    if (accountBtn) {
      var user = ECRU.user();
      accountBtn.classList.toggle('is-signed-in', !!user);
      accountBtn.setAttribute('aria-label', user ? '계정 — ' + user.name + ' 님 로그인됨' : '계정');
    }
  }

  function cartLineHTML(line) {
    var p = line.product;
    return '' +
      '<div class="cart-line">' +
        '<a class="cart-line__media" href="product.html?id=' + encodeURIComponent(p.id) + '"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '"></a>' +
        '<div class="cart-line__info">' +
          '<a class="cart-line__name" href="product.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a>' +
          '<div class="cart-line__meta">' + esc(line.size) + ' · ' + esc(p.colors[0] ? p.colors[0].name : '내추럴') + '</div>' +
          '<div class="cart-line__price">' + ECRU.money(p.price * line.qty) + '</div>' +
        '</div>' +
        '<div class="cart-line__side">' +
          '<button class="cart-line__remove" type="button" data-remove-cart="' + esc(line.key) + '" aria-label="' + esc(p.name) + ' 삭제">' + icon('trash') + '</button>' +
          '<div class="qty"><button type="button" data-cart-qty="' + esc(line.key) + '" data-delta="-1" aria-label="수량 줄이기">−</button><span>' + line.qty + '</span><button type="button" data-cart-qty="' + esc(line.key) + '" data-delta="1" aria-label="수량 늘리기">+</button></div>' +
        '</div>' +
      '</div>';
  }

  function renderCart() {
    syncCounts();
    var body = $('[data-cart-body]');
    var foot = $('[data-cart-foot]');
    if (!body || !foot) return;
    var lines = ECRU.getCart();
    var subtotal = ECRU.cartSubtotal();
    var settings = ECRU.getSettings();
    var threshold = settings.freeShipping || 150000;
    if (!lines.length) {
      body.innerHTML = '<div class="drawer__empty">' + icon('bag') + '<h3>쇼핑백이 비어 있습니다</h3><p>담아두신 아이템이 여기에 표시됩니다. 오래 입을 옷부터 시작해 보세요.</p><a class="btn btn--small" href="shop.html">컬렉션 둘러보기</a></div>';
      foot.innerHTML = '';
      return;
    }
    var remaining = Math.max(0, threshold - subtotal);
    var progress = Math.min(100, (subtotal / threshold) * 100);
    body.innerHTML =
      '<div class="ship-meter">' +
        '<div class="ship-meter__label"><span>' + (remaining > 0 ? ECRU.money(remaining) + ' 더 담으면 무료 배송' : '무료 배송이 적용되었습니다') + '</span><span>' + Math.round(progress) + '%</span></div>' +
        '<div class="ship-meter__track"><div class="ship-meter__fill" style="width:' + progress + '%"></div></div>' +
      '</div>' +
      lines.map(cartLineHTML).join('');
    foot.innerHTML =
      '<div class="cart-summary">' +
        '<div class="cart-summary__row"><span>상품 금액</span><span>' + ECRU.money(subtotal) + '</span></div>' +
        '<div class="cart-summary__row"><span>배송비</span><span>' + (remaining > 0 ? '결제 시 계산' : '무료') + '</span></div>' +
        '<div class="cart-summary__row cart-summary__row--total"><span>합계</span><span>' + ECRU.money(subtotal) + '</span></div>' +
      '</div>' +
      '<button class="btn btn--full" type="button" data-open-checkout>결제하기 ' + icon('arrow') + '</button>' +
      '<div class="drawer__note">데모 결제 · 실제 금액은 청구되지 않습니다</div>';
  }

  function renderWishlist() {
    var body = $('[data-wish-body]');
    if (!body) return;
    var items = ECRU.wishlist();
    if (!items.length) {
      body.innerHTML = '<div class="drawer__empty">' + icon('heart') + '<h3>아직 저장한 아이템이 없습니다</h3><p>마음에 드는 아이템의 하트를 눌러 나중에 다시 만나보세요.</p><a class="btn btn--small" href="shop.html">아이템 둘러보기</a></div>';
      return;
    }
    body.innerHTML = items.map(function (p) {
      return '' +
        '<div class="wish-line">' +
          '<a class="wish-line__media" href="product.html?id=' + encodeURIComponent(p.id) + '"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy"></a>' +
          '<div><h4><a href="product.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a></h4><p>' + ECRU.money(p.price) + (p.stock < 1 ? ' · 품절' : '') + '</p></div>' +
          '<div class="wish-line__actions"><button class="link-underline" type="button" data-quick-add="' + esc(p.id) + '">' + (p.stock < 1 ? '상품 보기' : '쇼핑백에 담기') + '</button><button class="cart-line__remove" type="button" data-wish-remove="' + esc(p.id) + '" aria-label="' + esc(p.name) + ' 삭제">' + icon('close') + '</button></div>' +
        '</div>';
    }).join('');
  }

  function refreshWishButtons(id) {
    var active = ECRU.isWishlisted(id);
    $$('[data-wish-id="' + id + '"]').forEach(function (btn) {
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active);
      btn.setAttribute('aria-label', (ECRU.getProduct(id) || {}).name + (active ? ' 위시리스트에서 삭제' : ' 위시리스트에 저장'));
    });
  }

  function renderSearch(query) {
    var results = $('[data-search-results]');
    var suggestions = $('[data-search-suggestions]');
    if (!results) return;
    query = String(query || '').trim();
    if (suggestions) suggestions.classList.toggle('hide', !!query);
    if (!query) {
      results.innerHTML = '<p class="search-heading">이번 주 신상품</p><div class="search-results">' +
        ECRU.products().filter(function (p) { return p.isNew; }).slice(0, 4).map(function (p) {
          return '<a class="search-result" href="product.html?id=' + encodeURIComponent(p.id) + '"><span class="search-result__media"><img src="' + esc(p.image) + '" alt=""></span><span><h4>' + esc(p.name) + '</h4><p>' + genderLabel(p.gender) + ' · ' + esc(p.type) + '</p></span><span>' + ECRU.money(p.price) + '</span></a>';
        }).join('') + '</div>';
      return;
    }
    var term = query.toLowerCase();
    var matches = ECRU.products().filter(function (p) {
      return [p.name, p.type, p.gender, p.description, p.colors.map(function (c) { return c.name; }).join(' ')].join(' ').toLowerCase().indexOf(term) > -1;
    }).slice(0, 8);
    if (!matches.length) {
      results.innerHTML = '<div class="search-empty">“' + esc(query) + '”에 대한 상품을 찾지 못했습니다. 다른 소재나 카테고리로 검색하거나 <a class="link-underline" href="shop.html">전체 상품</a>을 둘러보세요.</div>';
      return;
    }
    results.innerHTML = '<p class="search-heading">' + matches.length + '개의 결과</p><div class="search-results">' +
      matches.map(function (p) {
        return '<a class="search-result" href="product.html?id=' + encodeURIComponent(p.id) + '"><span class="search-result__media"><img src="' + esc(p.image) + '" alt=""></span><span><h4>' + esc(p.name) + '</h4><p>' + genderLabel(p.gender) + ' · ' + esc(p.type) + '</p></span><span>' + ECRU.money(p.price) + '</span></a>';
      }).join('') + '</div>';
  }

  function openQuickAdd(id) {
    var p = ECRU.getProduct(id);
    if (!p) return;
    if (p.stock < 1) {
      window.location.href = 'product.html?id=' + encodeURIComponent(p.id);
      return;
    }
    currentProduct = p;
    selectedQuickSize = p.sizes.length === 1 ? p.sizes[0] : null;
    var body = $('[data-quick-body]');
    body.innerHTML =
      '<p class="eyebrow modal__eyebrow">빠른 담기</p>' +
      '<div class="quick-add__product">' +
        '<div class="quick-add__media"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '"></div>' +
        '<div><h2 class="quick-add__name" id="quick-title">' + esc(p.name) + '</h2><div class="quick-add__price">' + ECRU.money(p.price) + (p.compareAt ? ' <s style="color:var(--muted)">' + ECRU.money(p.compareAt) + '</s>' : '') + '</div><p class="quick-add__meta">' + genderLabel(p.gender) + ' · ' + esc(p.type) + '</p></div>' +
      '</div>' +
      '<div class="eyebrow eyebrow--plain">사이즈 선택</div>' +
      '<div class="quick-add__sizes" data-quick-sizes>' +
        p.sizes.map(function (size) {
          return '<button type="button" data-quick-size="' + esc(size) + '"' + (selectedQuickSize === size ? ' class="is-selected"' : '') + '>' + esc(size) + '</button>';
        }).join('') +
      '</div>' +
      '<button class="btn btn--full" type="button" data-quick-confirm' + (selectedQuickSize ? '' : ' disabled') + '>쇼핑백에 담기</button>' +
      '<a class="quick-add__link link-underline" href="product.html?id=' + encodeURIComponent(p.id) + '">상세 정보 보기</a>';
    openLayer('quick');
  }

  function openAccount() {
    var body = $('[data-account-body]');
    var user = ECRU.user();
    if (user) {
      body.innerHTML =
        '<p class="eyebrow modal__eyebrow">내 계정</p>' +
        '<h2 class="modal__title" id="account-title">안녕하세요, ' + esc(user.name) + ' 님.</h2>' +
        '<p class="modal__text">' + esc(user.email) + '(으)로 로그인되어 있습니다. 저장한 아이템은 이 기기에서 데모로 유지됩니다.</p>' +
        '<div style="margin-top:28px;display:grid;gap:12px"><button class="btn btn--outline btn--full" type="button" data-open-wishlist>위시리스트 보기</button><button class="btn btn--full" type="button" data-sign-out>로그아웃</button></div>';
    } else {
      body.innerHTML =
        '<p class="eyebrow modal__eyebrow">멤버십</p>' +
        '<h2 class="modal__title" id="account-title">다시 만나 반가워요.</h2>' +
        '<p class="modal__text">로그인하면 좋아하는 아이템과 쇼핑백을 가까이 보관할 수 있습니다.</p>' +
        '<form data-account-form style="margin-top:26px;display:grid;gap:16px">' +
          '<div class="field"><label for="account-email">이메일 주소</label><input class="input" id="account-email" type="email" name="email" placeholder="you@example.com" required></div>' +
          '<div class="field"><label for="account-password">비밀번호</label><input class="input" id="account-password" type="password" name="password" placeholder="비밀번호" required></div>' +
          '<div data-form-error></div>' +
          '<button class="btn btn--full" type="submit">로그인 ' + icon('arrow') + '</button>' +
        '</form>' +
        '<p class="form-note" style="margin-top:16px;text-align:center">데모 계정: demo@tolead.kr / demo1234</p>';
    }
    openLayer('account');
  }

  function openSizeGuide(product) {
    var p = product || null;
    var body = $('[data-size-body]');
    var numeric = p && p.sizes.some(function (s) { return /^\d+$/.test(s); }) && (p.type === '슈즈' || p.type === '테일러링');
    var html = '<p class="eyebrow modal__eyebrow">핏 &amp; 실측</p><h2 class="modal__title" id="size-title">사이즈 가이드.</h2><p class="modal__text">' + (p ? esc(p.name) + '의 참고 실측입니다. ' : '') + '모든 실측은 단면 기준의 대략적인 수치입니다.</p>';
    if (numeric && p.type === '슈즈') {
      html += '<table class="size-table" style="margin-top:22px"><thead><tr><th>EU</th><th>UK</th><th>US</th><th>발 길이</th></tr></thead><tbody><tr><td>36</td><td>3</td><td>5.5</td><td>22.5cm</td></tr><tr><td>37</td><td>4</td><td>6.5</td><td>23.2cm</td></tr><tr><td>38</td><td>5</td><td>7.5</td><td>24cm</td></tr><tr><td>39</td><td>6</td><td>8.5</td><td>24.8cm</td></tr><tr><td>40</td><td>7</td><td>9.5</td><td>25.5cm</td></tr></tbody></table>';
    } else if (numeric) {
      html += '<table class="size-table" style="margin-top:22px"><thead><tr><th>사이즈</th><th>가슴</th><th>허리</th><th>어깨</th></tr></thead><tbody><tr><td>38</td><td>96cm</td><td>82cm</td><td>43cm</td></tr><tr><td>40</td><td>100cm</td><td>86cm</td><td>44.5cm</td></tr><tr><td>42</td><td>104cm</td><td>90cm</td><td>46cm</td></tr><tr><td>44</td><td>108cm</td><td>94cm</td><td>47.5cm</td></tr><tr><td>46</td><td>112cm</td><td>98cm</td><td>49cm</td></tr></tbody></table>';
    } else {
      html += '<table class="size-table" style="margin-top:22px"><thead><tr><th>사이즈</th><th>가슴</th><th>허리</th><th>힙</th></tr></thead><tbody><tr><td>XS</td><td>80–84cm</td><td>62–66cm</td><td>88–92cm</td></tr><tr><td>S</td><td>85–89cm</td><td>67–71cm</td><td>93–97cm</td></tr><tr><td>M</td><td>90–94cm</td><td>72–76cm</td><td>98–102cm</td></tr><tr><td>L</td><td>95–100cm</td><td>77–82cm</td><td>103–108cm</td></tr><tr><td>XL</td><td>101–106cm</td><td>83–88cm</td><td>109–114cm</td></tr></tbody></table>';
    }
    html += '<p class="form-note" style="margin-top:18px">사이즈 사이에 계시다면 여유로운 핏을 위해 한 사이즈 업을 권장합니다. 개인 상담은 <a class="link-underline" href="mailto:' + esc(ECRU.getSettings().supportEmail) + '">' + esc(ECRU.getSettings().supportEmail) + '</a>(으)로 문의해 주세요.</p>';
    body.innerHTML = html;
    openLayer('size');
  }

  function openCheckout() {
    var lines = ECRU.getCart();
    if (!lines.length) { toast('쇼핑백이 비어 있습니다.'); return; }
    var user = ECRU.user();
    var subtotal = ECRU.cartSubtotal();
    var settings = ECRU.getSettings();
    var threshold = settings.freeShipping || 150000;
    var shipping = subtotal >= threshold ? 0 : (settings.shippingFee || 5000);
    var body = $('[data-checkout-body]');
    body.innerHTML =
      '<p class="eyebrow modal__eyebrow">데모 결제</p>' +
      '<h2 class="modal__title" id="checkout-title">이제 거의 다 왔습니다.</h2>' +
      '<p class="modal__text">프런트엔드 데모입니다. 결제 정보는 수집되지 않으며 카드가 청구되지 않습니다.</p>' +
      '<div class="cart-summary" style="margin-top:24px">' +
        '<div class="cart-summary__row"><span>' + ECRU.cartCount() + '개 아이템</span><span>' + ECRU.money(subtotal) + '</span></div>' +
        '<div class="cart-summary__row"><span>배송비</span><span>' + (shipping ? ECRU.money(shipping) : '무료') + '</span></div>' +
        '<div class="cart-summary__row cart-summary__row--total"><span>합계</span><span>' + ECRU.money(subtotal + shipping) + '</span></div>' +
      '</div>' +
      '<form data-checkout-form style="margin-top:22px;display:grid;gap:16px">' +
        '<div class="field"><label for="checkout-email">주문 알림 이메일</label><input class="input" id="checkout-email" name="email" type="email" value="' + esc(user ? user.email : '') + '" placeholder="you@example.com" required></div>' +
        '<div class="field"><label for="checkout-name">받는 분 성함</label><input class="input" id="checkout-name" name="name" value="' + esc(user ? user.name : '') + '" placeholder="이름" required></div>' +
        '<div data-form-error></div>' +
        '<button class="btn btn--full" type="submit">데모 주문 완료 ' + icon('arrow') + '</button>' +
      '</form>';
    openLayer('checkout');
  }

  function openConfirm(order) {
    var body = $('[data-confirm-body]');
    body.innerHTML =
      '<div style="text-align:center;padding:16px 0 4px"><div style="width:58px;height:58px;margin:0 auto 22px;border:1px solid var(--line-strong);border-radius:50%;display:grid;place-items:center;color:var(--accent)">' + icon('check') + '</div>' +
      '<p class="eyebrow eyebrow--plain" style="justify-content:center">주문 완료</p>' +
      '<h2 class="modal__title" id="confirm-title" style="margin-top:10px">감사합니다.</h2>' +
      '<p class="modal__text" style="max-width:34ch;margin:12px auto 0">주문 <strong>' + esc(order.id) + '</strong>이(가) 확정되었습니다. ' + esc(order.customer.email) + '(으)로 영수증이 준비되었습니다.</p>' +
      '<div class="cart-summary" style="margin-top:26px;text-align:left"><div class="cart-summary__row"><span>합계</span><span>' + ECRU.money(order.total) + '</span></div><div class="cart-summary__row"><span>상태</span><span>' + esc(order.status) + '</span></div></div>' +
      '<button class="btn btn--full" type="button" data-close-layer style="margin-top:22px">쇼핑 계속하기</button>' +
      '<p class="form-note" style="margin-top:14px">이 주문은 브라우저에만 저장됩니다. 실제 결제와 배송 처리를 위해서는 백엔드 연동이 필요합니다.</p></div>';
    openLayer('confirm');
  }

  function observeReveals() {
    var items = $$('[data-reveal]:not(.is-in)');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { observer.observe(el); });
  }

  function handleAction(target, event) {
    var clicked = target.closest('[data-close-layer],[data-open-menu],[data-open-cart],[data-open-wishlist],[data-open-search],[data-open-account],[data-open-checkout],[data-open-size],[data-size-guide],[data-soon],[data-quick-add],[data-wish-id],[data-wish-remove],[data-cart-qty],[data-remove-cart],[data-quick-size],[data-quick-confirm],[data-sign-out],[data-search-suggest],[data-search-clear]');
    if (!clicked) return;

    if (clicked.hasAttribute('data-close-layer')) { closeLayer(); return; }
    if (clicked.hasAttribute('data-open-menu')) { openLayer('menu'); return; }
    if (clicked.hasAttribute('data-open-cart')) { renderCart(); openLayer('cart'); return; }
    if (clicked.hasAttribute('data-open-wishlist')) { renderWishlist(); openLayer('wishlist'); return; }
    if (clicked.hasAttribute('data-open-search')) { renderSearch(''); openLayer('search'); return; }
    if (clicked.hasAttribute('data-open-account')) { openAccount(); return; }
    if (clicked.hasAttribute('data-open-checkout')) { openCheckout(); return; }
    if (clicked.hasAttribute('data-size-guide')) { openSizeGuide(null); return; }
    if (clicked.hasAttribute('data-soon')) {
      if (event) event.preventDefault();
      toast('아직 준비 중인 페이지입니다 — 곧 만나보실 수 있습니다.', 'info');
      return;
    }
    if (clicked.hasAttribute('data-quick-add')) {
      openQuickAdd(clicked.getAttribute('data-quick-add'));
      return;
    }
    if (clicked.hasAttribute('data-wish-id')) {
      var wishId = clicked.getAttribute('data-wish-id');
      var result = ECRU.toggleWishlist(wishId);
      refreshWishButtons(wishId);
      syncCounts();
      toast(result.added ? '위시리스트에 저장했습니다.' : '위시리스트에서 삭제했습니다.');
      return;
    }
    if (clicked.hasAttribute('data-wish-remove')) {
      ECRU.toggleWishlist(clicked.getAttribute('data-wish-remove'));
      renderWishlist();
      syncCounts();
      return;
    }
    if (clicked.hasAttribute('data-cart-qty')) {
      var key = clicked.getAttribute('data-cart-qty');
      var delta = Number(clicked.getAttribute('data-delta'));
      var line = ECRU.getCart().filter(function (l) { return l.key === key; })[0];
      if (line) ECRU.setCartQty(key, line.qty + delta);
      renderCart();
      return;
    }
    if (clicked.hasAttribute('data-remove-cart')) {
      ECRU.removeCartLine(clicked.getAttribute('data-remove-cart'));
      renderCart();
      return;
    }
    if (clicked.hasAttribute('data-quick-size')) {
      selectedQuickSize = clicked.getAttribute('data-quick-size');
      $$('[data-quick-size]').forEach(function (btn) { btn.classList.toggle('is-selected', btn === clicked); });
      var confirm = $('[data-quick-confirm]');
      if (confirm) confirm.disabled = false;
      return;
    }
    if (clicked.hasAttribute('data-quick-confirm')) {
      if (!currentProduct || !selectedQuickSize) { toast('사이즈를 선택해 주세요.'); return; }
      var added = ECRU.addToCart(currentProduct.id, selectedQuickSize, 1);
      if (!added.ok) { toast(added.message); return; }
      closeLayer();
      renderCart();
      openLayer('cart');
      toast(added.product.name + '을(를) 쇼핑백에 담았습니다.');
      return;
    }
    if (clicked.hasAttribute('data-sign-out')) {
      ECRU.signOut();
      syncCounts();
      closeLayer();
      toast('로그아웃되었습니다.');
      return;
    }
    if (clicked.hasAttribute('data-search-suggest')) {
      var term = clicked.getAttribute('data-search-suggest');
      var input = $('[data-search-input]');
      if (input) { input.value = term; renderSearch(term); input.focus(); }
      return;
    }
    if (clicked.hasAttribute('data-search-clear')) {
      var searchInput = $('[data-search-input]');
      if (searchInput) { searchInput.value = ''; renderSearch(''); searchInput.focus(); }
    }
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    if (target.classList.contains('modal')) { closeLayer(); return; }
    if (target.hasAttribute('data-scrim')) { closeLayer(); return; }
    handleAction(target, event);
  });

  document.addEventListener('input', function (event) {
    if (event.target.matches('[data-search-input]')) renderSearch(event.target.value);
  });

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (form.matches('[data-search-form]')) {
      event.preventDefault();
      var q = form.querySelector('[data-search-input]').value.trim();
      window.location.href = q ? 'shop.html?q=' + encodeURIComponent(q) : 'shop.html';
      return;
    }
    if (form.matches('[data-account-form]')) {
      event.preventDefault();
      var data = new FormData(form);
      var result = ECRU.signIn(data.get('email'), data.get('password'));
      var errorBox = form.querySelector('[data-form-error]');
      if (!result.ok) {
        if (errorBox) errorBox.innerHTML = '<p class="form-error">' + esc(result.message) + '</p>';
        return;
      }
      syncCounts();
      closeLayer();
      toast('다시 오신 것을 환영합니다, ' + result.user.name + ' 님.');
      return;
    }
    if (form.matches('[data-checkout-form]')) {
      event.preventDefault();
      var checkoutData = new FormData(form);
      var outcome = ECRU.checkout({ email: checkoutData.get('email'), name: checkoutData.get('name') });
      var error = form.querySelector('[data-form-error]');
      if (!outcome.ok) {
        if (error) error.innerHTML = '<p class="form-error">' + esc(outcome.message) + '</p>';
        return;
      }
      renderCart();
      openConfirm(outcome.order);
      toast('주문 ' + outcome.order.id + '이(가) 접수되었습니다.');
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && currentLayer) closeLayer();
    if (event.key !== 'Tab' || !currentLayer) return;
    var focusables = Array.prototype.slice.call(currentLayer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(function (el) { return el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });

  document.addEventListener('ecru:change', function () {
    renderCart();
    renderWishlist();
    syncCounts();
  });

  window.addEventListener('scroll', function () {
    var header = $('[data-site-header]');
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }, { passive: true });

  function init() {
    document.body.insertAdjacentHTML('afterbegin', '<a class="skip-link" href="#main">본문으로 바로 가기</a>');
    var headerHost = document.getElementById('site-header');
    var footerHost = document.getElementById('site-footer');
    if (headerHost) headerHost.innerHTML = headerHTML();
    if (footerHost) footerHost.innerHTML = footerHTML();
    document.body.insertAdjacentHTML('beforeend', panelsHTML());
    renderCart();
    renderWishlist();
    syncCounts();
    syncFavicon();
    observeReveals();
    var yearNodes = $$('[data-year]');
    yearNodes.forEach(function (node) { node.textContent = new Date().getFullYear(); });
  }

  window.UI = {
    icon: icon,
    esc: esc,
    money: ECRU.money,
    productCard: productCard,
    brandHTML: brandHTML,
    applyContent: applyContent,
    settingText: settingText,
    syncFavicon: syncFavicon,
    toast: toast,
    openLayer: openLayer,
    closeLayer: closeLayer,
    openQuickAdd: openQuickAdd,
    openSizeGuide: openSizeGuide,
    observeReveals: observeReveals,
    syncCounts: syncCounts,
    renderCart: renderCart
  };

  init();
})();
