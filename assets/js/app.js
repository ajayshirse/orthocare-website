/* OrthoCare — shared behaviour: navigation, FAQ, slider, toasts, validation, API helper.
   Loaded first on every page. doctors.js and appointment.js use window.OrthoCare. */
(function () {
  'use strict';

  var OrthoCare = (window.OrthoCare = window.OrthoCare || {});

  /* ---- Backend hook: set API_BASE when the Spring Boot REST API exists. ----
     Expected endpoints:  GET /doctors · POST /appointments · POST /contacts
     Leave it empty and the site works with its built-in sample data only. */
  OrthoCare.config = { API_BASE: '' };

  OrthoCare.api = {
    enabled: function () { return !!OrthoCare.config.API_BASE; },
    request: function (method, path, body) {
      var opts = { method: method, headers: { 'Content-Type': 'application/json', Accept: 'application/json' } };
      if (body !== undefined) opts.body = JSON.stringify(body);
      return fetch(OrthoCare.config.API_BASE.replace(/\/$/, '') + path, opts).then(function (res) {
        return res.text().then(function (text) {
          var json = null;
          try { json = text ? JSON.parse(text) : null; } catch (e) { /* non-JSON body */ }
          if (!res.ok) throw new Error((json && (json.message || json.error)) || 'Request failed (' + res.status + ')');
          return json && typeof json === 'object' && 'data' in json ? json.data : json;
        });
      });
    },
    get: function (path) { return this.request('GET', path); },
    post: function (path, body) { return this.request('POST', path, body); }
  };

  /* ---- Toasts ---- */
  OrthoCare.toast = function (message, type) {
    var region = document.getElementById('toast-region');
    if (!region) return;
    var el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' toast--err' : '');
    var icon = document.createElement('i');
    icon.className = 'fa-solid ' + (type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check');
    icon.setAttribute('aria-hidden', 'true');
    var text = document.createElement('span');
    text.textContent = message;
    el.append(icon, text);
    region.appendChild(el);
    setTimeout(function () {
      el.classList.add('is-leaving');
      setTimeout(function () { el.remove(); }, 320);
    }, type === 'error' ? 5200 : 3600);
  };

  /* ---- Form validation (shared by contact + appointment forms) ---- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  OrthoCare.todayStr = todayStr;

  function fieldMessage(el) {
    var value = el.value.trim();
    var label = el.getAttribute('data-label') || 'This field';
    if (el.required && !value) return (el.tagName === 'SELECT' ? 'Choose ' : 'Enter ') + label.toLowerCase() + '.';
    if (!value) return '';
    var kind = el.getAttribute('data-type');
    if (kind === 'phone') {
      var digits = value.replace(/\D/g, '');
      if (!/^\+?[0-9\s\-()]+$/.test(value) || digits.length < 10 || digits.length > 15) return 'Enter a phone number with 10 to 15 digits.';
    }
    if (el.type === 'email' && !EMAIL_RE.test(value)) return 'Enter an email address like name@example.com.';
    if (el.type === 'date' && value < todayStr()) return 'Choose today or a later date.';
    if (el.minLength > 0 && value.length < el.minLength) return label + ' needs at least ' + el.minLength + ' characters.';
    return '';
  }

  function showFieldError(el, message) {
    var wrap = el.closest('.field');
    var err = document.getElementById(el.id + '-error');
    if (wrap) wrap.classList.toggle('has-error', !!message);
    if (err) err.textContent = message;
    el.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  OrthoCare.validateForm = function (form) {
    var firstBad = null;
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      var msg = fieldMessage(el);
      showFieldError(el, msg);
      if (msg && !firstBad) firstBad = el;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  };

  OrthoCare.watchForm = function (form) {
    form.setAttribute('novalidate', '');
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value.trim() || el.getAttribute('aria-invalid') === 'true') showFieldError(el, fieldMessage(el)); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') showFieldError(el, fieldMessage(el)); });
    });
  };

  OrthoCare.setStatus = function (box, kind, message) {
    box.className = 'form-status is-shown form-status--' + kind;
    box.textContent = message;
    box.focus();
  };

  OrthoCare.formData = function (form) {
    var out = {};
    new FormData(form).forEach(function (v, k) { out[k] = String(v).trim(); });
    return out;
  };

  /* ---- Mobile navigation ---- */
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');
  function setNav(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.firstElementChild.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setNav(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setNav(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 821px)').addEventListener('change', function (e) { if (e.matches) setNav(false); });
  }

  /* ---- FAQ accordion: one open at a time, buttons toggle with Enter/Space ---- */
  document.querySelectorAll('.faq').forEach(function (faq) {
    faq.addEventListener('click', function (e) {
      var btn = e.target.closest('.faq-q');
      if (!btn) return;
      var open = btn.getAttribute('aria-expanded') === 'true';
      faq.querySelectorAll('.faq-q').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      btn.setAttribute('aria-expanded', String(!open));
    });
  });

  /* ---- Testimonial slider ---- */
  var slider = document.getElementById('quotes');
  if (slider) {
    var slides = slider.querySelectorAll('.quote-slide');
    var dots = slider.querySelectorAll('.dot');
    var index = 0;
    var show = function (i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === index); });
      dots.forEach(function (d, n) { d.setAttribute('aria-current', String(n === index)); });
    };
    slider.querySelector('[data-quote="prev"]').addEventListener('click', function () { show(index - 1); });
    slider.querySelector('[data-quote="next"]').addEventListener('click', function () { show(index + 1); });
    dots.forEach(function (d, n) { d.addEventListener('click', function () { show(n); }); });
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    show(0);
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce && revealEls.length) {
    document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Back to top ---- */
  var toTop = document.getElementById('to-top');
  if (toTop) {
    window.addEventListener('scroll', function () { toTop.classList.toggle('is-shown', window.scrollY > 600); }, { passive: true });
    toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  }

  /* ---- Image fallback: a missing photo is swapped for a local illustration ---- */
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (img.tagName !== 'IMG' || img.dataset.fallbackDone) return;
    img.dataset.fallbackDone = '1';
    img.src = (document.body.dataset.root || '') + 'assets/images/placeholder.svg';
  }, true);

  // Images that failed before this script ran
  document.querySelectorAll('img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0 && !img.dataset.fallbackDone) img.dispatchEvent(new Event('error'));
  });

  /* ---- Footer year ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- Contact form ---- */
  var contact = document.getElementById('contact-form');
  if (contact) {
    OrthoCare.watchForm(contact);
    var cStatus = document.getElementById('contact-status');
    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      cStatus.className = 'form-status';
      if (!OrthoCare.validateForm(contact)) {
        OrthoCare.setStatus(cStatus, 'err', 'Some details need fixing. Check the highlighted fields and send again.');
        OrthoCare.toast('Check the highlighted fields.', 'error');
        return;
      }
      var payload = OrthoCare.formData(contact);
      var btn = contact.querySelector('button[type="submit"]');
      if (!OrthoCare.api.enabled()) {
        OrthoCare.setStatus(cStatus, 'warn', 'Your details look good, but this demo site is not connected to the clinic inbox yet, so nothing was sent. Please call or email the clinic using the details on this page.');
        OrthoCare.toast('Checked. Not sent: no backend connected yet.');
        return;
      }
      btn.disabled = true;
      OrthoCare.api.post('/contacts', payload).then(function () {
        OrthoCare.setStatus(cStatus, 'ok', 'Thanks, ' + payload.name + '. We received your message and will reply by email or phone.');
        OrthoCare.toast('Message sent.');
        contact.reset();
      }).catch(function (err) {
        OrthoCare.setStatus(cStatus, 'err', 'We could not send your message: ' + err.message + ' Please try again or call the clinic.');
        OrthoCare.toast('Message not sent.', 'error');
      }).finally(function () { btn.disabled = false; });
    });
  }
})();
