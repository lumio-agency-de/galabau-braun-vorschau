/* Garten- & Landschaftsbau Braun — Reveals, Zähler, Bild-Slots, wachsende Pflanzenlinie */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Jahr im Footer */
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  /* Nav-Hintergrund beim Scrollen */
  var nav = document.getElementById('nav');
  function onScrollNav() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* Mobile-Menü */
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  function closeMenu() {
    if (!links) return;
    links.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Menü öffnen');
  }
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    Array.prototype.forEach.call(document.querySelectorAll('.js-close'), function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* Bild-Slots: liegt die Datei in img/, wird sie geladen — sonst bleibt der Platzhalter. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-img]'), function (slot) {
    var src = slot.getAttribute('data-img');
    if (!src) return;
    var probe = new Image();
    probe.onload = function () {
      var img = document.createElement('img');
      img.src = src;
      img.alt = slot.getAttribute('data-alt') || '';
      img.loading = 'lazy';
      slot.insertBefore(img, slot.firstChild);
      slot.classList.add('has-img');
    };
    probe.src = src;
  });

  /* Kundenstimmen: „Mehr lesen" + Endlos-Lauf (links rein, rechts raus) */
  var track = document.getElementById('reviewTrack');
  if (track) {
    Array.prototype.forEach.call(track.querySelectorAll('.review'), function (card) {
      var body = card.querySelector('.review-body');
      if (!body) return;
      if (body.scrollHeight > body.clientHeight + 4) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'review-more';
        btn.textContent = 'Mehr lesen';
        card.insertBefore(btn, card.querySelector('footer'));
      }
    });
    if (!reduce) {
      track.innerHTML += track.innerHTML;
      for (var d = track.children.length / 2; d < track.children.length; d++) {
        track.children[d].setAttribute('aria-hidden', 'true');
      }
    }
    track.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('.review-more') : null;
      if (!btn) return;
      var card = btn.closest('.review');
      var open = card.classList.toggle('expanded');
      btn.textContent = open ? 'Weniger anzeigen' : 'Mehr lesen';
      track.classList.toggle('paused', !!track.querySelector('.review.expanded'));
    });
  }

  /* Reveal on scroll */
  var revs = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revs, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(revs, function (el) { io.observe(el); });
  }

  /* Zähler im Statistik-Band */
  var nums = document.querySelectorAll('.stat-num');
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) {
      el.innerHTML = (decimals ? target.toFixed(decimals).replace('.', ',') : String(target)) + suffix;
      return;
    }
    var dur = 1400;
    var t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.innerHTML = (decimals ? val.toFixed(decimals).replace('.', ',') : String(Math.round(val))) + suffix;
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window && nums.length) {
    var ioNum = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); ioNum.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(nums, function (el) { ioNum.observe(el); });
  } else {
    Array.prototype.forEach.call(nums, runCount);
  }

  /* Liane im Statistik-Band wächst beim Reinscrollen */
  var statsBand = document.querySelector('.stats');
  if (statsBand) {
    if (reduce || !('IntersectionObserver' in window)) {
      statsBand.classList.add('grow');
    } else {
      var ioLiana = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { statsBand.classList.add('grow'); ioLiana.unobserve(statsBand); }
        });
      }, { threshold: 0.25 });
      ioLiana.observe(statsBand);
    }
  }

  /* Leichter Parallax auf Hero-/Kontakt-Bildern */
  var layers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (!reduce && layers.length) {
    var ticking = false;
    function applyParallax() {
      var vh = window.innerHeight;
      layers.forEach(function (el) {
        var host = el.parentElement;
        var r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var offset = (r.top + r.height / 2 - vh / 2) * -speed;
        var img = el.querySelector('img');
        if (img) img.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(applyParallax); }
    }, { passive: true });
    window.addEventListener('resize', applyParallax);
    applyParallax();
  }

  /* Wachsende Pflanzenlinie: spannt von „Über uns" bis zum Kontakt, zeichnet sich beim Scrollen. */
  var vine = document.querySelector('.vine');
  var vinePath = document.getElementById('vinePath');
  if (vine && vinePath) {
    var vineTop = 0, vineHeight = 0, pathLen = 0;
    function layoutVine() {
      var start = document.getElementById('ueber');
      var end = document.getElementById('kontakt');
      if (!start || !end) return;
      vineTop = start.getBoundingClientRect().top + window.scrollY + 40;
      var endTop = end.getBoundingClientRect().top + window.scrollY;
      vineHeight = Math.max(endTop - vineTop, 0);
      vine.style.top = vineTop + 'px';
      vine.style.height = vineHeight + 'px';
      pathLen = vinePath.getTotalLength();
      vinePath.style.strokeDasharray = String(pathLen);
      drawVine();
    }
    function drawVine() {
      if (!vineHeight || !pathLen) return;
      if (reduce) { vinePath.style.strokeDashoffset = '0'; return; }
      var seen = window.scrollY + window.innerHeight * 0.8 - vineTop;
      var p = Math.min(Math.max(seen / vineHeight, 0), 1);
      vinePath.style.strokeDashoffset = String(pathLen * (1 - p));
    }
    var vineTick = false;
    window.addEventListener('scroll', function () {
      if (!vineTick) {
        vineTick = true;
        window.requestAnimationFrame(function () { drawVine(); vineTick = false; });
      }
    }, { passive: true });
    window.addEventListener('resize', layoutVine);
    window.addEventListener('load', layoutVine);
    layoutVine();
  }
})();
