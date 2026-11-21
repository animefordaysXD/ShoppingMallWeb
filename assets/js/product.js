/* To Lead — product detail page. */
(function () {
  'use strict';

  var ECRU = window.ECRU;
  var UI = window.UI;
  var params = new URLSearchParams(window.location.search);
  var requestedId = params.get('id');
  var product = requestedId ? ECRU.getProduct(requestedId) : ECRU.products()[0];
  var selectedSize = product && product.sizes.length === 1 ? product.sizes[0] : null;
  var selectedColor = product && product.colors[0] ? product.colors[0] : { name: '내추럴', hex: '#cbb89d' };
  var quantity = 1;

  function settingValue(key, data) {
    var settings = ECRU.getSettings();
    var text = String(settings[key] == null ? '' : settings[key]);
    text = text.replace(/\{(freeShipping|shippingFee|email|siteName|phone)\}/g, function (all, name) {
      if (name === 'freeShipping') return ECRU.money(settings.freeShipping);
      if (name === 'shippingFee') return ECRU.money(settings.shippingFee);
      if (name === 'email') return settings.supportEmail;
      if (name === 'phone') return settings.supportPhone;
      return settings.siteName;
    });
    if (data) {
      text = text.replace(/\{(\w+)\}/g, function (all, name) {
        return data[name] != null ? data[name] : all;
      });
    }
    return text;
  }

  function genderLabel(gender) {
    return gender === 'women' ? '여성' : gender === 'men' ? '남성' : '액세서리';
  }

  function stars(rating) {
    var rounded = Math.round(Number(rating) || 0);
    var out = '';
    for (var i = 0; i < 5; i++) {
      out += '<span style="opacity:' + (i < rounded ? 1 : .2) + '">' + UI.icon('star') + '</span>';
    }
    return out;
  }

  function badgeFor(p) {
    if (p.stock < 1) return '<span class="badge badge--muted">' + UI.esc(settingValue('pdpSoldOut')) + '</span>';
    if (p.compareAt) return '<span class="badge badge--sale">세일</span>';
    if (p.isNew) return '<span class="badge badge--dark">신상품</span>';
    if (p.badge) return '<span class="badge badge--dark">' + UI.esc(p.badge) + '</span>';
    return '';
  }

  function stockMessage(p) {
    if (p.stock < 1) return '<span class="pdp__stock is-out">' + UI.esc(settingValue('pdpStockOut')) + '</span>';
    if (!selectedSize) return '<span class="pdp__stock">' + UI.esc(settingValue('pdpStockSelect')) + '</span>';
    if (p.stock <= 5) return '<span class="pdp__stock is-low">' + UI.esc(settingValue('pdpStockLow', { count: p.stock })) + '</span>';
    return '<span class="pdp__stock">' + UI.esc(settingValue('pdpStockIn')) + '</span>';
  }

  function notFound() {
    document.getElementById('pdp-root').innerHTML = '' +
      '<div class="catalog__empty" style="padding-top:60px">' +
        '<p class="eyebrow eyebrow--plain">' + UI.esc(ECRU.getSettings().shopEmptyEyebrow) + '</p>' +
        '<h2>' + UI.esc(settingValue('pdpNotFoundTitle')) + '</h2>' +
        '<p>' + UI.esc(settingValue('pdpNotFoundText')) + '</p>' +
        '<a class="btn btn--outline" href="shop.html">' + UI.esc(settingValue('pdpNotFoundCta')) + '</a>' +
      '</div>';
    var reviews = document.getElementById('reviews');
    var related = document.getElementById('related');
    if (reviews) reviews.classList.add('hide');
    if (related) related.classList.add('hide');
    var crumbs = document.querySelector('.breadcrumbs');
    if (crumbs) crumbs.innerHTML = '<a href="index.html">' + UI.esc(ECRU.getSettings().pdpBreadcrumbHome) + '</a><span aria-hidden="true">/</span><a href="shop.html">' + UI.esc(ECRU.getSettings().pdpBreadcrumbCollection) + '</a><span aria-hidden="true">/</span><span aria-current="page">' + UI.esc(settingValue('pdpNotFoundTitle')) + '</span>';
  }

  function renderProduct() {
    if (!product) { notFound(); return; }
    var settings = ECRU.getSettings();
    document.title = product.name + ' — ' + settings.siteName;
    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', product.description);

    var crumbs = document.getElementById('product-breadcrumbs');
    if (crumbs) {
      crumbs.innerHTML = '<a href="index.html">' + UI.esc(settings.pdpBreadcrumbHome) + '</a><span aria-hidden="true">/</span><a href="shop.html?gender=' + product.gender + '">' + UI.esc(genderLabel(product.gender)) + '</a><span aria-hidden="true">/</span><span aria-current="page">' + UI.esc(product.name) + '</span>';
    }

    var price = '<span>' + ECRU.money(product.price) + '</span>';
    if (product.compareAt) {
      var saving = Math.round((1 - product.price / product.compareAt) * 100);
      price += '<s>' + ECRU.money(product.compareAt) + '</s><span class="pdp__save">' + UI.esc(settingValue('pdpSave', { percent: saving })) + '</span>';
    }

    var wishlisted = ECRU.isWishlisted(product.id);
    var root = document.getElementById('pdp-root');
    root.innerHTML = '' +
      '<section class="pdp">' +
        '<div class="pdp__gallery">' +
          '<div class="pdp__thumbs" role="group" aria-label="' + UI.esc(settings.pdpGalleryLabel) + '">' +
            '<button class="pdp__thumb is-active" type="button" data-gallery-view="full" aria-label="' + UI.esc(settings.pdpGalleryFull) + '"><img src="' + UI.esc(product.image) + '" alt=""><span class="pdp__thumb-label">' + UI.esc(settings.pdpGalleryFull) + '</span></button>' +
            '<button class="pdp__thumb" type="button" data-gallery-view="top" aria-label="' + UI.esc(settings.pdpGalleryDetail) + '"><img src="' + UI.esc(product.image) + '" alt="" style="object-position:50% 12%;transform:scale(1.5)"><span class="pdp__thumb-label">' + UI.esc(settings.pdpGalleryDetail) + '</span></button>' +
            '<button class="pdp__thumb" type="button" data-gallery-view="detail" aria-label="' + UI.esc(settings.pdpGalleryTexture) + '"><img src="' + UI.esc(product.image) + '" alt="" style="object-position:48% 68%;transform:scale(1.7)"><span class="pdp__thumb-label">' + UI.esc(settings.pdpGalleryTexture) + '</span></button>' +
          '</div>' +
          '<div>' +
            '<div class="pdp__main">' + badgeFor(product) + '<img src="' + UI.esc(product.image) + '" alt="' + UI.esc(product.name) + '" data-gallery-image data-view="full" fetchpriority="high"></div>' +
            '<div class="pdp__gallery-note">' + (product.image ? UI.esc(settingValue('pdpGalleryNote', { sku: product.sku })) : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="pdp__info">' +
          '<div class="pdp__kicker"><span class="eyebrow">' + UI.esc(genderLabel(product.gender)) + ' — ' + UI.esc(product.type) + '</span><span class="micro">' + UI.esc(product.sku) + '</span></div>' +
          '<h1 class="pdp__title">' + UI.esc(product.name) + '</h1>' +
          '<div class="pdp__rating"><span class="stars">' + stars(product.rating) + '</span><span>' + product.rating.toFixed(1) + ' · <a href="#reviews" style="text-decoration:underline;text-underline-offset:3px">' + UI.esc(settingValue('pdpReviewsLink', { count: product.reviewCount + (ECRU.state().reviews[product.id] || []).length })) + '</a></span></div>' +
          '<div class="pdp__price">' + price + '</div>' +
          '<p class="pdp__desc">' + UI.esc(product.description) + '</p>' +

          '<div class="pdp__option">' +
            '<div class="pdp__label-row"><span class="pdp__label">' + UI.esc(settings.pdpColourLabel) + '</span><span class="pdp__label-value" data-color-name>' + UI.esc(selectedColor.name) + '</span></div>' +
            '<div class="pdp__colors" role="group" aria-label="' + UI.esc(settings.pdpColourLabel) + '">' +
              product.colors.map(function (color, index) {
                return '<button class="color-choice' + (index === 0 ? ' is-selected' : '') + '" type="button" data-color-choice="' + index + '" aria-label="' + UI.esc(color.name) + '" aria-pressed="' + (index === 0) + '"><span style="background:' + UI.esc(color.hex) + '"></span></button>';
              }).join('') +
            '</div>' +
          '</div>' +

          '<div class="pdp__option pdp__option--size">' +
            '<div class="pdp__label-row"><span class="pdp__label">' + UI.esc(settings.pdpSizeLabel) + '</span><button class="size-guide-link" type="button" data-size-guide>' + UI.esc(settings.pdpSizeGuideLink) + '</button></div>' +
            '<div class="pdp__sizes" role="group" aria-label="' + UI.esc(settings.pdpSizeLabel) + '">' +
              product.sizes.map(function (size) {
                return '<button class="size-choice' + (selectedSize === size ? ' is-selected' : '') + '" type="button" data-size-choice="' + UI.esc(size) + '">' + UI.esc(size) + '</button>';
              }).join('') +
            '</div>' +
            '<div data-stock-message>' + stockMessage(product) + '</div>' +
          '</div>' +

          '<div class="pdp__buy">' +
            '<div class="qty"><button type="button" data-qty-change="-1" aria-label="수량 줄이기">−</button><span data-qty-value>' + quantity + '</span><button type="button" data-qty-change="1" aria-label="수량 늘리기">+</button></div>' +
            '<button class="btn" type="button" data-add-to-bag' + (product.stock < 1 || !selectedSize ? ' disabled' : '') + '>' + UI.esc(product.stock < 1 ? settings.pdpSoldOut : selectedSize ? settings.pdpAddToBag : settings.pdpSelectSize) + '</button>' +
            '<button class="pdp__wish' + (wishlisted ? ' is-active' : '') + '" type="button" data-wish-id="' + UI.esc(product.id) + '" aria-label="' + UI.esc(settings.pdpSaveToWishlist) + '" aria-pressed="' + wishlisted + '">' + UI.icon('heart') + '</button>' +
          '</div>' +

          '<div class="pdp__assurances">' +
            '<span>' + UI.icon('check') + UI.esc(UI.settingText(settings.pdpAssurance1)) + '</span>' +
            '<span>' + UI.icon('check') + UI.esc(UI.settingText(settings.pdpAssurance2)) + '</span>' +
            '<span>' + UI.icon('check') + UI.esc(UI.settingText(settings.pdpAssurance3)) + '</span>' +
          '</div>' +

          '<details class="acc" open><summary>' + UI.esc(settings.pdpDetailsTitle) + '</summary><div class="acc__body"><ul>' + product.details.map(function (d) { return '<li>' + UI.esc(d) + '</li>'; }).join('') + '</ul><p style="margin-top:10px">' + UI.esc(product.fit) + '</p></div></details>' +
          '<details class="acc"><summary>' + UI.esc(settings.pdpCareTitle) + '</summary><div class="acc__body">' + UI.esc(product.composition) + '</div></details>' +
          '<details class="acc"><summary>' + UI.esc(settings.pdpDeliveryTitle) + '</summary><div class="acc__body">' + UI.esc(UI.settingText(settings.pdpDeliveryText)) + '</div></details>' +
          '<p class="pdp__note">' + UI.esc(settings.pdpDemoNote) + '</p>' +
        '</div>' +
      '</section>';

    renderReviews();
    renderRelated();
    setupMobileBuy();
    UI.observeReveals();
  }

  function renderReviews() {
    var root = document.getElementById('reviews-root');
    if (!root || !product) return;
    var settings = ECRU.getSettings();
    var reviews = ECRU.getReviews(product.id);
    var customCount = (ECRU.state().reviews[product.id] || []).length;
    var total = product.reviewCount + customCount;
    var rating = product.rating;
    var five = rating >= 4.9 ? 91 : rating >= 4.7 ? 84 : rating >= 4.5 ? 76 : 64;
    var four = rating >= 4.9 ? 7 : 12;
    var three = 100 - five - four - 2 > 0 ? 100 - five - four - 2 : 1;
    var bars = [{ label: '5', value: five }, { label: '4', value: four }, { label: '3', value: three }, { label: '2', value: 1 }, { label: '1', value: 1 }];
    root.innerHTML = '' +
      '<div class="reviews__summary">' +
        '<p class="eyebrow">' + UI.esc(settings.reviewsEyebrow) + '</p>' +
        '<h2 class="reviews__title" id="reviews-title">' + UI.esc(settings.reviewsTitle) + '</h2>' +
        '<div class="reviews__score"><strong>' + rating.toFixed(1) + '</strong><span>' + UI.esc(settingValue('reviewsBasedOn', { count: total })) + '</span></div>' +
        '<span class="stars">' + stars(rating) + '</span>' +
        '<div class="rating-bars">' + bars.map(function (bar) {
          return '<div class="rating-bar"><span>' + bar.label + '</span><span class="rating-bar__track"><span class="rating-bar__fill" style="width:' + bar.value + '%"></span></span><span>' + bar.value + '%</span></div>';
        }).join('') + '</div>' +
        '<button class="btn btn--outline btn--small reviews__write" type="button" data-write-review>' + UI.esc(settings.reviewsWrite) + '</button>' +
      '</div>' +
      '<div>' +
        '<div class="review-list">' + reviews.map(function (review) {
          return '<article class="review"><div class="review__head"><span class="review__stars">' + stars(review.rating) + '</span><span class="review__meta">' + UI.esc(review.date) + '</span></div><h3 class="review__title">' + UI.esc(review.title) + '</h3><p class="review__text">' + UI.esc(review.text) + '</p><div class="review__verified">' + UI.esc(review.verified ? settings.reviewVerified : settings.reviewCommunity) + ' · ' + UI.esc(review.name) + '</div></article>';
        }).join('') + '</div>' +
        '<form class="review-form" data-review-form>' +
          '<h3 class="review-form__title">' + UI.esc(settings.reviewFormTitle) + '</h3>' +
          '<div class="review-form__row"><div class="field"><label for="review-name">' + UI.esc(settings.reviewNameLabel) + '</label><input class="input" id="review-name" name="name" placeholder="' + UI.esc(settings.reviewNamePlaceholder) + '" required></div><div class="field"><label for="review-rating">' + UI.esc(settings.reviewRatingLabel) + '</label><select class="select" id="review-rating" name="rating"><option value="5">' + UI.esc(settings.reviewRating5) + '</option><option value="4">' + UI.esc(settings.reviewRating4) + '</option><option value="3">' + UI.esc(settings.reviewRating3) + '</option><option value="2">' + UI.esc(settings.reviewRating2) + '</option><option value="1">' + UI.esc(settings.reviewRating1) + '</option></select></div></div>' +
          '<div class="field"><label for="review-title">' + UI.esc(settings.reviewTitleLabel) + '</label><input class="input" id="review-title" name="title" placeholder="' + UI.esc(settings.reviewTitlePlaceholder) + '" required></div>' +
          '<div class="field"><label for="review-text">' + UI.esc(settings.reviewTextLabel) + '</label><textarea class="textarea" id="review-text" name="text" placeholder="' + UI.esc(settings.reviewTextPlaceholder) + '" required></textarea></div>' +
          '<p class="form-note">' + UI.esc(settings.reviewNote) + '</p>' +
          '<div><button class="btn btn--outline btn--small" type="submit">' + UI.esc(settings.reviewSubmit) + '</button></div>' +
        '</form>' +
      '</div>';
  }

  function renderRelated() {
    if (!product) return;
    var pool = ECRU.products().filter(function (p) { return p.id !== product.id; });
    var same = pool.filter(function (p) { return p.gender === product.gender; });
    var accessories = pool.filter(function (p) { return p.gender === 'accessories'; });
    var picks = [];
    same.slice(0, 2).forEach(function (p) { picks.push(p); });
    accessories.slice(0, 3 - picks.length).forEach(function (p) { if (picks.indexOf(p) === -1) picks.push(p); });
    pool.forEach(function (p) { if (picks.length < 3 && picks.indexOf(p) === -1) picks.push(p); });
    var grid = document.getElementById('related-grid');
    if (grid) grid.innerHTML = picks.slice(0, 3).map(UI.productCard).join('');
  }

  function setupMobileBuy() {
    var bar = document.getElementById('mobile-buy');
    var image = document.getElementById('mobile-buy-image');
    var name = document.getElementById('mobile-buy-name');
    var price = document.getElementById('mobile-buy-price');
    var add = document.getElementById('mobile-buy-add');
    if (!bar || !product) return;
    if (image) { image.src = product.image; image.alt = product.name; }
    if (name) name.textContent = product.name;
    if (price) price.textContent = ECRU.money(product.price);
    if (add && product.stock < 1) { add.disabled = true; add.textContent = ECRU.getSettings().pdpSoldOut; }
    window.addEventListener('scroll', function () {
      var buy = document.querySelector('.pdp__buy');
      if (!buy) return;
      var threshold = buy.getBoundingClientRect().top + window.scrollY + 90;
      bar.classList.toggle('is-visible', window.scrollY > threshold);
      bar.setAttribute('aria-hidden', window.scrollY > threshold ? 'false' : 'true');
    }, { passive: true });
  }

  function updateBuyState() {
    var settings = ECRU.getSettings();
    var button = document.querySelector('[data-add-to-bag]');
    var message = document.querySelector('[data-stock-message]');
    if (message) message.innerHTML = stockMessage(product);
    if (button) {
      button.disabled = product.stock < 1 || !selectedSize;
      button.textContent = product.stock < 1 ? settings.pdpSoldOut : selectedSize ? settings.pdpAddToBag : settings.pdpSelectSize;
    }
  }

  function addCurrentToBag() {
    if (!product) return;
    if (product.stock < 1) { UI.toast('현재 품절된 상품입니다.'); return; }
    if (!selectedSize) {
      UI.toast('먼저 사이즈를 선택해 주세요.');
      var sizeBlock = document.querySelector('.pdp__option--size');
      if (sizeBlock) sizeBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    var result = ECRU.addToCart(product.id, selectedSize, quantity);
    if (!result.ok) { UI.toast(result.message); return; }
    UI.renderCart();
    UI.openLayer('cart');
    UI.toast(product.name + '을(를) 쇼핑백에 담았습니다.');
  }

  document.addEventListener('click', function (event) {
    var size = event.target.closest('[data-size-choice]');
    if (size) {
      selectedSize = size.getAttribute('data-size-choice');
      document.querySelectorAll('[data-size-choice]').forEach(function (btn) { btn.classList.toggle('is-selected', btn === size); });
      updateBuyState();
      return;
    }
    var color = event.target.closest('[data-color-choice]');
    if (color) {
      var index = Number(color.getAttribute('data-color-choice'));
      selectedColor = product.colors[index] || product.colors[0];
      document.querySelectorAll('[data-color-choice]').forEach(function (btn) { btn.classList.toggle('is-selected', btn === color); });
      var label = document.querySelector('[data-color-name]');
      if (label) label.textContent = selectedColor.name;
      return;
    }
    var view = event.target.closest('[data-gallery-view]');
    if (view) {
      var mode = view.getAttribute('data-gallery-view');
      var image = document.querySelector('[data-gallery-image]');
      if (image) image.setAttribute('data-view', mode);
      document.querySelectorAll('[data-gallery-view]').forEach(function (btn) { btn.classList.toggle('is-active', btn === view); });
      return;
    }
    var qty = event.target.closest('[data-qty-change]');
    if (qty) {
      var delta = Number(qty.getAttribute('data-qty-change'));
      quantity = Math.max(1, Math.min(product.stock || 1, quantity + delta));
      var value = document.querySelector('[data-qty-value]');
      if (value) value.textContent = quantity;
      return;
    }
    if (event.target.closest('[data-add-to-bag]') || event.target.closest('#mobile-buy-add')) {
      addCurrentToBag();
      return;
    }
    if (event.target.closest('[data-write-review]')) {
      var form = document.querySelector('[data-review-form]');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var firstInput = form.querySelector('input');
        if (firstInput) window.setTimeout(function () { firstInput.focus(); }, 400);
      }
    }
  });

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form.matches('[data-review-form]')) return;
    event.preventDefault();
    var data = new FormData(form);
    var result = ECRU.addReview(product.id, {
      name: data.get('name'),
      rating: data.get('rating'),
      title: data.get('title'),
      text: data.get('text')
    });
    if (!result.ok) { UI.toast('리뷰 내용을 확인한 후 다시 시도해 주세요.'); return; }
    renderReviews();
    UI.toast(ECRU.getSettings().reviewThanks);
    var reviews = document.getElementById('reviews');
    if (reviews) reviews.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.addEventListener('ecru:ready', function () {
    var next = requestedId ? ECRU.getProduct(requestedId) : ECRU.products()[0];
    UI.applyContent(document);
    if (!next) {
      product = null;
      notFound();
      return;
    }
    product = next;
    if (selectedSize && product.sizes.indexOf(selectedSize) === -1) selectedSize = null;
    if (!selectedSize && product.sizes.length === 1) selectedSize = product.sizes[0];
    selectedColor = product.colors[0] || { name: '내추럴', hex: '#cbb89d' };
    quantity = Math.max(1, Math.min(quantity, product.stock || 1));
    renderProduct();
  });

  UI.applyContent(document);
  if (product) {
    renderProduct();
  } else {
    notFound();
  }
})();
