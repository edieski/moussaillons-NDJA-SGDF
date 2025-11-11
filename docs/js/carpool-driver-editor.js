// Enhances driver cards with a full editor (name, phone, kid/adult seats, trip mode, time pref, points, comments)
// Works alongside carpool-ui.js by observing driver lists and attaching form controls per .driver-drop-zone
(function () {
  const LOG = '[DriverEditor]';

  function ready(cb) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(cb, 0);
    else document.addEventListener('DOMContentLoaded', cb);
  }

  function getSelectedOutingId() {
    const sel = document.getElementById('carpoolOutingSelect');
    return sel && sel.value ? sel.value : null;
  }

  function findDriverObject(driverId) {
    try {
      const tripId = getSelectedOutingId();
      if (!tripId || !window.CarpoolManager || !window.CarpoolManager.getDrivers) return null;
      const drivers = window.CarpoolManager.getDrivers(tripId) || [];
      return drivers.find(d => ('' + d.id) === ('' + driverId));
    } catch (_) { return null; }
  }

  function normalize(val) { return (val ?? '').toString(); }
  function num(val, def = 0) { const n = parseInt(val, 10); return Number.isNaN(n) ? def : n; }
  function esc(val) { return normalize(val).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function attachEditor(zone) {
    try {
      if (zone.querySelector('.driver-full-editor')) return;
      const driverId = zone.dataset.driverId;
      const direction = zone.dataset.direction || 'outbound';
      const driver = findDriverObject(driverId);
      if (!driver) return;

      // Count assigned in this zone (direction-aware UI already rendered)
      const assignedCount = zone.querySelectorAll('.passenger-delete-btn').length;

      const fields = {
        name: driver.name || driver.parentName || '',
        phone: driver.phone || driver.parentPhone || '',
        kidSpots: num(driver.kid_spots || driver.seats_available || driver.childSeats || 0, 0),
        adultSpots: num(driver.adult_spots || driver.adultSeats || 0, 0),
        roundTrip: driver.roundTrip || driver.round_trip || 'aller-retour',
        timePref: driver.timePreference || driver.time_preference || '',
        departure: driver.departurePoint || '',
        arrival: driver.arrivalPoint || '',
        comments: driver.comments || ''
      };

      const html = `
        <div class="driver-full-editor" style="margin-bottom:0.75rem;">
          <div class="driver-full-editor-bar" style="display:flex;gap:0.5rem;align-items:center;">
            <button type="button" class="fey-btn driver-edit-toggle" style="background:#607D8B; padding: 0.3rem 0.6rem; font-size:0.85rem;">✏️ Modifier la voiture</button>
          </div>
          <div class="driver-full-edit-form" style="display:none; border:2px dashed var(--c-ink-900); border-radius:var(--r-sm); padding:0.5rem; margin-top:0.5rem;">
            <div style="display:grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap:0.5rem;">
              <label>👤 Nom
                <input type="text" class="driver-name-input" value="${esc(fields.name)}" style="width:100%; padding:0.3rem; border:2px solid var(--c-ink-900); border-radius:var(--r-sm);" />
              </label>
              <label>📱 Téléphone
                <input type="tel" class="driver-phone-input" value="${esc(fields.phone)}" style="width:100%; padding:0.3rem; border:2px solid var(--c-ink-900); border-radius:var(--r-sm);" />
              </label>
              <label>🪑 Places enfants
                <input type="number" min="${assignedCount}" class="driver-kid-spots-input" value="${fields.kidSpots}" style="width:100%; padding:0.3rem; border:2px solid var(--c-ink-900); border-radius:var(--r-sm);" />
              </label>
              <label>👨‍👩‍👧 Places adultes
                <input type="number" min="0" class="driver-adult-spots-input" value="${fields.adultSpots}" style="width:100%; padding:0.3rem; border:2px solid var(--c-ink-900); border-radius:var(--r-sm);" />
              </label>
              <label>🚦 Trajet
                <select class="driver-roundtrip-input" style="width:100%; padding:0.3rem; border:2px solid var(--c-ink-900); border-radius:var(--r-sm);">
                  <option value="aller-retour" ${fields.roundTrip==='aller-retour'?'selected':''}>Aller & Retour</option>
                  <option value="aller-seulement" ${fields.roundTrip==='aller-seulement'?'selected':''}>Aller seulement</option>
                  <option value="retour-seulement" ${fields.roundTrip==='retour-seulement'?'selected':''}>Retour seulement</option>
                </select>
              </label>
              <label>⏰ Préférence horaire
                <input type="text" class="driver-timepref-input" value="${esc(fields.timePref)}" style="width:100%; padding:0.3rem; border:2px solid var(--c-ink-900); border-radius:var(--r-sm);" />
              </label>
              <label>📍 Départ
                <input type="text" class="driver-departure-input" value="${esc(fields.departure)}" style="width:100%; padding:0.3rem; border:2px solid var(--c-ink-900); border-radius:var(--r-sm);" />
              </label>
              <label>📍 Arrivée
                <input type="text" class="driver-arrival-input" value="${esc(fields.arrival)}" style="width:100%; padding:0.3rem; border:2px solid var(--c-ink-900); border-radius:var(--r-sm);" />
              </label>
              <label>💬 Commentaires
                <input type="text" class="driver-comments-input" value="${esc(fields.comments)}" style="width:100%; padding:0.3rem; border:2px solid var(--c-ink-900); border-radius:var(--r-sm);" />
              </label>
            </div>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
              <button type="button" class="fey-btn driver-save-full-btn" data-driver-id="${driverId}" style="background:#4CAF50; padding: 0.3rem 0.6rem; font-size:0.85rem;">💾 Enregistrer</button>
              <button type="button" class="fey-btn driver-cancel-full-btn" style="background:#BDBDBD; padding: 0.3rem 0.6rem; font-size:0.85rem;">Annuler</button>
              <span style="font-size:0.8rem; color:#555;">(assignés: ${assignedCount})</span>
            </div>
          </div>
        </div>
      `;

      zone.insertAdjacentHTML('afterbegin', html);

      const form = zone.querySelector('.driver-full-edit-form');
      const toggle = zone.querySelector('.driver-edit-toggle');
      const cancel = zone.querySelector('.driver-cancel-full-btn');
      const save = zone.querySelector('.driver-save-full-btn');

      const nameInput = zone.querySelector('.driver-name-input');
      const phoneInput = zone.querySelector('.driver-phone-input');
      const kidInput = zone.querySelector('.driver-kid-spots-input');
      const adultInput = zone.querySelector('.driver-adult-spots-input');
      const rtInput = zone.querySelector('.driver-roundtrip-input');
      const timeInput = zone.querySelector('.driver-timepref-input');
      const depInput = zone.querySelector('.driver-departure-input');
      const arrInput = zone.querySelector('.driver-arrival-input');
      const comInput = zone.querySelector('.driver-comments-input');

      toggle.addEventListener('click', () => {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
      });
      cancel.addEventListener('click', () => { form.style.display = 'none'; });
      save.addEventListener('click', async (e) => {
        const kidVal = num(kidInput.value, 0);
        const assigned = zone.querySelectorAll('.passenger-delete-btn').length;
        if (kidVal < assigned) { alert(`Impossible: ${assigned} enfant(s) déjà assigné(s). Réduisez d'abord les passagers.`); return; }
        try {
          await window.CarpoolManager.updateDriver(driverId, {
            name: nameInput.value,
            parentName: nameInput.value,
            phone: phoneInput.value,
            parentPhone: phoneInput.value,
            kid_spots: kidVal,
            seats_available: kidVal,
            childSeats: kidVal,
            adult_spots: num(adultInput.value, 0),
            adultSeats: num(adultInput.value, 0),
            roundTrip: rtInput.value,
            round_trip: rtInput.value,
            timePreference: timeInput.value,
            time_preference: timeInput.value,
            departurePoint: depInput.value,
            arrivalPoint: arrInput.value,
            comments: comInput.value
          });
          // Force a refresh of the outing data
          try { if (window.loadOutingData) await window.loadOutingData(true); } catch(_) {}
          form.style.display = 'none';
          if (window.notify) notify('Voiture mise à jour', 'success');
          console.log(LOG, 'driver updated', { driverId });
        } catch (err) {
          console.error(LOG, 'update failed', err);
          if (window.notify) notify('Impossible de mettre à jour la voiture', 'error');
        }
      });
    } catch (e) {
      console.warn(LOG, 'attachEditor failed', e);
    }
  }

  function scanAndAttach(container) {
    if (!container) return;
    container.querySelectorAll('.driver-drop-zone').forEach(attachEditor);
  }

  function observeTargets() {
    const targets = [
      document.getElementById('carpoolDriversListOutbound'),
      document.getElementById('carpoolDriversListReturn')
    ];
    targets.forEach(t => {
      if (!t) return;
      const obs = new MutationObserver(() => scanAndAttach(t));
      obs.observe(t, { childList: true, subtree: true });
      scanAndAttach(t);
    });
  }

  ready(() => {
    if (!window.CarpoolManager || !document.getElementById('carpoolDriversListOutbound')) {
      // Try again shortly if UI not ready yet
      setTimeout(observeTargets, 500);
    } else {
      observeTargets();
    }
  });
})();

