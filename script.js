/* Portfolio scripts: plain JavaScript, no libraries. */
(function () {
    'use strict';
  
    // ---- Settings you can edit ----
    var CONFIG = {
      email: '', // Add your email here to make the contact form open your mail app
      roles: ['Software Developer', 'Software Engineering Student', 'C and JavaScript Learner']
    };
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var $ = function (s) { return document.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  
    // ---- Page loading animation ----
    window.addEventListener('load', function () {
      setTimeout(function () { $('#loader').classList.add('done'); }, reduceMotion ? 0 : 700);
    });
  
    // ---- Typing effect: types and deletes each role in turn ----
    function startTyping() {
      var el = $('#typed'), r = 0, c = 0, deleting = false;
      if (reduceMotion) { el.textContent = CONFIG.roles[0]; return; }
      (function tick() {
        var word = CONFIG.roles[r];
        c += deleting ? -1 : 1;
        el.textContent = word.slice(0, c);
        var delay = deleting ? 40 : 90;
        if (!deleting && c === word.length) { deleting = true; delay = 1400; }
        else if (deleting && c === 0) { deleting = false; r = (r + 1) % CONFIG.roles.length; delay = 400; }
        setTimeout(tick, delay);
      })();
    }
    startTyping();
  
    // ---- Navbar: shadow on scroll, active link, back-to-top, mobile menu ----
    var nav = $('#nav'), topBtn = $('#top'), burger = $('#burger'), menu = $('#menu');
    var links = $$('.menu a[href^="#"]:not(.btn)');
    var sections = links.map(function (a) { return $(a.getAttribute('href')); });
  
    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle('scrolled', y > 20);
      topBtn.classList.toggle('show', y > 600);
      var current = -1;
      sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < 140) current = i; });
      links.forEach(function (a, i) { a.classList.toggle('active', i === current); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  
    topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
  
    function setMenu(open) {
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  
    // ---- Scroll reveal with IntersectionObserver ----
    var revealEls = $$('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }
  
    // ---- Animated counters: count up once when visible ----
    function animateCount(el) {
      var target = parseInt(el.dataset.count, 10), start = null;
      if (reduceMotion) { el.textContent = target; return; }
      function step(t) {
        if (!start) start = t;
        var p = Math.min((t - start) / 1200, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); } });
      }, { threshold: 0.6 });
      $$('[data-count]').forEach(function (el) { co.observe(el); });
    } else {
      $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; });
    }
  
    // ---- 3D tilt effect on project cards and the profile photo ----
    if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
      $$('.tilt').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = 'perspective(800px) rotateY(' + x * 12 + 'deg) rotateX(' + -y * 12 + 'deg) scale(1.02)';
        });
        card.addEventListener('mouseleave', function () { card.style.transform = ''; });
      });
    }
  
    // ---- Floating particles on a canvas ----
    (function particles() {
      var canvas = $('#particles');
      if (reduceMotion || !canvas.getContext) return;
      var ctx = canvas.getContext('2d'), dots = [], w, h;
      function resize() {
        w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight;
        var n = Math.min(60, Math.floor(w / 22));
        dots = [];
        for (var i = 0; i < n; i++) dots.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + .4, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 });
      }
      function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(0,212,255,.55)';
        dots.forEach(function (d) {
          d.x = (d.x + d.vx + w) % w; d.y = (d.y + d.vy + h) % h;
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
        });
        requestAnimationFrame(draw);
      }
      window.addEventListener('resize', resize);
      resize(); draw();
    })();
  
    // ---- Custom cursor (desktop only) ----
    var cursor = $('#cursor');
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
      document.addEventListener('mousemove', function (e) {
        cursor.classList.add('on');
        cursor.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      });
      document.addEventListener('mouseover', function (e) {
        cursor.classList.toggle('big', !!e.target.closest('a,button,.chip,.card'));
      });
    }
  
    // ---- Click ripple on buttons ----
    $$('.btn').forEach(function (b) {
      b.addEventListener('click', function (e) {
        var r = b.getBoundingClientRect(), s = document.createElement('span');
        s.className = 'ripple';
        s.style.cssText = 'width:40px;height:40px;left:' + (e.clientX - r.left - 20) + 'px;top:' + (e.clientY - r.top - 20) + 'px';
        b.appendChild(s);
        setTimeout(function () { s.remove(); }, 600);
      });
    });
  
    // ---- Contact form: validate, then open email app (or copy message) ----
    var form = $('#form'), status = $('#status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, ok = true;
      ['name', 'email', 'message'].forEach(function (k) {
        var bad = !f[k].value.trim() || (k === 'email' && !/^\S+@\S+\.\S+$/.test(f[k].value));
        f[k].classList.toggle('bad', bad);
        if (bad) ok = false;
      });
      status.classList.toggle('err', !ok);
      if (!ok) { status.textContent = 'Please fill in every field with a valid email.'; return; }
      var body = 'From: ' + f.name.value + ' (' + f.email.value + ')\n\n' + f.message.value;
      if (CONFIG.email) {
        window.location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('Portfolio message from ' + f.name.value) + '&body=' + encodeURIComponent(body);
        status.textContent = 'Opening your email app...';
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(body).then(function () {
          status.textContent = 'Message copied. Paste it into a LinkedIn message to Shabuj.';
          window.open('https://www.linkedin.com/in/musfiqur-rahman-shabuj-79b999354/', '_blank', 'noopener');
        }, function () { status.textContent = 'Could not copy. Please message me on LinkedIn.'; });
      } else {
        status.textContent = 'Please message me on LinkedIn.';
      }
      form.reset();
    });
  
    $('#year').textContent = new Date().getFullYear();
  })();