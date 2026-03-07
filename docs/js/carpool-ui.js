(function () {
    'use strict';

    const LOG_PREFIX = '[CarpoolUI]';

    const state = {
        outings: [],
        selectedOutingId: null,
        drivers: [],
        passengers: [],
        participants: [],
        adultParticipants: [],
        roster: [],
        registrations: [],
        confirmedRoster: [],
        confirmedRosterMap: new Map(),
        loading: false
    };

    const dom = {};

    const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    const dateFormatterNoTime = new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'medium'
    });

    const DIRECTION_LABELS = Object.freeze({
        outbound: 'Aller',
        return: 'Retour',
        'round-trip': 'Aller & Retour'
    });

    function notify(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            const logger = type === 'error' ? console.error : console.log;
            logger(`${LOG_PREFIX} ${message}`);
        }
    }

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalizeName(name) {
        if (window.ScoutsRoster && typeof window.ScoutsRoster.resolve === 'function') {
            return window.ScoutsRoster.resolve(name);
        }
        return (name || '').toString().trim().toUpperCase();
    }

    function normalizeDirection(value, options = {}) {
        const allowRoundTrip = options.allowRoundTrip ?? false;
        const defaultDirection = options.defaultDirection ?? 'outbound';

        if (window.CarpoolManager && typeof window.CarpoolManager.normalizeDirection === 'function') {
            return window.CarpoolManager.normalizeDirection(value, {
                allowRoundTrip,
                defaultDirection
            });
        }

        const raw = (value || '').toString().trim().toLowerCase();
        if (!raw) {
            return defaultDirection;
        }

        if (raw === 'outbound' || raw === 'aller' || raw === 'aller-seulement' || raw === 'aller_only') {
            return 'outbound';
        }

        if (raw === 'return' || raw === 'retour' || raw === 'retour-seulement' || raw === 'retour_only') {
            return 'return';
        }

        if (allowRoundTrip && (raw === 'round-trip' || raw === 'roundtrip' || raw === 'round_trip' || raw === 'aller-retour')) {
            return 'round-trip';
        }

        return defaultDirection;
    }

    function formatPhoneForCsv(value) {
        if (!value && value !== 0) return '';
        const stringValue = value.toString().trim();
        if (!stringValue) return '';
        return `\t${stringValue}`;
    }

    function titleCase(name) {
        if (!name) return '';
        return name.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
    }

    function rebuildConfirmedRoster(registrations) {
        const confirmedEntries = [];
        const confirmedMap = new Map();

        if (Array.isArray(registrations) && registrations.length) {
            registrations
                .filter(record => record && record.parent_confirmed)
                .forEach(record => {
                    const normalized = normalizeName(record.scout_name);
                    if (!normalized) {
                        return;
                    }

                    if (confirmedMap.has(normalized)) {
                        const existing = confirmedMap.get(normalized);
                        if (!existing.child_id && record.child_id) {
                            existing.child_id = record.child_id;
                            existing.record = record;
                        }
                        return;
                    }

                    const rosterMatch = state.roster.find(entry => normalizeName(entry.value || entry.label) === normalized) || null;
                    const displayLabel = rosterMatch ? rosterMatch.label : titleCase(record.scout_name || normalized);
                    const canonicalValue = rosterMatch ? rosterMatch.value : normalized;

                    const entry = {
                        normalized,
                        value: canonicalValue,
                        label: displayLabel,
                        child_id: record.child_id || null,
                        record
                    };

                    confirmedEntries.push(entry);
                    confirmedMap.set(normalized, entry);
                });
        }

        state.confirmedRoster = confirmedEntries;
        state.confirmedRosterMap = confirmedMap;
    }

    function getConfirmedEntry(normalized) {
        if (!normalized) return null;
        return state.confirmedRosterMap.get(normalized) || null;
    }

    function toIso(value) {
        if (!value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }

    function normalizeId(value) {
        return value == null ? null : String(value);
    }

    function escapeCsv(value) {
        const stringValue = value == null ? '' : String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    function downloadCsv(filename, rows) {
        if (!Array.isArray(rows) || rows.length === 0) {
            return;
        }
        const csvBody = rows.map(row => row.map(escapeCsv).join(',')).join('\r\n');
        const csvContent = `\uFEFF${csvBody}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function findSelectedOuting() {
        if (!state.selectedOutingId) return null;
        const target = state.selectedOutingId.toString();
        return state.outings.find(outing => {
            const candidates = [outing.id, outing.slug];
            return candidates.some(value => value != null && value.toString() === target);
        }) || null;
    }

    function getSelectedOutingLabel() {
        const outing = findSelectedOuting();
        if (outing) {
            return formatOutingLabel(outing) || outing.title || outing.name || 'Sortie';
        }
        if (dom.outingSelect) {
            const option = dom.outingSelect.options[dom.outingSelect.selectedIndex];
            if (option) {
                return option.textContent || option.value || 'Sortie';
            }
        }
        return 'Sortie';
    }

    function getDriverDirectionLabel(driver) {
        const outbound = typeof CarpoolManager?.isDriverOutbound === 'function'
            ? CarpoolManager.isDriverOutbound(driver)
            : true;
        const ret = typeof CarpoolManager?.isDriverReturn === 'function'
            ? CarpoolManager.isDriverReturn(driver)
            : true;
        if (outbound && ret) return 'Aller & Retour';
        if (outbound) return 'Aller seulement';
        if (ret) return 'Retour seulement';
        return 'Trajet non précisé';
    }

    function formatPassengerDirectionLabel(passenger) {
        const direction = getPassengerDirection(passenger);
        return DIRECTION_LABELS[direction] || 'Trajet';
    }

    function formatOutingLabel(outing) {
        if (!outing) {
            return '';
        }
        let label = outing.title;
        if (outing.startDate) {
            label += ` — ${dateFormatterNoTime.format(outing.startDate)}`;
        }
        return label;
    }

    function formatOutingMeta(outing) {
        if (!outing) {
            return '';
        }
        // Fallbacks to raw row fields when normalized props are empty
        const raw = outing.raw || {};
        const startDate = outing.startDate || (outing.startAt ? new Date(outing.startAt) : (raw.start_at ? new Date(raw.start_at) : null));
        const endDate = outing.endDate || (outing.endAt ? new Date(outing.endAt) : (raw.end_at ? new Date(raw.end_at) : null));
        const start = startDate && !isNaN(startDate) ? dateFormatter.format(startDate) : ' définir';
        const end = endDate && !isNaN(endDate) ? dateFormatter.format(endDate) : null;

        const location = outing.location || raw.location || '';
        const meetingPoint = outing.meetingPoint || raw.meeting_point || '';
        const departure = outing.departureDetails || raw.departure_details || '';
        const ret = outing.returnDetails || raw.return_details || '';
        const notes = (outing.notes || raw.notes || '').toString().trim();

        const isCarpoolPage = typeof window !== 'undefined' && /carpool-link\.html$/i.test(window.location?.pathname || '');
        const editLink = isCarpoolPage
            ? `<a href="index.html#admin-outings" class="fey-btn" style="display: inline-block; margin-top: 0.75rem; font-size: 0.9rem; padding: 0.5rem 1rem; background: #FF9800; color: white; text-decoration: none; border-radius: var(--r-sm, 8px); border: 2px solid var(--c-ink-900, #1a1a1a);">✏️ Modifier les infos (Admin)</a>`
            : '';

        const metaGrid = `
            <div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div style="background: rgba(255,255,255,0.85); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem;">
                        <strong>🗓️ Dates</strong><br>
                        ${end ? `${start}<br>${end}` : start}
                    </div>
                    <div style="background: rgba(255,255,255,0.85); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem;">
                        <strong>📍 Lieu</strong><br>
                        ${escapeHtml(location || ' préciser')}
                    </div>
                    <div style="background: rgba(255,255,255,0.85); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem;">
                        <strong>📍 Rendez-vous</strong><br>
                        ${escapeHtml(meetingPoint || ' préciser')}
                    </div>
                    <div style="background: rgba(255,255,255,0.85); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem;">
                        <strong>🚗 Infos départ</strong><br>
                        ${escapeHtml(departure || ' préciser')}<br>
                        <em>Retour :</em> ${escapeHtml(ret || ' préciser')}
                    </div>
                </div>
                ${editLink}
            </div>
        `;

        const notesBlock = notes
            ? `
            <div class="fey-note" style="margin-top: 0.75rem; background: linear-gradient(135deg, #FFFDE7, #FFF9C4); border-left: 4px solid #FBC02D;">
                <strong>📝 Notes organisateur</strong><br>
                ${escapeHtml(notes)}
            </div>
            `
            : '';

        return metaGrid + notesBlock;
    }

    function escapeHtml(value) {
        return (value ?? '').toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function initRoster() {
        if (window.ScoutsRoster && typeof window.ScoutsRoster.getEntries === 'function') {
            state.roster = window.ScoutsRoster.getEntries();
        } else {
            state.roster = [];
        }
 
        const childSelect = dom.passengerChildSelect;
        if (!childSelect) {
            return;
        }
 
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Sélectionnez une sortie pour afficher les enfants confirmés';
        childSelect.innerHTML = '';
        childSelect.appendChild(placeholder);
    }

    function updateConfirmedChildSelect() {
        const childSelect = dom.passengerChildSelect;
        if (!childSelect) {
            return;
        }

        const fragment = document.createDocumentFragment();
        const defaultOption = document.createElement('option');
        defaultOption.value = '';

        if (!state.selectedOutingId) {
            defaultOption.textContent = 'Sélectionnez une sortie pour afficher les enfants confirmés';
            fragment.appendChild(defaultOption);
            childSelect.innerHTML = '';
            childSelect.appendChild(fragment);
            return;
        }

        if (!state.confirmedRoster.length) {
            defaultOption.textContent = 'Aucun enfant confirmé pour cette sortie';
            fragment.appendChild(defaultOption);
            childSelect.innerHTML = '';
            childSelect.appendChild(fragment);
            return;
        }

        defaultOption.textContent = 'Choisir un enfant...';
        fragment.appendChild(defaultOption);

        state.confirmedRoster
            .slice()
            .sort((a, b) => a.label.localeCompare(b.label))
            .forEach(entry => {
                const option = document.createElement('option');
                option.value = entry.value;
                option.textContent = entry.label;
                fragment.appendChild(option);
            });

        childSelect.innerHTML = '';
        childSelect.appendChild(fragment);
    }

    function renderOutingOptions() {
        const select = dom.outingSelect;
        select.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Choisir une sortie...';
        select.appendChild(placeholder);

        state.outings.forEach(outing => {
            const option = document.createElement('option');
            option.value = normalizeId(outing.id) || (outing.slug || '');
            option.textContent = formatOutingLabel(outing);
            // Store raw title/slug to help find selection from URL query
            try {
                option.dataset.title = outing.title || '';
                option.dataset.slug = (outing.slug || '').toString();
            } catch (e) {}
            select.appendChild(option);
        });

        select.value = state.selectedOutingId || '';
        console.debug(LOG_PREFIX, 'Options rendues', {
            count: state.outings.length,
            selectedId: state.selectedOutingId,
            sample: state.outings.slice(0,3).map(o => ({ id: o.id, title: o.title }))
        });
    }

    function renderOutingMeta() {
        const container = dom.outingMeta;
        if (!container) return;

        // Ensure we have a selected id from the DOM if missing
        if (!state.selectedOutingId && dom.outingSelect) {
            state.selectedOutingId = dom.outingSelect.value || null;
        }

        // Try to resolve the selected outing by id first
        let outing = state.outings.find(item => normalizeId(item.id) === normalizeId(state.selectedOutingId));

        // If not found, try to match by the visible option label (title)
        if (!outing && dom.outingSelect) {
            const selectedLabel = dom.outingSelect.options[dom.outingSelect.selectedIndex]?.textContent?.trim() || '';
            if (selectedLabel) {
                const lc = selectedLabel.toLowerCase();
                outing = state.outings.find(o => (o.title || '').toLowerCase() === lc) ||
                         state.outings.find(o => (o.title || '').toLowerCase().includes(lc));
            }
        }

        // Debug log to help diagnose empty fields
        try {
            if (outing) {
                console.debug('[carpool-ui] renderOutingMeta match', {
                    id: outing.id,
                    title: outing.title,
                    location: outing.location || outing.raw?.location,
                    meeting_point: outing.meetingPoint || outing.raw?.meeting_point,
                    departure_details: outing.departureDetails || outing.raw?.departure_details,
                    return_details: outing.returnDetails || outing.raw?.return_details
                });
            } else {
                console.warn('[carpool-ui] renderOutingMeta: no outing matched', {
                    selectedId: state.selectedOutingId,
                    selectedIndex: dom.outingSelect?.selectedIndex,
                    selectedText: dom.outingSelect?.options?.[dom.outingSelect.selectedIndex]?.textContent
                });
            }
        } catch (_) {}
        if (!outing) {
            container.style.display = 'none';
            container.innerHTML = '';
            return;
        }

        container.innerHTML = formatOutingMeta(outing);
        container.style.display = 'block';
    }

    function setFormsEnabled(enabled) {
        const forms = [dom.driverForm, dom.passengerForm];
        forms.forEach(form => {
            if (!form) return;
            Array.from(form.elements).forEach(element => {
                if (element.name === 'roundTrip') return;
                element.disabled = !enabled && element.type !== 'hidden';
            });
        });
    }

    function clearLists() {
        if (dom.driversListOutbound) {
            dom.driversListOutbound.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Sélectionnez une sortie</div>';
        }
        if (dom.driversListReturn) {
            dom.driversListReturn.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Sélectionnez une sortie</div>';
        }
        if (dom.unassignedOutbound) {
            dom.unassignedOutbound.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Sélectionnez une sortie</div>';
        }
        if (dom.unassignedReturn) {
            dom.unassignedReturn.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Sélectionnez une sortie</div>';
        }
        if (dom.summaryCard) {
            dom.summaryCard.style.display = 'none';
        }
        if (dom.passengerDriverSelect) {
            dom.passengerDriverSelect.innerHTML = '<option value="">Je n\'ai pas encore de conducteur</option>';
        }
        updateExportButtonState();
    }

    async function loadConfirmedRegistrations(force = false) {
        if (!window.RegistrationsService || !state.selectedOutingId) {
            state.registrations = [];
            state.confirmedRoster = [];
            state.confirmedRosterMap = new Map();
            return [];
        }

        try {
            const records = await window.RegistrationsService.list(state.selectedOutingId, { force });
            state.registrations = records || [];
            rebuildConfirmedRoster(state.registrations);
            updateConfirmedChildSelect();
            return state.registrations;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur chargement confirmations`, error);
            notify(error.message || 'Impossible de récupérer les confirmations parents.', 'error');
            state.registrations = [];
            rebuildConfirmedRoster([]);
            updateConfirmedChildSelect();
            return [];
        }
    }

    async function loadOutings(force = false) {
        if (!window.OutingsService) {
            notify('Le service des sorties n\'est pas disponible.', 'error');
            return;
        }

        dom.outingSelect.disabled = true;
        try {
            console.debug(LOG_PREFIX, 'Chargement des sorties depuis Supabase', { force });
            const outings = await OutingsService.list({ force });
            console.debug(LOG_PREFIX, 'Sorties chargées', { count: outings.length });
            // OutingsService.list() already returns normalized outings.
            // Re-running normalizeOuting on those objects would drop fields like startDate/meetingPoint.
            state.outings = outings.map(outing => ({ ...outing }));
            state.outings.sort((a, b) => {
                const at = a.startDate ? a.startDate.getTime() : 0;
                const bt = b.startDate ? b.startDate.getTime() : 0;
                return at - bt;
            });

            // Try to select outing from URL (?outing|outting=<title|slug|id>) before defaulting
            try {
                const url = new URL(window.location.href);
                const qp = url.searchParams.get('outing') || url.searchParams.get('outting');
                console.debug(LOG_PREFIX, 'Paramètre URL outing détecté', { qp });
                if (qp && !state.selectedOutingId) {
                    const lc = qp.toString().toLowerCase();
                    const byId = state.outings.find(o => normalizeId(o.id) === qp);
                    const bySlug = state.outings.find(o => (o.slug || '').toString().toLowerCase() === lc);
                    const byTitle = state.outings.find(o => (o.title || '').toLowerCase() === lc);
                    const byLabel = state.outings.find(o => formatOutingLabel(o).toLowerCase() === lc);
                    const byLabelContains = state.outings.find(o => formatOutingLabel(o).toLowerCase().includes(lc));
                    const match = byId || bySlug || byTitle || byLabel || byLabelContains;
                    if (match) {
                        state.selectedOutingId = normalizeId(match.id) || (match.slug ? match.slug.toString() : null);
                        console.debug(LOG_PREFIX, 'Sortie URL appariée', { matchedId: match.id, title: match.title });
                    } else {
                        console.warn(LOG_PREFIX, 'Aucune sortie ne correspond au paramètre URL', { qp });
                    }
                }
            } catch (e) { console.warn(LOG_PREFIX, 'Analyse URL échouée', e); }

            if (!state.selectedOutingId && state.outings.length) {
                // Pré-sélectionner la prochaine sortie à venir
                const now = Date.now();
                const upcoming = state.outings.find(outing => outing.startDate && outing.startDate.getTime() >= now);
                const selected = upcoming || state.outings[0];
                state.selectedOutingId = normalizeId(selected?.id) || (selected?.slug ? selected.slug.toString() : null);
            }

            renderOutingOptions();
            // Synchronize the select with the chosen outing and force change handling
            if (dom.outingSelect && state.selectedOutingId) {
                dom.outingSelect.value = state.selectedOutingId;
                console.debug(LOG_PREFIX, 'Déclenchement du change pour mise à jour des méta', { selectedId: state.selectedOutingId });
                dom.outingSelect.dispatchEvent(new Event('change'));
            } else {
                console.warn(LOG_PREFIX, 'Aucune sortie sélectionnée après chargement; affichage par défaut');
                renderOutingMeta();
                clearLists();
                setFormsEnabled(false);
            }
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur lors du chargement des sorties`, error);
            notify(error.message || 'Impossible de charger les sorties.', 'error');
        } finally {
            dom.outingSelect.disabled = false;
        }
    }

    async function loadOutingData(force = false) {
        if (!state.selectedOutingId) {
            clearLists();
            setFormsEnabled(false);
            state.registrations = [];
            state.confirmedRoster = [];
            state.confirmedRosterMap = new Map();
            state.passengers = [];
            state.participants = [];
            state.adultParticipants = [];
            updateConfirmedChildSelect();
            return;
        }
 
        setFormsEnabled(true);
        state.loading = true;
        dom.driversListOutbound.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Chargement...</div>';
        dom.driversListReturn.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Chargement...</div>';
        dom.unassignedOutbound.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Analyse...</div>';
        dom.unassignedReturn.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Analyse...</div>';
 
        try {
            const [drivers, passengers, participants, _registrations] = await Promise.all([
                CarpoolManager.loadDrivers(state.selectedOutingId, force),
                CarpoolManager.loadPassengers(state.selectedOutingId, force),
                typeof CarpoolManager.loadParticipants === 'function'
                    ? CarpoolManager.loadParticipants(state.selectedOutingId, force)
                    : Promise.resolve([]),
                loadConfirmedRegistrations(force)
            ]);

            state.drivers = drivers || [];
            state.participants = participants || [];
            state.adultParticipants = (state.participants || []).filter(entry => entry && entry.is_adult);

            const hasConfirmed = state.confirmedRoster.length > 0;
            const confirmedIds = new Set(state.confirmedRoster.map(entry => entry.child_id).filter(Boolean));
            const confirmedNames = new Set(state.confirmedRoster.map(entry => entry.normalized));

            const filteredPassengers = hasConfirmed
                ? (passengers || []).filter(passenger => {
                    const normalized = normalizeName(passenger.child_name || passenger.name);
                    if (passenger.child_id && confirmedIds.size) {
                        return confirmedIds.has(passenger.child_id);
                    }
                    if (confirmedNames.size) {
                        return confirmedNames.has(normalized);
                    }
                    return false;
                })
                : [];

            state.passengers = filteredPassengers;
 
            renderDrivers();
            renderUnassigned();
            renderSummary();
            updatePassengerDriverSelect();
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur lors du chargement des données`, error);
            notify(error.message || 'Impossible de récupérer les données de covoiturage.', 'error');
        } finally {
            state.loading = false;
            updateExportButtonState();
        }
    }

    function getPassengerDirection(passenger) {
        return normalizeDirection(passenger?.direction ?? passenger?.roundTrip, {
            allowRoundTrip: true,
            defaultDirection: 'round-trip'
        });
    }

    function computeMetrics() {
        const drivers = state.drivers;
        const passengers = state.passengers;
 
        const driverMap = new Map();
        const totalSeats = drivers.reduce((sum, driver) => {
            driverMap.set(normalizeId(driver.id), driver);
            const ks = driver.kid_spots ?? driver.seats_available ?? 0;
            const isLogistics = driver.is_logistics === true || (ks || 0) <= 0;
            if (isLogistics) {
                return sum;
            }
            return sum + ks;
        }, 0);
        let totalSeatsOutbound = 0;
        let totalSeatsReturn = 0;
 
        const confirmedEntries = state.confirmedRoster || [];
        const confirmedNames = confirmedEntries.map(entry => entry.normalized);
        const confirmedSet = new Set(confirmedNames);
        const confirmedIds = new Set(confirmedEntries.map(entry => entry.child_id).filter(Boolean));
 
        const registeredNamesSet = new Set();
        let occupiedSeats = 0;
        let occupiedSeatsOutbound = 0;
        let occupiedSeatsReturn = 0;
 
        passengers.forEach(passenger => {
            const normalized = normalizeName(passenger.child_name || passenger.name);
            const childId = passenger.child_id || null;
            const isConfirmed = childId && confirmedIds.size
                ? confirmedIds.has(childId)
                : confirmedSet.has(normalized);
            if (!isConfirmed) {
                return;
            }
 
            registeredNamesSet.add(normalized);
            const hasDriver = passenger.driver_id != null && passenger.driver_id !== '' && passenger.driver_id !== undefined;
            if (!hasDriver) {
                return;
            }

            const driver = driverMap.get(normalizeId(passenger.driver_id));
            if (!driver) {
                return;
            }

            // Ne pas compter les passagers dans les voitures matériel / courses
            const ks = driver.kid_spots ?? driver.seats_available ?? 0;
            const isLogistics = driver.is_logistics === true || (ks || 0) <= 0;
            if (isLogistics) {
                return;
            }

            occupiedSeats += 1;
            if (CarpoolManager.isDriverOutbound(driver) && CarpoolManager.passengerMatchesDirection(passenger, 'outbound')) {
                occupiedSeatsOutbound += 1;
            }
            if (CarpoolManager.isDriverReturn(driver) && CarpoolManager.passengerMatchesDirection(passenger, 'return')) {
                occupiedSeatsReturn += 1;
            }
        });
 
        drivers.forEach(driver => {
            const seats = driver.kid_spots ?? driver.seats_available ?? 0;
            const isLogistics = driver.is_logistics === true || (seats || 0) <= 0;
            if (isLogistics) {
                return;
            }
            if (CarpoolManager.isDriverOutbound(driver)) {
                totalSeatsOutbound += seats;
            }
            if (CarpoolManager.isDriverReturn(driver)) {
                totalSeatsReturn += seats;
            }
        });
 
        const trackedNames = confirmedNames;
        const registeredNames = Array.from(registeredNamesSet);
 
        const remainingSeats = Math.max(0, totalSeats - occupiedSeats);
        const remainingSeatsOutbound = Math.max(0, totalSeatsOutbound - occupiedSeatsOutbound);
        const remainingSeatsReturn = Math.max(0, totalSeatsReturn - occupiedSeatsReturn);
 
        const assignedOutboundSet = new Set();
        const assignedReturnSet = new Set();
 
        passengers.forEach(passenger => {
            const normalized = normalizeName(passenger.child_name || passenger.name);
            if (!confirmedSet.has(normalized) && !(passenger.child_id && confirmedIds.has(passenger.child_id))) {
                return;
            }
 
            const hasDriver = passenger.driver_id != null && passenger.driver_id !== '' && passenger.driver_id !== undefined;
            if (!hasDriver) {
                return;
            }
 
            if (CarpoolManager.passengerMatchesDirection(passenger, 'outbound')) {
                assignedOutboundSet.add(normalized);
            }
            if (CarpoolManager.passengerMatchesDirection(passenger, 'return')) {
                assignedReturnSet.add(normalized);
            }
        });
 
        const unassignedOutboundRegistered = registeredNames.filter(name => !assignedOutboundSet.has(name));
        const unassignedReturnRegistered = registeredNames.filter(name => !assignedReturnSet.has(name));
 
        const unassignedOutbound = trackedNames.filter(name => !assignedOutboundSet.has(name));
        const unassignedReturn = trackedNames.filter(name => !assignedReturnSet.has(name));
 
        return {
            totalSeats,
            occupiedSeats,
            remainingSeats,
            trackedCount: trackedNames.length,
            registeredCount: registeredNames.length,
            unassignedOutboundRegistered,
            unassignedReturnRegistered,
            unassignedOutbound,
            unassignedReturn,
            totalSeatsOutbound,
            totalSeatsReturn,
            occupiedSeatsOutbound,
            occupiedSeatsReturn,
            remainingSeatsOutbound,
            remainingSeatsReturn
        };
    }

    function renderSummary() {
        const container = dom.summaryContent;
        if (!container) return;

        const metrics = computeMetrics();

        // Update detailed logistics summary if present
        updateLogisticsSummary(metrics);

        const activePassengerDrivers = (state.drivers || []).filter(driver => {
            const ks = driver.kid_spots ?? driver.seats_available ?? 0;
            const isLogistics = driver.is_logistics === true || (ks || 0) <= 0;
            return !isLogistics;
        }).length;

        const stats = [
            { label: 'Voitures actives', value: activePassengerDrivers, color: '#4CAF50' },
            { label: 'Places Aller', value: metrics.totalSeatsOutbound, color: '#2196F3' },
            { label: 'Places Retour', value: metrics.totalSeatsReturn, color: '#1976D2' },
            { label: 'Restantes Aller', value: metrics.remainingSeatsOutbound, color: '#9C27B0' },
            { label: 'Restantes Retour', value: metrics.remainingSeatsReturn, color: '#6A1B9A' },
            { label: 'Enfants inscrits', value: metrics.trackedCount, color: '#FF9800' },
            { label: 'Sans voiture Aller', value: metrics.unassignedOutbound.length, color: '#E91E63' },
            { label: 'Sans voiture Retour', value: metrics.unassignedReturn.length, color: '#3F51B5' }
        ];

        container.innerHTML = stats.map(stat => `
            <div style="padding: 1rem; border-radius: var(--r-sm); border: 2px solid var(--c-ink-900); background: ${stat.color}; color: white; text-align: center;">
                <div style="font-size: 1.8rem; font-weight: bold;">${stat.value}</div>
                <div style="font-size: 0.9rem;">${stat.label}</div>
            </div>
        `).join('');

        dom.summaryCard.style.display = 'block';
        updateExportButtonState();
    }

    function updateLogisticsSummary(metrics) {
        const kidsFill = dom.kidsProgressFill;
        const kidsLabel = dom.kidsProgressLabel;
        const kidsCaption = dom.kidsProgressCaption;
        const logisticsFill = dom.logisticsProgressFill;
        const logisticsLabel = dom.logisticsProgressLabel;
        const logisticsCaption = dom.logisticsProgressCaption;

        if (!kidsFill || !kidsLabel || !kidsCaption || !logisticsFill || !logisticsLabel || !logisticsCaption) {
            return;
        }

        const resetBars = () => {
            kidsFill.style.transform = 'scaleX(0)';
            kidsLabel.textContent = '0 / 0';
            kidsCaption.textContent = 'En attente des confirmations parents et des affectations de voitures.';
            logisticsFill.style.transform = 'scaleX(0)';
            logisticsLabel.textContent = '0 / 3';
            logisticsCaption.textContent = 'Objectif : jusqu\'à 3 voitures dédiées au matériel, sans enfants.';
        };

        if (!state.selectedOutingId) {
            resetBars();
            return;
        }

        const totalKids = metrics.trackedCount || 0;

        if (!totalKids) {
            kidsFill.style.transform = 'scaleX(0)';
            kidsLabel.textContent = '0 / 0';
            kidsCaption.textContent = 'Aucun enfant encore confirmé pour cette sortie.';
        } else {
            const fullyAssignedCount = totalKids - Math.max(
                metrics.unassignedOutbound.length,
                metrics.unassignedReturn.length
            );
            const ratio = Math.max(0, Math.min(1, totalKids ? fullyAssignedCount / totalKids : 0));

            kidsFill.style.transform = `scaleX(${ratio.toFixed(3)})`;
            kidsLabel.textContent = `${fullyAssignedCount} / ${totalKids}`;

            if (fullyAssignedCount === totalKids && totalKids > 0) {
                kidsCaption.textContent = 'Tous les enfants confirmés ont une voiture pour l\'aller et le retour.';
            } else {
                const remaining = totalKids - fullyAssignedCount;
                kidsCaption.textContent = `${remaining} enfant(s) confirmé(s) à placer encore dans une voiture (aller et/ou retour).`;
            }
        }

        const drivers = state.drivers || [];
        const outboundLogistics = drivers.filter(driver => {
            const ks = driver.kid_spots ?? driver.seats_available ?? 0;
            const isLogistics = driver.is_logistics === true || (ks || 0) <= 0;
            return isLogistics && CarpoolManager.isDriverOutbound(driver);
        });
        const returnLogistics = drivers.filter(driver => {
            const ks = driver.kid_spots ?? driver.seats_available ?? 0;
            const isLogistics = driver.is_logistics === true || (ks || 0) <= 0;
            return isLogistics && CarpoolManager.isDriverReturn(driver);
        });

        const maxPerDirection = 3;
        const totalMax = maxPerDirection * 2;
        const totalCount = outboundLogistics.length + returnLogistics.length;
        const logisticsRatio = Math.max(0, Math.min(1, totalCount / totalMax));

        logisticsFill.style.transform = `scaleX(${logisticsRatio.toFixed(3)})`;
        logisticsLabel.textContent = `${Math.min(totalCount, totalMax)} / ${totalMax}`;

        if (totalCount === 0) {
            logisticsCaption.textContent = 'Aucune voiture matériel déclarée pour le moment.';
        } else if (outboundLogistics.length < maxPerDirection || returnLogistics.length < maxPerDirection) {
            logisticsCaption.textContent = `${outboundLogistics.length} voiture(s) matériel Aller, ${returnLogistics.length} voiture(s) matériel Retour. Objectif : 3 dans chaque sens.`;
        } else {
            logisticsCaption.textContent = 'Objectif atteint : 3 voitures matériel/courses pour l\'aller et 3 pour le retour.';
        }
    }

    function buildCarpoolCsvRows() {
        if (!state.selectedOutingId) return [];
        const outingLabel = getSelectedOutingLabel();
        const header = ['Sortie', 'Enfant', 'Conducteur', 'Téléphone conducteur', 'Trajet(s)', 'Parent/Tuteur', 'Téléphone parent', 'Notes'];
        const rows = [header];

        const drivers = state.drivers || [];
        const passengers = state.passengers || [];
        const driverMap = new Map(drivers.map(driver => [normalizeId(driver.id), driver]));

        const byNormalized = (entry) => entry?.normalized || '';

        const resolvePassengersForChild = (childId, normalizedName) => {
            return passengers.filter(passenger => {
                if (childId && passenger.child_id) {
                    return CarpoolManager.sameId(passenger.child_id, childId);
                }
                const passengerNormalized = normalizeName(passenger.child_name || passenger.name);
                return passengerNormalized === normalizedName;
            });
        };

        const buildRowForChild = (label, normalizedName, childId) => {
            const relatedPassengers = resolvePassengersForChild(childId, normalizedName);
            const directions = new Set();
            let chosenPassenger = null;

            const priorityOrder = ['round-trip', 'outbound', 'return'];

            relatedPassengers.forEach(passenger => {
                directions.add(formatPassengerDirectionLabel(passenger));
                if (!chosenPassenger && passenger.driver_id) {
                    chosenPassenger = passenger;
                }
            });

            if (!chosenPassenger) {
                chosenPassenger = priorityOrder
                    .map(direction => relatedPassengers.find(passenger => getPassengerDirection(passenger) === direction))
                    .find(Boolean) || null;
            }

            const driver = chosenPassenger?.driver_id ? driverMap.get(normalizeId(chosenPassenger.driver_id)) : null;
            const directionLabel = directions.size
                ? Array.from(directions).sort((a, b) => a.localeCompare(b)).join(' / ')
                : 'Non attribué';

            rows.push([
                outingLabel,
                label,
                driver?.name || 'Non assigné',
                formatPhoneForCsv(driver?.phone),
                directionLabel,
                chosenPassenger?.guardian_name || '',
                formatPhoneForCsv(chosenPassenger?.guardian_phone),
                chosenPassenger?.notes || ''
            ]);
        };

        const processedKeys = new Set();

        state.confirmedRoster
            .slice()
            .sort((a, b) => a.label.localeCompare(b.label))
            .forEach(entry => {
                const normalized = byNormalized(entry);
                const key = entry.child_id ? `id:${entry.child_id}` : `name:${normalized}`;
                if (key) processedKeys.add(key);
                if (normalized) processedKeys.add(normalized);
                buildRowForChild(entry.label, normalized, entry.child_id || null);
            });

        passengers.forEach(passenger => {
            const normalized = normalizeName(passenger.child_name || passenger.name);
            const key = passenger.child_id ? `id:${passenger.child_id}` : `name:${normalized}`;
            if (processedKeys.has(key) || (normalized && processedKeys.has(normalized))) {
                return;
            }
            processedKeys.add(key);
            const label = titleCase(passenger.child_name || passenger.name || 'Enfant');
            buildRowForChild(label, normalized, passenger.child_id || null);
        });

        rows.splice(1, rows.length - 1, ...rows.slice(1).sort((a, b) => a[1].localeCompare(b[1], 'fr', { sensitivity: 'base' })));

        return rows;
    }

    function updateExportButtonState() {
        if (!dom.exportButton) return;
        const hasData = Boolean(state.selectedOutingId) &&
            (
                (state.drivers && state.drivers.length > 0) ||
                (state.passengers && state.passengers.length > 0) ||
                (state.confirmedRoster && state.confirmedRoster.length > 0)
            );
        dom.exportButton.disabled = !hasData;
    }

    function handleCarpoolExport() {
        if (!state.selectedOutingId) {
            notify('Sélectionnez une sortie avant d\'exporter.', 'warning');
            return;
        }
        const rows = buildCarpoolCsvRows();
        if (rows.length <= 1) {
            notify('Aucune donnée à exporter pour cette sortie.', 'info');
            return;
        }
        const outing = findSelectedOuting();
        const slugSource = outing?.slug || outing?.id || outing?.title || state.selectedOutingId || 'covoiturage';
        const slug = slugSource.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        downloadCsv(`covoiturage_${slug}.csv`, rows);
        notify('Export CSV généré.', 'success');
    }

    function renderDrivers() {
        const outboundContainer = dom.driversListOutbound;
        const returnContainer = dom.driversListReturn;
        const logisticsOutboundContainer = dom.logisticsDriversListOutbound;
        const logisticsReturnContainer = dom.logisticsDriversListReturn;

        if (!outboundContainer || !returnContainer) return;

        if (!state.selectedOutingId) {
            clearLists();
            return;
        }

        // Helper function to render a single driver card
        function renderDriverCard(driver, direction) {
            const passengers = state.passengers.filter(passenger => {
                if (!sameId(passenger.driver_id, driver.id)) return false;
                return CarpoolManager.passengerMatchesDirection(passenger, direction);
            });

            const adultEntries = (state.adultParticipants || []).filter(participant => {
                if (!participant || !participant.is_adult) return false;
                if (!sameId(participant.driver_id, driver.id)) return false;
                if (typeof CarpoolManager.participantMatchesDirection === 'function') {
                    return CarpoolManager.participantMatchesDirection(participant, direction);
                }
                const participantDirection = normalizeDirection(participant.direction, {
                    allowRoundTrip: false,
                    defaultDirection: direction
                });
                return participantDirection === direction;
            });

            const kidSpots = driver.kid_spots || driver.seats_available || 0;
            const adultSpots = driver.adult_spots || 0;
            const isLogistics = isLogisticsDriver(driver);
            const effectiveAdultSpots = isLogistics ? 0 : adultSpots;
            const remainingChildSeats = CarpoolManager.getRemainingSeatsForDirection(driver, state.passengers, direction);
            const remainingAdultSeats = Math.max(0, effectiveAdultSpots - adultEntries.length);

            // Dedicated layout for logistics-only cars: no seat counters at all
            if (isLogistics) {
                return `
                    <div class="fey-item driver-drop-zone" data-driver-id="${driver.id}" data-direction="${direction}" style="background: linear-gradient(135deg, #E8F5E8, #C8E6C9); border: 3px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 1.25rem; box-shadow: 0 3px 10px rgba(0,0,0,0.1); transition: all 0.2s; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
                            <div style="flex: 1;">
                                <div style="font-size: 1.3rem; font-weight: bold; color: var(--c-forest-700); margin-bottom: 0.5rem;">
                                    ${direction === 'outbound' ? '🚗 Aller' : '🔙 Retour'} • ${escapeHtml(driver.name || 'Conducteur')}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <span style="font-size: 1.1rem;">📱</span>
                                        <span style="color: var(--c-ink-700); font-size: 0.95rem;">${escapeHtml(driver.phone || 'Pas de numéro')}</span>
                                    </div>
                                    ${driver.notes ? `<div style="font-size: 0.9rem; color: var(--c-ink-700); margin-top: 0.25rem;">${escapeHtml(driver.notes)}</div>` : ''}
                                </div>
                            </div>
                            <div style="text-align: center; background: rgba(255,255,255,0.9); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem; min-width: 200px;">
                                <div style="font-size: 0.95rem; font-weight: 700; color: #F57C00; line-height: 1.4;">
                                    🚚 Voiture matériel / courses<br>
                                    <span style="font-weight: 600; color: var(--c-ink-800);">Aucune place enfant ou adulte</span>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem; padding-top: 0.75rem; border-top: 2px dashed var(--c-ink-900);">
                            <button type="button" class="fey-btn driver-delete-btn" data-driver-id="${driver.id}" style="background: #F44336; padding: 0.65rem 1.25rem;">🗑️ Supprimer la voiture</button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="fey-item driver-drop-zone" data-driver-id="${driver.id}" data-direction="${direction}" style="background: linear-gradient(135deg, #E8F5E8, #C8E6C9); border: 3px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 1.25rem; box-shadow: 0 3px 10px rgba(0,0,0,0.1); transition: all 0.2s; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <div style="font-size: 1.3rem; font-weight: bold; color: var(--c-forest-700); margin-bottom: 0.5rem;">
                                ${direction === 'outbound' ? '🚗 Aller' : '🔙 Retour'} • ${escapeHtml(driver.name || 'Conducteur')}
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="font-size: 1.1rem;">📱</span>
                                    <span style="color: var(--c-ink-700); font-size: 0.95rem;">${escapeHtml(driver.phone || 'Pas de numéro')}</span>
                                </div>
                            </div>
                        </div>
                        <div style="text-align: center; background: rgba(255,255,255,0.9); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem; min-width: 160px;">
                            <div style="font-size: 1.8rem; font-weight: bold; color: var(--c-forest-700); line-height: 1;">${passengers.length}/${kidSpots}</div>
                            <div style="font-size: 0.75rem; color: var(--c-ink-600); margin-top: 0.25rem;">Enfants ${direction === 'outbound' ? 'aller' : 'retour'}</div>
            <div style="margin-top: 0.5rem; font-size: 0.9rem; line-height: 1.4;">
                                <div style="color: var(--c-ink-700); font-weight: 600;">🧑‍🤝‍🧑 ${adultEntries.length}/${effectiveAdultSpots} adultes</div>
                                <div style="color: var(--c-ink-700); font-weight: 600;">👶 ${passengers.length}/${kidSpots} enfants</div>
                            </div>
                            <div style="margin-top: 0.5rem; font-size: 0.9rem; font-weight: bold; color: ${(remainingChildSeats) > 0 ? '#2E7D32' : '#F44336'};">
                                ${remainingChildSeats} place(s) enfant libre(s)
                            </div>
                            <div style="margin-top: 0.25rem; font-size: 0.9rem; font-weight: bold; color: ${(remainingAdultSeats) > 0 ? '#2E7D32' : '#F44336'};">
                                ${remainingAdultSeats} place(s) adulte libre(s)
                            </div>
                            ${isLogistics ? '<div style="margin-top: 0.5rem; font-size: 0.85rem; font-weight: bold; color: #F57C00;">🚚 Voiture matériel / courses (sans enfants)</div>' : ''}
                        </div>
                    </div>
                    <div style="margin-top: 1rem;">
                        <div style="font-weight: bold; font-size: 1.1rem; color: var(--c-forest-700); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>👶</span>
                            <span>Enfants embarqués</span>
                        </div>
                        ${passengers.length ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem;">
                                ${passengers.map(passenger => {
                                    return `
                                        <div style="background: rgba(255,255,255,0.95); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem; position: relative;">
                                            <div style="font-weight: bold; font-size: 1rem; color: var(--c-forest-700); margin-bottom: 0.5rem;">
                                                ${escapeHtml(passenger.child_name || passenger.name || 'Enfant')}
                                            </div>
                                            <div style="font-size: 0.85rem; color: var(--c-ink-700); margin-bottom: 0.5rem;">
                                                ${passenger.guardian_name ? `<div>👨‍👩‍👧 ${escapeHtml(passenger.guardian_name)}</div>` : ''}
                                                ${passenger.guardian_phone ? `<div>📱 ${escapeHtml(passenger.guardian_phone)}</div>` : ''}
                                            </div>
                                            <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
                                                <button type="button" class="fey-btn passenger-delete-btn" data-passenger-id="${passenger.id}" style="background: #F44336; padding: 0.4rem 0.75rem; font-size: 0.9rem;">🗑️ Retirer</button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : '<div class="fey-note" style="margin-top: 0.5rem; padding: 1rem; text-align: center;">Aucun enfant affecté pour le moment.</div>'}
                    </div>
                    <div style="margin-top: 1.5rem;">
                        <div style="font-weight: bold; font-size: 1.1rem; color: var(--c-forest-700); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>🧑‍🤝‍🧑</span>
                            <span>Adultes inscrits</span>
                        </div>
                        ${adultEntries.length ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem;">
                                ${adultEntries.map(participant => {
                                    return `
                                        <div style="background: rgba(255,255,255,0.95); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
                                            <div style="font-weight: bold; font-size: 0.95rem; color: var(--c-forest-700); flex: 1;">
                                                ${escapeHtml(participant.child_name || participant.name || 'Adulte')}
                                            </div>
                                            <button type="button" class="fey-btn adult-remove-btn" data-participant-id="${participant.id}" style="background: #F44336; padding: 0.4rem 0.75rem; font-size: 0.85rem;">🗑️ Retirer</button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : '<div class="fey-note" style="margin-top: 0.5rem; padding: 1rem; text-align: center;">Aucun adulte inscrit pour ce trajet.</div>'}
                        <div style="margin-top: 0.75rem;">
                            ${(!isLogistics && effectiveAdultSpots > 0 && remainingAdultSeats > 0) ? `
                                <form class="adult-add-form" data-driver-id="${driver.id}" data-direction="${direction}" style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
                                    <input type="text" name="adultName" placeholder="Nom de l'adulte" autocomplete="off" required style="flex: 1 1 220px; padding: 0.55rem 0.65rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); font-size: 0.95rem;">
                                    <button type="submit" class="fey-btn adult-add-btn" style="background: #2E7D32; padding: 0.55rem 1rem;">Ajouter un adulte</button>
                                </form>
                            ` : (isLogistics ? `
                                <div class="fey-note adult-no-slot" data-driver-id="${driver.id}" data-direction="${direction}" style="padding: 0.75rem; text-align: center; border: 2px dashed var(--c-ink-900); background: rgba(255,255,255,0.85); color: #F57C00;">
                                    Aucune place adulte disponible (voiture matériel / courses)
                                </div>
                            ` : `
                                <div class="fey-note adult-no-slot" data-driver-id="${driver.id}" data-direction="${direction}" style="padding: 0.75rem; text-align: center; border: 2px dashed var(--c-ink-900); background: rgba(255,255,255,0.85); color: #F44336;">
                                    Aucune place adulte disponible
                                </div>
                            `)}
                            <div class="adult-error-message" data-driver-id="${driver.id}" data-direction="${direction}" style="display: none; margin-top: 0.5rem; color: #F44336; font-weight: bold;"></div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 1rem; padding-top: 1rem; border-top: 2px dashed var(--c-ink-900);">
                        <button type="button" class="fey-btn driver-delete-btn" data-driver-id="${driver.id}" style="background: #F44336; padding: 0.65rem 1.25rem;">🗑️ Supprimer la voiture</button>
                    </div>
                </div>
            `;
        }

        // Helper to detect "voiture matériel / courses"
        function isLogisticsDriver(driver) {
            const ks = driver.kid_spots ?? driver.seats_available ?? 0;
            const notes = (driver.notes || '').toString().toLowerCase();
            const flaggedByNotes = notes.startsWith('voiture matériel/courses');
            return driver.is_logistics === true || (ks || 0) <= 0 || flaggedByNotes;
        }

        // Filter drivers by direction
        const outboundAll = state.drivers.filter(d => CarpoolManager.isDriverOutbound(d));
        const returnAll = state.drivers.filter(d => CarpoolManager.isDriverReturn(d));

        const outboundLogistics = outboundAll.filter(isLogisticsDriver);
        const outboundRegular = outboundAll.filter(d => !isLogisticsDriver(d));

        const returnLogistics = returnAll.filter(isLogisticsDriver);
        const returnRegular = returnAll.filter(d => !isLogisticsDriver(d));

        function buildDriversHtml(regularDrivers, direction) {
            let html = '';

            if (regularDrivers.length) {
                html += regularDrivers.map(d => renderDriverCard(d, direction)).join('');
            }

            return html;
        }

        // Render outbound drivers
        if (!outboundRegular.length && !outboundLogistics.length) {
            outboundContainer.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Aucune voiture pour l\'aller. Proposez la vôtre !</div>';
        } else {
            outboundContainer.innerHTML = buildDriversHtml(outboundRegular, 'outbound');
        }

        if (!logisticsOutboundContainer) return;
        if (!outboundLogistics.length) {
            logisticsOutboundContainer.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Aucune voiture matériel pour l\'aller.</div>';
        } else {
            logisticsOutboundContainer.innerHTML = outboundLogistics.map(d => renderDriverCard(d, 'outbound')).join('');
        }

        // Render return drivers
        if (!returnRegular.length && !returnLogistics.length) {
            returnContainer.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Aucune voiture pour le retour. Proposez la vôtre !</div>';
        } else {
            returnContainer.innerHTML = buildDriversHtml(returnRegular, 'return');
        }

        if (!logisticsReturnContainer) return;
        if (!returnLogistics.length) {
            logisticsReturnContainer.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Aucune voiture matériel pour le retour.</div>';
        } else {
            logisticsReturnContainer.innerHTML = returnLogistics.map(d => renderDriverCard(d, 'return')).join('');
        }

        // Add event listeners (normal + logistique)
        [outboundContainer, returnContainer, logisticsOutboundContainer, logisticsReturnContainer]
            .filter(Boolean)
            .forEach(container => {
            container.querySelectorAll('.passenger-delete-btn').forEach(button => {
                button.addEventListener('click', handlePassengerDelete);
            });

            container.querySelectorAll('.driver-delete-btn').forEach(button => {
                button.addEventListener('click', handleDriverDelete);
            });

            container.querySelectorAll('.driver-drop-zone').forEach(dropZone => {
                dropZone.addEventListener('dragover', handleDriverDragOver);
                dropZone.addEventListener('dragleave', handleDriverDragLeave);
                dropZone.addEventListener('drop', handleDriverDrop);
            });

            container.querySelectorAll('.adult-add-form').forEach(form => {
                form.addEventListener('submit', handleAdultAdd);
            });

            container.querySelectorAll('.adult-remove-btn').forEach(button => {
                button.addEventListener('click', handleAdultRemove);
            });
        });
    }


    /** Retourne les conducteurs ayant au moins une place enfant pour la direction donnée (hors voitures matériel). Les voitures déjà pleines (0 place restante) n’apparaissent pas. */
    function getDriversWithCapacityForDirection(direction) {
        return (state.drivers || []).filter(driver => {
            const ks = driver.kid_spots ?? driver.seats_available ?? 0;
            if ((ks || 0) <= 0) return false;
            if (driver.is_logistics === true) return false;
            const doesOutbound = CarpoolManager.isDriverOutbound(driver);
            const doesReturn = CarpoolManager.isDriverReturn(driver);
            const noDirectionSet = !doesOutbound && !doesReturn;
            const supportsDirection = noDirectionSet || (direction === 'outbound' ? doesOutbound : doesReturn);
            if (!supportsDirection) return false;
            const remaining = CarpoolManager.getRemainingSeatsForDirection(driver, state.passengers, direction);
            return remaining > 0;
        });
    }

    /** Assigne un enfant à une voiture (utilisé par le drop et par le menu "Placer dans une voiture"). */
    async function assignChildToDriver(childId, childName, normalizedChildName, direction, driverId) {
        if (!state.selectedOutingId) {
            notify('Aucune sortie sélectionnée.', 'error');
            return;
        }
        const passengersForChild = state.passengers.filter(passenger => {
            if (!passenger) return false;
            if (childId && passenger.child_id) return sameId(passenger.child_id, childId);
            return normalizeName(passenger.child_name || passenger.name) === normalizedChildName;
        });
        const passengerForDirection = passengersForChild.find(p => getPassengerDirection(p) === direction);
        const roundTripPassenger = passengersForChild.find(p => getPassengerDirection(p) === 'round-trip');

        if (passengerForDirection) {
            if (sameId(passengerForDirection.driver_id, driverId)) {
                notify(`${childName} est déjà dans cette voiture.`, 'info');
            } else {
                await CarpoolManager.updatePassenger(passengerForDirection.id, { driver_id: driverId });
                notify(`${childName} a été assigné(e) à la voiture`, 'success');
            }
            await loadOutingData(true);
            return;
        }
        if (roundTripPassenger) {
            const currentDriverId = roundTripPassenger.driver_id ?? null;
            const hasCurrentDriver = currentDriverId !== null && currentDriverId !== '';
            if (!hasCurrentDriver || sameId(currentDriverId, driverId)) {
                await CarpoolManager.updatePassenger(roundTripPassenger.id, { direction, driver_id: driverId });
                notify(`${childName} a été assigné(e) à la voiture`, 'success');
                await loadOutingData(true);
                return;
            }
            const directionToPreserve = direction === 'outbound' ? 'return' : 'outbound';
            const originalDriver = state.drivers.find(d => sameId(d.id, currentDriverId));
            let preservedDriverId = currentDriverId;
            if (directionToPreserve === 'outbound') {
                if (!originalDriver || !CarpoolManager.isDriverOutbound(originalDriver)) preservedDriverId = null;
            } else {
                if (!originalDriver || !CarpoolManager.isDriverReturn(originalDriver)) preservedDriverId = null;
            }
            await CarpoolManager.updatePassenger(roundTripPassenger.id, { direction: directionToPreserve, driver_id: preservedDriverId });
        }
        const templatePassenger = roundTripPassenger || {};
        const passengerPayload = {
            outing_id: state.selectedOutingId,
            trip_id: state.selectedOutingId,
            child_id: childId || templatePassenger.child_id || null,
            child_name: childName || templatePassenger.child_name || normalizedChildName,
            name: templatePassenger.name || normalizedChildName,
            driver_id: driverId,
            direction,
            guardian_name: templatePassenger.guardian_name || '',
            guardian_phone: templatePassenger.guardian_phone || '',
            notes: templatePassenger.notes || ''
        };
        await CarpoolManager.createPassenger(passengerPayload);
        notify(`${childName} a été inscrit(e) et assigné(e) à la voiture`, 'success');
        await loadOutingData(true);
    }

    function renderPassengerDriverOptions(currentDriverId) {
        const options = [`<option value="">Sans affectation</option>`];
        state.drivers.forEach(driver => {
            const ks = driver.kid_spots ?? driver.seats_available ?? 0;
            if ((ks || 0) <= 0) {
                return;
            }
            options.push(`<option value="${driver.id}" ${sameId(currentDriverId, driver.id) ? 'selected' : ''}>${escapeHtml(driver.name || 'Conducteur')} (${driver.seats_available || 0} places)</option>`);
        });
        return options.join('');
    }

    function updatePassengerDriverSelect() {
        const select = dom.passengerDriverSelect;
        if (!select) {
            return;
        }

        const fragment = document.createDocumentFragment();
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Je n\'ai pas encore de conducteur';
        fragment.appendChild(defaultOption);

        state.drivers.forEach(driver => {
            const ks = driver.kid_spots ?? driver.seats_available ?? 0;
            if ((ks || 0) <= 0) {
                return;
            }
            const option = document.createElement('option');
            option.value = driver.id;
            option.textContent = `${driver.name || 'Conducteur'} (${driver.seats_available || 0} places)`;
            fragment.appendChild(option);
        });

        select.innerHTML = '';
        select.appendChild(fragment);
    }

    function renderUnassigned() {
        const outboundContainer = dom.unassignedOutbound;
        const returnContainer = dom.unassignedReturn;

        if (!outboundContainer || !returnContainer) return;
 
         const metrics = computeMetrics();
        if (!state.confirmedRoster.length) {
            const message = '<div class="fey-note" style="text-align: center; padding: 1rem;">Aucun enfant confirmé par les parents pour cette sortie.</div>';
            outboundContainer.innerHTML = message;
            returnContainer.innerHTML = message;
            return;
        }
        const outboundList = metrics.unassignedOutbound;
        const returnList = metrics.unassignedReturn;

        const renderList = (list, direction) => {
            if (!list.length) {
                return '<div class="fey-note" style="text-align: center; padding: 1rem; color: #2E7D32;">✅ Tous les enfants ont une place.</div>';
            }
            const driversWithSeats = getDriversWithCapacityForDirection(direction);
            const driverOptions = driversWithSeats.length
                ? driversWithSeats.map(d => `<option value="${d.id}">${escapeHtml(d.name || 'Conducteur')} (${CarpoolManager.getRemainingSeatsForDirection(d, state.passengers, direction)} pl.)</option>`).join('')
                : `<option value="" disabled>— Aucune voiture ${direction === 'outbound' ? 'aller' : 'retour'} —</option>`;
            return `
                <div class="unassigned-children-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem; padding: 0.5rem;">
                    ${list.map(name => {
                        const confirmedEntry = getConfirmedEntry(name);
                        const displayName = confirmedEntry ? confirmedEntry.label : titleCase(name);
                        const childIdAttr = confirmedEntry && confirmedEntry.child_id ? confirmedEntry.child_id : '';
                        const dirLabel = direction === 'outbound' ? 'aller' : 'retour';
                        return `
                            <div class="draggable-child unassigned-child-card"
                                 draggable="true"
                                 data-child-id="${childIdAttr}"
                                 data-child-name="${escapeHtml(displayName)}"
                                 data-child-normalized="${escapeHtml(name)}"
                                 data-direction="${direction}"
                                 style="background: linear-gradient(135deg, #FFF3E0, #FFE0B2); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem; cursor: grab; transition: transform 0.2s, box-shadow 0.2s;"
                                 onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'"
                                 onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'">
                                <div style="font-weight: bold; font-size: 0.95rem; text-align: center; margin-bottom: 0.5rem;">${escapeHtml(displayName)}</div>
                                <div class="assign-child-row" style="margin-top: 0.5rem;">
                                    <label class="assign-child-label" style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--c-ink-700); margin-bottom: 0.25rem;">Placer (${dirLabel})</label>
                                    <select class="assign-child-driver-select" data-child-id="${childIdAttr}" data-child-name="${escapeHtml(displayName)}" data-child-normalized="${escapeHtml(name)}" data-direction="${direction}"
                                            style="width: 100%; padding: 0.5rem 0.6rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); font-size: 1rem; background: #fff; min-height: 44px;"
                                            aria-label="Choisir une voiture pour ${escapeHtml(displayName)}">
                                        <option value="">Choisir une voiture...</option>
                                        ${driverOptions}
                                    </select>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        };

        // Render to separate containers
        outboundContainer.innerHTML = renderList(outboundList, 'outbound');
        returnContainer.innerHTML = renderList(returnList, 'return');

        // Drag et menu "Placer dans une voiture"
        [outboundContainer, returnContainer].forEach(container => {
            container.querySelectorAll('.draggable-child').forEach(child => {
                child.addEventListener('dragstart', handleChildDragStart);
                child.addEventListener('dragend', handleChildDragEnd);
            });
            container.querySelectorAll('.assign-child-driver-select').forEach(select => {
                select.addEventListener('change', handleAssignChildSelectChange);
            });
        });
    }

    async function handleAssignChildSelectChange(event) {
        const select = event.target;
        const driverId = select.value;
        if (!driverId) return;
        const childId = select.dataset.childId || null;
        const childName = select.dataset.childName || '';
        const childNormalized = select.dataset.childNormalized || normalizeName(childName);
        const direction = select.dataset.direction || 'outbound';
        try {
            await assignChildToDriver(childId, childName, childNormalized, direction, driverId);
        } catch (err) {
            console.error(LOG_PREFIX, err);
            notify(err.message || 'Impossible d\'assigner l\'enfant.', 'error');
        }
    }

    function sameId(a, b) {
        if (typeof CarpoolManager.sameId === 'function') {
            return CarpoolManager.sameId(a, b);
        }
        const normalize = value => (value == null ? null : String(value));
        return normalize(a) === normalize(b);
    }

    async function handlePassengerAssignmentChange(event) {
        const select = event.target;
        const passengerId = select.dataset.passengerId;
        const driverId = select.value || null;

        try {
            await CarpoolManager.updatePassenger(passengerId, { driver_id: driverId });
            notify('Affectation mise à jour.', 'success');
            await loadOutingData(true);
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur mise à jour passager`, error);
            notify(error.message || 'Impossible de mettre à jour le passager.', 'error');
            await loadOutingData();
        }
    }

    async function handlePassengerDelete(event) {
        const passengerId = event.currentTarget.dataset.passengerId;
        if (!passengerId) return;
        if (!confirm('Supprimer cette inscription ?')) {
            return;
        }
        try {
            await CarpoolManager.deletePassenger(passengerId);
            // Refresh lists so the child immediately reappears in the available list for the current direction
            try { await loadOutingData(true); } catch (e) { console.warn('[CarpoolUI] refresh after delete failed', e); }
            notify('Inscription supprimée.', 'success');
            await loadOutingData(true);
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur suppression passager`, error);
            notify(error.message || 'Impossible de supprimer le passager.', 'error');
        }
    }

    async function handleAdultAdd(event) {
        event.preventDefault();
        if (!state.selectedOutingId) {
            notify('Veuillez d\'abord sélectionner une sortie.', 'error');
            return;
        }

        const form = event.currentTarget;
        const driverId = form.dataset.driverId;
        const directionRaw = form.dataset.direction || 'outbound';
        const normalizedDirection = normalizeDirection(directionRaw, { allowRoundTrip: false, defaultDirection: 'outbound' });
        const input = form.querySelector('input[name="adultName"]');
        const errorContainer = form.parentElement ? form.parentElement.querySelector('.adult-error-message') : null;
        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.style.display = 'none';
        }

        const rawName = input ? input.value.trim() : '';
        if (!rawName) {
            if (input) {
                input.focus();
            }
            const message = 'Veuillez saisir un nom.';
            if (errorContainer) {
                errorContainer.textContent = message;
                errorContainer.style.display = 'block';
            } else {
                notify(message, 'error');
            }
            return;
        }

        const driver = state.drivers.find(d => sameId(d.id, driverId));
        if (!driver) {
            notify('Voiture introuvable.', 'error');
            return;
        }

        const kidSpots = driver.kid_spots ?? driver.seats_available ?? 0;
        if ((kidSpots || 0) <= 0) {
            const message = 'Cette voiture est réservée au matériel/courses et ne peut pas transporter d\'adultes.';
            if (errorContainer) {
                errorContainer.textContent = message;
                errorContainer.style.display = 'block';
            } else {
                notify(message, 'error');
            }
            return;
        }

        const adultSpots = driver.adult_spots || 0;
        const assignedAdults = (state.adultParticipants || []).filter(participant => {
            if (!participant || !participant.is_adult) return false;
            if (!sameId(participant.driver_id, driver.id)) return false;
            if (typeof CarpoolManager.participantMatchesDirection === 'function') {
                return CarpoolManager.participantMatchesDirection(participant, normalizedDirection);
            }
            const participantDirection = normalizeDirection(participant.direction, {
                allowRoundTrip: false,
                defaultDirection: normalizedDirection
            });
            return participantDirection === normalizedDirection;
        }).length;
        const remaining = Math.max(0, adultSpots - assignedAdults);

        if (remaining <= 0) {
            const message = 'Aucune place adulte disponible';
            if (errorContainer) {
                errorContainer.textContent = message;
                errorContainer.style.display = 'block';
            } else {
                notify(message, 'error');
            }
            return;
        }

        try {
            await CarpoolManager.createParticipant({
                outing_id: state.selectedOutingId,
                driver_id: driverId,
                participant_name: rawName,
                is_adult: true,
                direction: normalizedDirection
            });
            if (input) {
                input.value = '';
            }
            await loadOutingData(true);
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur ajout adulte`, error);
            const message = error?.message || 'Impossible d\'ajouter l\'adulte.';
            if (errorContainer) {
                errorContainer.textContent = message;
                errorContainer.style.display = 'block';
            } else {
                notify(message, 'error');
            }
        }
    }

    async function handleAdultRemove(event) {
        const participantId = event.currentTarget.dataset.participantId;
        if (!participantId) {
            return;
        }
        try {
            await CarpoolManager.deleteParticipant(participantId);
            await loadOutingData(true);
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur suppression adulte`, error);
            notify(error?.message || 'Impossible de retirer l\'adulte.', 'error');
        }
    }

    async function handleDriverDelete(event) {
        const driverId = event.currentTarget.dataset.driverId;
        if (!driverId) return;

        const driver = (state.drivers || []).find(d => sameId(d.id, driverId));
        const ks = driver?.kid_spots ?? driver?.seats_available ?? 0;
        const notes = (driver?.notes || '').toString().toLowerCase();
        const isLogistics = driver?.is_logistics === true || (ks || 0) <= 0 || notes.startsWith('voiture matériel/courses');

        const confirmMsg = isLogistics
            ? 'Supprimer cette voiture matériel ?'
            : 'Supprimer cette voiture ? Les enfants associés devront être réaffectés.';
        if (!confirm(confirmMsg)) {
            return;
        }
        try {
            await CarpoolManager.deleteDriver(driverId);
            notify('Voiture supprimée.', 'success');
            await loadOutingData(true);
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur suppression conducteur`, error);
            notify(error.message || 'Impossible de supprimer la voiture.', 'error');
        }
    }

    async function handleDriverForm(event) {
        event.preventDefault();
        if (!state.selectedOutingId) {
            notify('Veuillez d\'abord sélectionner une sortie.', 'error');
            return;
        }
        const formData = new FormData(dom.driverForm);
        const outing = state.outings.find(item => item.id === state.selectedOutingId) || {};

        const checkboxLogistics = formData.get('isLogistics') === 'on';
        let kidSpots = parseInt(formData.get('kidSpots'), 10) || 0;
        let adultSpots = parseInt(formData.get('adultSpots'), 10) || 0;
        const selectedRoundTrip = formData.get('roundTrip') || 'aller-retour';
        const wantsOutbound = selectedRoundTrip === 'aller-retour' || selectedRoundTrip === 'aller-seulement';
        const wantsReturn = selectedRoundTrip === 'aller-retour' || selectedRoundTrip === 'retour-seulement';

        // Auto-detect "voiture matériel" si les deux valeurs sont à 0,
        // même si la case n'a pas été cochée (UX plus tolérante).
        const autoLogistics = (kidSpots + adultSpots) === 0;
        const isLogistics = checkboxLogistics || autoLogistics;

        if (isLogistics) {
            kidSpots = 0;
            adultSpots = 0;
        }

        if (!isLogistics && (kidSpots + adultSpots <= 0)) {
            notify('Nombre de places invalide. Ajoutez au moins une place.', 'error');
            return;
        }

        if (isLogistics) {
            const drivers = state.drivers || [];
            const outboundLogistics = drivers.filter(d => {
                const ks = d.kid_spots ?? d.seats_available ?? 0;
                const isLogisticsDriver = d.is_logistics === true || (ks || 0) <= 0;
                return isLogisticsDriver && CarpoolManager.isDriverOutbound(d);
            });
            const returnLogistics = drivers.filter(d => {
                const ks = d.kid_spots ?? d.seats_available ?? 0;
                const isLogisticsDriver = d.is_logistics === true || (ks || 0) <= 0;
                return isLogisticsDriver && CarpoolManager.isDriverReturn(d);
            });

            const maxPerDirection = 3;
            if (wantsOutbound && outboundLogistics.length >= maxPerDirection) {
                notify('Le maximum de 3 voitures matériel/courses est déjà atteint pour l\'aller.', 'error');
                return;
            }
            if (wantsReturn && returnLogistics.length >= maxPerDirection) {
                notify('Le maximum de 3 voitures matériel/courses est déjà atteint pour le retour.', 'error');
                return;
            }
        }

        let notes = formData.get('driverNotes') || '';
        if (isLogistics) {
            notes = notes
                ? `Voiture matériel/courses — ${notes}`
                : 'Voiture matériel/courses';
        }

        const driverPayload = {
            outing_id: state.selectedOutingId,
            trip_id: state.selectedOutingId,
            name: formData.get('driverName'),
            phone: formData.get('driverPhone'),
            kid_spots: kidSpots,
            adult_spots: adultSpots,
            seats_available: kidSpots, // For backward compatibility
            is_logistics: isLogistics,
            departure_location: outing.meetingPoint || '',
            notes,
            round_trip: selectedRoundTrip,
            is_round_trip: selectedRoundTrip === 'aller-retour'
        };

        try {
            await CarpoolManager.createDriver(driverPayload);
            notify('Voiture enregistrée.', 'success');
            dom.driverForm.reset();
            await loadOutingData(true);
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur création conducteur`, error);
            notify(error.message || 'Impossible d\'enregistrer la voiture.', 'error');
        }
    }

    async function handlePassengerForm(event) {
        event.preventDefault();
        if (!state.selectedOutingId) {
            notify('Veuillez d\'abord sélectionner une sortie.', 'error');
            return;
        }
        const formData = new FormData(dom.passengerForm);
        const childValue = formData.get('childName');
        if (!childValue) {
            notify('Veuillez sélectionner un enfant.', 'error');
            return;
        }

        const confirmedEntry = state.confirmedRoster.find(entry => entry.value === childValue || entry.normalized === childValue);
        if (!confirmedEntry) {
            notify('Cet enfant n\'est pas confirmé par ses parents pour cette sortie.', 'error');
            return;
        }

        const directionSelection = formData.get('roundTrip') || 'aller-retour';
        const normalizedNameValue = confirmedEntry.normalized;
        const directionMap = {
            'aller-retour': 'round-trip',
            'aller-seulement': 'outbound',
            'retour-seulement': 'return'
        };
 
        const passengerPayload = {
            outing_id: state.selectedOutingId,
            trip_id: state.selectedOutingId,
            child_id: confirmedEntry.child_id || null,
            child_name: confirmedEntry.label,
            name: normalizedNameValue,
            guardian_name: formData.get('guardianName') || '',
            guardian_phone: formData.get('guardianPhone') || '',
            driver_id: formData.get('driverId') || null,
            roundTrip: directionSelection,
            direction: directionMap[directionSelection] || directionSelection,
            notes: formData.get('passengerNotes') || ''
        };
 
        try {
            await CarpoolManager.createPassenger(passengerPayload);
            notify('Inscription enregistrée.', 'success');
            dom.passengerForm.reset();
            await loadOutingData(true);
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur création passager`, error);
            notify(error.message || 'Impossible d\'enregistrer l\'enfant.', 'error');
        }
    }

    // Drag and Drop handlers
    let draggedChild = null;

    const DRAG_AUTO_SCROLL_EDGE = 120;
    const DRAG_AUTO_SCROLL_STEP = 32;
    const DRAG_AUTO_SCROLL_OVER_OPTIONS = Object.freeze({ capture: true, passive: false });
    const DRAG_AUTO_SCROLL_STOP_OPTIONS = Object.freeze({ capture: true });
    let dragAutoScrollActive = false;

    function handleGlobalDragOver(event) {
        if (!draggedChild) {
            return;
        }
        event.preventDefault();

        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const clientY = event.clientY ?? 0;

        let deltaY = 0;
        if (clientY < DRAG_AUTO_SCROLL_EDGE) {
            deltaY = -DRAG_AUTO_SCROLL_STEP;
        } else if (clientY > viewportHeight - DRAG_AUTO_SCROLL_EDGE) {
            deltaY = DRAG_AUTO_SCROLL_STEP;
        }

        if (deltaY !== 0) {
            window.scrollBy({ top: deltaY, left: 0, behavior: 'auto' });
        }
    }

    function stopDragAutoScroll() {
        if (!dragAutoScrollActive) {
            return;
        }
        dragAutoScrollActive = false;
        document.removeEventListener('dragover', handleGlobalDragOver, DRAG_AUTO_SCROLL_OVER_OPTIONS);
        document.removeEventListener('dragend', stopDragAutoScroll, DRAG_AUTO_SCROLL_STOP_OPTIONS);
        document.removeEventListener('drop', stopDragAutoScroll, DRAG_AUTO_SCROLL_STOP_OPTIONS);
    }

    function startDragAutoScroll() {
        if (dragAutoScrollActive) {
            return;
        }
        dragAutoScrollActive = true;
        document.addEventListener('dragover', handleGlobalDragOver, DRAG_AUTO_SCROLL_OVER_OPTIONS);
        document.addEventListener('dragend', stopDragAutoScroll, DRAG_AUTO_SCROLL_STOP_OPTIONS);
        document.addEventListener('drop', stopDragAutoScroll, DRAG_AUTO_SCROLL_STOP_OPTIONS);
    }

    function handleChildDragStart(event) {
        const target = event.currentTarget;
        const displayName = target.dataset.childName || '';
        const normalizedName = target.dataset.childNormalized || normalizeName(displayName);
        draggedChild = {
            id: target.dataset.childId || null,
            displayName,
            normalizedName,
            direction: target.dataset.direction
        };
        event.currentTarget.style.opacity = '0.5';
        event.currentTarget.style.cursor = 'grabbing';
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', event.currentTarget.innerHTML);
        startDragAutoScroll();
    }

    function handleChildDragEnd(event) {
        event.currentTarget.style.opacity = '1';
        event.currentTarget.style.cursor = 'grab';
        draggedChild = null;
        stopDragAutoScroll();
    }

    function handleDriverDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        const dropZone = event.currentTarget;
        if (!dropZone.classList.contains('drag-over')) {
            dropZone.style.border = '3px dashed #4CAF50';
            dropZone.style.background = 'linear-gradient(135deg, #C8E6C9, #A5D6A7)';
            dropZone.classList.add('drag-over');
        }
    }

    function handleDriverDragLeave(event) {
        const dropZone = event.currentTarget;
        if (event.target === dropZone) {
            dropZone.style.border = '3px solid var(--c-ink-900)';
            dropZone.style.background = 'linear-gradient(135deg, #E8F5E8, #C8E6C9)';
            dropZone.classList.remove('drag-over');
        }
    }

    async function handleDriverDrop(event) {
        event.preventDefault();
        const dropZone = event.currentTarget;
        dropZone.style.border = '3px solid var(--c-ink-900)';
        dropZone.style.background = 'linear-gradient(135deg, #E8F5E8, #C8E6C9)';
        dropZone.classList.remove('drag-over');

        if (!draggedChild) {
            return;
        }

        const driverId = dropZone.dataset.driverId;
        const targetDriver = (state.drivers || []).find(d => sameId(d.id, driverId));
        if (targetDriver) {
            const ks = targetDriver.kid_spots ?? targetDriver.seats_available ?? 0;
            if ((ks || 0) <= 0) {
                notify('Cette voiture est réservée au matériel/courses et ne peut pas transporter d\'enfants.', 'error');
                draggedChild = null;
                stopDragAutoScroll();
                return;
            }
        }
        const dropZoneDirection = normalizeDirection(dropZone.dataset.direction, {
            allowRoundTrip: false,
            defaultDirection: 'outbound'
        });
        const childName = draggedChild.displayName;
        const childId = draggedChild.id || null;
        const normalizedChildName = draggedChild.normalizedName || normalizeName(childName);
        const childDirection = normalizeDirection(draggedChild.direction, {
            allowRoundTrip: false,
            defaultDirection: dropZoneDirection
        });

        const directionLabels = { outbound: 'Aller', return: 'Retour' };
        if (dropZoneDirection !== childDirection) {
            notify(`Impossible : ${childName} est dans la liste "${directionLabels[childDirection] || childDirection}" et ne peut être placé(e) que dans une voiture "${directionLabels[childDirection] || childDirection}".`, 'error');
            draggedChild = null;
            stopDragAutoScroll();
            return;
        }

        try {
            await assignChildToDriver(childId, childName, normalizedChildName, dropZoneDirection, driverId);
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur lors du drop`, error);
            notify(error.message || 'Impossible d\'assigner l\'enfant', 'error');
        } finally {
            draggedChild = null;
            stopDragAutoScroll();
        }
    }

    function attachEvents() {
        if (!dom.outingSelect) {
            console.error(LOG_PREFIX, 'outingSelect introuvable; impossible d\'initialiser.');
            return;
        }
        dom.outingSelect.addEventListener('change', async event => {
            state.selectedOutingId = event.target.value || null;
            console.debug(LOG_PREFIX, 'Changement de sortie sélectionnée', { selectedId: state.selectedOutingId });
            renderOutingMeta();
            if (state.selectedOutingId) {
                await loadOutingData(true);
            } else {
                clearLists();
                setFormsEnabled(false);
            }
        });

        if (dom.refreshButton) dom.refreshButton.addEventListener('click', () => loadOutings(true));

        if (dom.driverForm) {
            dom.driverForm.addEventListener('submit', handleDriverForm);

            const kidInput = dom.driverForm.querySelector('input[name="kidSpots"]');
            const adultInput = dom.driverForm.querySelector('input[name="adultSpots"]');
            const logisticsCheckbox = dom.driverForm.querySelector('input[name="isLogistics"]');

            if (kidInput && adultInput && logisticsCheckbox) {
                logisticsCheckbox.addEventListener('change', () => {
                    const isChecked = logisticsCheckbox.checked;

                    if (isChecked) {
                        // Sauvegarder les anciennes valeurs pour un éventuel retour en arrière
                        logisticsCheckbox.dataset.prevKidSpots = kidInput.value || '4';
                        logisticsCheckbox.dataset.prevAdultSpots = adultInput.value || '0';

                        kidInput.value = '0';
                        adultInput.value = '0';
                        kidInput.disabled = true;
                        adultInput.disabled = true;
                    } else {
                        kidInput.disabled = false;
                        adultInput.disabled = false;

                        const prevKid = logisticsCheckbox.dataset.prevKidSpots || '4';
                        const prevAdult = logisticsCheckbox.dataset.prevAdultSpots || '0';
                        kidInput.value = prevKid;
                        adultInput.value = prevAdult;
                    }
                });
            }
        }

        if (dom.passengerForm) dom.passengerForm.addEventListener('submit', handlePassengerForm);
        if (dom.exportButton) dom.exportButton.addEventListener('click', handleCarpoolExport);
    }

    ready(() => {
        dom.outingSelect = document.getElementById('carpoolOutingSelect');
        dom.refreshButton = document.getElementById('carpoolRefreshButton');
        dom.outingMeta = document.getElementById('carpoolOutingMeta');
        dom.summaryCard = document.getElementById('carpoolSummaryCard');
        dom.summaryContent = document.getElementById('carpoolSummaryContent');
        dom.kidsProgressFill = document.getElementById('carpoolKidsProgressFill');
        dom.kidsProgressLabel = document.getElementById('carpoolKidsProgressLabel');
        dom.kidsProgressCaption = document.getElementById('carpoolKidsProgressCaption');
        dom.logisticsProgressFill = document.getElementById('carpoolLogisticsProgressFill');
        dom.logisticsProgressLabel = document.getElementById('carpoolLogisticsProgressLabel');
        dom.logisticsProgressCaption = document.getElementById('carpoolLogisticsProgressCaption');
        dom.driversListOutbound = document.getElementById('carpoolDriversListOutbound');
        dom.driversListReturn = document.getElementById('carpoolDriversListReturn');
        dom.logisticsDriversListOutbound = document.getElementById('carpoolLogisticsDriversListOutbound');
        dom.logisticsDriversListReturn = document.getElementById('carpoolLogisticsDriversListReturn');
        dom.unassignedOutbound = document.getElementById('carpoolUnassignedOutbound');
        dom.unassignedReturn = document.getElementById('carpoolUnassignedReturn');
        dom.driverForm = document.getElementById('carpoolDriverForm');
        dom.passengerForm = document.getElementById('carpoolPassengerForm');
        dom.passengerChildSelect = dom.passengerForm ? dom.passengerForm.querySelector('select[name="childName"]') : null;
        dom.passengerDriverSelect = dom.passengerForm ? dom.passengerForm.querySelector('select[name="driverId"]') : null;
        dom.exportButton = document.getElementById('carpoolExportButton');

        if (!dom.outingSelect) {
            console.error(LOG_PREFIX, 'Initialisation interrompue: aucun select de sortie trouvé.');
            return;
        }

        if (!window.carpoolSupabase || !window.CarpoolManager || !window.OutingsService) {
            notify('Les services Supabase ne sont pas disponibles. Impossible d\'initialiser le covoiturage.', 'error');
            return;
        }

        initRoster();
        if (window.RegistrationsService && typeof window.RegistrationsService.subscribe === 'function') {
            window.RegistrationsService.subscribe((eventName, payload) => {
                if (!payload?.outingId || payload.outingId !== state.selectedOutingId) {
                    return;
                }
                if (eventName === 'parent_confirmation' || eventName === 'upsert') {
                    loadOutingData(true);
                }
            });
        }
        attachEvents();
        loadOutings();
        updateExportButtonState();
    });
    // === Capacity editor for drivers (kid seats) ===
    function initCapacityEditorsForContainer(container, direction) {
        if (!container) return;
        container.querySelectorAll('.driver-drop-zone').forEach(dropZone => {
            try {
                if (dropZone.querySelector('.driver-capacity-editor')) return;
                const driverId = dropZone.dataset.driverId;
                const dir = dropZone.dataset.direction || direction;
                const driver = (state.drivers || []).find(d => CarpoolManager.sameId(d.id, driverId));
                if (!driver) return;

                const dirPassengers = (state.passengers || []).filter(p =>
                    CarpoolManager.passengerMatchesDirection(p, dir)
                );
                const assignedCount = dirPassengers.filter(p => CarpoolManager.sameId(p.driver_id, driverId)).length;
                const currentSpots = parseInt(driver.kid_spots || driver.seats_available || driver.childSeats || 0, 10) || 0;

                // Removed inline capacity summary to avoid duplication with the full editor.
            } catch (e) {
                console.warn('[CarpoolUI] capacity editor init failed', e);
            }
        });
    }

    function enableCapacityEditors() {
        const targets = [
            { el: dom?.driversListOutbound, dir: 'outbound' },
            { el: dom?.driversListReturn, dir: 'return' }
        ];
        targets.forEach(t => {
            if (!t.el) return;
            const obs = new MutationObserver(() => initCapacityEditorsForContainer(t.el, t.dir));
            obs.observe(t.el, { childList: true, subtree: true });
            initCapacityEditorsForContainer(t.el, t.dir);
        });
    }

    // Enable capacity editors after initial render
    try { ready(() => { setTimeout(() => { try { enableCapacityEditors(); } catch (e) {} }, 0); }); } catch (e) {}

})();
