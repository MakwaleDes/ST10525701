/* =========================================================================
   DES-LUX PLAY | js/site.js
   -------------------------------------------------------------------------
   Behaviour shared by every page.

   Contents
   1. Helpers (DOM builder, e-mail check, AJAX sender)
   2. Header search
   3. Newsletter sign-up
   4. Count-up numbers
   5. Accordion
   6. Tabs
   7. Gallery lightbox
   ========================================================================= */
(function () {
  'use strict';

  var DLP = window.DLP;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* -----------------------------------------------------------------------
     1. Helpers
     ----------------------------------------------------------------------- */

  /* Tiny element builder: h('p', {class: 'x'}, 'text', childNode).
     Strings are added with createTextNode, so user input can never be
     interpreted as HTML (this is what keeps the result panels XSS-safe). */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (attrs[key] === false || attrs[key] == null) return;
      el.setAttribute(key, attrs[key] === true ? '' : attrs[key]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var kid = arguments[i];
      if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === 'object' ? kid : document.createTextNode(kid));
    }
    return el;
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  /* AJAX submit. Resolves to {ok, demo, error}. Never throws. */
  function sendForm(form) {
    if (DLP.DEMO) {
      return new Promise(function (resolve) {
        setTimeout(function () { resolve({ ok: true, demo: true }); }, 600);
      });
    }
    return fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    }).then(function (res) {
      if (res.ok) return { ok: true, demo: false };
      return res.json().then(function (body) {
        var msg = body && body.errors ? body.errors.map(function (e) { return e.message; }).join(', ') : '';
        return { ok: false, error: msg || 'The server could not accept the form. Please try again.' };
      }, function () {
        return { ok: false, error: 'The server could not accept the form. Please try again.' };
      });
    }, function () {
      return { ok: false, error: 'Network error. Please check your connection and try again.' };
    });
  }

  DLP.h = h;
  DLP.$ = $;
  DLP.$$ = $$;
  DLP.isEmail = isEmail;
  DLP.sendForm = sendForm;
  DLP.reduceMotion = reduceMotion;

  /* -----------------------------------------------------------------------
     2. Header search
     On products.html, products.js takes over and filters live. On every other
     page the form simply performs a GET to products.html?q=..., so it works
     even without JavaScript. Here we only stop empty searches.
     ----------------------------------------------------------------------- */
  var searchForm = $('.site-search');
  var searchInput = $('#site-search');
  if (searchForm && searchInput && !$('#product-grid')) {
    searchForm.addEventListener('submit', function (e) {
      if (!searchInput.value.trim()) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  /* -----------------------------------------------------------------------
     3. Newsletter sign-up (sidebar of every page)
     ----------------------------------------------------------------------- */
  var news = $('#newsletterForm');
  if (news) {
    var newsEmail = $('input[type="email"]', news);
    var newsStatus = $('.form-status', news);
    var newsBtn = $('button[type="submit"]', news);
    /* Our own message replaces the browser's bubble (set by script, so the
       HTML5 required check still applies when JavaScript is off). */
    news.noValidate = true;

    function say(text, ok) {
      newsStatus.textContent = text;
      newsStatus.className = 'form-status ' + (ok ? 'is-success' : 'is-error');
    }

    news.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = newsEmail.value.trim();
      if (!isEmail(value)) {
        newsEmail.setAttribute('aria-invalid', 'true');
        say('Please enter a valid e-mail address, for example jane@example.com.', false);
        newsEmail.focus();
        return;
      }
      newsEmail.removeAttribute('aria-invalid');
      if (news.elements._gotcha && news.elements._gotcha.value) return; /* honeypot: bots only */

      newsBtn.disabled = true;
      newsBtn.textContent = 'Subscribing...';
      sendForm(news).then(function (res) {
        newsBtn.disabled = false;
        newsBtn.textContent = 'Subscribe';
        if (res.ok) {
          say(res.demo ? 'Thank you! (Demo mode: no mailing service is connected yet.)' : 'Thank you for subscribing!', true);
          news.reset();
        } else {
          say(res.error, false);
        }
      });
    });
  }

  /* -----------------------------------------------------------------------
     4. Count-up numbers
     <strong class="count-up" data-count-to="50000" data-prefix="R" data-suffix="+">
     The real number stays in the HTML, so it is correct without JavaScript.
     ----------------------------------------------------------------------- */
  function formatCount(n, el) {
    return (el.dataset.prefix || '') + Math.round(n).toLocaleString('en-US') + (el.dataset.suffix || '');
  }

  function runCount(el) {
    var target = Number(el.dataset.countTo);
    if (!target || reduceMotion) return;
    var duration = 1400;
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatCount(target * eased, el);
      if (t < 1) requestAnimationFrame(frame);
    }
    el.textContent = formatCount(0, el);
    requestAnimationFrame(frame);
  }

  var counters = $$('.count-up');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (c) { seen.observe(c); });
    }
  }

  /* -----------------------------------------------------------------------
     5. Accordion  (WAI-ARIA accordion pattern)
     ----------------------------------------------------------------------- */
  function setOpen(trigger, open) {
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.classList.toggle('is-open', open);
    /* "inert" removes collapsed content from the tab order and the
       accessibility tree, which the CSS height animation alone would not. */
    if (open) panel.removeAttribute('inert'); else panel.setAttribute('inert', '');
  }

  $$('[data-accordion]').forEach(function (root) {
    var triggers = $$('.accordion-trigger', root);

    root.addEventListener('click', function (e) {
      var trigger = e.target.closest('.accordion-trigger');
      if (!trigger) return;
      setOpen(trigger, trigger.getAttribute('aria-expanded') !== 'true');
    });

    root.addEventListener('keydown', function (e) {
      var i = triggers.indexOf(document.activeElement);
      if (i === -1) return;
      var next = null;
      if (e.key === 'ArrowDown') next = triggers[(i + 1) % triggers.length];
      if (e.key === 'ArrowUp') next = triggers[(i - 1 + triggers.length) % triggers.length];
      if (e.key === 'Home') next = triggers[0];
      if (e.key === 'End') next = triggers[triggers.length - 1];
      if (next) { e.preventDefault(); next.focus(); }
    });
  });

  /* -----------------------------------------------------------------------
     6. Tabs  (WAI-ARIA tabs pattern, automatic activation)
     ----------------------------------------------------------------------- */
  $$('[data-tabs]').forEach(function (root) {
    var tabs = $$('[role="tab"]', root);

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(tab);
        var target = null;
        if (e.key === 'ArrowRight') target = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') target = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') target = tabs[0];
        if (e.key === 'End') target = tabs[tabs.length - 1];
        if (target) { e.preventDefault(); select(target, true); }
      });
    });
  });

  /* -----------------------------------------------------------------------
     7. Gallery lightbox
     Gallery buttons carry data-lightbox; the <dialog id="lightbox"> is in the
     page. <dialog>.showModal() supplies the focus trap, Esc to close and the
     dimmed backdrop; we add previous / next and arrow-key support.
     ----------------------------------------------------------------------- */
  var box = $('#lightbox');
  var items = $$('[data-lightbox]');
  if (box && items.length) {
    var boxImg = $('img', box);
    var boxCaption = $('figcaption', box);
    var boxCount = $('.lb-count', box);
    var current = 0;

    function show(index) {
      current = (index + items.length) % items.length;
      var thumb = $('img', items[current]);
      boxImg.src = thumb.currentSrc || thumb.src;
      boxImg.alt = thumb.alt;
      boxCaption.textContent = items[current].dataset.caption || thumb.alt;
      boxCount.textContent = (current + 1) + ' of ' + items.length;
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () {
        show(i);
        box.showModal();
      });
    });

    $('.lb-prev', box).addEventListener('click', function () { show(current - 1); });
    $('.lb-next', box).addEventListener('click', function () { show(current + 1); });
    $('.lb-close', box).addEventListener('click', function () { box.close(); });

    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });

    /* A click on the dark backdrop (the dialog element itself) closes it */
    box.addEventListener('click', function (e) {
      if (e.target === box) box.close();
    });
  }

})();
