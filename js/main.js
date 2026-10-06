(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mqMobile = window.matchMedia('(max-width: 991px)');

  /* language dropdown */
  var lang = $('.lang'), langBtn = $('.lang__btn');
  if (lang && langBtn) {
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = lang.classList.toggle('open');
      langBtn.setAttribute('aria-expanded', o);
    });
    document.addEventListener('click', function () { lang.classList.remove('open'); langBtn.setAttribute('aria-expanded', 'false'); });
  }

  /* mobile menu */
  var burger = $('.burger'), nav = $('#nav'), overlay = $('.hdr__overlay');
  function setMenu(o) {
    if (!nav) return;
    nav.classList.toggle('open', o);
    document.body.classList.toggle('menu-open', o);
    if (burger) burger.setAttribute('aria-expanded', o);
  }
  if (burger && nav) {
    burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    var cl = $('.nav__close');
    if (cl) cl.addEventListener('click', function () { setMenu(false); });
    if (overlay) overlay.addEventListener('click', function () { setMenu(false); });
    $$('#nav a').forEach(function (a) {
      if (a.classList.contains('sub-toggle')) return;
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (!mqMobile.matches) setMenu(false); });
  }
  $$('.sub-toggle').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!mqMobile.matches) return;
      e.preventDefault();
      a.parentNode.classList.toggle('open');
    });
  });

  /* home accordion */
  $$('[data-accordion]').forEach(function (wrap) {
    var ps = $$('.acc__p', wrap), idx = -1, timer = null, hovering = false;
    function openOne(n) {
      ps.forEach(function (p, i) { p.classList.toggle('is-open', i === n); });
      idx = n;
    }
    function start() {
      stop();
      timer = setInterval(function () { if (!hovering) openOne((idx + 1) % ps.length); }, 3500);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    ps.forEach(function (p, i) {
      p.addEventListener('mouseenter', function () { hovering = true; openOne(i); });
      p.addEventListener('focus', function () { hovering = true; openOne(i); });
      p.addEventListener('blur', function () { hovering = false; });
    });
    wrap.addEventListener('mouseleave', function () { hovering = false; });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }).observe(wrap);
      } else { start(); }
    }
  });

  /* home tabs */
  var tabLinks = $$('[data-tab]');
  if (tabLinks.length) {
    var panels = $$('.rooms__panel');
    var show = function (k) {
      var ok = false;
      tabLinks.forEach(function (a) {
        var on = a.getAttribute('data-tab') === k;
        if (on) ok = true;
        a.parentNode.classList.toggle('active', on);
      });
      if (!ok) return;
      panels.forEach(function (p) { p.classList.toggle('active', p.id === 'tab-' + k); });
    };
    tabLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var k = a.getAttribute('data-tab');
        show(k);
        try { history.replaceState(null, '', '#' + k); } catch (x) {}
      });
    });
    if (location.hash) show(location.hash.slice(1));
  }

  /* room slider */
  $$('[data-slider]').forEach(function (s) {
    var track = $('.rslider__track', s), n = track.children.length, i = 0, sx = null;
    function go(k) { i = (k + n) % n; track.style.transform = 'translateX(' + (-100 * i) + '%)'; }
    var pv = $('.rslider__btn--prev', s), nx = $('.rslider__btn--next', s);
    if (n < 2) { if (pv) pv.hidden = true; if (nx) nx.hidden = true; return; }
    pv.addEventListener('click', function () { go(i - 1); });
    nx.addEventListener('click', function () { go(i + 1); });
    s.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    s.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var d = e.changedTouches[0].clientX - sx;
      if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1));
      sx = null;
    });
    s.setAttribute('tabindex', '0');
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(i - 1);
      if (e.key === 'ArrowRight') go(i + 1);
    });
  });

  /* gallery filter */
  var cats = $$('[data-cat].x, a[data-cat]').filter(function (a) { return a.closest('.tabs'); });
  if (cats.length) {
    var items = $$('.gal__item');
    var filt = function (k) {
      cats.forEach(function (a) { a.parentNode.classList.toggle('active', a.getAttribute('data-cat') === k); });
      items.forEach(function (it) { it.hidden = !(k === 'all' || it.getAttribute('data-cat') === k); });
    };
    cats.forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); filt(a.getAttribute('data-cat')); });
    });
  }

  /* lightbox */
  var lb = $('.lightbox');
  if (lb) {
    var img = $('img', lb), count = $('.lightbox__count', lb), cur = 0, list = [];
    var render = function () {
      var a = list[cur];
      img.src = a.getAttribute('href');
      img.alt = $('img', a) ? $('img', a).alt : '';
      count.textContent = (cur + 1) + ' / ' + list.length;
    };
    var openLb = function (a) {
      list = $$('[data-lightbox]').filter(function (x) { return !x.hidden; });
      cur = Math.max(0, list.indexOf(a));
      render(); lb.hidden = false; document.body.style.overflow = 'hidden';
      $('.lightbox__close', lb).focus();
    };
    var closeLb = function () { lb.hidden = true; img.removeAttribute('src'); document.body.style.overflow = ''; };
    var step = function (d) { cur = (cur + d + list.length) % list.length; render(); };
    $$('[data-lightbox]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); openLb(a); }); });
    $('.lightbox__close', lb).addEventListener('click', closeLb);
    $('.lightbox__nav--prev', lb).addEventListener('click', function () { step(-1); });
    $('.lightbox__nav--next', lb).addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

})();
