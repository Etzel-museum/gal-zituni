/* בונה את האתר מתוך js/content.js. בדרך כלל אין צורך לערוך את הקובץ הזה. */
(function () {
  'use strict';

  var S = window.SITE;
  var ICONS = window.ICONS || {};
  var B = S.business;
  var draft = !!S.draftMode;

  /* ---------- עזרים ---------- */
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function has(v) { return Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim()); }
  function icon(name) { return ICONS[name] || ''; }
  function get(path) { return path.split('.').reduce(function (o, k) { return o && o[k]; }, S); }
  // מילים באנגלית (שמות שדות) מקבלות כיוון LTR כדי שלא ישבשו את המשפט העברי
  function ltr(text) { return esc(text).replace(/[A-Za-z][\w.\-]*/g, '<code dir="ltr">$&</code>'); }
  function draftNote(text) {
    return draft && text ? '<p class="draft-note">' + icon('edit') + '<span><strong>לעריכה:</strong> ' + ltr(text) + '</span></p>' : '';
  }
  function placeholder(iconName, text) {
    return '<div class="placeholder">' + icon(iconName) + '<p>' + esc(text) + '</p></div>';
  }
  function head(id, data, intro) {
    return '<h2 class="section__title" id="' + id + '-title">' + esc(data.title) + '</h2>' +
      (intro ? '<p class="section__intro">' + esc(intro) + '</p>' : '');
  }

  var waUrl = 'https://wa.me/' + B.phoneIntl + '?text=' + encodeURIComponent(B.whatsappMessage);
  var telUrl = 'tel:+' + B.phoneIntl;
  var newTab = ' target="_blank" rel="noopener"';
  var newTabSr = '<span class="visually-hidden"> (נפתח בחלון חדש)</span>';

  /* ---------- החלקים ---------- */
  var R = {};

  R.whatIs = function (d) {
    if (!has(d.paragraphs) && !has(d.points)) return '';
    return head('whatIs', d) +
      '<div class="split">' +
        '<div class="prose">' + (d.paragraphs || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
        '<ul class="points">' + (d.points || []).map(function (p) {
          return '<li class="point"><span class="point__icon">' + icon('paw') + '</span><div><h3>' + esc(p.title) + '</h3><p>' + esc(p.text) + '</p></div></li>';
        }).join('') + '</ul>' +
      '</div>';
  };

  function cards(items) {
    return '<ul class="cards">' + items.map(function (it) {
      return '<li class="card">' + (it.icon ? '<span class="card__icon">' + icon(it.icon) + '</span>' : '') +
        '<h3 class="card__title">' + esc(it.title) + '</h3><p>' + esc(it.text) + '</p></li>';
    }).join('') + '</ul>';
  }

  R.whyTrain = function (d) {
    if (!has(d.items)) return '';
    return head('whyTrain', d, d.intro) + cards(d.items);
  };

  R.services = function (d) {
    if (!has(d.items)) return draft ? head('services', d) + draftNote(d.draftNote) : '';
    return head('services', d, d.intro) + draftNote(d.draftNote) + cards(d.items);
  };

  R.process = function (d) {
    if (!has(d.steps)) return '';
    return head('process', d, d.intro) +
      '<ol class="steps">' + d.steps.map(function (st, i) {
        return '<li class="step"><span class="step__num" aria-hidden="true">' + (i + 1) + '</span><h3>' + esc(st.title) + '</h3><p>' + esc(st.text) + '</p></li>';
      }).join('') + '</ol>' +
      '<div class="section__cta"><a class="btn btn--wa" href="' + waUrl + '"' + newTab + '>' + icon('whatsapp') + '<span>מתחילים בשיחת היכרות</span>' + newTabSr + '</a></div>';
  };

  R.about = function (d) {
    if (!has(d.paragraphs) && !draft) return '';
    var img = has(d.image)
      ? '<img class="about__img" src="' + esc(d.image) + '" alt="' + esc(d.imageAlt) + '" loading="lazy">'
      : (draft ? placeholder('image', 'כאן תופיע תמונה של גל') : '');
    return '<div class="about' + (img ? '' : ' about--noimg') + '">' +
      (img ? '<div class="about__media">' + img + '</div>' : '') +
      '<div class="about__body">' + head('about', d) + draftNote(d.draftNote) +
        '<div class="prose">' + (d.paragraphs || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      '</div></div>';
  };

  R.video = function (d) {
    var media = '';
    if (has(d.youtubeId)) {
      media = '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(d.youtubeId) + '?rel=0&cc_load_policy=1&hl=he"' +
        ' title="' + esc(d.title) + ' – סרטון של ' + esc(B.name) + '" loading="lazy"' +
        ' allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
    } else if (has(d.file)) {
      media = '<div class="video"><video controls preload="metadata"' + (has(d.poster) ? ' poster="' + esc(d.poster) + '"' : '') + '>' +
        '<source src="' + esc(d.file) + '">' +
        (has(d.captions) ? '<track kind="captions" srclang="he" label="עברית" src="' + esc(d.captions) + '" default>' : '') +
        'הדפדפן שלך לא תומך בהצגת וידאו.</video></div>';
    } else if (draft) {
      media = '<div class="video video--empty">' + placeholder('video', 'כאן יופיע סרטון ההסברה של גל') + '</div>';
    } else {
      return '';
    }
    return '<div class="video-wrap">' + head('video', d, d.text) + draftNote(has(d.youtubeId) || has(d.file) ? '' : d.draftNote) + media + '</div>';
  };

  R.gallery = function (d) {
    if (!has(d.images)) return draft ? head('gallery', d) + draftNote(d.draftNote) : '';
    return head('gallery', d, d.intro) +
      '<ul class="gallery">' + d.images.map(function (im) {
        return '<li><img src="' + esc(im.src) + '" alt="' + esc(im.alt) + '" loading="lazy"></li>';
      }).join('') + '</ul>';
  };

  R.reviews = function (d) {
    var items = (d.items || []).filter(function (r) { return draft || !r.placeholder; });
    if (!items.length) return draft ? head('reviews', d) + draftNote(d.draftNote) : '';
    var g = S.social && S.social.googleReviews;
    return head('reviews', d, d.intro) + draftNote(d.draftNote) +
      '<ul class="reviews">' + items.map(function (r) {
        var stars = '';
        if (r.rating) {
          var n = Math.max(0, Math.min(5, Math.round(r.rating)));
          stars = '<p class="review__stars" role="img" aria-label="דירוג ' + n + ' מתוך 5">' +
            new Array(n + 1).join(icon('starFill')) + new Array(6 - n).join(icon('star')) + '</p>';
        }
        return '<li class="review' + (r.placeholder ? ' review--placeholder' : '') + '"><figure>' +
          (r.placeholder ? '<span class="badge">דוגמה</span>' : '') + stars +
          '<blockquote><p>' + esc(r.text) + '</p></blockquote>' +
          '<figcaption><strong>' + esc(r.name) + '</strong>' + (has(r.dog) ? '<span>' + esc(r.dog) + '</span>' : '') + '</figcaption>' +
          '</figure></li>';
      }).join('') + '</ul>' +
      (has(g) ? '<div class="section__cta"><a class="btn btn--outline" href="' + esc(g) + '"' + newTab + '>' + icon('google') + '<span>לכל הביקורות בגוגל</span>' + newTabSr + '</a></div>' : '');
  };

  R.faq = function (d) {
    if (!has(d.items)) return '';
    return head('faq', d, d.intro) + draftNote(d.draftNote) +
      '<div class="faq">' + d.items.map(function (f) {
        return '<details class="faq__item"><summary><h3>' + esc(f.q) + '</h3></summary><div class="faq__answer"><p>' + esc(f.a) + '</p></div></details>';
      }).join('') + '</div>';
  };

  R.contact = function (d) {
    var rows = [];
    rows.push('<li><span class="contact__icon">' + icon('phone') + '</span><div><span class="contact__label">טלפון</span><a href="' + telUrl + '" dir="ltr">' + esc(B.phoneDisplay) + '</a></div></li>');
    if (has(B.email)) rows.push('<li><span class="contact__icon">' + icon('mail') + '</span><div><span class="contact__label">אימייל</span><a href="mailto:' + esc(B.email) + '" dir="ltr">' + esc(B.email) + '</a></div></li>');
    if (has(B.area)) rows.push('<li><span class="contact__icon">' + icon('pin') + '</span><div><span class="contact__label">אזורי שירות</span><span>' + esc(B.area) + '</span></div></li>');
    else if (draft) rows.push('<li class="contact__draft"><span class="contact__icon">' + icon('pin') + '</span><div><span class="contact__label">אזורי שירות</span><span>להשלים בשדה <code dir="ltr">business.area</code></span></div></li>');
    if (has(B.hours)) rows.push('<li><span class="contact__icon">' + icon('clock') + '</span><div><span class="contact__label">שעות פעילות</span><span>' + esc(B.hours) + '</span></div></li>');
    else if (draft) rows.push('<li class="contact__draft"><span class="contact__icon">' + icon('clock') + '</span><div><span class="contact__label">שעות פעילות</span><span>להשלים בשדה <code dir="ltr">business.hours</code></span></div></li>');

    var social = socialHtml();
    var extra = extraLinksHtml();
    if (!social && !extra && draft) social = '<li class="contact__draft social__draft">' + icon('instagram') +
      '<span>כאן יופיעו אינסטגרם ורשתות נוספות – להשלים בשדות <code dir="ltr">social</code> ו-<code dir="ltr">extraLinks</code></span></li>';

    return '<div class="contact">' +
      '<div class="contact__main">' + head('contact', d, d.text) +
        '<div class="contact__buttons">' +
          '<a class="btn btn--wa btn--lg" href="' + waUrl + '"' + newTab + '>' + icon('whatsapp') + '<span>שליחת הודעה בוואטסאפ</span>' + newTabSr + '</a>' +
          '<a class="btn btn--outline btn--lg" href="' + telUrl + '">' + icon('phone') + '<span>חיוג ישיר</span></a>' +
        '</div>' +
        '<ul class="contact__list">' + rows.join('') + '</ul>' +
        (social ? '<ul class="social" aria-label="רשתות חברתיות">' + social + '</ul>' : '') +
        (extra ? '<ul class="extra-links" aria-label="קישורים נוספים">' + extra + '</ul>' : '') +
      '</div>' +
      '<figure class="qr">' +
        '<div class="qr__code" id="qr-code"></div>' +
        '<figcaption>' + esc(d.qrCaption) + '</figcaption>' +
      '</figure>' +
    '</div>';
  };

  /* ---------- רשתות חברתיות וקישורים נוספים ---------- */
  function socialHtml() {
    var labels = { instagram: 'אינסטגרם', facebook: 'פייסבוק', tiktok: 'טיקטוק', youtube: 'יוטיוב' };
    return Object.keys(labels).filter(function (k) { return S.social && has(S.social[k]); }).map(function (k) {
      return '<li><a class="social__link" href="' + esc(S.social[k]) + '"' + newTab + ' aria-label="' + labels[k] + ' (נפתח בחלון חדש)">' + icon(k) + '</a></li>';
    }).join('');
  }
  function extraLinksHtml() {
    return (S.extraLinks || []).filter(function (l) { return has(l.url) && has(l.label); }).map(function (l) {
      return '<li><a class="extra-link" href="' + esc(l.url) + '"' + newTab + '>' + icon(l.icon || 'link') + '<span>' + esc(l.label) + '</span>' + newTabSr + '</a></li>';
    }).join('');
  }

  /* ---------- בניית הדף ---------- */
  var main = document.getElementById('main');
  var navList = document.querySelector('.site-nav__list');
  var html = '', nav = '';

  (S.order || []).forEach(function (id) {
    var d = S[id];
    if (!d || !R[id]) return;
    var inner = R[id](d);
    if (!inner) return;
    html += '<section class="section section--' + id + '" id="' + id + '" aria-labelledby="' + id + '-title"><div class="container">' + inner + '</div></section>';
    if (d.navLabel) nav += '<li><a href="#' + id + '">' + esc(d.navLabel) + '</a></li>';
  });
  main.insertAdjacentHTML('beforeend', html);
  navList.innerHTML = nav;

  // טקסטים קבועים
  document.querySelectorAll('[data-bind]').forEach(function (el) {
    var v = get(el.getAttribute('data-bind'));
    if (has(v)) el.textContent = v; else if (el.parentNode) el.hidden = true;
  });
  document.querySelectorAll('[data-icon]').forEach(function (el) { el.innerHTML = icon(el.getAttribute('data-icon')); });
  if (has(B.logo)) {
    var brandIcon = document.querySelector('.brand__icon');
    brandIcon.innerHTML = '<img src="' + esc(B.logo) + '" alt="">';
    brandIcon.classList.add('brand__icon--logo');
  }
  var footSocial = socialHtml(), footExtra = extraLinksHtml(), footBox = document.querySelector('.footer__social');
  if (footBox && (footSocial || footExtra)) footBox.innerHTML = footSocial + footExtra; else if (footBox) footBox.hidden = true;
  document.querySelectorAll('[data-wa]').forEach(function (a) { a.href = waUrl; a.target = '_blank'; a.rel = 'noopener'; });
  document.querySelectorAll('[data-tel]').forEach(function (a) { a.href = telUrl; a.setAttribute('dir', 'ltr'); });
  document.querySelectorAll('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  if (!document.getElementById('process')) {
    var sec = document.querySelector('.hero .btn--ghost');
    if (sec) sec.hidden = true;
  }
  if (draft) document.documentElement.classList.add('is-draft');

  /* ---------- ברקוד לוואטסאפ ---------- */
  function drawQr() {
    var box = document.getElementById('qr-code');
    if (!box) return;
    if (typeof window.qrcode !== 'function') {
      box.innerHTML = '<a href="' + waUrl + '"' + newTab + '>פתיחת וואטסאפ' + newTabSr + '</a>';
      return;
    }
    var qr = window.qrcode(0, 'L'); // L = ברקוד פחות צפוף, קל יותר לסריקה (הקישור ארוך בגלל העברית)
    qr.addData(waUrl);
    qr.make();
    box.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
    var svg = box.querySelector('svg');
    if (svg) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'ברקוד QR לפתיחת שיחת וואטסאפ עם ' + B.name + ' בטלפון ' + B.phoneDisplay);
      svg.removeAttribute('width'); svg.removeAttribute('height');
    }
  }
  if (document.readyState === 'complete') drawQr(); else window.addEventListener('load', drawQr);

  /* ---------- תפריט ניווט במובייל ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var siteNav = document.getElementById('site-nav');
  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    siteNav.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', function () { setNav(toggle.getAttribute('aria-expanded') !== 'true'); });
  siteNav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && siteNav.classList.contains('is-open')) { setNav(false); toggle.focus(); }
  });

  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- תמונות מתחלפות ---------- */
  var slidesBox = document.querySelector('.hero__slides');
  var pauseBtn = document.querySelector('.hero__pause');
  var pauseLabel = pauseBtn.querySelector('.hero__pause-label');
  var pauseIcon = pauseBtn.querySelector('.hero__pause-icon');
  var slides = [], current = 0, timer = null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var userPaused = false;

  (S.backgroundImages || []).forEach(function (im) {
    var div = document.createElement('div');
    div.className = 'hero__slide';
    div.style.backgroundPosition = im.position || 'center';
    slidesBox.appendChild(div);
    var pre = new Image();
    pre.onload = function () {
      div.style.backgroundImage = 'url("' + im.src.replace(/"/g, '%22') + '")';
      div.classList.add('is-loaded');
    };
    pre.onerror = function () { div.remove(); slides = slides.filter(function (s) { return s !== div; }); };
    pre.src = im.src;
    slides.push(div);
  });
  if (slides[0]) slides[0].classList.add('is-active');

  var userPlay = false; // המשתמש לחץ "הפעלה" במפורש – גובר על העדפת הפחתת תנועה
  function motionOff() {
    if (userPlay) return false;
    return userPaused || reduceMotion.matches || document.documentElement.classList.contains('a11y-motion');
  }
  function next() {
    if (slides.length < 2) return;
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  }
  function syncSlideshow() {
    clearInterval(timer); timer = null;
    var off = motionOff();
    document.documentElement.classList.toggle('slides-paused', off);
    pauseBtn.setAttribute('aria-pressed', String(off));
    pauseLabel.textContent = off ? 'הפעלת החלפת התמונות' : 'עצירת החלפת התמונות';
    pauseIcon.innerHTML = icon(off ? 'play' : 'pause');
    if (!off && !document.hidden) timer = setInterval(next, (S.slideSeconds || 7) * 1000);
  }
  pauseBtn.hidden = (S.backgroundImages || []).length < 2;
  pauseBtn.addEventListener('click', function () {
    if (motionOff()) { userPlay = true; userPaused = false; }
    else { userPlay = false; userPaused = true; }
    syncSlideshow();
  });
  document.addEventListener('visibilitychange', syncSlideshow);
  document.addEventListener('a11y:change', function () { userPlay = false; syncSlideshow(); });
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', syncSlideshow);
  syncSlideshow();

  /* ---------- הופעה הדרגתית בגלילה ---------- */
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.section .container').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  /* ---------- נתונים מובנים למנועי חיפוש ---------- */
  var ld = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: B.name + ' – ' + B.title,
    telephone: '+' + B.phoneIntl,
    description: S.hero.subtitle
  };
  if (has(B.siteUrl)) ld.url = B.siteUrl;
  if (has(B.email)) ld.email = B.email;
  if (has(B.area)) ld.areaServed = B.area;
  var sameAs = ['instagram', 'facebook', 'tiktok', 'youtube'].map(function (k) { return S.social[k]; }).filter(has);
  if (sameAs.length) ld.sameAs = sameAs;
  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);
})();
