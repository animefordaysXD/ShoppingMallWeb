/* To Lead — Supabase REST adapter.
   Keeps window.ECRU synchronous: the UI reads/writes the in-memory store as
   before, while this module hydrates it on load and mirrors admin changes to
   Postgres through Supabase's REST API. No build step, no SDK, no server. */
(function () {
  'use strict';

  var cfg = window.TOLEAD_CONFIG || {};
  var base = String(cfg.supabaseUrl || '').replace(/\/+$/, '');
  var anonKey = String(cfg.supabaseAnonKey || '');
  var storeId = String(cfg.storeId || 'main');
  var enabled = /^https?:\/\//i.test(base) && anonKey.length > 20;
  var SESSION_KEY = 'tolead.auth.v1';
  var session = readSession();

  function readSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function writeSession(value) {
    session = value;
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(value)); } catch (err) { /* ignore */ }
  }

  function clearSession() {
    session = null;
    try { localStorage.removeItem(SESSION_KEY); } catch (err) { /* ignore */ }
  }

  function isEnabled() { return enabled; }
  function isAuthenticated() { return !!(enabled && session && session.access_token); }
  function userEmail() { return session && session.email ? session.email : null; }

  function tokenIsFresh() {
    if (!session || !session.access_token) return false;
    if (!session.expires_at) return true;
    return (Date.now() / 1000) < (Number(session.expires_at) - 120);
  }

  function tokenRequest(body) {
    var grant = body.grant_type === 'refresh_token' ? 'refresh_token' : 'password';
    var payload = Object.assign({}, body);
    delete payload.grant_type;
    return fetch(base + '/auth/v1/token?grant_type=' + grant, {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(readResponse);
  }

  function readResponse(res) {
    return res.text().then(function (text) {
      var data = null;
      try { data = text ? JSON.parse(text) : null; } catch (err) { data = text; }
      if (!res.ok) {
        var message = (data && (data.msg || data.message || data.error_description || data.error)) || ('HTTP ' + res.status);
        var error = new Error(message);
        error.status = res.status;
        error.details = data;
        throw error;
      }
      return data;
    });
  }

  var refreshPromise = null;

  function refreshAccessToken() {
    if (refreshPromise) return refreshPromise;
    if (!session || !session.refresh_token) {
      clearSession();
      return Promise.resolve(anonKey);
    }
    refreshPromise = tokenRequest({ grant_type: 'refresh_token', refresh_token: session.refresh_token }).then(function (data) {
      writeSession(sessionFromToken(data, session.email));
      return data.access_token;
    }, function () {
      clearSession();
      return anonKey;
    }).then(function (token) {
      refreshPromise = null;
      return token;
    });
    return refreshPromise;
  }

  function accessToken() {
    if (!session) return Promise.resolve(anonKey);
    if (tokenIsFresh()) return Promise.resolve(session.access_token);
    return refreshAccessToken();
  }

  function sessionFromToken(data, fallbackEmail) {
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at || (Math.floor(Date.now() / 1000) + (Number(data.expires_in) || 3600)),
      email: (data.user && data.user.email) || fallbackEmail || null
    };
  }

  function request(path, options) {
    options = options || {};
    return accessToken().then(function (token) {
      var headers = {
        apikey: anonKey,
        Authorization: 'Bearer ' + (token || anonKey),
        'Content-Type': 'application/json'
      };
      if (options.prefer) headers.Prefer = options.prefer;
      var init = { method: options.method || 'GET', headers: headers };
      if (options.body !== undefined) init.body = JSON.stringify(options.body);
      return fetch(base + path, init).then(readResponse);
    });
  }

  function rest(path, options) {
    return request('/rest/v1/' + path, options);
  }

  function enc(value) { return encodeURIComponent(String(value)); }

  /* Row <-> app shape ------------------------------------------------------- */
  function productToRow(p) {
    return {
      id: p.id,
      sku: p.sku || '',
      name: p.name || '무제',
      gender: p.gender || 'women',
      type: p.type || '기성복',
      price: Math.max(0, Number(p.price) || 0),
      compare_at: p.compareAt == null ? null : Math.max(0, Number(p.compareAt) || 0),
      image: p.image || '',
      colors: Array.isArray(p.colors) ? p.colors : [],
      sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['원사이즈'],
      stock: Math.max(0, Number(p.stock) || 0),
      rating: Number(p.rating) || 4.7,
      review_count: Math.max(0, Number(p.reviewCount) || 0),
      badge: p.badge || null,
      is_new: !!p.isNew,
      description: p.description || '',
      details: Array.isArray(p.details) ? p.details : [],
      composition: p.composition || '',
      fit: p.fit || '',
      created_at: p.createdAt || new Date().toISOString().slice(0, 10)
    };
  }

  function rowToProduct(r) {
    return {
      id: r.id,
      sku: r.sku || '',
      name: r.name,
      gender: r.gender || 'women',
      type: r.type || '기성복',
      price: Number(r.price) || 0,
      compareAt: r.compare_at == null ? null : Number(r.compare_at),
      image: r.image || '',
      colors: Array.isArray(r.colors) ? r.colors : [],
      sizes: Array.isArray(r.sizes) ? r.sizes : ['원사이즈'],
      stock: Number(r.stock) || 0,
      rating: Number(r.rating) || 4.7,
      reviewCount: Number(r.review_count) || 0,
      badge: r.badge || null,
      isNew: !!r.is_new,
      description: r.description || '',
      details: Array.isArray(r.details) ? r.details : [],
      composition: r.composition || '',
      fit: r.fit || '',
      createdAt: r.created_at || new Date().toISOString().slice(0, 10)
    };
  }

  function rowToCustomer(r) {
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      joined: r.joined || (r.created_at || '').slice(0, 10),
      segment: r.segment || 'New',
      totalSpent: Number(r.total_spent) || 0,
      orderCount: Number(r.order_count) || 0,
      lastOrderAt: r.last_order_at || null
    };
  }

  function rowToOrder(r) {
    var items = (r.order_items || []).slice().sort(function (a, b) { return (a.id || 0) - (b.id || 0); });
    return {
      id: r.id,
      customer: { name: r.customer_name, email: r.customer_email },
      date: r.created_at,
      items: items.map(function (item) {
        return {
          productId: item.product_id,
          name: item.name,
          size: item.size || '',
          qty: Number(item.qty) || 1,
          price: Number(item.price) || 0
        };
      }),
      subtotal: Number(r.subtotal) || 0,
      shipping: Number(r.shipping) || 0,
      total: Number(r.total) || 0,
      status: r.status || 'Processing',
      payment: r.payment || 'Paid',
      channel: r.channel || 'Online'
    };
  }

  function relativeDate(iso) {
    var time = new Date(iso).getTime();
    if (!time) return '';
    var diff = Date.now() - time;
    var day = 86400000;
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return Math.floor(diff / 60000) + '분 전';
    if (diff < day) return Math.floor(diff / 3600000) + '시간 전';
    if (diff < 30 * day) return Math.floor(diff / day) + '일 전';
    if (diff < 365 * day) return Math.floor(diff / (30 * day)) + '개월 전';
    return Math.floor(diff / (365 * day)) + '년 전';
  }

  /* Reads ------------------------------------------------------------------- */
  function loadStore() {
    return Promise.all([
      rest('products?select=*&order=created_at.desc'),
      rest('customers?select=*&order=joined.desc'),
      rest('orders?select=*,order_items(*)&order=created_at.desc'),
      rest('settings?select=*&id=eq.' + enc(storeId)),
      rest('reviews?select=*&order=created_at.desc'),
      rest('subscribers?select=*&order=created_at.asc')
    ]).then(function (res) {
      var data = { products: [], customers: [], orders: [], settings: null, reviews: {}, subscribers: [] };
      (res[0] || []).forEach(function (row) { data.products.push(rowToProduct(row)); });
      (res[1] || []).forEach(function (row) { data.customers.push(rowToCustomer(row)); });
      (res[2] || []).forEach(function (row) { data.orders.push(rowToOrder(row)); });
      if (res[3] && res[3].length) data.settings = res[3][0].data;
      (res[4] || []).forEach(function (row) {
        if (!data.reviews[row.product_id]) data.reviews[row.product_id] = [];
        data.reviews[row.product_id].push({
          id: row.id,
          name: row.name || '익명',
          rating: Number(row.rating) || 5,
          title: row.title || '',
          text: row.body || '',
          date: relativeDate(row.created_at) || row.date_label || '',
          verified: !!row.verified
        });
      });
      (res[5] || []).forEach(function (row) { data.subscribers.push(row.email); });
      return data;
    });
  }

  function isEmpty(remote) {
    return !remote || (!remote.products.length && !remote.settings);
  }

  /* Writes ------------------------------------------------------------------ */
  function saveSettings(data) {
    return rest('settings?on_conflict=id', {
      method: 'POST',
      body: [{ id: storeId, data: data }],
      prefer: 'resolution=merge-duplicates,return=minimal'
    });
  }

  function saveProduct(product) {
    return rest('products?on_conflict=id', {
      method: 'POST',
      body: [productToRow(product)],
      prefer: 'resolution=merge-duplicates,return=minimal'
    });
  }

  function deleteProduct(id) {
    return rest('products?id=eq.' + enc(id), { method: 'DELETE', prefer: 'return=minimal' });
  }

  function updateOrder(id, patch) {
    var body = Object.assign({ updated_at: new Date().toISOString() }, patch || {});
    return rest('orders?id=eq.' + enc(id), {
      method: 'PATCH',
      body: body,
      prefer: 'return=minimal'
    });
  }

  function addReview(productId, review) {
    return rest('reviews', {
      method: 'POST',
      body: [{
        id: review.id,
        product_id: productId,
        name: review.name,
        rating: review.rating,
        title: review.title,
        body: review.text,
        date_label: review.date,
        verified: !!review.verified
      }],
      prefer: 'return=minimal'
    });
  }

  function subscribe(email) {
    return rest('subscribers?on_conflict=email', {
      method: 'POST',
      body: [{ email: email }],
      prefer: 'resolution=merge-duplicates,return=minimal'
    });
  }

  function placeOrder(order) {
    return rest('rpc/place_order', {
      method: 'POST',
      body: {
        p_id: order.id,
        p_name: order.customer.name,
        p_email: order.customer.email,
        p_items: order.items.map(function (item) {
          return { productId: item.productId, qty: item.qty, size: item.size };
        }),
        p_channel: order.channel || 'Online'
      }
    });
  }

  function removeAll(table, filter) {
    return rest(table + '?' + filter, { method: 'DELETE', prefer: 'return=minimal' });
  }

  function chunk(list, size) {
    var out = [];
    for (var i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
    return out;
  }

  function insertAll(table, rows) {
    var batches = chunk(rows, 250);
    return batches.reduce(function (chain, batch) {
      return chain.then(function () {
        return rest(table, { method: 'POST', body: batch, prefer: 'return=minimal' });
      });
    }, Promise.resolve());
  }

  /* Full reset: wipes the catalogue/orders and writes the bundled seed back.
     Used by the admin "데모 데이터 초기화" action and first-run seeding. */
  function resetStore(seed) {
    var customersByEmail = {};
    (seed.customers || []).forEach(function (customer) { customersByEmail[customer.email] = customer; });

    var productRows = (seed.products || []).map(productToRow);
    var customerRows = (seed.customers || []).map(function (customer) {
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        joined: customer.joined,
        segment: customer.segment || 'New'
      };
    });
    var orderRows = [];
    var itemRows = [];
    (seed.orders || []).forEach(function (order) {
      var customer = customersByEmail[order.customer.email];
      orderRows.push({
        id: order.id,
        customer_id: customer ? customer.id : null,
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        created_at: order.date,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        status: order.status,
        payment: order.payment,
        channel: order.channel
      });
      (order.items || []).forEach(function (item) {
        itemRows.push({
          order_id: order.id,
          product_id: item.productId,
          name: item.name,
          size: item.size,
          qty: item.qty,
          price: item.price
        });
      });
    });
    var reviewRows = [];
    Object.keys(seed.reviews || {}).forEach(function (productId) {
      (seed.reviews[productId] || []).forEach(function (review) {
        reviewRows.push({
          id: review.id,
          product_id: productId,
          name: review.name,
          rating: review.rating,
          title: review.title,
          body: review.text,
          date_label: review.date,
          verified: !!review.verified
        });
      });
    });
    var subscriberRows = (seed.subscribers || []).map(function (email) { return { email: email }; });

    return Promise.resolve()
      .then(function () { return removeAll('order_items', 'id=not.is.null'); })
      .then(function () { return removeAll('orders', 'id=not.is.null'); })
      .then(function () { return removeAll('reviews', 'id=not.is.null'); })
      .then(function () { return removeAll('customers', 'id=not.is.null'); })
      .then(function () { return removeAll('products', 'id=not.is.null'); })
      .then(function () { return removeAll('subscribers', 'email=not.is.null'); })
      .then(function () { return insertAll('products', productRows); })
      .then(function () { return insertAll('customers', customerRows); })
      .then(function () { return insertAll('orders', orderRows); })
      .then(function () { return insertAll('order_items', itemRows); })
      .then(function () { return reviewRows.length ? insertAll('reviews', reviewRows) : null; })
      .then(function () { return subscriberRows.length ? insertAll('subscribers', subscriberRows) : null; })
      .then(function () { return saveSettings(seed.settings || {}); });
  }

  /* Auth -------------------------------------------------------------------- */
  function syncAccount(user, email) {
    if (!user || !user.id) return Promise.resolve();
    return rest('accounts?on_conflict=email', {
      method: 'POST',
      body: [{
        auth_user_id: user.id,
        email: email,
        name: (user.user_metadata && user.user_metadata.name) || null,
        role: 'admin'
      }],
      prefer: 'resolution=merge-duplicates,return=minimal'
    });
  }

  function signIn(email, password) {
    if (!enabled) return Promise.resolve({ ok: false, message: '데이터베이스가 설정되지 않았습니다.' });
    return tokenRequest({ email: email, password: password }).then(function (data) {
      writeSession(sessionFromToken(data, email));
      return syncAccount(data.user, session.email).catch(function () { /* profile row is optional */ }).then(function () {
        return { ok: true, user: { email: session.email, name: (data.user && data.user.user_metadata && data.user.user_metadata.name) || 'To Lead 관리자' } };
      });
    }).catch(function (err) {
      var message = err.status === 400 ? '이메일 또는 비밀번호가 올바르지 않습니다.' : 'Supabase 인증에 연결하지 못했습니다.';
      return { ok: false, message: message, error: err.message, status: err.status };
    });
  }

  function signOut() {
    var token = session && session.access_token;
    clearSession();
    if (!enabled || !token) return Promise.resolve();
    return fetch(base + '/auth/v1/logout', {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: 'Bearer ' + token }
    }).catch(function () { /* local sign-out already happened */ });
  }

  window.ToLeadBackend = {
    enabled: isEnabled,
    isAuthenticated: isAuthenticated,
    userEmail: userEmail,
    loadStore: loadStore,
    isEmpty: isEmpty,
    saveSettings: saveSettings,
    saveProduct: saveProduct,
    deleteProduct: deleteProduct,
    updateOrder: updateOrder,
    addReview: addReview,
    subscribe: subscribe,
    placeOrder: placeOrder,
    resetStore: resetStore,
    signIn: signIn,
    signOut: signOut
  };
})();
