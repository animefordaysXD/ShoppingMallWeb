/* To Lead 스튜디오 — 관리자 인터페이스 (프런트엔드 데모). */
(function () {
  'use strict';

  var ECRU = window.ECRU;
  if (!ECRU) throw new Error('To Lead 스토어를 불러오지 못했습니다.');

  /* 데모용 하드코딩 계정 — 실제 서비스에서는 서버 인증으로 교체해야 합니다. */
  var SESSION_KEY = 'tolead.admin';
  var ADMIN_EMAIL = 'admin';
  var ADMIN_PASSWORD = 'admin';

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function initials(name) {
    return String(name || '스튜디오').trim().split(/\s+/).slice(0, 2).map(function (part) {
      return part.charAt(0);
    }).join('').toUpperCase();
  }

  function count(n, unit) {
    return n + (unit || '개');
  }

  function shortDate(value) {
    return ECRU.formatDate(value, { month: 'short', day: 'numeric' });
  }

  function fullDate(value) {
    return ECRU.formatDate(value, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function timeOf(value) {
    return new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
  }

  function compactMoney(value) {
    var n = Number(value) || 0;
    if (n >= 100000000) return '₩' + (n / 100000000).toFixed(1).replace(/\.0$/, '') + '억';
    if (n >= 10000) return '₩' + (n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '') + '만';
    return '₩' + Math.round(n);
  }

  function niceMax(value) {
    if (!value || value <= 0) return 100;
    var exp = Math.pow(10, Math.floor(Math.log(value) / Math.LN10));
    var fraction = value / exp;
    var nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
    return nice * exp;
  }

  var icons = {
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3.5" y="3.5" width="7" height="7"/><rect x="13.5" y="3.5" width="7" height="7"/><rect x="3.5" y="13.5" width="7" height="7"/><rect x="13.5" y="13.5" width="7" height="7"/></svg>',
    receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M5 3.5h14v17l-2.3-1.6-2.4 1.6-2.3-1.6-2.3 1.6-2.4-1.6L5 20.5Z"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="m3.5 12.4 8.9 8.9 8.1-8.1-8.9-8.9H3.5Z"/><circle cx="8" cy="8" r="1.4"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="9" cy="8" r="3.4"/><path d="M3 20c.6-3.2 2.8-5 6-5s5.4 1.8 6 5"/><path d="M15.5 4.8a3.4 3.4 0 0 1 0 6.4M17 15.2c2.1.5 3.5 2.1 4 4.8"/></svg>',
    layout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17"/><path d="M3.5 9h17M9.5 9v11.5"/></svg>',
    sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="m5 5 14 14M19 5 5 19"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12.5 5 5L20 6.5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 4v16M4 12h16"/></svg>',
    arrowUpRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18 18 6M8 6h10v10"/></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="m14.5 5.5 4 4"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.7"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 6.7"/><path d="M20 4v7h-7"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 22 20.5H2L12 3.5Z"/><path d="M12 9v5M12 17.4v.2"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.2"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14"/><path d="m3.5 6 8.5 7 8.5-7"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M3.5 6.5h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-15v-13Z"/><path d="M3.5 6.5v-1a2 2 0 0 1 2-2h11v3"/><path d="M16 12h4"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h2l2.2 10.5h9.6L20 8H6"/><circle cx="9" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>'
  };

  function icon(name, cls) {
    var body = icons[name] || '';
    var klass = cls ? ' class="' + cls + '"' : '';
    return body.replace('<svg ', '<svg' + klass + ' aria-hidden="true" ');
  }

  var IMAGES = [
    'bag-orange', 'bag-red', 'bomber', 'boots-men', 'boots-women', 'category-accessories',
    'category-men', 'category-women', 'dress', 'editorial-rail', 'editorial', 'hero',
    'knit-men', 'leather-men', 'leather-women', 'lookbook', 'overshirt', 'pearls',
    'pendant', 'poncho', 'rings', 'silk-blouse', 'story', 'story-detail', 'suit',
    'suit-detail', 'sweatshirt', 'tee', 'tee-portrait', 'trench', 'trousers', 'watch'
  ].map(function (name) { return 'assets/images/' + name + '.jpg'; });

  var NAV = [
    { id: 'overview', label: '개요', icon: 'grid' },
    { id: 'orders', label: '주문', icon: 'receipt' },
    { id: 'products', label: '상품', icon: 'tag' },
    { id: 'customers', label: '고객', icon: 'users' },
    { id: 'content', label: '콘텐츠', icon: 'layout' },
    { id: 'settings', label: '설정', icon: 'sliders' }
  ];

  var TABS = {};
  NAV.forEach(function (tab) { TABS[tab.id] = tab; });

  var state = {
    tab: 'overview',
    range: 30,
    orderFilter: 'All',
    orderSearch: '',
    productFilter: 'all',
    productSearch: '',
    customerSearch: '',
    chart: null,
    lastFocus: null
  };

  var STATUS_MOD = {
    'low stock': 'stock',
    'sold out': 'out',
    live: 'live',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
    paid: 'paid',
    refunded: 'refunded'
  };

  var STATUS_KO = {
    All: '전체',
    Processing: '처리 중',
    Shipped: '배송 중',
    Delivered: '배송 완료',
    Cancelled: '취소',
    Paid: '결제 완료',
    Refunded: '환불 완료',
    Online: '온라인',
    Boutique: '부티크',
    'Sold out': '품절',
    'Low stock': '재고 부족',
    Live: '판매 중',
    VIP: 'VIP',
    Returning: '재방문',
    New: '신규'
  };

  function ko(value) {
    return STATUS_KO[value] || value;
  }

  function genderLabel(gender) {
    return gender === 'women' ? '여성' : gender === 'men' ? '남성' : gender === 'accessories' ? '액세서리' : gender;
  }

  function pill(label, mod) {
    var key = String(mod || label).toLowerCase();
    return '<span class="status-pill status-pill--' + (STATUS_MOD[key] || key.replace(/\s+/g, '-')) + '">' + esc(ko(label)) + '</span>';
  }

  /* Session ----------------------------------------------------------------- */
  function readSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && parsed.email ? parsed : null;
    } catch (err) { return null; }
  }

  function writeSession(session) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (err) { /* ignore */ }
  }

  function clearSession() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (err) { /* ignore */ }
  }

  /* Chrome ------------------------------------------------------------------ */
  function renderNav() {
    var processing = ECRU.orders().filter(function (order) { return order.status === 'Processing'; }).length;
    var lowStock = ECRU.products().filter(function (product) { return product.stock <= 5; }).length;
    $$('.admin-nav [data-admin-tab]').forEach(function (link) {
      var id = link.getAttribute('data-admin-tab');
      var tab = TABS[id];
      if (!tab) return;
      var count = id === 'orders' ? processing : id === 'products' ? lowStock : 0;
      link.innerHTML =
        icon(tab.icon) +
        '<span>' + esc(tab.label) + '</span>' +
        (count ? '<span class="admin-nav__count">' + count + '</span>' : '');
      link.classList.toggle('is-active', state.tab === id);
      if (state.tab === id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function injectChrome() {
    renderNav();
    var menu = $('[data-admin-menu]');
    if (menu) menu.innerHTML = icon('menu');
    var bell = $('[data-admin-notifications]');
    if (bell) {
      bell.innerHTML = icon('bell') + '<span class="admin-bell__dot" aria-hidden="true"></span>';
      var low = ECRU.products().filter(function (p) { return p.stock <= 5; }).length;
      bell.setAttribute('aria-label', low ? '알림 — 재고 부족 상품 ' + low + '개' : '알림');
      bell.classList.toggle('has-alert', low > 0);
    }
    var close = $('[data-admin-close]');
    if (close) close.innerHTML = icon('close');
    var searchIcon = $('[data-search-icon]');
    if (searchIcon) searchIcon.innerHTML = icon('search');
    $$('[data-year]').forEach(function (node) { node.textContent = new Date().getFullYear(); });
  }

  /* Routing ----------------------------------------------------------------- */
  function currentTab() {
    var hash = String(window.location.hash || '').replace('#', '');
    return TABS[hash] ? hash : 'overview';
  }

  function route() {
    state.tab = currentTab();
    var topSearch = $('[data-admin-search]');
    if (topSearch) topSearch.value = '';
    renderTab();
    closeSidebar();
    window.scrollTo(0, 0);
  }

  function renderTab() {
    var host = $('#admin-content');
    if (!host) return;
    var html;
    if (state.tab === 'orders') html = viewOrders();
    else if (state.tab === 'products') html = viewProducts();
    else if (state.tab === 'customers') html = viewCustomers();
    else if (state.tab === 'content') html = viewContent();
    else if (state.tab === 'settings') html = viewSettings();
    else html = viewOverview();
    host.innerHTML = html;
    var crumb = $('[data-admin-crumb]');
    if (crumb) crumb.textContent = TABS[state.tab].label;
    renderNav();
    afterRender();
  }

  /* App visibility ---------------------------------------------------------- */
  function showApp() {
    var login = $('#admin-login');
    var app = $('#admin-app');
    if (login) login.hidden = true;
    if (app) app.hidden = false;
    document.body.classList.remove('no-scroll');
    route();
  }

  function showLogin() {
    var login = $('#admin-login');
    var app = $('#admin-app');
    if (app) app.hidden = true;
    if (login) login.hidden = false;
    closeModal(true);
    closeSidebar();
    document.body.classList.remove('no-scroll');
    var email = $('#admin-email');
    if (email) email.focus();
  }

  function handleSignOut() {
    clearSession();
    ECRU.adminSignOut();
    showLogin();
    toast('스튜디오에서 로그아웃되었습니다.', 'info');
  }

  /* Sidebar / modal --------------------------------------------------------- */
  function openSidebar() {
    var side = $('#admin-side');
    var scrim = $('[data-admin-scrim]');
    if (side) side.classList.add('is-open');
    if (scrim) scrim.classList.add('is-open');
  }

  function closeSidebar() {
    var side = $('#admin-side');
    var scrim = $('[data-admin-scrim]');
    if (side) side.classList.remove('is-open');
    if (scrim) scrim.classList.remove('is-open');
  }

  function openModal(html) {
    var modal = $('#admin-modal');
    var body = $('#admin-modal-body');
    if (!modal || !body) return;
    state.lastFocus = document.activeElement;
    body.innerHTML = html;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    var focusTarget = modal.querySelector('[data-autofocus]') || modal.querySelector('input, select, textarea, button');
    if (focusTarget) {
      window.setTimeout(function () { try { focusTarget.focus(); } catch (err) { /* ignore */ } }, 80);
    }
  }

  function closeModal(immediate) {
    var modal = $('#admin-modal');
    var body = $('#admin-modal-body');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (immediate) {
      if (body) body.innerHTML = '';
    } else {
      window.setTimeout(function () {
        if (body && !modal.classList.contains('is-open')) body.innerHTML = '';
      }, 320);
    }
    if (state.lastFocus && state.lastFocus.isConnected) {
      try { state.lastFocus.focus(); } catch (err) { /* ignore */ }
    }
  }

  /* Toasts / files ---------------------------------------------------------- */
  function toast(message, type) {
    var stack = $('[data-admin-toasts]');
    if (!stack) return;
    var el = document.createElement('div');
    el.className = 'admin-toast';
    el.innerHTML = icon(type === 'info' ? 'info' : type === 'alert' ? 'alert' : 'check') + '<span>' + esc(message) + '</span>';
    stack.appendChild(el);
    window.setTimeout(function () {
      el.classList.add('is-out');
      window.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, 3400);
  }

  function downloadFile(filename, content, mime) {
    var blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
  }

  function csvCell(value) {
    return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
  }

  function downloadOrders() {
    var rows = [['주문번호', '날짜', '고객', '이메일', '상품', '상태', '결제', '채널', '상품 금액', '배송비', '합계']];
    ECRU.orders().forEach(function (order) {
      rows.push([
        order.id,
        ECRU.formatDateTime(order.date),
        order.customer.name,
        order.customer.email,
        order.items.map(function (item) { return item.name + ' / ' + item.size + ' x' + item.qty; }).join(' | '),
        order.status,
        order.payment,
        order.channel,
        order.subtotal,
        order.shipping,
        order.total
      ]);
    });
    downloadFile('tolead-orders-' + new Date().toISOString().slice(0, 10) + '.csv', rows.map(function (row) {
      return row.map(csvCell).join(',');
    }).join('\r\n'), 'text/csv;charset=utf-8');
    toast('주문 목록을 CSV로 내려받았습니다.');
  }

  function downloadStore() {
    downloadFile('tolead-store-' + new Date().toISOString().slice(0, 10) + '.json', ECRU.exportData(), 'application/json');
    toast('스토어 데이터를 JSON으로 내려받았습니다.');
  }

  /* Shared view pieces ------------------------------------------------------ */
  function head(eyebrow, title, sub, actions) {
    return '' +
      '<div class="admin-head">' +
        '<div>' +
          '<p class="eyebrow eyebrow--plain">' + esc(eyebrow) + '</p>' +
          '<h1>' + title + '</h1>' +
          '<p>' + esc(sub) + '</p>' +
        '</div>' +
        '<div class="admin-head__actions">' + (actions || '') + '</div>' +
      '</div>';
  }

  function emptyState(title, text, action) {
    return '<div class="admin-empty"><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p>' + (action || '') + '</div>';
  }

  function dayKey(value) {
    var d = new Date(value);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function buildDaily(days) {
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    var list = [];
    var index = {};
    for (var i = 0; i < days; i++) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      var entry = { date: d, revenue: 0, orders: 0, units: 0 };
      list.push(entry);
      index[dayKey(d)] = entry;
    }
    ECRU.orders().forEach(function (order) {
      if (order.status === 'Cancelled') return;
      var target = index[dayKey(order.date)];
      if (!target) return;
      target.revenue += order.total;
      target.orders += 1;
      target.units += order.items.reduce(function (sum, item) { return sum + item.qty; }, 0);
    });
    return list;
  }

  function sparkline(values) {
    if (!values || values.length < 2) return '';
    var width = 100;
    var height = 28;
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var span = max - min || 1;
    var points = values.map(function (value, index) {
      var x = (index / (values.length - 1)) * width;
      var y = height - 2 - ((value - min) / span) * (height - 6);
      return (index ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
    }).join(' ');
    return '<div class="kpi__spark"><svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><path d="' + points + '"/></svg></div>';
  }

  function kpiCard(label, value, delta, values, note) {
    var up = Number(delta) >= 0;
    return '' +
      '<article class="kpi">' +
        '<div class="kpi__label"><span>' + esc(label) + '</span><span>' + esc(note) + '</span></div>' +
        '<div class="kpi__value">' + value + '</div>' +
        '<div class="kpi__delta ' + (up ? 'is-up' : 'is-down') + '">' +
          icon(up ? 'arrowUp' : 'arrowDown') +
          '<strong>' + Math.abs(Number(delta) || 0).toFixed(1) + '%</strong>' +
          '<span>지난 기간 대비</span>' +
        '</div>' +
        sparkline(values) +
      '</article>';
  }

  function chartPanel() {
    var daily = buildDaily(state.range);
    var values = daily.map(function (d) { return d.revenue; });
    var rawMax = Math.max.apply(null, values.concat([1]));
    var yMax = niceMax(rawMax * 1.08);
    var VBW = 760;
    var VBH = 220;
    var L = 44;
    var R = 12;
    var T = 16;
    var B = 30;
    var plotW = VBW - L - R;
    var plotH = VBH - T - B;
    var n = daily.length;

    function xAt(i) { return L + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW); }
    function yAt(v) { return T + (1 - v / yMax) * plotH; }

    var line = daily.map(function (d, i) {
      return (i ? 'L' : 'M') + xAt(i).toFixed(1) + ' ' + yAt(d.revenue).toFixed(1);
    }).join(' ');
    var area = line + ' L ' + xAt(n - 1).toFixed(1) + ' ' + (T + plotH) + ' L ' + xAt(0).toFixed(1) + ' ' + (T + plotH) + ' Z';

    var grid = '';
    for (var k = 0; k <= 4; k++) {
      var value = (yMax / 4) * k;
      var y = yAt(value);
      grid += '<line x1="' + L + '" y1="' + y.toFixed(1) + '" x2="' + (VBW - R) + '" y2="' + y.toFixed(1) + '" />';
      grid += '<text x="' + (L - 9) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end">' + compactMoney(value) + '</text>';
    }

    var dots = daily.map(function (d, i) {
      return '<circle cx="' + xAt(i).toFixed(1) + '" cy="' + yAt(d.revenue).toFixed(1) + '" r="2.6"' + (i === n - 1 ? ' class="is-on"' : '') + ' />';
    }).join('');

    state.chart = {
      points: daily,
      yMax: yMax,
      VBW: VBW,
      VBH: VBH,
      L: L,
      R: R,
      T: T,
      plotW: plotW,
      plotH: plotH
    };

    var labelIndexes = [0, Math.round((n - 1) * 0.25), Math.round((n - 1) * 0.5), Math.round((n - 1) * 0.75), n - 1];
    var seen = {};
    var xlabels = labelIndexes.filter(function (index) {
      if (seen[index]) return false;
      seen[index] = true;
      return true;
    }).map(function (index) {
      return '<span>' + esc(shortDate(daily[index].date)) + '</span>';
    }).join('');

    return '' +
      '<section class="panel">' +
        '<div class="panel__head">' +
          '<div><h2 class="panel__title">매출</h2><p class="panel__sub">일별 순매출 · 최근 ' + state.range + '일</p></div>' +
          '<div class="range-toggle" role="group" aria-label="매출 기간">' +
            '<button type="button" data-range="7" class="' + (state.range === 7 ? 'is-active' : '') + '">7D</button>' +
            '<button type="button" data-range="30" class="' + (state.range === 30 ? 'is-active' : '') + '">30D</button>' +
            '<button type="button" data-range="90" class="' + (state.range === 90 ? 'is-active' : '') + '">90D</button>' +
          '</div>' +
        '</div>' +
        '<div class="chart-wrap" data-chart>' +
          '<svg class="chart-svg" viewBox="0 0 ' + VBW + ' ' + VBH + '" role="img" aria-label="최근 ' + state.range + '일 일별 매출">' +
            '<defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1712" stop-opacity=".12"/><stop offset="1" stop-color="#1b1712" stop-opacity="0"/></linearGradient></defs>' +
            '<g class="chart-grid">' + grid + '</g>' +
            '<path class="chart-area" d="' + area + '" />' +
            '<path class="chart-line" d="' + line + '" />' +
            '<g class="chart-dots">' + dots + '</g>' +
            '<line class="chart-guide" x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (T + plotH) + '" />' +
          '</svg>' +
          '<div class="chart-tip" data-chart-tip></div>' +
          '<div class="chart-xlabels">' + xlabels + '</div>' +
        '</div>' +
      '</section>';
  }

  function bindChart() {
    var wrap = $('[data-chart]');
    var chart = state.chart;
    if (!wrap || !chart) return;
    var svg = wrap.querySelector('svg');
    var tip = wrap.querySelector('[data-chart-tip]');
    var guide = wrap.querySelector('.chart-guide');
    var dots = $$('.chart-dots circle', wrap);
    if (!svg || !tip) return;
    var points = chart.points;
    var n = points.length;
    var lastIndex = -1;

    function xAt(i) { return chart.L + (n <= 1 ? chart.plotW / 2 : (i / (n - 1)) * chart.plotW); }
    function yAt(v) { return chart.T + (1 - v / chart.yMax) * chart.plotH; }

    function activate(index) {
      if (index === lastIndex) return;
      lastIndex = index;
      var day = points[index];
      var rect = svg.getBoundingClientRect();
      var px = (xAt(index) / chart.VBW) * rect.width + svg.offsetLeft;
      var py = (yAt(day.revenue) / chart.VBH) * rect.height + svg.offsetTop;
      tip.style.left = px.toFixed(1) + 'px';
      tip.style.top = py.toFixed(1) + 'px';
      tip.innerHTML = '<strong>' + esc(shortDate(day.date)) + '</strong><br>' +
        ECRU.money(day.revenue) +
        (day.orders ? ' · 주문 ' + day.orders + '건' : ' · 주문 없음');
      tip.classList.add('is-on');
      if (guide) {
        guide.setAttribute('x1', xAt(index).toFixed(1));
        guide.setAttribute('x2', xAt(index).toFixed(1));
        guide.classList.add('is-on');
      }
      dots.forEach(function (dot, i) { dot.classList.toggle('is-on', i === index); });
    }

    function reset() {
      lastIndex = -1;
      tip.classList.remove('is-on');
      if (guide) guide.classList.remove('is-on');
      dots.forEach(function (dot, i) { dot.classList.toggle('is-on', i === n - 1); });
    }

    svg.addEventListener('mousemove', function (event) {
      var rect = svg.getBoundingClientRect();
      var vbX = ((event.clientX - rect.left) / rect.width) * chart.VBW;
      var ratio = (vbX - chart.L) / chart.plotW;
      var index = clamp(Math.round(ratio * (n - 1)), 0, n - 1);
      activate(index);
    });
    svg.addEventListener('mouseleave', reset);
  }

  /* Overview ---------------------------------------------------------------- */
  function viewOverview() {
    var stats = ECRU.stats(state.range);
    var daily = buildDaily(state.range);
    var orders = ECRU.orders();
    var products = ECRU.products();
    var lowStock = products.filter(function (p) { return p.stock <= 5; })
      .sort(function (a, b) { return a.stock - b.stock; })
      .slice(0, 6);
    var top = stats.topProducts;
    var now = new Date();
    var hour = now.getHours();
    var greeting = hour < 6 ? '늦은 밤이네요' : hour < 12 ? '좋은 아침입니다' : hour < 18 ? '좋은 오후입니다' : '좋은 저녁입니다';
    var dateLine = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(now);
    var rangeLabel = state.range + '일';

    var revenueSpark = daily.map(function (d) { return d.revenue; });
    var orderSpark = daily.map(function (d) { return d.orders; });
    var aovSpark = daily.map(function (d) { return d.orders ? d.revenue / d.orders : 0; });
    var unitSpark = daily.map(function (d) { return d.units; });

    var kpis = '' +
      kpiCard('순매출', ECRU.money(stats.revenue), stats.deltaRevenue, revenueSpark, rangeLabel) +
      kpiCard('주문', String(stats.orders), stats.deltaOrders, orderSpark, rangeLabel) +
      kpiCard('평균 주문 금액', ECRU.money(stats.aov), stats.deltaAov, aovSpark, rangeLabel) +
      kpiCard('판매 수량', String(stats.units), stats.deltaUnits, unitSpark, rangeLabel);

    var rankRows = '';
    if (top.length) {
      var topMax = top[0].revenue || 1;
      rankRows = top.map(function (item) {
        var product = ECRU.getProduct(item.productId);
        var image = product ? product.image : 'assets/images/story.jpg';
        return '' +
          '<div class="rank-row">' +
            '<div class="rank-row__media"><img src="' + esc(image) + '" alt="" loading="lazy"></div>' +
            '<div><div class="rank-row__name">' + esc(item.name) + '</div><div class="rank-row__units">' + count(item.units, '개 판매') + '</div></div>' +
            '<div class="rank-row__value">' + ECRU.money(item.revenue) + '</div>' +
            '<div class="rank-row__bar"><div class="rank-row__fill" style="width:' + Math.max(6, (item.revenue / topMax) * 100).toFixed(1) + '%"></div></div>' +
          '</div>';
      }).join('');
    } else {
      rankRows = '<p class="panel__sub">이 기간에는 아직 판매 기록이 없습니다.</p>';
    }

    var recentRows = orders.slice(0, 6).map(function (order) {
      return '' +
        '<tr>' +
          '<td><span class="mono">' + esc(order.id) + '</span></td>' +
          '<td><div class="customer-cell"><span class="customer-avatar">' + esc(initials(order.customer.name)) + '</span><div><strong>' + esc(order.customer.name) + '</strong><span>' + esc(order.customer.email) + '</span></div></div></td>' +
          '<td>' + esc(shortDate(order.date)) + '</td>' +
          '<td>' + pill(order.status) + '</td>' +
          '<td class="num">' + ECRU.money(order.total) + '</td>' +
          '<td class="actions"><button class="icon-action" type="button" data-order-view="' + esc(order.id) + '" aria-label="주문 ' + esc(order.id) + ' 보기">' + icon('eye') + '</button></td>' +
        '</tr>';
    }).join('');

    var lowRows = '';
    if (lowStock.length) {
      lowRows = lowStock.map(function (product) {
        return '' +
          '<div class="low-row">' +
            '<div class="low-row__media"><img src="' + esc(product.image) + '" alt="" loading="lazy"></div>' +
            '<div><strong>' + esc(product.name) + '</strong><span>' + esc(product.sku) + '</span><span class="sub">' + (product.stock < 1 ? '품절' : product.stock + '개 남음') + '</span></div>' +
            '<button type="button" data-stock-edit="' + esc(product.id) + '">재고 보충</button>' +
          '</div>';
      }).join('');
    } else {
      lowRows = '<p class="panel__sub">모든 상품의 재고가 충분합니다.</p>';
    }

    return '' +
      head(dateLine, greeting + ', <em>관리자님</em>.', '오늘 스튜디오의 상황을 한눈에 확인하세요.',
        '<a class="btn btn--admin-ghost" href="index.html" target="_blank" rel="noopener">스토어 보기 ' + icon('arrowUpRight') + '</a>' +
        '<button class="btn" type="button" data-product-new>' + icon('plus') + '상품 추가</button>') +
      '<div class="kpi-grid">' + kpis + '</div>' +
      '<div class="admin-grid">' +
        chartPanel() +
        '<section class="panel">' +
          '<div class="panel__head"><div><h2 class="panel__title">인기 상품</h2><p class="panel__sub">매출 기준 · 최근 ' + state.range + '일</p></div></div>' +
          '<div class="rank-list">' + rankRows + '</div>' +
        '</section>' +
      '</div>' +
      '<div class="admin-grid admin-grid--lower">' +
        '<section class="panel panel--flush">' +
          '<div class="panel__head"><div><h2 class="panel__title">최근 주문</h2><p class="panel__sub">이 기간에 접수된 주문 ' + stats.orders + '건</p></div>' +
            '<button class="panel__link" type="button" data-goto-tab="orders">전체 주문 ' + icon('arrowUpRight') + '</button></div>' +
          '<div class="table-wrap"><table class="data-table"><thead><tr><th>주문</th><th>고객</th><th>날짜</th><th>상태</th><th class="num">합계</th><th class="actions"></th></tr></thead><tbody>' +
            (recentRows || '<tr><td colspan="6">' + emptyState('아직 주문이 없습니다', '스토어프런트에서 주문이 들어오면 여기에 표시됩니다.') + '</td></tr>') +
          '</tbody></table></div>' +
        '</section>' +
        '<section class="panel">' +
          '<div class="panel__head"><div><h2 class="panel__title">재고 부족</h2><p class="panel__sub">보유 수량이 5개 이하인 상품</p></div>' +
            '<button class="panel__link" type="button" data-goto-tab="products" data-goto-filter="low">관리 ' + icon('arrowUpRight') + '</button></div>' +
          '<div class="low-stock">' + lowRows + '</div>' +
        '</section>' +
      '</div>';
  }

  function afterRender() {
    if (state.tab === 'overview') bindChart();
    if (state.tab === 'content') bindContentForm();
  }

  /* Orders ------------------------------------------------------------------ */
  function matchesOrder(order, query) {
    if (!query) return true;
    var haystack = [
      order.id,
      order.customer.name,
      order.customer.email,
      order.status,
      order.channel,
      order.payment,
      order.items.map(function (item) { return item.name; }).join(' ')
    ].join(' ').toLowerCase();
    return haystack.indexOf(query.toLowerCase()) > -1;
  }

  function orderUnits(order) {
    return order.items.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function filteredOrders() {
    return ECRU.orders().filter(function (order) {
      var statusMatch = state.orderFilter === 'All' || order.status === state.orderFilter;
      return statusMatch && matchesOrder(order, state.orderSearch);
    });
  }

  function ordersTable(list) {
    if (!list.length) {
      return emptyState('조건에 맞는 주문이 없습니다', '다른 상태를 선택하거나 검색어를 지워 전체 주문을 확인해 보세요.');
    }
    var rows = list.map(function (order) {
      return '' +
        '<tr>' +
          '<td><span class="mono">' + esc(order.id) + '</span><span class="subline">' + esc(ko(order.channel)) + '</span></td>' +
          '<td><div class="customer-cell"><span class="customer-avatar">' + esc(initials(order.customer.name)) + '</span><div><strong>' + esc(order.customer.name) + '</strong><span>' + esc(order.customer.email) + '</span></div></div></td>' +
          '<td>' + esc(shortDate(order.date)) + '<span class="subline">' + esc(timeOf(order.date)) + '</span></td>' +
          '<td class="num">' + orderUnits(order) + '개</td>' +
          '<td>' + pill(order.status) + '</td>' +
          '<td>' + pill(order.payment) + '</td>' +
          '<td class="num">' + ECRU.money(order.total) + '</td>' +
          '<td class="actions"><button class="icon-action" type="button" data-order-view="' + esc(order.id) + '" aria-label="주문 ' + esc(order.id) + ' 보기">' + icon('eye') + '</button></td>' +
        '</tr>';
    }).join('');
    return '' +
      '<div class="table-wrap"><table class="data-table">' +
        '<thead><tr><th>주문</th><th>고객</th><th>날짜</th><th class="num">수량</th><th>상태</th><th>결제</th><th class="num">합계</th><th class="actions"></th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table></div>';
  }

  function refreshOrdersHost() {
    var host = $('[data-orders-host]');
    if (host) host.innerHTML = ordersTable(filteredOrders());
  }

  function viewOrders() {
    var all = ECRU.orders();
    var filters = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    var counts = { All: all.length };
    filters.slice(1).forEach(function (status) {
      counts[status] = all.filter(function (order) { return order.status === status; }).length;
    });
    var tabs = filters.map(function (status) {
      return '<button type="button" data-order-filter="' + status + '" class="' + (state.orderFilter === status ? 'is-active' : '') + '">' +
        ko(status) + ' <span class="tab-count">' + counts[status] + '</span></button>';
    }).join('');

    return '' +
      head('주문 처리', '주문', '스토어프런트에서 접수된 모든 주문을 확인하고 상태를 변경하세요.',
        '<button class="btn btn--admin-ghost" type="button" data-export-orders>' + icon('download') + 'CSV 내려받기</button>') +
      '<div class="admin-toolbar">' +
        '<div class="filter-tabs">' + tabs + '</div>' +
        '<div class="admin-toolbar__group">' +
          '<label class="admin-search"><span aria-hidden="true">' + icon('search') + '</span>' +
            '<input type="search" placeholder="주문 또는 고객 검색…" value="' + esc(state.orderSearch) + '" data-order-search aria-label="주문 검색">' +
          '</label>' +
        '</div>' +
      '</div>' +
      '<div data-orders-host>' + ordersTable(filteredOrders()) + '</div>';
  }

  function openOrderModal(id) {
    var order = ECRU.orders().filter(function (o) { return o.id === id; })[0];
    if (!order) { toast('해당 주문을 찾을 수 없습니다.', 'alert'); return; }
    var items = order.items.map(function (item) {
      return '' +
        '<div class="order-detail__item">' +
          '<div><strong>' + esc(item.name) + '</strong><span>사이즈 ' + esc(item.size) + ' · 수량 ' + item.qty + '</span></div>' +
          '<div class="num">' + ECRU.money(item.price * item.qty) + '</div>' +
        '</div>';
    }).join('');
    var options = ['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(function (status) {
      return '<option value="' + status + '"' + (order.status === status ? ' selected' : '') + '>' + ko(status) + '</option>';
    }).join('');
    var html = '' +
      '<p class="eyebrow eyebrow--plain admin-modal__eyebrow">주문 상세</p>' +
      '<div class="order-detail__head">' +
        '<div>' +
          '<div class="order-detail__id">' + esc(order.id) + '</div>' +
          '<div class="order-detail__meta">' + esc(fullDate(order.date)) + ' · ' + esc(timeOf(order.date)) + '<br>' + esc(ko(order.channel)) + ' · ' + esc(ko(order.payment)) + '</div>' +
        '</div>' +
        pill(order.status) +
      '</div>' +
      '<div class="order-detail__meta" style="margin-top:16px">' +
        '<strong style="color:var(--ink)">' + esc(order.customer.name) + '</strong><br>' +
        '<a href="mailto:' + esc(order.customer.email) + '" style="text-decoration:underline">' + esc(order.customer.email) + '</a>' +
      '</div>' +
      '<div class="order-detail__items">' + items + '</div>' +
      '<div class="order-detail__totals">' +
        '<div><span>상품 금액</span><span>' + ECRU.money(order.subtotal) + '</span></div>' +
        '<div><span>배송비</span><span>' + (order.shipping ? ECRU.money(order.shipping) : '무료') + '</span></div>' +
        '<div><span>합계</span><span>' + ECRU.money(order.total) + '</span></div>' +
      '</div>' +
      '<div class="order-detail__status">' +
        '<label for="admin-order-status">상태 변경</label>' +
        '<select class="select" id="admin-order-status" data-order-status-select data-order-id="' + esc(order.id) + '">' + options + '</select>' +
      '</div>' +
      '<div class="admin-modal__actions">' +
        '<button class="btn btn--admin-ghost" type="button" data-admin-close>닫기</button>' +
        '<a class="btn" href="mailto:' + esc(order.customer.email) + '?subject=' + encodeURIComponent('To Lead 주문 ' + order.id) + '">' + icon('mail') + '고객에게 메일</a>' +
      '</div>';
    openModal(html);
  }

  /* Products ---------------------------------------------------------------- */
  function productStatus(product) {
    if (product.stock < 1) return { label: 'Sold out', mod: 'out' };
    if (product.stock <= 5) return { label: 'Low stock', mod: 'stock' };
    return { label: 'Live', mod: 'live' };
  }

  function productCounts() {
    var list = ECRU.products();
    return {
      all: list.length,
      women: list.filter(function (p) { return p.gender === 'women'; }).length,
      men: list.filter(function (p) { return p.gender === 'men'; }).length,
      accessories: list.filter(function (p) { return p.gender === 'accessories'; }).length,
      low: list.filter(function (p) { return p.stock > 0 && p.stock <= 5; }).length,
      out: list.filter(function (p) { return p.stock < 1; }).length
    };
  }

  function filteredProducts() {
    var list = ECRU.products().slice().sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    if (state.productFilter === 'low') list = list.filter(function (p) { return p.stock > 0 && p.stock <= 5; });
    else if (state.productFilter === 'out') list = list.filter(function (p) { return p.stock < 1; });
    else if (state.productFilter !== 'all') list = list.filter(function (p) { return p.gender === state.productFilter; });

    var query = state.productSearch.trim().toLowerCase();
    if (query) {
      list = list.filter(function (p) {
        return [p.name, p.sku, p.type, p.gender, p.badge || ''].join(' ').toLowerCase().indexOf(query) > -1;
      });
    }
    return list;
  }

  function productsTable(list) {
    if (!list.length) {
      return emptyState('조건에 맞는 상품이 없습니다', '필터나 검색어를 조정하거나 새 상품을 추가해 보세요.');
    }
    var rows = list.map(function (product) {
      var status = productStatus(product);
      return '' +
        '<tr>' +
          '<td><div class="product-cell"><div class="product-cell__media"><img src="' + esc(product.image) + '" alt="" loading="lazy"></div><div><strong>' + esc(product.name) + '</strong><span>' + esc(product.sku) + ' · ' + esc(product.type) + '</span></div></div></td>' +
          '<td>' + esc(genderLabel(product.gender)) + '</td>' +
          '<td class="num">' + ECRU.money(product.price) + '</td>' +
          '<td class="num">' + product.stock + '</td>' +
          '<td>' + pill(status.label, status.mod) + '</td>' +
          '<td>' + esc(shortDate(product.createdAt)) + '</td>' +
          '<td class="actions"><span class="actions-row">' +
            '<button class="icon-action" type="button" data-product-edit="' + esc(product.id) + '" aria-label="' + esc(product.name) + ' 수정">' + icon('edit') + '</button>' +
            '<button class="icon-action icon-action--danger" type="button" data-product-delete="' + esc(product.id) + '" aria-label="' + esc(product.name) + ' 삭제">' + icon('trash') + '</button>' +
          '</span></td>' +
        '</tr>';
    }).join('');
    return '' +
      '<div class="table-wrap"><table class="data-table">' +
        '<thead><tr><th>상품</th><th>카테고리</th><th class="num">가격</th><th class="num">재고</th><th>상태</th><th>등록일</th><th class="actions"></th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table></div>';
  }

  function refreshProductsHost() {
    var host = $('[data-products-host]');
    if (host) host.innerHTML = productsTable(filteredProducts());
  }

  function viewProducts() {
    var counts = productCounts();
    var filters = [
      { key: 'all', label: '전체', count: counts.all },
      { key: 'women', label: '여성', count: counts.women },
      { key: 'men', label: '남성', count: counts.men },
      { key: 'accessories', label: '액세서리', count: counts.accessories },
      { key: 'low', label: '재고 부족', count: counts.low },
      { key: 'out', label: '품절', count: counts.out }
    ];
    var tabs = filters.map(function (filter) {
      return '<button type="button" data-product-filter="' + filter.key + '" class="' + (state.productFilter === filter.key ? 'is-active' : '') + '">' +
        filter.label + ' <span class="tab-count">' + filter.count + '</span></button>';
    }).join('');

    return '' +
      head('카탈로그', '상품', '여성·남성·액세서리 전체 ' + counts.all + '개 상품을 관리합니다.',
        '<button class="btn" type="button" data-product-new>' + icon('plus') + '상품 추가</button>') +
      '<div class="admin-toolbar">' +
        '<div class="filter-tabs">' + tabs + '</div>' +
        '<div class="admin-toolbar__group">' +
          '<label class="admin-search"><span aria-hidden="true">' + icon('search') + '</span>' +
            '<input type="search" placeholder="상품명 또는 SKU 검색…" value="' + esc(state.productSearch) + '" data-product-search aria-label="상품 검색">' +
          '</label>' +
        '</div>' +
      '</div>' +
      '<div data-products-host>' + productsTable(filteredProducts()) + '</div>';
  }

  function openProductModal(id) {
    var product = id ? ECRU.getProduct(id) : null;
    if (id && !product) { toast('해당 상품을 찾을 수 없습니다.', 'alert'); return; }
    var images = IMAGES.slice();
    if (product && images.indexOf(product.image) === -1 && product.image.indexOf('data:') === 0) {
      /* 업로드된 이미지는 선택 목록에 넣지 않고 미리보기로만 보여줍니다. */
    } else if (product && images.indexOf(product.image) === -1) {
      images.unshift(product.image);
    }
    var currentImage = product ? product.image : images[0];
    var imageOptions = images.map(function (src) {
      return '<option value="' + esc(src) + '"' + (src === currentImage ? ' selected' : '') + '>' + esc(src.replace('assets/images/', '')) + '</option>';
    }).join('');
    var sizes = product ? product.sizes.join(', ') : 'XS, S, M, L';
    var colors = product ? product.colors.map(function (color) { return color.name + ':' + color.hex; }).join(', ') : '아이보리:#f1ece1, 세이지:#9aa48f';
    var details = product ? (product.details || []).join('\n') : '';
    var title = product ? '상품 수정' : '새 상품 추가';
    var submitLabel = product ? '변경 사항 저장' : '컬렉션에 추가';

    var html = '' +
      '<p class="eyebrow eyebrow--plain admin-modal__eyebrow">상품 편집</p>' +
      '<h2 class="admin-modal__title" id="admin-modal-title">' + title + '</h2>' +
      '<p class="admin-modal__text">변경 사항은 이 브라우저에 저장되고 스토어프런트에 즉시 반영됩니다.</p>' +
      '<form class="admin-form" data-product-form>' +
        '<input type="hidden" name="id" value="' + esc(product ? product.id : '') + '">' +
        '<div class="form-grid">' +
          '<div class="field field--full"><label for="pf-name">상품명</label><input class="input" id="pf-name" name="name" value="' + esc(product ? product.name : '') + '" placeholder="예: 아이리스 코튼 원피스" required data-autofocus></div>' +
          '<div class="field"><label for="pf-sku">SKU</label><input class="input" id="pf-sku" name="sku" value="' + esc(product ? product.sku : '') + '" placeholder="TL-W-109"></div>' +
          '<div class="field"><label for="pf-gender">카테고리</label><select class="select" id="pf-gender" name="gender">' +
            '<option value="women"' + (product && product.gender === 'women' ? ' selected' : '') + '>여성</option>' +
            '<option value="men"' + (product && product.gender === 'men' ? ' selected' : '') + '>남성</option>' +
            '<option value="accessories"' + (product && product.gender === 'accessories' ? ' selected' : '') + '>액세서리</option>' +
          '</select></div>' +
          '<div class="field"><label for="pf-type">타입</label><input class="input" id="pf-type" name="type" value="' + esc(product ? product.type : '') + '" placeholder="니트웨어"></div>' +
          '<div class="field"><label for="pf-price">가격 (원)</label><input class="input" id="pf-price" name="price" type="number" min="0" step="1000" value="' + esc(product ? product.price : '') + '" placeholder="189000" required></div>' +
          '<div class="field"><label for="pf-compare">정상가 (선택)</label><input class="input" id="pf-compare" name="compareAt" type="number" min="0" step="1000" value="' + esc(product && product.compareAt ? product.compareAt : '') + '" placeholder="—"></div>' +
          '<div class="field"><label for="pf-stock">재고 수량</label><input class="input" id="pf-stock" name="stock" type="number" min="0" step="1" value="' + esc(product ? product.stock : 12) + '"></div>' +
          '<div class="field"><label for="pf-badge">배지 (선택)</label><input class="input" id="pf-badge" name="badge" value="' + esc(product && product.badge ? product.badge : '') + '" placeholder="베스트셀러"></div>' +
          '<div class="field field--full"><label for="pf-sizes">사이즈 <span class="form-note" style="text-transform:none;letter-spacing:0">(쉼표로 구분)</span></label><input class="input" id="pf-sizes" name="sizes" value="' + esc(sizes) + '" placeholder="XS, S, M, L"></div>' +
          '<div class="field field--full"><label for="pf-colors">컬러 <span class="form-note" style="text-transform:none;letter-spacing:0">(이름:HEX, 쉼표로 구분)</span></label><input class="input" id="pf-colors" name="colors" value="' + esc(colors) + '" placeholder="아이보리:#f1ece1, 세이지:#9aa48f"></div>' +
          '<div class="field field--full"><label for="pf-image">이미지</label><div class="image-picker">' +
            '<select class="select" id="pf-image" name="image" data-image-select>' + imageOptions + '</select>' +
            '<div class="image-preview"><img src="' + esc(currentImage) + '" alt="" data-image-preview></div>' +
          '</div>' +
          '<label class="image-upload"><span>또는 새 이미지 업로드 (JPG · PNG, 자동 압축)</span><input type="file" accept="image/*" data-product-image-file></label>' +
          '<input type="hidden" name="imageData" value="">' +
          '</div>' +
          '<div class="field field--full"><label for="pf-description">설명</label><textarea class="textarea" id="pf-description" name="description" rows="3">' + esc(product ? product.description : '') + '</textarea></div>' +
          '<div class="field field--full"><label for="pf-details">상세 <span class="form-note" style="text-transform:none;letter-spacing:0">(한 줄에 하나씩)</span></label><textarea class="textarea" id="pf-details" name="details" rows="3">' + esc(details) + '</textarea></div>' +
          '<div class="field"><label for="pf-composition">소재</label><input class="input" id="pf-composition" name="composition" value="' + esc(product ? product.composition : '') + '"></div>' +
          '<div class="field"><label for="pf-fit">핏 안내</label><input class="input" id="pf-fit" name="fit" value="' + esc(product ? product.fit : '') + '"></div>' +
          '<div class="field field--full"><label class="check-row"><input type="checkbox" name="isNew" value="1"' + (product && product.isNew ? ' checked' : '') + '> 신상품으로 표시</label></div>' +
        '</div>' +
        '<div class="admin-modal__actions">' +
          '<button class="btn btn--admin-ghost" type="button" data-admin-close>취소</button>' +
          '<button class="btn" type="submit">' + submitLabel + '</button>' +
        '</div>' +
      '</form>';
    openModal(html);
  }

  function openDeleteProductModal(id) {
    var product = ECRU.getProduct(id);
    if (!product) return;
    openModal('' +
      '<p class="eyebrow eyebrow--plain admin-modal__eyebrow">상품 삭제</p>' +
      '<h2 class="admin-modal__title" id="admin-modal-title">이 상품을 삭제할까요?</h2>' +
      '<p class="admin-modal__text"><strong style="color:var(--ink)">' + esc(product.name) + '</strong> 상품이 컬렉션, 쇼핑백, 위시리스트에서 제거됩니다. 이 작업은 되돌릴 수 없습니다.</p>' +
      '<div class="admin-modal__actions">' +
        '<button class="btn btn--admin-ghost" type="button" data-admin-close>유지하기</button>' +
        '<button class="btn" type="button" data-confirm-product-delete="' + esc(product.id) + '">' + icon('trash') + '상품 삭제</button>' +
      '</div>');
  }

  /* Customers --------------------------------------------------------------- */
  function customersWithStats() {
    var buckets = {};
    ECRU.orders().forEach(function (order) {
      if (order.status === 'Cancelled') return;
      var key = order.customer.email.toLowerCase();
      if (!buckets[key]) buckets[key] = { orders: 0, spent: 0, last: null };
      var bucket = buckets[key];
      bucket.orders += 1;
      bucket.spent += order.total;
      if (!bucket.last || new Date(order.date) > new Date(bucket.last)) bucket.last = order.date;
    });
    return ECRU.customers().map(function (customer) {
      var bucket = buckets[customer.email.toLowerCase()] || { orders: 0, spent: 0, last: null };
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        joined: customer.joined,
        segment: customer.segment,
        orders: bucket.orders,
        spent: bucket.spent,
        last: bucket.last
      };
    }).sort(function (a, b) { return b.spent - a.spent; });
  }

  function filteredCustomers() {
    var query = state.customerSearch.trim().toLowerCase();
    return customersWithStats().filter(function (customer) {
      if (!query) return true;
      return [customer.name, customer.email, customer.segment].join(' ').toLowerCase().indexOf(query) > -1;
    });
  }

  function customersTable(list) {
    if (!list.length) {
      return emptyState('조건에 맞는 고객이 없습니다', '다른 이름이나 이메일 주소로 검색해 보세요.');
    }
    var rows = list.map(function (customer) {
      return '' +
        '<tr>' +
          '<td><div class="customer-cell"><span class="customer-avatar">' + esc(initials(customer.name)) + '</span><div><strong>' + esc(customer.name) + '</strong><span>' + esc(customer.email) + '</span></div></div></td>' +
          '<td>' + esc(fullDate(customer.joined)) + '</td>' +
          '<td class="num">' + customer.orders + '</td>' +
          '<td class="num">' + ECRU.money(customer.spent) + '</td>' +
          '<td>' + pill(customer.segment) + '</td>' +
          '<td>' + (customer.last ? esc(shortDate(customer.last)) : '—') + '</td>' +
          '<td class="actions"><button class="icon-action" type="button" data-customer-view="' + esc(customer.email) + '" aria-label="' + esc(customer.name) + ' 보기">' + icon('eye') + '</button></td>' +
        '</tr>';
    }).join('');
    return '' +
      '<div class="table-wrap"><table class="data-table">' +
        '<thead><tr><th>고객</th><th>가입일</th><th class="num">주문</th><th class="num">누적 구매</th><th>등급</th><th>최근 주문</th><th class="actions"></th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table></div>';
  }

  function refreshCustomersHost() {
    var host = $('[data-customers-host]');
    if (host) host.innerHTML = customersTable(filteredCustomers());
  }

  function viewCustomers() {
    var list = customersWithStats();
    var vip = list.filter(function (c) { return c.segment === 'VIP'; }).length;
    return '' +
      head('고객 관리', '고객', '총 ' + list.length + '명 · VIP ' + vip + '명 · 전체 주문 기준 누적 구매액입니다.',
        '<button class="btn btn--admin-ghost" type="button" data-export-customers>' + icon('download') + 'CSV 내려받기</button>') +
      '<div class="admin-toolbar">' +
        '<div class="panel__sub">뉴스레터 구독자 ' + ECRU.state().subscribers.length + '명</div>' +
        '<div class="admin-toolbar__group">' +
          '<label class="admin-search"><span aria-hidden="true">' + icon('search') + '</span>' +
            '<input type="search" placeholder="고객 검색…" value="' + esc(state.customerSearch) + '" data-customer-search aria-label="고객 검색">' +
          '</label>' +
        '</div>' +
      '</div>' +
      '<div data-customers-host>' + customersTable(filteredCustomers()) + '</div>';
  }

  function openCustomerModal(email) {
    var customer = customersWithStats().filter(function (c) { return c.email.toLowerCase() === String(email).toLowerCase(); })[0];
    if (!customer) { toast('해당 고객을 찾을 수 없습니다.', 'alert'); return; }
    var orders = ECRU.orders().filter(function (order) {
      return order.customer.email.toLowerCase() === customer.email.toLowerCase();
    }).slice(0, 5);
    var orderRows = orders.map(function (order) {
      return '' +
        '<div class="order-detail__item">' +
          '<div><strong>' + esc(order.id) + '</strong><span>' + esc(fullDate(order.date)) + ' · ' + esc(ko(order.status)) + '</span></div>' +
          '<div style="display:flex;align-items:center;gap:12px">' + ECRU.money(order.total) +
            '<button class="icon-action" type="button" data-order-view="' + esc(order.id) + '" aria-label="주문 ' + esc(order.id) + ' 보기">' + icon('eye') + '</button>' +
          '</div>' +
        '</div>';
    }).join('');
    openModal('' +
      '<p class="eyebrow eyebrow--plain admin-modal__eyebrow">고객 프로필</p>' +
      '<div class="order-detail__head">' +
        '<div><div class="order-detail__id">' + esc(customer.name) + '</div><div class="order-detail__meta">' + esc(customer.email) + '<br>가입 ' + esc(fullDate(customer.joined)) + ' · ' + esc(ko(customer.segment)) + '</div></div>' +
        '<span class="customer-avatar" style="width:52px;height:52px;font-size:12px">' + esc(initials(customer.name)) + '</span>' +
      '</div>' +
      '<div style="margin-top:16px">' +
        '<div class="settings-row"><span>누적 구매액</span><strong>' + ECRU.money(customer.spent) + '</strong></div>' +
        '<div class="settings-row"><span>주문 수</span><strong>' + customer.orders + '</strong></div>' +
        '<div class="settings-row"><span>평균 주문 금액</span><strong>' + ECRU.money(customer.orders ? customer.spent / customer.orders : 0) + '</strong></div>' +
        '<div class="settings-row"><span>최근 주문</span><strong>' + (customer.last ? esc(fullDate(customer.last)) : '주문 없음') + '</strong></div>' +
      '</div>' +
      '<h3 style="margin:24px 0 2px;font-family:var(--serif);font-size:20px;font-weight:400">최근 주문</h3>' +
      '<div class="order-detail__items">' + (orderRows || '<p class="panel__sub" style="padding:12px 0">아직 주문 내역이 없습니다.</p>') + '</div>' +
      '<div class="admin-modal__actions">' +
        '<button class="btn btn--admin-ghost" type="button" data-admin-close>닫기</button>' +
        '<a class="btn" href="mailto:' + esc(customer.email) + '">' + icon('mail') + '고객에게 메일</a>' +
      '</div>');
  }

  function downloadCustomers() {
    var rows = [['이름', '이메일', '가입일', '등급', '주문 수', '누적 구매액', '최근 주문']];
    customersWithStats().forEach(function (customer) {
      rows.push([customer.name, customer.email, fullDate(customer.joined), ko(customer.segment), customer.orders, customer.spent, customer.last ? fullDate(customer.last) : '']);
    });
    downloadFile('tolead-customers-' + new Date().toISOString().slice(0, 10) + '.csv', rows.map(function (row) {
      return row.map(csvCell).join(',');
    }).join('\r\n'), 'text/csv;charset=utf-8');
    toast('고객 목록을 CSV로 내려받았습니다.');
  }

  /* Content ----------------------------------------------------------------- */
  var CONTENT_SCHEMA = [
    {
      title: '브랜드 & SEO',
      desc: '사이트 이름, 로고 이미지, 검색 결과에 노출되는 문구입니다.',
      fields: [
        { key: 'siteName', label: '사이트 이름' },
        { key: 'siteNameEn', label: '영문 표기' },
        { key: 'brandTagline', label: '브랜드 한 줄 소개' },
        { key: 'seoTitle', label: '브라우저 제목 (SEO)' },
        { key: 'seoDescription', label: '검색 설명 (SEO)', type: 'textarea', rows: 2 },
        { key: 'logoImage', label: '로고 이미지 (밝은 배경)', type: 'image', hint: '권장: 가로형 PNG/SVG, 높이 80px 이상' },
        { key: 'logoLightImage', label: '로고 이미지 (어두운 배경)', type: 'image', hint: '푸터·에디토리얼용 밝은 색 로고' },
        { key: 'logoMark', label: '파비콘 마크', type: 'image', hint: '정사각형 PNG 또는 SVG' }
      ]
    },
    {
      title: '공지 바',
      desc: '헤더 위 얇은 띠에 표시되는 문구입니다.',
      fields: [
        { key: 'announcement', label: '가운데 문구' },
        { key: 'announcementSide', label: '왼쪽 문구' },
        { key: 'announcementRight', label: '오른쪽 문구' }
      ]
    },
    {
      title: '내비게이션',
      desc: '헤더와 모바일 메뉴의 링크 이름입니다.',
      fields: [
        { key: 'navNew', label: '신상품' },
        { key: 'navWomen', label: '여성' },
        { key: 'navMen', label: '남성' },
        { key: 'navAccessories', label: '액세서리' },
        { key: 'navJournal', label: '저널' },
        { key: 'navStory', label: '브랜드 스토리' },
        { key: 'mobileNavNote', label: '모바일 메뉴 하단 문구' }
      ]
    },
    {
      title: '홈 — 히어로',
      desc: '첫 화면의 이미지, 문구와 연결 상품입니다.',
      fields: [
        { key: 'heroEyebrow', label: '상단 작은 문구' },
        { key: 'heroTitle', label: '헤드라인' },
        { key: 'heroItalic', label: '이탤릭 한 줄' },
        { key: 'heroLede', label: '소개 문구', type: 'textarea', rows: 3 },
        { key: 'heroCta', label: '버튼 문구' },
        { key: 'heroSecondary', label: '보조 링크 문구' },
        { key: 'heroProductId', label: '캡션 연결 상품', type: 'product' },
        { key: 'heroCaptionLabel', label: '캡션 라벨' },
        { key: 'heroCaptionPrice', label: '캡션 가격 문구' },
        { key: 'heroImage', label: '히어로 이미지', type: 'image' },
        { key: 'heroImageAlt', label: '히어로 이미지 대체 텍스트' },
        { key: 'heroScroll', label: '스크롤 안내 문구' }
      ]
    },
    {
      title: '홈 — 프레스',
      desc: '소개된 매체 로고 줄입니다.',
      fields: [
        { key: 'pressLabel', label: '라벨' },
        { key: 'press1', label: '매체 1' },
        { key: 'press2', label: '매체 2' },
        { key: 'press3', label: '매체 3' },
        { key: 'press4', label: '매체 4' },
        { key: 'press5', label: '매체 5' }
      ]
    },
    {
      title: '홈 — 카테고리',
      desc: '여성·남성·액세서리 카드의 제목, 설명, 이미지입니다.',
      fields: [
        { key: 'categoriesEyebrow', label: '섹션 라벨' },
        { key: 'categoriesTitle', label: '섹션 제목' },
        { key: 'categoriesNote', label: '섹션 설명' },
        { key: 'categoriesCta', label: '전체 상품 링크 문구' },
        { key: 'catWomenTitle', label: '여성 카드 제목' },
        { key: 'catWomenMeta', label: '여성 카드 설명' },
        { key: 'catWomenImage', label: '여성 카드 이미지', type: 'image' },
        { key: 'catWomenAlt', label: '여성 이미지 대체 텍스트' },
        { key: 'catMenTitle', label: '남성 카드 제목' },
        { key: 'catMenMeta', label: '남성 카드 설명' },
        { key: 'catMenImage', label: '남성 카드 이미지', type: 'image' },
        { key: 'catMenAlt', label: '남성 이미지 대체 텍스트' },
        { key: 'catAccTitle', label: '액세서리 카드 제목' },
        { key: 'catAccMeta', label: '액세서리 카드 설명' },
        { key: 'catAccImage', label: '액세서리 카드 이미지', type: 'image' },
        { key: 'catAccAlt', label: '액세서리 이미지 대체 텍스트' }
      ]
    },
    {
      title: '홈 — 신상품',
      desc: '신상품 섹션의 제목과 버튼입니다.',
      fields: [
        { key: 'newEyebrow', label: '섹션 라벨' },
        { key: 'newTitle', label: '섹션 제목' },
        { key: 'newCta', label: '전체 보기 버튼' }
      ]
    },
    {
      title: '홈 — 에디토리얼',
      desc: '홈 중간의 큰 이미지 밴드입니다.',
      fields: [
        { key: 'editorialEyebrow', label: '라벨' },
        { key: 'editorialTitle', label: '제목' },
        { key: 'editorialItalic', label: '이탤릭 한 줄' },
        { key: 'editorialLede', label: '설명 문구', type: 'textarea', rows: 2 },
        { key: 'editorialCta', label: '버튼 문구' },
        { key: 'editorialImage', label: '배경 이미지', type: 'image' },
        { key: 'editorialAlt', label: '이미지 대체 텍스트' },
        { key: 'editorialIndex', label: '인덱스 문구' }
      ]
    },
    {
      title: '홈 — 스토리',
      desc: '브랜드 스토리 섹션과 숫자 지표입니다.',
      fields: [
        { key: 'storyEyebrow', label: '라벨' },
        { key: 'storyTitle', label: '제목' },
        { key: 'storyItalic', label: '이탤릭 한 줄' },
        { key: 'storyP1', label: '본문 1', type: 'textarea', rows: 3 },
        { key: 'storyP2', label: '본문 2', type: 'textarea', rows: 2 },
        { key: 'storySignature', label: '서명' },
        { key: 'storyImage', label: '스토리 이미지', type: 'image' },
        { key: 'storyAlt', label: '이미지 대체 텍스트' },
        { key: 'storyStamp', label: '스탬프 문구 (줄바꿈 가능)', type: 'textarea', rows: 2 },
        { key: 'storyStat1Value', label: '지표 1 숫자' },
        { key: 'storyStat1Label', label: '지표 1 라벨' },
        { key: 'storyStat2Value', label: '지표 2 숫자' },
        { key: 'storyStat2Label', label: '지표 2 라벨' },
        { key: 'storyStat3Value', label: '지표 3 숫자' },
        { key: 'storyStat3Label', label: '지표 3 라벨' }
      ]
    },
    {
      title: '홈 — 가치',
      desc: '네 가지 약속 카드입니다.',
      fields: [
        { key: 'value1Title', label: '가치 1 제목' },
        { key: 'value1Text', label: '가치 1 설명', type: 'textarea', rows: 2 },
        { key: 'value2Title', label: '가치 2 제목' },
        { key: 'value2Text', label: '가치 2 설명', type: 'textarea', rows: 2 },
        { key: 'value3Title', label: '가치 3 제목' },
        { key: 'value3Text', label: '가치 3 설명', type: 'textarea', rows: 2 },
        { key: 'value4Title', label: '가치 4 제목' },
        { key: 'value4Text', label: '가치 4 설명', type: 'textarea', rows: 2 }
      ]
    },
    {
      title: '홈 — 뉴스레터',
      desc: '구독 섹션의 모든 문구입니다.',
      fields: [
        { key: 'newsletterEyebrow', label: '라벨' },
        { key: 'newsletterTitle', label: '제목' },
        { key: 'newsletterItalic', label: '이탤릭 한 줄' },
        { key: 'newsletterCopy', label: '설명', type: 'textarea', rows: 2 },
        { key: 'newsletterButton', label: '버튼 문구' },
        { key: 'newsletterNote', label: '약관 안내', type: 'textarea', rows: 2 },
        { key: 'newsletterSuccessTitle', label: '성공 제목' },
        { key: 'newsletterSuccessText', label: '성공 설명', type: 'textarea', rows: 2 }
      ]
    },
    {
      title: '푸터',
      desc: '사이트 하단의 링크, 연락처와 저작권입니다.',
      fields: [
        { key: 'footerBlurb', label: '브랜드 소개', type: 'textarea', rows: 2 },
        { key: 'socialInstagram', label: '인스타그램 링크 이름' },
        { key: 'socialPinterest', label: '핀터레스트 링크 이름' },
        { key: 'socialTikTok', label: '틱톡 링크 이름' },
        { key: 'footerShopTitle', label: '쇼핑 컬럼 제목' },
        { key: 'footerCareTitle', label: '고객 지원 컬럼 제목' },
        { key: 'footerStudioTitle', label: '스튜디오 컬럼 제목' },
        { key: 'footerContactTitle', label: '문의 컬럼 제목' },
        { key: 'footerShippingLabel', label: '배송 및 반품 링크' },
        { key: 'footerSizeLabel', label: '사이즈 가이드 링크' },
        { key: 'footerCareLabel', label: '관리 가이드 링크' },
        { key: 'footerFaqLabel', label: '자주 묻는 질문 링크' },
        { key: 'footerStoryLabel', label: '브랜드 스토리 링크' },
        { key: 'footerJournalLabel', label: '저널 링크' },
        { key: 'footerStockistsLabel', label: '판매처 링크' },
        { key: 'footerCareersLabel', label: '채용 링크' },
        { key: 'footerPrivacyLabel', label: '개인정보 처리방침 링크' },
        { key: 'footerTermsLabel', label: '이용약관 링크' },
        { key: 'footerAccessibilityLabel', label: '접근성 링크' },
        { key: 'supportEmail', label: '고객센터 이메일' },
        { key: 'supportPhone', label: '고객센터 전화' },
        { key: 'contactAddress', label: '주소 (줄바꿈 가능)', type: 'textarea', rows: 2 },
        { key: 'copyright', label: '저작권 문구 ({year} 사용 가능)' }
      ]
    },
    {
      title: '컬렉션 페이지',
      desc: '상품 목록 상단의 제목과 빈 상태 문구입니다.',
      fields: [
        { key: 'shopAllEyebrow', label: '전체 라벨' },
        { key: 'shopAllTitle', label: '전체 제목' },
        { key: 'shopAllItalic', label: '전체 이탤릭' },
        { key: 'shopAllDesc', label: '전체 설명', type: 'textarea', rows: 2 },
        { key: 'shopNewEyebrow', label: '신상품 라벨' },
        { key: 'shopNewTitle', label: '신상품 제목' },
        { key: 'shopNewItalic', label: '신상품 이탤릭' },
        { key: 'shopNewDesc', label: '신상품 설명', type: 'textarea', rows: 2 },
        { key: 'shopWomenEyebrow', label: '여성 라벨' },
        { key: 'shopWomenTitle', label: '여성 제목' },
        { key: 'shopWomenItalic', label: '여성 이탤릭' },
        { key: 'shopWomenDesc', label: '여성 설명', type: 'textarea', rows: 2 },
        { key: 'shopMenEyebrow', label: '남성 라벨' },
        { key: 'shopMenTitle', label: '남성 제목' },
        { key: 'shopMenItalic', label: '남성 이탤릭' },
        { key: 'shopMenDesc', label: '남성 설명', type: 'textarea', rows: 2 },
        { key: 'shopAccEyebrow', label: '액세서리 라벨' },
        { key: 'shopAccTitle', label: '액세서리 제목' },
        { key: 'shopAccItalic', label: '액세서리 이탤릭' },
        { key: 'shopAccDesc', label: '액세서리 설명', type: 'textarea', rows: 2 },
        { key: 'shopSaleEyebrow', label: '아카이브 라벨' },
        { key: 'shopSaleTitle', label: '아카이브 제목' },
        { key: 'shopSaleItalic', label: '아카이브 이탤릭' },
        { key: 'shopSaleDesc', label: '아카이브 설명', type: 'textarea', rows: 2 },
        { key: 'shopNoteEyebrow', label: '하단 노트 라벨' },
        { key: 'shopNoteText', label: '하단 노트 내용', type: 'textarea', rows: 2 },
        { key: 'shopNoteCta', label: '하단 노트 버튼' },
        { key: 'shopEmptyEyebrow', label: '빈 상태 라벨' },
        { key: 'shopEmptyTitle', label: '빈 상태 제목' },
        { key: 'shopEmptyText', label: '빈 상태 설명', type: 'textarea', rows: 2 },
        { key: 'shopEmptyCta', label: '빈 상태 버튼' }
      ]
    },
    {
      title: '상품 페이지',
      desc: '상품 상세의 라벨, 배송 안내, 리뷰와 관련 상품 문구입니다. {freeShipping} · {shippingFee} · {email} 같은 치환자를 쓸 수 있습니다.',
      fields: [
        { key: 'pdpBreadcrumbHome', label: '브레드크럼 홈' },
        { key: 'pdpBreadcrumbCollection', label: '브레드크럼 컬렉션' },
        { key: 'pdpGalleryLabel', label: '갤러리 라벨' },
        { key: 'pdpGalleryFull', label: '갤러리 전체 탭' },
        { key: 'pdpGalleryDetail', label: '갤러리 디테일 탭' },
        { key: 'pdpGalleryTexture', label: '갤러리 질감 탭' },
        { key: 'pdpGalleryNote', label: '갤러리 하단 문구' },
        { key: 'pdpColourLabel', label: '컬러 라벨' },
        { key: 'pdpSizeLabel', label: '사이즈 라벨' },
        { key: 'pdpSizeGuideLink', label: '사이즈 가이드 링크' },
        { key: 'pdpAddToBag', label: '쇼핑백 담기 버튼' },
        { key: 'pdpSoldOut', label: '품절 표시' },
        { key: 'pdpSelectSize', label: '사이즈 선택 안내 버튼' },
        { key: 'pdpStockOut', label: '품절 안내' },
        { key: 'pdpStockSelect', label: '사이즈 미선택 안내' },
        { key: 'pdpStockLow', label: '재고 부족 안내 ({count})' },
        { key: 'pdpStockIn', label: '재고 있음 안내' },
        { key: 'pdpReviewsLink', label: '리뷰 링크 ({count})' },
        { key: 'pdpSave', label: '할인율 ({percent})' },
        { key: 'pdpSaveToWishlist', label: '위시리스트 버튼' },
        { key: 'pdpNotFoundTitle', label: '상품 없음 제목' },
        { key: 'pdpNotFoundText', label: '상품 없음 설명', type: 'textarea', rows: 2 },
        { key: 'pdpNotFoundCta', label: '상품 없음 버튼' },
        { key: 'pdpAssurance1', label: '보증 문구 1' },
        { key: 'pdpAssurance2', label: '보증 문구 2' },
        { key: 'pdpAssurance3', label: '보증 문구 3' },
        { key: 'pdpDetailsTitle', label: '상세 아코디언 제목' },
        { key: 'pdpCareTitle', label: '소재 아코디언 제목' },
        { key: 'pdpDeliveryTitle', label: '배송 아코디언 제목' },
        { key: 'pdpDeliveryText', label: '배송 안내', type: 'textarea', rows: 3 },
        { key: 'pdpDemoNote', label: '데모 안내', type: 'textarea', rows: 2 },
        { key: 'pdpSizeNote', label: '사이즈 안내', type: 'textarea', rows: 2 },
        { key: 'reviewsEyebrow', label: '리뷰 라벨' },
        { key: 'reviewsTitle', label: '리뷰 제목' },
        { key: 'reviewsWrite', label: '리뷰 작성 버튼' },
        { key: 'reviewsBasedOn', label: '리뷰 수 문구 ({count})' },
        { key: 'reviewVerified', label: '구매 인증 라벨' },
        { key: 'reviewCommunity', label: '커뮤니티 리뷰 라벨' },
        { key: 'reviewFormTitle', label: '리뷰 폼 제목' },
        { key: 'reviewNameLabel', label: '이름 라벨' },
        { key: 'reviewRatingLabel', label: '평점 라벨' },
        { key: 'reviewTitleLabel', label: '제목 라벨' },
        { key: 'reviewTextLabel', label: '내용 라벨' },
        { key: 'reviewNamePlaceholder', label: '이름 플레이스홀더' },
        { key: 'reviewTitlePlaceholder', label: '제목 플레이스홀더' },
        { key: 'reviewTextPlaceholder', label: '내용 플레이스홀더' },
        { key: 'reviewRating5', label: '평점 5' },
        { key: 'reviewRating4', label: '평점 4' },
        { key: 'reviewRating3', label: '평점 3' },
        { key: 'reviewRating2', label: '평점 2' },
        { key: 'reviewRating1', label: '평점 1' },
        { key: 'reviewSubmit', label: '리뷰 등록 버튼' },
        { key: 'reviewNote', label: '리뷰 안내', type: 'textarea', rows: 2 },
        { key: 'reviewThanks', label: '리뷰 감사 문구' },
        { key: 'relatedEyebrow', label: '관련 상품 라벨' },
        { key: 'relatedTitle', label: '관련 상품 제목' },
        { key: 'relatedCta', label: '관련 상품 버튼' }
      ]
    },
    {
      title: '커머스',
      desc: '배송 기준과 표시 통화입니다.',
      fields: [
        { key: 'freeShipping', label: '무료 배송 기준 (원)', type: 'number' },
        { key: 'shippingFee', label: '기본 배송비 (원)', type: 'number' },
        { key: 'currencyLabel', label: '통화 표기' }
      ]
    }
  ];

  function contentFieldHTML(field, settings) {
    var value = settings[field.key] == null ? '' : settings[field.key];
    var id = 'cf-' + field.key;
    var label = '<label for="' + id + '">' + esc(field.label) + (field.hint ? ' <span class="form-note" style="text-transform:none;letter-spacing:0">' + esc(field.hint) + '</span>' : '') + '</label>';

    if (field.type === 'image') {
      return '<div class="field field--full content-image-field">' + label +
        '<div class="image-picker">' +
          '<div class="image-preview"><img src="' + esc(value || 'assets/images/story.jpg') + '" alt="" data-content-preview="' + field.key + '"></div>' +
          '<div class="image-picker__side">' +
            '<input class="input" id="' + id + '" name="' + field.key + '" value="' + esc(value) + '" placeholder="assets/images/파일명.jpg 또는 업로드" data-content-image-input="' + field.key + '">' +
            '<label class="image-upload"><span>이미지 업로드</span><input type="file" accept="image/*" data-content-image-file="' + field.key + '"></label>' +
            '<button class="link-underline image-clear" type="button" data-content-image-clear="' + field.key + '">이미지 비우기</button>' +
          '</div>' +
        '</div></div>';
    }

    if (field.type === 'product') {
      var options = ECRU.products().map(function (product) {
        return '<option value="' + esc(product.id) + '"' + (product.id === value ? ' selected' : '') + '>' + esc(product.name) + '</option>';
      }).join('');
      return '<div class="field">' + label + '<select class="select" id="' + id + '" name="' + field.key + '">' + options + '</select></div>';
    }

    if (field.type === 'textarea') {
      return '<div class="field field--full">' + label + '<textarea class="textarea" id="' + id + '" name="' + field.key + '" rows="' + (field.rows || 3) + '">' + esc(value) + '</textarea></div>';
    }

    if (field.type === 'number') {
      return '<div class="field">' + label + '<input class="input" id="' + id + '" name="' + field.key + '" type="number" min="0" step="1000" value="' + esc(value) + '"></div>';
    }

    return '<div class="field">' + label + '<input class="input" id="' + id + '" name="' + field.key + '" value="' + esc(value) + '"></div>';
  }

  function viewContent() {
    var settings = ECRU.getSettings();
    var groups = CONTENT_SCHEMA.map(function (group, index) {
      var body = group.fields.map(function (field) { return contentFieldHTML(field, settings); }).join('');
      return '' +
        '<details class="content-form__section" open>' +
          '<summary><span><strong>' + esc(group.title) + '</strong><span class="content-form__desc">' + esc(group.desc) + '</span></span><span class="content-form__count">' + group.fields.length + '개 항목</span></summary>' +
          '<div class="content-form__fields">' + body + '</div>' +
        '</details>';
    }).join('');

    return '' +
      head('스토어프런트', '콘텐츠 편집', '사이트에 보이는 모든 문구와 이미지를 여기에서 수정합니다. 저장하면 즉시 반영됩니다.',
        '<a class="btn btn--admin-ghost" href="index.html" target="_blank" rel="noopener">사이트 미리보기 ' + icon('arrowUpRight') + '</a>') +
      '<div class="content-layout">' +
        '<form class="content-form" data-content-form>' +
          groups +
          '<div class="content-form__actions">' +
            '<button class="btn btn--admin-ghost" type="button" data-content-reset>' + icon('refresh') + '기본값으로 되돌리기</button>' +
            '<button class="btn" type="submit">' + icon('check') + '변경 사항 저장</button>' +
          '</div>' +
        '</form>' +
        '<aside class="content-preview">' +
          '<div class="preview-frame">' +
            '<span class="wordmark preview-wordmark">' + esc(settings.siteName) + '</span>' +
            '<p class="preview-eyebrow" data-preview-heroEyebrow>' + esc(settings.heroEyebrow) + '</p>' +
            '<h3 class="preview-title"><span data-preview-heroTitle>' + esc(settings.heroTitle) + '</span> <em data-preview-heroItalic>' + esc(settings.heroItalic) + '</em></h3>' +
            '<p class="preview-lede" data-preview-heroLede>' + esc(settings.heroLede) + '</p>' +
            '<span class="preview-btn" data-preview-heroCta>' + esc(settings.heroCta) + '</span>' +
            '<img class="preview-image" src="' + esc(settings.heroImage) + '" alt="" data-preview-heroImage>' +
            '<p class="preview-note">실시간 미리보기 · 히어로 영역</p>' +
          '</div>' +
          '<p class="preview-note" style="margin-top:10px">입력하는 동안 미리보기가 갱신됩니다. 저장 전까지는 사이트에 반영되지 않습니다.</p>' +
        '</aside>' +
      '</div>';
  }

  function compressImage(file, maxSize, quality) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('파일을 읽을 수 없습니다.')); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error('이미지를 해석할 수 없습니다.')); };
        img.onload = function () {
          var scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          /* PNG/SVG 로고는 투명 배경을 유지하고, 사진은 JPEG로 압축합니다. */
          var isTransparent = /png|svg/i.test(file.type);
          resolve(canvas.toDataURL(isTransparent ? 'image/png' : 'image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function bindContentForm() {
    var form = $('[data-content-form]');
    if (!form) return;

    form.addEventListener('input', function (event) {
      var name = event.target.name;
      if (!name) return;
      var preview = $('[data-preview-' + name + ']');
      if (preview) {
        if (preview.tagName === 'IMG') preview.src = event.target.value;
        else preview.textContent = event.target.value || ' ';
      }
      if (event.target.matches('[data-content-image-input]')) {
        var image = $('[data-content-preview="' + event.target.getAttribute('data-content-image-input') + '"]');
        if (image) image.src = event.target.value || 'assets/images/story.jpg';
      }
    });

    form.addEventListener('change', function (event) {
      var fileInput = event.target.closest('[data-content-image-file]');
      if (!fileInput) return;
      var key = fileInput.getAttribute('data-content-image-file');
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      toast('이미지를 압축하는 중입니다…', 'info');
      compressImage(file, 1400, 0.82).then(function (dataUrl) {
        var textInput = form.querySelector('[data-content-image-input="' + key + '"]');
        var preview = form.querySelector('[data-content-preview="' + key + '"]');
        if (textInput) textInput.value = dataUrl;
        if (preview) preview.src = dataUrl;
        toast('이미지가 준비되었습니다. 저장을 눌러 반영하세요.');
      }).catch(function (err) {
        toast(err.message || '이미지를 불러오지 못했습니다.', 'alert');
      });
    });
  }

  function handleContentReset() {
    ECRU.resetSettings();
    toast('스토어프런트 콘텐츠를 기본값으로 되돌렸습니다.');
    renderTab();
  }

  /* Settings ---------------------------------------------------------------- */
  function viewSettings() {
    var settings = ECRU.getSettings();
    var products = ECRU.products();
    var orders = ECRU.orders();
    var customers = ECRU.customers();
    var reviewCount = Object.keys(ECRU.state().reviews || {}).reduce(function (sum, key) {
      return sum + ECRU.state().reviews[key].length;
    }, 0);

    return '' +
      head('스튜디오', '설정', '스토어 정보, 데모 데이터, 그리고 정식 오픈 전 연결해야 할 서비스입니다.', '') +
      '<div class="settings-grid">' +
        '<section class="panel settings-card">' +
          '<div><h2>스토어 정보</h2><p>스토어프런트와 이메일에 표시되는 기본 정보입니다.</p></div>' +
          '<div>' +
            '<div class="settings-row"><span>스토어 이름</span><strong>' + esc(settings.siteName) + '</strong></div>' +
            '<div class="settings-row"><span>고객센터 이메일</span><strong>' + esc(settings.supportEmail) + '</strong></div>' +
            '<div class="settings-row"><span>무료 배송 기준</span><strong>' + ECRU.money(settings.freeShipping) + '</strong></div>' +
            '<div class="settings-row"><span>통화</span><strong>KRW ₩</strong></div>' +
            '<div class="settings-row"><span>판매 채널</span><strong>온라인 · 부티크</strong></div>' +
          '</div>' +
          '<a class="btn btn--admin-ghost" href="index.html" target="_blank" rel="noopener" style="justify-self:start">스토어프런트 보기 ' + icon('arrowUpRight') + '</a>' +
        '</section>' +
        '<section class="panel settings-card">' +
          '<div><h2>정식 오픈 준비</h2><p>현재는 프런트엔드만 구현되어 있습니다. 아래 서비스 연결이 필요합니다.</p></div>' +
          '<ul class="integration-list">' +
            '<li>' + icon('check') + '<span><strong style="color:var(--ink)">결제 및 세금</strong> — 토스페이먼츠·포트원·Stripe, 간편결제, 부가세 계산.</span></li>' +
            '<li>' + icon('check') + '<span><strong style="color:var(--ink)">회원 계정</strong> — 실제 인증, 배송지 저장, 주문 내역.</span></li>' +
            '<li>' + icon('check') + '<span><strong style="color:var(--ink)">재고</strong> — 사이즈별 재고, 물류 연동, 재고 부족 알림.</span></li>' +
            '<li>' + icon('check') + '<span><strong style="color:var(--ink)">이메일</strong> — 영수증, 배송 알림, 장바구니 리마인드, 뉴스레터.</span></li>' +
            '<li>' + icon('check') + '<span><strong style="color:var(--ink)">이미지</strong> — CDN과 반응형 포맷으로 이전.</span></li>' +
            '<li>' + icon('check') + '<span><strong style="color:var(--ink)">분석</strong> — GA4 또는 Plausible, 메타 픽셀, 동의 관리.</span></li>' +
          '</ul>' +
        '</section>' +
        '<section class="panel settings-card settings-card--wide">' +
          '<div><h2>데모 데이터</h2><p>' + (ECRU.backendStatus().enabled
            ? (ECRU.backendStatus().error
              ? 'Supabase에 연결하지 못해 로컬 캐시로 동작 중입니다. 새로고침하거나 config.js와 네트워크를 확인하세요.'
              : '스토어 데이터는 Supabase Postgres에 저장되며, 이 브라우저는 오프라인 캐시로 함께 사용됩니다.')
            : '스토어 데이터는 <code>localStorage</code>의 <code>tolead.store.v1</code>에 저장됩니다. Supabase를 연결하면 모든 변경이 데이터베이스에 기록됩니다.') + '</p></div>' +
          '<div class="form-grid">' +
            '<div class="settings-row"><span>데이터 저장소</span><strong>' + (ECRU.backendStatus().enabled
              ? 'Supabase · ' + (ECRU.backendStatus().error ? '연결 오류' : ECRU.backendStatus().authenticated ? '관리자 인증됨' : '공개 키')
              : '브라우저 localStorage') + '</strong></div>' +
            '<div class="settings-row"><span>상품</span><strong>' + products.length + '</strong></div>' +
            '<div class="settings-row"><span>주문</span><strong>' + orders.length + '</strong></div>' +
            '<div class="settings-row"><span>고객</span><strong>' + customers.length + '</strong></div>' +
            '<div class="settings-row"><span>등록된 리뷰</span><strong>' + reviewCount + '</strong></div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            '<button class="btn btn--small btn--admin-ghost" type="button" data-export-data>' + icon('download') + '스토어 JSON</button>' +
            '<button class="btn btn--small btn--admin-ghost" type="button" data-export-orders>' + icon('download') + '주문 CSV</button>' +
            '<button class="btn btn--small btn--admin-ghost" type="button" data-export-customers>' + icon('download') + '고객 CSV</button>' +
          '</div>' +
        '</section>' +
        '<section class="panel settings-card danger-card settings-card--wide">' +
          '<div><h2>데모 데이터 초기화</h2><p>원래의 상품, 주문, 기본 콘텐츠로 되돌립니다. 이 브라우저에서 추가한 내용은 모두 사라집니다.</p></div>' +
          '<div class="admin-head__actions">' +
            '<button class="btn btn--small" type="button" data-reset-data>' + icon('refresh') + '전체 초기화</button>' +
          '</div>' +
        '</section>' +
      '</div>';
  }

  function openNotifications() {
    var products = ECRU.products();
    var low = products.filter(function (p) { return p.stock <= 5; }).sort(function (a, b) { return a.stock - b.stock; });
    var processing = ECRU.orders().filter(function (order) { return order.status === 'Processing'; }).length;
    var lowRows = low.slice(0, 5).map(function (product) {
      return '' +
        '<div class="low-row">' +
          '<div class="low-row__media"><img src="' + esc(product.image) + '" alt="" loading="lazy"></div>' +
          '<div><strong>' + esc(product.name) + '</strong><span>' + esc(product.sku) + '</span><span class="sub">' + (product.stock < 1 ? '품절' : product.stock + '개 남음') + '</span></div>' +
          '<button type="button" data-stock-edit="' + esc(product.id) + '">재고 보충</button>' +
        '</div>';
    }).join('');
    openModal('' +
      '<p class="eyebrow eyebrow--plain admin-modal__eyebrow">스튜디오 알림</p>' +
      '<h2 class="admin-modal__title" id="admin-modal-title">확인이 필요합니다</h2>' +
      '<p class="admin-modal__text">재고, 주문 처리, 구독자 현황을 빠르게 확인하세요.</p>' +
      '<div style="margin-top:20px">' +
        '<div class="settings-row"><span>재고 부족 또는 품절 상품</span><strong>' + low.length + '</strong></div>' +
        '<div class="settings-row"><span>처리 대기 주문</span><strong>' + processing + '</strong></div>' +
        '<div class="settings-row"><span>뉴스레터 구독자</span><strong>' + ECRU.state().subscribers.length + '</strong></div>' +
      '</div>' +
      '<div class="low-stock" style="margin-top:18px">' + (lowRows || '<p class="panel__sub">재고 상태가 양호합니다.</p>') + '</div>' +
      '<div class="admin-modal__actions">' +
        '<button class="btn btn--admin-ghost" type="button" data-admin-close>나중에</button>' +
        '<button class="btn" type="button" data-goto-tab="products" data-goto-filter="low">재고 확인 ' + icon('arrowUpRight') + '</button>' +
      '</div>');
  }

  function openResetModal() {
    openModal('' +
      '<p class="eyebrow eyebrow--plain admin-modal__eyebrow">주의 구역</p>' +
      '<h2 class="admin-modal__title" id="admin-modal-title">데모 데이터를 초기화할까요?</h2>' +
      '<p class="admin-modal__text">상품, 주문, 고객, 리뷰, 콘텐츠 설정이 초기 상태로 돌아갑니다. ' + (ECRU.backendStatus().enabled ? 'Supabase 데이터베이스의 데이터도 함께 초기화됩니다.' : '이 브라우저에서 변경한 내용은 모두 사라집니다.') + '</p>' +
      '<div class="admin-modal__actions">' +
        '<button class="btn btn--admin-ghost" type="button" data-admin-close>취소</button>' +
        '<button class="btn" type="button" data-confirm-reset>' + icon('refresh') + '전체 초기화</button>' +
      '</div>');
  }

  function openContentResetModal() {
    openModal('' +
      '<p class="eyebrow eyebrow--plain admin-modal__eyebrow">콘텐츠 초기화</p>' +
      '<h2 class="admin-modal__title" id="admin-modal-title">콘텐츠를 기본값으로 되돌릴까요?</h2>' +
      '<p class="admin-modal__text">공지, 히어로, 스토리, 푸터 등 모든 스토어프런트 문구와 이미지가 To Lead 기본값으로 돌아갑니다. 상품과 주문은 그대로 유지됩니다.</p>' +
      '<div class="admin-modal__actions">' +
        '<button class="btn btn--admin-ghost" type="button" data-admin-close>취소</button>' +
        '<button class="btn" type="button" data-confirm-content-reset>' + icon('refresh') + '기본값으로 되돌리기</button>' +
      '</div>');
  }

  /* Events ------------------------------------------------------------------ */
  function handleTopSearch(value) {
    var query = value.trim();
    if (state.tab === 'orders') {
      state.orderSearch = query;
      renderTab();
    } else if (state.tab === 'products') {
      state.productSearch = query;
      renderTab();
    } else if (state.tab === 'customers') {
      state.customerSearch = query;
      renderTab();
    }
    // Other tabs wait for Enter, which opens the global results dialog.
  }

  function openGlobalSearch(rawQuery) {
    var query = String(rawQuery || '').trim();
    if (!query) { toast('검색어를 입력해 주세요.', 'info'); return; }
    var lower = query.toLowerCase();
    var productMatches = ECRU.products().filter(function (product) {
      return [product.name, product.sku, product.type, product.gender].join(' ').toLowerCase().indexOf(lower) > -1;
    });
    var orderMatches = ECRU.orders().filter(function (order) { return matchesOrder(order, query); });
    var customerMatches = customersWithStats().filter(function (customer) {
      return [customer.name, customer.email, customer.segment].join(' ').toLowerCase().indexOf(lower) > -1;
    });
    var products = productMatches.slice(0, 5);
    var orders = orderMatches.slice(0, 5);
    var customers = customerMatches.slice(0, 5);
    var productRows = products.map(function (product) {
      return '<div class="order-detail__item"><div class="product-cell"><div class="product-cell__media"><img src="' + esc(product.image) + '" alt="" loading="lazy"></div><div><strong>' + esc(product.name) + '</strong><span>' + esc(product.sku) + ' · ' + esc(product.type) + '</span></div></div><button class="icon-action" type="button" data-product-edit="' + esc(product.id) + '" aria-label="' + esc(product.name) + ' 수정">' + icon('edit') + '</button></div>';
    }).join('');
    var orderRows = orders.map(function (order) {
      return '<div class="order-detail__item"><div><strong>' + esc(order.id) + '</strong><span>' + esc(order.customer.name) + ' · ' + esc(shortDate(order.date)) + ' · ' + esc(ko(order.status)) + '</span></div><button class="icon-action" type="button" data-order-view="' + esc(order.id) + '" aria-label="주문 ' + esc(order.id) + ' 보기">' + icon('eye') + '</button></div>';
    }).join('');
    var customerRows = customers.map(function (customer) {
      return '<div class="order-detail__item"><div><strong>' + esc(customer.name) + '</strong><span>' + esc(customer.email) + ' · ' + esc(ko(customer.segment)) + '</span></div><button class="icon-action" type="button" data-customer-view="' + esc(customer.email) + '" aria-label="' + esc(customer.name) + ' 보기">' + icon('eye') + '</button></div>';
    }).join('');
    var total = productMatches.length + orderMatches.length + customerMatches.length;
    var sections = '';
    if (productRows) sections += '<h3 style="margin:22px 0 2px;font-family:var(--serif);font-size:19px;font-weight:400">상품</h3><div class="order-detail__items">' + productRows + '</div>';
    if (orderRows) sections += '<h3 style="margin:22px 0 2px;font-family:var(--serif);font-size:19px;font-weight:400">주문</h3><div class="order-detail__items">' + orderRows + '</div>';
    if (customerRows) sections += '<h3 style="margin:22px 0 2px;font-family:var(--serif);font-size:19px;font-weight:400">고객</h3><div class="order-detail__items">' + customerRows + '</div>';
    openModal('' +
      '<p class="eyebrow eyebrow--plain admin-modal__eyebrow">스튜디오 검색</p>' +
      '<h2 class="admin-modal__title" id="admin-modal-title">“' + esc(query) + '” 검색 결과</h2>' +
      '<p class="admin-modal__text">' + (total ? '상품·주문·고객에서 총 ' + total + '건을 찾았습니다.' : '검색 결과가 없습니다. 이름, SKU 또는 주문 번호로 다시 시도해 보세요.') + '</p>' +
      (sections || '<p class="panel__sub" style="padding:24px 0">결과가 없습니다.</p>') +
      '<div class="admin-modal__actions">' +
        '<button class="btn btn--admin-ghost" type="button" data-admin-close>닫기</button>' +
      '</div>');
  }

  function parseColors(raw) {
    return String(raw || '').split(',').map(function (part) {
      var bits = part.split(':');
      var name = (bits[0] || '').trim();
      var hex = (bits[1] || '').trim();
      if (!name) return null;
      return { name: name, hex: /^#[0-9a-f]{3,8}$/i.test(hex) ? hex : '#cbb89d' };
    }).filter(Boolean);
  }

  function handleProductSubmit(form) {
    var data = new FormData(form);
    var id = String(data.get('id') || '').trim();
    var existing = id ? ECRU.getProduct(id) : null;
    var details = String(data.get('details') || '').split(/\r?\n/).map(function (line) {
      return line.trim();
    }).filter(Boolean);
    var uploaded = String(data.get('imageData') || '').trim();
    var colors = parseColors(data.get('colors'));

    var payload = {
      id: id || undefined,
      name: data.get('name'),
      sku: data.get('sku'),
      gender: data.get('gender'),
      type: data.get('type') || '기성복',
      price: data.get('price'),
      compareAt: data.get('compareAt') || null,
      image: uploaded || data.get('image'),
      stock: data.get('stock'),
      sizes: String(data.get('sizes') || '').trim(),
      description: data.get('description'),
      details: details,
      composition: data.get('composition'),
      fit: data.get('fit'),
      badge: data.get('badge') || null,
      isNew: data.get('isNew') === '1',
      colors: colors.length ? colors : (existing ? existing.colors : [{ name: '내추럴', hex: '#cbb89d' }]),
      rating: existing ? existing.rating : 4.7,
      reviewCount: existing ? existing.reviewCount : 0,
      createdAt: existing ? existing.createdAt : undefined
    };

    var result = ECRU.saveProduct(payload);
    if (!result.ok) {
      toast(result.message || '상품을 저장하지 못했습니다.', 'alert');
      return;
    }
    toast((existing ? '상품을 수정했습니다' : '새 상품을 컬렉션에 추가했습니다') + (ECRU.backendStatus().enabled ? ' — DB에 저장 중입니다.' : ' — 스토어프런트에 반영됩니다.'));
    closeModal();
    if (state.tab !== 'products') {
      state.productFilter = 'all';
      window.location.hash = '#products';
    } else {
      renderTab();
    }
  }

  function handleContentSubmit(form) {
    var data = new FormData(form);
    var patch = {};
    CONTENT_SCHEMA.forEach(function (group) {
      group.fields.forEach(function (field) {
        if (!data.has(field.key)) return;
        if (field.type === 'number') patch[field.key] = Math.max(0, Number(data.get(field.key)) || 0);
        else patch[field.key] = String(data.get(field.key) || '').trim();
      });
    });
    ECRU.updateSettings(patch);
    toast('스토어프런트 콘텐츠를 저장했습니다.' + (ECRU.backendStatus().enabled ? ' DB에 저장 중입니다.' : ''));
    renderTab();
  }

  function bindGlobal() {
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;

      if (target.id === 'admin-modal') { closeModal(); return; }

      var goto = target.closest('[data-goto-tab]');
      if (goto) {
        event.preventDefault();
        var tab = goto.getAttribute('data-goto-tab');
        var filter = goto.getAttribute('data-goto-filter');
        if (tab === 'products' && filter) state.productFilter = filter;
        if (tab === 'orders' && filter) state.orderFilter = filter;
        closeModal();
        closeSidebar();
        if (window.location.hash === '#' + tab) renderTab();
        else window.location.hash = '#' + tab;
        return;
      }

      if (target.closest('[data-admin-close]')) {
        event.preventDefault();
        closeModal();
        return;
      }

      var navLink = target.closest('.admin-nav [data-admin-tab]');
      if (navLink) {
        var navTab = navLink.getAttribute('data-admin-tab');
        closeSidebar();
        if (window.location.hash === '#' + navTab) {
          event.preventDefault();
          state.tab = navTab;
          renderTab();
        }
        return;
      }

      if (target.closest('[data-admin-menu]')) { openSidebar(); return; }
      if (target.closest('[data-admin-scrim]')) { closeSidebar(); return; }
      if (target.closest('[data-admin-signout]')) { handleSignOut(); return; }
      if (target.closest('[data-admin-notifications]')) { openNotifications(); return; }

      var range = target.closest('[data-range]');
      if (range) {
        state.range = Number(range.getAttribute('data-range')) || 30;
        renderTab();
        return;
      }

      var orderFilter = target.closest('[data-order-filter]');
      if (orderFilter) {
        state.orderFilter = orderFilter.getAttribute('data-order-filter');
        renderTab();
        return;
      }

      var productFilter = target.closest('[data-product-filter]');
      if (productFilter) {
        state.productFilter = productFilter.getAttribute('data-product-filter');
        renderTab();
        return;
      }

      if (target.closest('[data-product-new]')) { openProductModal(null); return; }

      var edit = target.closest('[data-product-edit]');
      if (edit) { openProductModal(edit.getAttribute('data-product-edit')); return; }

      var remove = target.closest('[data-product-delete]');
      if (remove) { openDeleteProductModal(remove.getAttribute('data-product-delete')); return; }

      var stockEdit = target.closest('[data-stock-edit]');
      if (stockEdit) { openProductModal(stockEdit.getAttribute('data-stock-edit')); return; }

      var orderView = target.closest('[data-order-view]');
      if (orderView) { openOrderModal(orderView.getAttribute('data-order-view')); return; }

      var customerView = target.closest('[data-customer-view]');
      if (customerView) { openCustomerModal(customerView.getAttribute('data-customer-view')); return; }

      if (target.closest('[data-export-orders]')) { downloadOrders(); return; }
      if (target.closest('[data-export-customers]')) { downloadCustomers(); return; }
      if (target.closest('[data-export-data]')) { downloadStore(); return; }
      if (target.closest('[data-reset-data]')) { openResetModal(); return; }
      if (target.closest('[data-content-reset]')) { openContentResetModal(); return; }

      var imageClear = target.closest('[data-content-image-clear]');
      if (imageClear) {
        var imageKey = imageClear.getAttribute('data-content-image-clear');
        var imageInput = $('[data-content-image-input="' + imageKey + '"]');
        var imagePreview = $('[data-content-preview="' + imageKey + '"]');
        if (imageInput) imageInput.value = '';
        if (imagePreview) imagePreview.src = 'assets/images/story.jpg';
        return;
      }

      if (target.closest('[data-confirm-content-reset]')) {
        closeModal();
        handleContentReset();
        return;
      }

      var confirmDelete = target.closest('[data-confirm-product-delete]');
      if (confirmDelete) {
        var deleted = ECRU.getProduct(confirmDelete.getAttribute('data-confirm-product-delete'));
        ECRU.deleteProduct(confirmDelete.getAttribute('data-confirm-product-delete'));
        closeModal();
        renderTab();
        toast((deleted ? deleted.name : '상품') + '을(를) 컬렉션에서 삭제했습니다.');
        return;
      }

      if (target.closest('[data-confirm-reset]')) {
        ECRU.reset();
        state.orderSearch = '';
        state.productSearch = '';
        state.customerSearch = '';
        state.orderFilter = 'All';
        state.productFilter = 'all';
        state.range = 30;
        closeModal();
        if (window.location.hash === '#overview') renderTab();
        else window.location.hash = '#overview';
        toast('데모 데이터를 초기화했습니다.');
        return;
      }
    });

    document.addEventListener('input', function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;

      if (target.matches('#admin-email, #admin-password')) {
        var loginError = $('[data-login-error]');
        if (loginError) loginError.classList.add('hide');
        return;
      }
      if (target.matches('[data-admin-search]')) { handleTopSearch(target.value); return; }
      if (target.matches('[data-order-search]')) { state.orderSearch = target.value; refreshOrdersHost(); return; }
      if (target.matches('[data-product-search]')) { state.productSearch = target.value; refreshProductsHost(); return; }
      if (target.matches('[data-customer-search]')) { state.customerSearch = target.value; refreshCustomersHost(); return; }
    });

    document.addEventListener('change', function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;

      if (target.matches('[data-image-select]')) {
        var preview = $('[data-image-preview]');
        if (preview) preview.src = target.value;
        var dataField = $('[data-product-form] [name="imageData"]');
        if (dataField) dataField.value = '';
        return;
      }

      var productFile = target.closest('[data-product-image-file]');
      if (productFile) {
        var file = productFile.files && productFile.files[0];
        if (!file) return;
        toast('이미지를 압축하는 중입니다…', 'info');
        compressImage(file, 1400, 0.82).then(function (dataUrl) {
          var form = $('[data-product-form]');
          if (!form) return;
          var hidden = form.querySelector('[name="imageData"]');
          var preview = form.querySelector('[data-image-preview]');
          if (hidden) hidden.value = dataUrl;
          if (preview) preview.src = dataUrl;
          toast('이미지가 준비되었습니다. 저장을 눌러 반영하세요.');
        }).catch(function (err) {
          toast(err.message || '이미지를 불러오지 못했습니다.', 'alert');
        });
        return;
      }

      if (target.matches('[data-order-status-select]')) {
        var orderId = target.getAttribute('data-order-id');
        var result = ECRU.updateOrderStatus(orderId, target.value);
        if (!result.ok) { toast('주문 상태를 변경하지 못했습니다.', 'alert'); return; }
        toast('주문 ' + orderId + '을(를) ' + ko(target.value) + '(으)로 변경했습니다.' + (ECRU.backendStatus().enabled ? ' DB에 저장 중입니다.' : ''));
        var modalStatus = $('#admin-modal .order-detail__head .status-pill');
        if (modalStatus) modalStatus.outerHTML = pill(target.value);
        renderTab();
      }
    });

    document.addEventListener('submit', function (event) {
      var form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      if (form.matches('[data-admin-login]')) {
        event.preventDefault();
        var data = new FormData(form);
        var email = String(data.get('email') || '').trim().toLowerCase();
        var password = String(data.get('password') || '');
        var error = form.querySelector('[data-login-error]');
        var submit = form.querySelector('button[type="submit"]');
        function loginFailed(message) {
          if (error) {
            error.textContent = message;
            error.classList.remove('hide');
          }
          if (submit) submit.disabled = false;
          var field = $('#admin-password');
          if (field) field.select();
        }
        if (submit) submit.disabled = true;
        ECRU.adminSignIn(email, password).then(function (result) {
          if (submit) submit.disabled = false;
          if (result.ok) {
            writeSession({ email: email, name: 'To Lead 관리자', at: Date.now(), remote: true });
            if (error) error.classList.add('hide');
            showApp();
            toast('Supabase에 연결했습니다. 변경 사항이 데이터베이스에 저장됩니다.');
            return;
          }
          if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            writeSession({ email: email, name: 'To Lead 관리자', at: Date.now(), remote: false });
            if (error) error.classList.add('hide');
            showApp();
            toast(ECRU.backendStatus().enabled
              ? '로컬 데모 모드로 입장했습니다. DB 저장은 Supabase 관리자 계정으로 로그인해 주세요.'
              : '다시 오신 것을 환영합니다, 관리자님.');
            return;
          }
          loginFailed(ECRU.backendStatus().enabled
            ? '이메일 또는 비밀번호가 올바르지 않습니다. Supabase Auth에 등록된 관리자 계정을 사용하거나, 데모 계정(admin / admin)으로 입장하세요.'
            : '아이디 또는 비밀번호가 올바르지 않습니다. 미리 입력된 데모 계정(admin / admin)을 확인해 주세요.');
        }).catch(function () {
          loginFailed('로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        });
        return;
      }

      if (form.matches('[data-product-form]')) {
        event.preventDefault();
        handleProductSubmit(form);
        return;
      }

      if (form.matches('[data-content-form]')) {
        event.preventDefault();
        handleContentSubmit(form);
      }
    });

    document.addEventListener('keydown', function (event) {
      var modal = $('#admin-modal');
      var modalOpen = modal && modal.classList.contains('is-open');

      if (event.key === 'Enter' && event.target instanceof Element && event.target.matches('[data-admin-search]')) {
        event.preventDefault();
        openGlobalSearch(event.target.value);
        return;
      }

      if (event.key === 'Escape') {
        if (modalOpen) closeModal();
        else closeSidebar();
        return;
      }
      if (event.key !== 'Tab' || !modalOpen) return;
      var focusables = $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', modal)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('hashchange', function () {
      if (readSession()) route();
    });
  }

  function boot() {
    injectChrome();
    bindGlobal();

    document.addEventListener('ecru:ready', function (event) {
      renderNav();
      var detail = event && event.detail ? event.detail : {};
      if (detail.mode === 'local' && ECRU.backendStatus().enabled) {
        toast('데이터베이스에 연결하지 못했습니다. 로컬 캐시로 표시 중입니다 — ' + (detail.error || ''), 'alert');
      }
      var app = $('#admin-app');
      var loggedIn = !!readSession() || ECRU.backendStatus().authenticated;
      if (loggedIn && app && !app.hidden) renderTab();
      else if (loggedIn) showApp();
    });

    document.addEventListener('ecru:sync-error', function (event) {
      var detail = event && event.detail ? event.detail : {};
      var message = ECRU.backendStatus().authenticated
        ? 'DB 저장에 실패했습니다: ' + detail.message
        : 'DB 저장 권한이 없습니다. Supabase 관리자 계정으로 다시 로그인하거나 supabase/demo-policies.sql을 실행해 주세요.';
      toast(message, 'alert');
    });

    if (readSession() || ECRU.backendStatus().authenticated) showApp();
    else showLogin();
  }

  boot();
})();
