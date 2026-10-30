/* =========================================================================
   DES-LUX PLAY | js/map.js   (contact.html only)
   -------------------------------------------------------------------------
   Interactive Leaflet map with OpenStreetMap tiles. The marker positions
   are read from the location cards in the HTML (data-lat / data-lng), so
   the page and the map can never disagree.

   Features
   - one marker per store, each with a popup and a Google Maps link
   - "Show on map" buttons that fly to a store
   - "Find my nearest store" using the browser's geolocation
   ========================================================================= */
(function () {
  'use strict';

  var DLP = window.DLP;
  var h = DLP.h, $ = DLP.$, $$ = DLP.$$;

  var mapEl = $('#map');
  if (!mapEl) return;

  /* If the Leaflet script was blocked or offline, say so and offer links
     instead of leaving an empty grey box. */
  if (typeof window.L === 'undefined') {
    mapEl.classList.add('map-failed');
    mapEl.replaceChildren(h('p', null, 'The interactive map could not be loaded. Use the links in each location below to open it in Google Maps.'));
    return;
  }

  var L = window.L;
  var cards = $$('[data-store]');
  var stores = cards.map(function (card) {
    return {
      name: card.dataset.name,
      lat: Number(card.dataset.lat),
      lng: Number(card.dataset.lng),
      address: $('address', card).innerText.replace(/\s*\n\s*/g, ', '),
      card: card
    };
  });

  var map = L.map(mapEl, { scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  /* Gold stitched-pin marker drawn in CSS (no image files to load) */
  var pin = L.divIcon({
    className: 'store-pin',
    html: '<span></span>',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34]
  });

  function googleMapsUrl(store) {
    return 'https://www.google.com/maps/search/?api=1&query=' + store.lat + ',' + store.lng;
  }

  stores.forEach(function (store) {
    /* Popup content is built from DOM nodes, never from an HTML string */
    var popup = h('div', { class: 'map-popup' },
      h('strong', null, store.name),
      h('p', null, store.address),
      h('a', { href: googleMapsUrl(store), target: '_blank', rel: 'noopener' }, 'Open in Google Maps'));

    store.marker = L.marker([store.lat, store.lng], { icon: pin, title: store.name, alt: store.name })
      .addTo(map)
      .bindPopup(popup);

    var link = $('.map-link', store.card);
    if (link) link.href = googleMapsUrl(store);
  });

  map.fitBounds(L.latLngBounds(stores.map(function (s) { return [s.lat, s.lng]; })), { padding: [50, 50] });

  /* Scroll-wheel zoom stays off so the page can still scroll; enable it
     once the visitor has clicked into the map. */
  map.on('focus', function () { map.scrollWheelZoom.enable(); });
  map.on('blur', function () { map.scrollWheelZoom.disable(); });

  function goTo(store) {
    if (DLP.reduceMotion) map.setView([store.lat, store.lng], 13, { animate: false });
    else map.flyTo([store.lat, store.lng], 13, { duration: 1.2 });
    store.marker.openPopup();
  }

  $$('[data-show-on-map]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var store = stores.filter(function (s) { return s.card.id === btn.dataset.showOnMap; })[0];
      if (!store) return;
      goTo(store);
      mapEl.scrollIntoView({ behavior: DLP.reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
  });

  /* Nearest store (haversine distance, in kilometres) */
  function distanceKm(a, b) {
    var rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad;
    var dLng = (b.lng - a.lng) * rad;
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  var nearBtn = $('#find-nearest');
  var nearOut = $('#nearest-result');
  if (nearBtn) {
    if (!('geolocation' in navigator)) {
      nearBtn.hidden = true;
    } else {
      nearBtn.addEventListener('click', function () {
        nearOut.textContent = 'Finding your location...';
        navigator.geolocation.getCurrentPosition(function (pos) {
          var here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          var ranked = stores.map(function (s) { return { store: s, km: distanceKm(here, s) }; })
            .sort(function (a, b) { return a.km - b.km; });
          var best = ranked[0];
          nearOut.textContent = 'Your nearest store is ' + best.store.name + ', about ' + Math.round(best.km) + ' km away.';
          goTo(best.store);
        }, function () {
          nearOut.textContent = 'We could not get your location. You can still pick a store from the list below.';
        }, { timeout: 10000 });
      });
    }
  }
})();
