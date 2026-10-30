/* =========================================================================
   DES-LUX PLAY | js/forms.js   (enquiry.html and contact.html)
   -------------------------------------------------------------------------
   Client-side validation, error messages, AJAX submission and the result
   panels for both forms.

   Contents
   1. Validation rules
   2. Error display
   3. Wiring a form (blur / input / submit)
   4. Enquiry form: prefill, estimate, result panel
   5. Contact form: compiled e-mail, result panel
   ========================================================================= */
(function () {
  'use strict';

  var DLP = window.DLP;
  var h = DLP.h, $ = DLP.$, $$ = DLP.$$;

  var MAX_FILE_BYTES = 2 * 1024 * 1024; /* 2 MB */

  /* -----------------------------------------------------------------------
     1. Validation rules
     Each control may carry data-validate="name|email|phone|date". Required,
     minlength and maxlength are read from the normal HTML5 attributes so the
     markup and the script can never disagree.
     ----------------------------------------------------------------------- */
  function labelText(el) {
    var label = $('label[for="' + el.id + '"]');
    if (!label) return 'This field';
    return label.textContent.replace(/\(optional\)/i, '').replace(/[:*]/g, '').trim();
  }

  /* Add whole business days (Mon-Fri), used for the turnaround check */
  function addBusinessDays(from, days) {
    var d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    while (days > 0) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) days--;
    }
    return d;
  }

  function isoDate(d) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  var typeRules = {
    name: function (v) {
      return /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F '.\u2019-]*$/.test(v)
        ? '' : 'Please use letters only (spaces, hyphens and apostrophes are fine).';
    },
    email: function (v) {
      return DLP.isEmail(v) ? '' : 'Please enter a valid e-mail address, for example jane@example.com.';
    },
    phone: function (v) {
      /* South African numbers: 0821234567 or +27821234567 once spaces, dashes
         and brackets are removed. */
      var digits = v.replace(/[\s\-()]/g, '');
      return /^(?:\+27|0)[1-9]\d{8}$/.test(digits)
        ? '' : 'Please enter a South African number such as 082 123 4567 or +27 82 123 4567.';
    },
    date: function (v, el) {
      var picked = new Date(v + 'T00:00:00');
      if (isNaN(picked)) return 'Please choose a valid date.';
      if (el.min && v < el.min) {
        return 'Our shortest turnaround is ' + DLP.TURNAROUND.min + ' business days. Please choose ' +
          new Date(el.min + 'T00:00:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) + ' or later.';
      }
      return '';
    }
  };

  function validate(el) {
    if (el.type === 'file') {
      var file = el.files && el.files[0];
      if (!file) return '';
      if (file.type.indexOf('image/') !== 0) return 'Please choose an image file (JPG, PNG, WebP or GIF).';
      if (file.size > MAX_FILE_BYTES) return 'That image is larger than 2 MB. Please choose a smaller one.';
      return '';
    }

    var value = el.value.trim();
    var label = labelText(el);

    if (el.required && !value) {
      return el.tagName === 'SELECT' ? 'Please choose an option for ' + label + '.' : label + ' is required.';
    }
    if (!value) return '';

    var min = Number(el.getAttribute('minlength'));
    var max = Number(el.getAttribute('maxlength'));
    if (min && value.length < min) return label + ' must be at least ' + min + ' characters (you have ' + value.length + ').';
    if (max && value.length > max) return label + ' must be ' + max + ' characters or fewer.';

    var rule = typeRules[el.dataset.validate];
    return rule ? rule(value, el) : '';
  }

  /* -----------------------------------------------------------------------
     2. Error display
     ----------------------------------------------------------------------- */
  function errorBox(el) {
    var id = el.id + '-error';
    var box = document.getElementById(id);
    if (!box) {
      box = h('p', { class: 'field-error', id: id });
      el.insertAdjacentElement('afterend', box);
      var described = el.getAttribute('aria-describedby');
      el.setAttribute('aria-describedby', described ? described + ' ' + id : id);
    }
    return box;
  }

  function showResult(el) {
    var message = validate(el);
    var box = errorBox(el);
    box.textContent = message;
    if (message) {
      el.setAttribute('aria-invalid', 'true');
      el.classList.add('is-invalid');
    } else {
      el.removeAttribute('aria-invalid');
      el.classList.remove('is-invalid');
    }
    return !message;
  }

  /* -----------------------------------------------------------------------
     3. Wiring a form
     ----------------------------------------------------------------------- */
  function controls(form) {
    return $$('input, select, textarea', form).filter(function (el) {
      return el.name && el.name !== '_gotcha' && el.type !== 'hidden' && el.type !== 'submit';
    });
  }

  function wire(form, onSuccess) {
    var fields = controls(form);
    var touched = new WeakSet();
    var status = $('.form-status', form);
    var submit = $('button[type="submit"]', form);
    var submitLabel = submit.textContent;

    /* Turn off the browser's own bubbles so our messages are the only ones.
       Added by script, so a visitor without JavaScript still gets the
       HTML5 validation from the required/pattern attributes. */
    form.noValidate = true;

    /* Live character counters on textareas */
    $$('textarea[maxlength]', form).forEach(function (area) {
      var counter = h('p', { class: 'char-count', id: area.id + '-count' });
      area.insertAdjacentElement('afterend', counter);
      var update = function () { counter.textContent = area.value.length + ' / ' + area.maxLength + ' characters'; };
      area.addEventListener('input', update);
      form.addEventListener('reset', function () { setTimeout(update, 0); });
      update();
    });

    form.addEventListener('focusout', function (e) {
      if (fields.indexOf(e.target) === -1) return;
      touched.add(e.target);
      showResult(e.target);
    });

    form.addEventListener('input', function (e) {
      if (touched.has(e.target)) showResult(e.target);
    });
    form.addEventListener('change', function (e) {
      if (fields.indexOf(e.target) !== -1) { touched.add(e.target); showResult(e.target); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstBad = null;
      fields.forEach(function (el) {
        touched.add(el);
        if (!showResult(el) && !firstBad) firstBad = el;
      });
      if (firstBad) {
        status.textContent = 'Please fix the highlighted fields and try again.';
        status.className = 'form-status is-error';
        firstBad.focus();
        return;
      }

      if (form.elements._gotcha && form.elements._gotcha.value) return; /* honeypot: bots only */

      status.textContent = '';
      status.className = 'form-status';
      submit.disabled = true;
      submit.textContent = 'Sending...';

      DLP.sendForm(form).then(function (res) {
        submit.disabled = false;
        submit.textContent = submitLabel;
        if (!res.ok) {
          status.textContent = res.error;
          status.className = 'form-status is-error';
          return;
        }
        onSuccess(res);
      });
    });

    form.addEventListener('reset', function () {
      fields.forEach(function (el) {
        el.removeAttribute('aria-invalid');
        el.classList.remove('is-invalid');
        var box = document.getElementById(el.id + '-error');
        if (box) box.textContent = '';
      });
      status.textContent = '';
      status.className = 'form-status';
    });
  }

  /* Plain object of what the visitor typed (the file itself is left out) */
  function readValues(form) {
    var out = {};
    controls(form).forEach(function (el) {
      if (el.type === 'file') return;
      out[el.name] = el.value.trim();
    });
    return out;
  }

  function optionText(select) {
    return select.options[select.selectedIndex].text;
  }

  function mailto(subject, lines) {
    return 'mailto:' + DLP.EMAIL_TO + '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\r\n'));
  }

  function money(n) { return 'R' + n.toLocaleString('en-US'); }

  function swapToResult(form, panel) {
    form.hidden = true;
    panel.hidden = false;
    panel.focus();
  }

  function backToForm(form, panel) {
    form.reset();
    form.hidden = false;
    panel.hidden = true;
    var first = controls(form)[0];
    if (first) first.focus();
  }

  /* -----------------------------------------------------------------------
     4. Enquiry form
     ----------------------------------------------------------------------- */
  var enquiry = $('#enquiryForm');
  if (enquiry) {
    var enqPanel = $('#enquiry-result');

    /* products.html links here with ?toy=unicorn - preselect that option */
    var toy = new URLSearchParams(window.location.search).get('toy');
    var typeSelect = $('#enq-type');
    if (toy && typeSelect.querySelector('option[value="' + toy + '"]')) typeSelect.value = toy;

    /* "Needed by" cannot be sooner than the shortest turnaround */
    var needed = $('#enq-needed');
    needed.min = isoDate(addBusinessDays(new Date(), DLP.TURNAROUND.min));

    wire(enquiry, function (res) {
      var d = readValues(enquiry);
      var estimate = DLP.ESTIMATES[d.size];
      var deposit = Math.round(estimate * DLP.DEPOSIT_PERCENT / 100);

      /* Budget values look like "500-800" or "1200+" */
      var range = d.budget.split(/[-+]/);
      var low = Number(range[0]);
      var high = d.budget.indexOf('+') !== -1 ? Infinity : Number(range[1]);
      var budgetNote;
      if (estimate > high) {
        budgetNote = 'The estimate is above your chosen budget. Mention it when you reply and we can suggest ways to bring it down, such as a smaller size.';
      } else if (estimate < low) {
        budgetNote = 'The estimate is below your budget, which leaves room for extras like embroidery or a personalised message.';
      } else {
        budgetNote = 'The estimate fits inside your chosen budget.';
      }

      var availability = 'We are taking custom orders now. Turnaround is ' + DLP.TURNAROUND.min + '\u2013' +
        DLP.TURNAROUND.max + ' business days.';
      if (d.needed_by && d.needed_by < isoDate(addBusinessDays(new Date(), DLP.TURNAROUND.max))) {
        availability += ' Your date is inside our longest turnaround, so we will confirm whether we can make it.';
      }

      var subject = 'Custom toy enquiry from ' + d.full_name;
      var lines = [
        'Name: ' + d.full_name, 'Email: ' + d.email, 'Phone: ' + d.phone, '',
        'Toy type: ' + optionText(enquiry.elements.toy_type),
        'Size: ' + optionText(enquiry.elements.size),
        'Colours: ' + (d.colours || 'not specified'),
        'Budget: ' + optionText(enquiry.elements.budget),
        'Needed by: ' + (d.needed_by || 'no date given'), '',
        'Description:', d.message || '(none)'
      ];

      enqPanel.replaceChildren(
        h('h3', { id: 'enquiry-result-title' }, 'Thank you, ' + d.full_name.split(' ')[0] + '. Here is your estimate.'),
        res.demo ? h('p', { class: 'demo-note' }, 'Demo mode: this site is not connected to a form service yet, so nothing has been sent. Use the e-mail button below to send your enquiry.') : h('p', null, 'Your enquiry has been sent. We will reply to ' + d.email + ' with a formal quote.'),
        h('dl', { class: 'result-list' },
          h('dt', null, 'Your toy'), h('dd', null, optionText(enquiry.elements.toy_type) + ', ' + optionText(enquiry.elements.size)),
          h('dt', null, 'Indicative price'), h('dd', null, 'From ' + money(estimate)),
          h('dt', null, 'Budget'), h('dd', null, budgetNote),
          h('dt', null, 'Availability'), h('dd', null, availability),
          h('dt', null, 'To confirm'), h('dd', null, DLP.DEPOSIT_PERCENT + '% deposit (' + money(deposit) + ')')),
        h('p', { class: 'fine-print' }, 'This is an estimate only. The final price depends on the design, materials and embroidery.'),
        h('div', { class: 'result-actions' },
          h('a', { class: 'cta', href: mailto(subject, lines) }, 'E-mail this enquiry to us'),
          h('button', { type: 'button', class: 'btn-quiet', id: 'enquiry-again' }, 'Start another enquiry')));

      $('#enquiry-again').addEventListener('click', function () { backToForm(enquiry, enqPanel); });
      swapToResult(enquiry, enqPanel);
    });
  }

  /* -----------------------------------------------------------------------
     5. Contact form
     ----------------------------------------------------------------------- */
  var contact = $('#contactForm');
  if (contact) {
    var conPanel = $('#contact-result');

    wire(contact, function (res) {
      var d = readValues(contact);
      var typeLabel = optionText(contact.elements.message_type);
      var subject = '[Des-Lux Play] ' + typeLabel + ' from ' + d.name;
      var lines = [
        'Name: ' + d.name, 'Email: ' + d.email, 'Phone: ' + (d.phone || 'not given'),
        'Message type: ' + typeLabel, '', d.message
      ];

      conPanel.replaceChildren(
        h('h3', { id: 'contact-result-title' }, res.demo ? 'Your message is ready to send' : 'Thank you, your message has been sent'),
        res.demo
          ? h('p', { class: 'demo-note' }, 'Demo mode: this site is not connected to a form service yet, so nothing has been sent. Check the e-mail below and send it from your own e-mail app.')
          : h('p', null, 'We will reply to ' + d.email + ' within 24\u201348 hours. A copy of your message is below.'),
        h('dl', { class: 'result-list' },
          h('dt', null, 'To'), h('dd', null, DLP.EMAIL_TO),
          h('dt', null, 'Subject'), h('dd', null, subject),
          h('dt', null, 'Message'), h('dd', { class: 'preformatted' }, lines.join('\n'))),
        h('div', { class: 'result-actions' },
          h('a', { class: 'cta', href: mailto(subject, lines) }, 'Open in my e-mail app'),
          h('button', { type: 'button', class: 'btn-quiet', id: 'contact-again' }, 'Write another message')));

      $('#contact-again').addEventListener('click', function () { backToForm(contact, conPanel); });
      swapToResult(contact, conPanel);
    });
  }
})();
