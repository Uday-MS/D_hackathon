// FloodWatch – final robust main.js (paste as app/static/js/main.js)
(() => {

  const DEMO_LAT = 12.9716, DEMO_LON = 77.6411, MAP_ZOOM = 13;

  // Robust $: accepts 'id' or element
  const $ = (sel) => {
    if (!sel) return null;
    if (typeof sel === 'string') {
      const id = sel.startsWith('#') ? sel.slice(1) : sel;
      return document.getElementById(id);
    }
    return sel instanceof Element ? sel : null;
  };

  // Safe fetch helpers
  async function fetchJSON(url, opts = {}) {
    try {
      const r = await fetch(url, opts);
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      console.warn('fetchJSON error:', e);
      return null;
    }
  }
  async function fetchTEXT(url) {
    try {
      const r = await fetch(url);
      if (!r.ok) return null;
      return await r.text();
    } catch (e) {
      console.warn('fetchTEXT error:', e);
      return null;
    }
  }

  // ============================================================
  // HOME PAGE MAP + RISK SYSTEM
  // ============================================================

  function initHomeMap() {
    const mapEl = $('map');
    if (!mapEl) return;

    const map = L.map('map').setView([DEMO_LAT, DEMO_LON], MAP_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const bounds = [
      [DEMO_LAT + 0.05, DEMO_LON - 0.08],
      [DEMO_LAT - 0.05, DEMO_LON + 0.08]
    ];

    const tileUrl = '/static/assets/sample_satellite/tile_dry_1.jpg';
    const maskUrl = '/static/assets/sample_satellite/mask_overlay_1.png';

    // base tile
    fetchTEXT(tileUrl).then(t => { if (t) L.imageOverlay(tileUrl, bounds).addTo(map); });

    // overlay (static first, fallback to /api/overlay)
    fetchTEXT(maskUrl).then(m => {
      if (m) {
        const overlay = L.imageOverlay(maskUrl, bounds, { opacity: 0.55 }).addTo(map);

        const toggle = $('toggleOverlay');
        if (toggle) toggle.addEventListener('change', e => {
          if (e.target.checked) overlay.addTo(map);
          else overlay.remove();
        });

        const op = $('overlayOpacity');
        if (op) op.addEventListener('input', e => overlay.setOpacity(e.target.value));

      } else {
        const fallback = '/api/overlay/mask_overlay_1.png';
        fetchTEXT(fallback).then(apiMask => {
          if (apiMask) L.imageOverlay(fallback, bounds, { opacity: 0.55 }).addTo(map);
        });
      }
    });

    L.circleMarker([DEMO_LAT, DEMO_LON], {
      radius: 7,
      color: '#0066ff',
      fillOpacity: 0.9
    })
      .addTo(map)
      .bindPopup("You are here");
  }

  // ============================================================
  // SOCIAL FEED
  // ============================================================

  async function loadSocial() {
    const feed = $('socialFeed');
    if (!feed) return;
    feed.innerHTML = '<li class="list-group-item text-muted">Loading…</li>';

    const apiData = await fetchJSON('/api/get_samples');
    if (apiData && apiData.length) {
      feed.innerHTML = '';
      apiData.forEach(r => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `<b>Report:</b> ${r.message || r.msg || JSON.stringify(r)}`;
        li.addEventListener('click', () => li.classList.toggle('verified'));
        feed.appendChild(li);
      });
      return;
    }

    const txt = await fetchTEXT('/static/assets/social_samples.csv') || await fetchTEXT('/data/social_samples.csv');
    if (!txt) {
      feed.innerHTML = '<li class="list-group-item text-muted">No social data found.</li>';
      return;
    }

    feed.innerHTML = '';
    txt.trim().split('\n').slice(1).forEach(line => {
      const parts = line.split(',');
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `<b>Report:</b> ${parts.slice(1).join(', ')}`;
      li.addEventListener('click', () => li.classList.toggle('verified'));
      feed.appendChild(li);
    });
  }

  // ============================================================
  // RISK COMPUTE & DISPLAY
  // ============================================================

  function renderRisk(res) {
    if (!res) return;

    $('riskGauge').innerText = res.risk_score ?? '--';
    $('riskLevel').innerText = res.level ?? '--';

    const rc = $('reasonsContainer');
    rc.innerHTML = '';
    (res.reasons || []).forEach(r => rc.innerHTML += `<div>• ${r}</div>`);

    const sl = $('shelterList');
    if (sl) {
      sl.innerHTML = '';
      (res.shelter_suggestions || []).forEach(s => {
        sl.innerHTML += `
          <div class="shelter-card">
            <b>${s.name}</b>
            <div class="small text-muted">${(s.distance_km || 0).toFixed(2)} km • ${s.capacity}</div>
            <button class="btn btn-sm btn-outline-primary mt-2"
              onclick="window.open('https://www.google.com/maps/dir/?api=1&origin=${DEMO_LAT},${DEMO_LON}&destination=${s.lat},${s.lon}','_blank')">
              Navigate
            </button>
          </div>`;
      });
    }
  }

  async function computeRisk() {
    $('riskGauge').innerText = '…';
    const res = await fetchJSON('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: DEMO_LAT, lon: DEMO_LON, messages: [] })
    });
    if (res) renderRisk(res);
    else $('riskGauge').innerText = '--';
  }

  // ============================================================
  // SHELTERS PAGE
  // ============================================================

  async function initShelterPage() {
    if (!window.SHOW_SHELTER_PAGE) return;

    const mapEl = $('shelterMap');
    const cardsEl = $('shelterCards');
    if (!mapEl || !cardsEl) return;

    const map = L.map('shelterMap').setView([DEMO_LAT, DEMO_LON], MAP_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const shelters = await fetchJSON('/api/get_shelters');
    if (!shelters || !shelters.length) {
      cardsEl.innerHTML = '<div class="alert alert-warning">No shelters available.</div>';
      return;
    }

    cardsEl.innerHTML = '';
    const coords = [];

    shelters.forEach(s => {
      if (!isNaN(+s.lat) && !isNaN(+s.lon)) {
        L.marker([+s.lat, +s.lon])
          .addTo(map)
          .bindPopup(`<b>${s.name}</b><br>Capacity: ${s.capacity}<br>Contact: ${s.contact}`);

        coords.push([+s.lat, +s.lon]);
      }

      cardsEl.innerHTML += `
        <div class="card my-2 p-2">
          <b>${s.name}</b>
          <div class="small text-muted">${s.capacity} seats • ${s.contact}</div>
          <button class="btn btn-sm btn-outline-primary mt-2"
            onclick="window.open('https://maps.google.com/?q=${s.lat},${s.lon}','_blank')">
            Navigate
          </button>
        </div>`;
    });

    if (coords.length > 1) {
      try { map.fitBounds(coords, { padding: [50, 50] }); } catch (e) {}
    }
  }

  // ============================================================
  // ADMIN PAGE
  // ============================================================

  async function initAdminPage() {
    if (!window.SHOW_ADMIN_PAGE) return;

    const tbody = document.querySelector("#respondersTable tbody");
    if (!tbody) return;

    let txt = await fetchTEXT("/static/assets/responders.csv");
    if (!txt) txt = await fetchTEXT("/data/responders.csv");

    if (!txt) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-muted">No responders.csv found</td></tr>`;
      return;
    }

    const rows = txt.trim().split("\n").slice(1);
    tbody.innerHTML = "";

    rows.forEach(r => {
      const c = r.split(",");
      tbody.innerHTML += `
        <tr>
          <td>${c[0]}</td>
          <td>${c[1]}</td>
          <td>${c[2]}</td>
          <td>${c[3]}</td>
          <td>${c[4]}</td>
          <td>${c[5]}</td>
          <td>${c[6]}</td>
          <td><button class="btn btn-sm btn-success">Test</button></td>
        </tr>
      `;
    });
  }

  // ============================================================
  // LOGS PAGE
  // ============================================================

  async function initLogsPage() {
    if (!window.SHOW_LOGS_PAGE) return;

    const c = $('logsContainer');
    if (!c) return;

    const txt = await fetchTEXT("/logs/sos_log.json") || await fetchTEXT("/static/assets/sos_log.json");

    c.innerText = txt || "No logs available.";
  }

  // ============================================================
  // SOS HOLD-TO-CONFIRM
  // ============================================================

  function initSOS() {
    const btn = $('sosButton');
    if (!btn) return;

    let timer = null;

    const start = (ev) => {
      ev.preventDefault?.();
      timer = setTimeout(() => {
        const modal = new bootstrap.Modal($('sosModal'));
        modal.show();

        $('confirmSosBtn').onclick = async () => {
          $('sosModalProgress').innerText = 'Notifying responders…';

          const res = await fetchJSON('/api/send_sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: DEMO_LAT, lon: DEMO_LON,
              name: "DemoUser",
              contact: "+910000000"
            })
          });

          $('sosModalProgress').innerText = 'Done!';
          $('sosStatus').innerText = 'SOS sent successfully';
        };
      }, 1200);
    };

    const cancel = () => { if (timer) clearTimeout(timer); };

    btn.addEventListener('mousedown', start);
    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('pointerdown', start);

    ['mouseup', 'mouseleave', 'touchend', 'pointerup', 'pointerleave']
      .forEach(ev => btn.addEventListener(ev, cancel));
  }

  // ============================================================
  // VOICE ASSISTANT
  // ============================================================

  function initVoice() {
    const btn = $('voiceBtn');
    if (!btn) return;

    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      btn.onclick = () => alert("Voice not supported");
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.interimResults = false;

    rec.onresult = async (ev) => {
      const text = ev.results[0][0].transcript;

      const res = await fetchJSON('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: DEMO_LAT, lon: DEMO_LON, messages: [text] })
      });

      if (res) renderRisk(res);
    };

    btn.onclick = () => rec.start();
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    window.speechSynthesis.speak(u);
  }

  // ============================================================
  // BOOT
  // ============================================================

  document.addEventListener('DOMContentLoaded', async () => {
    initHomeMap();
    await loadSocial();
    await initShelterPage();
    await initAdminPage();
    await initLogsPage();
    initSOS();
    initVoice();

    const computeBtn = $('computeBtn');
    if (computeBtn) computeBtn.addEventListener('click', computeRisk);

    const alertBtn = $('alertBtn');
    if (alertBtn) alertBtn.addEventListener('click', () => alert('Simulated alert sent'));

    await computeRisk();
  });

})();
