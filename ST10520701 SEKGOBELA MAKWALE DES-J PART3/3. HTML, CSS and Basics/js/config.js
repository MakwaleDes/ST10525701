/* =========================================================================
   DES-LUX PLAY | js/config.js
   -------------------------------------------------------------------------
   Every value the site owner may need to change lives here, so nobody has
   to hunt through the other scripts. Loaded first on every page.
   ========================================================================= */
window.DLP = {

  /* Where the forms are sent (AJAX).
     1. Create a free form at https://formspree.io
     2. Replace YOUR_FORM_ID below AND in the three <form action="..."> tags
        (enquiry.html, contact.html and the newsletter box in each sidebar).
     While the placeholder is still here the site runs in DEMO mode: forms
     validate and show their results, but nothing is sent to a server. */
  FORM_ENDPOINT: 'https://formspree.io/f/YOUR_FORM_ID',

  /* The recipient of the compiled e-mails on the contact and enquiry pages */
  EMAIL_TO: 'info@desluxplay.co.za',

  /* Business-day turnaround quoted in the sidebar of the enquiry page */
  TURNAROUND: { min: 7, max: 14 },

  /* Indicative starting prices (ZAR) used for the instant enquiry estimate.
     Only "Custom Creations start at R500" comes from the brief; the larger
     sizes are placeholders - the owner must confirm them. */
  ESTIMATES: { small: 500, medium: 700, large: 1000, xlarge: 1400 },

  /* Deposit quoted on the enquiry page (percentage of the estimate) */
  DEPOSIT_PERCENT: 50
};

window.DLP.DEMO = window.DLP.FORM_ENDPOINT.indexOf('YOUR_FORM_ID') !== -1;
