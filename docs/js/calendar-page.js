(function () {
    const MONTH_NAMES = [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre'
    ];

    const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const state = {
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        selectedKey: null,
        eventsMap: new Map(),
        dayEvents: [],
        summaries: []
    };

    const elements = {
        monthLabel: null,
        grid: null,
        status: null,
        info: null,
        detailsCard: null,
        detailsContent: null,
        timelineList: null
    };

    function init() {
        elements.monthLabel = document.getElementById('calendar-month-label');
        elements.grid = document.getElementById('calendar-grid');
        elements.status = document.getElementById('calendar-status');
        elements.info = document.getElementById('calendar-info');
        elements.detailsCard = document.getElementById('event-details');
        elements.detailsContent = document.getElementById('event-details-content');
        elements.timelineList = document.getElementById('upcoming-events');

        const weekdaysEl = document.getElementById('calendar-weekdays');
        if (weekdaysEl && weekdaysEl.childElementCount === 0) {
            DAY_NAMES.forEach(dayName => {
                const span = document.createElement('span');
                span.textContent = dayName;
                weekdaysEl.appendChild(span);
            });
        }

        document.getElementById('calendar-prev').addEventListener('click', () => changeMonth(-1));
        document.getElementById('calendar-next').addEventListener('click', () => changeMonth(1));
        document.getElementById('calendar-today').addEventListener('click', goToToday);

        loadEvents();
    }

    async function loadEvents() {
        setStatus('Chargement des sorties…');
        hideDetails();

        let result = await fetchSupabaseEvents();
        let usingFallback = false;

        if (!result || result.summaries.length === 0) {
            result = buildEventsFromDefault();
            usingFallback = true;
        }

        state.eventsMap = result.map;
        state.dayEvents = collectDayEvents(result.map);
        state.summaries = sortSummaries(result.summaries);

        renderCalendar();
        renderTimeline();

        setInfo(usingFallback ? "Affichage du programme 2025-2026 (les sorties Supabase ne sont pas disponibles)." : '');
        setStatus(state.dayEvents.length === 0 ? 'Aucun événement trouvé pour le moment.' : '');
    }

    async function fetchSupabaseEvents() {
        if (!window.OutingsService) {
            return null;
        }

        try {
            const outings = await window.OutingsService.list({ force: true });
            return buildEventsFromOutings(outings || []);
        } catch (error) {
            console.error('[CalendarPage] Erreur Supabase', error);
            setStatus('Impossible de contacter Supabase. Affichage du programme par défaut.');
            return null;
        }
    }

    function buildEventsFromOutings(outings) {
        const map = new Map();
        const summaryMap = new Map();

        outings.forEach(outing => {
            const start = getOutingStartDate(outing);
            if (!start) {
                return;
            }

            const end = getOutingEndDate(outing) || start;
            const summaryKey = outing.id ? `supabase-${outing.id}` : `supabase-${formatDateKey(start)}-${(outing.title || outing.name || 'Sortie')}`;

            const summary = ensureSummary(summaryMap, summaryKey, {
                title: outing.title || outing.name || 'Sortie',
                startDate: start,
                endDate: end,
                location: outing.location || '',
                notes: outing.notes || outing.description || '',
                time: formatOutingTime(outing),
                source: 'supabase'
            });

            const rangeDates = enumerateDates(summary.startDate, summary.endDate);
            rangeDates.forEach((date, index, arr) => {
                const key = formatDateKey(date);
                const eventsForDay = map.get(key) || [];
                eventsForDay.push(createDailyEvent({
                    key,
                    summaryKey,
                    summary,
                    date,
                    index,
                    total: arr.length,
                    daySpecific: {
                        time: index === 0 ? summary.time : '',
                        notes: summary.notes,
                        location: summary.location
                    }
                }));
                map.set(key, eventsForDay);
            });
        });

        return {
            map,
            summaries: Array.from(summaryMap.values())
        };
    }

    function buildEventsFromDefault() {
        const defaults = typeof window.getDefaultCalendarEvents === 'function'
            ? window.getDefaultCalendarEvents()
            : {};

        const entries = Object.entries(defaults)
            .map(([key, value]) => {
                const date = parseKeyToDate(key);
                if (!date) {
                    return null;
                }

                return {
                    key,
                    date,
                    title: value.title || 'Sortie',
                    time: value.time || '',
                    location: value.location || '',
                    notes: value.description || ''
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        const groups = groupDefaultEntries(entries);
        const map = new Map();
        const summaries = [];

        groups.forEach((group, index) => {
            const summaryKey = `default-${formatDateKey(group.startDate)}-${group.title}-${index}`;
            const summary = ensureSummary(null, summaryKey, {
                title: group.title,
                startDate: group.startDate,
                endDate: group.endDate,
                location: firstNonEmpty(group.values.map(v => v.location)),
                notes: firstNonEmpty(group.values.map(v => v.notes)),
                time: firstNonEmpty(group.values.map(v => v.time)),
                source: 'default'
            });
            summaries.push(summary);

            const detailByKey = new Map(
                group.values.map(value => [formatDateKey(value.date), value])
            );

            const rangeDates = enumerateDates(group.startDate, group.endDate);
            rangeDates.forEach((date, idx, arr) => {
                const key = formatDateKey(date);
                const dayDetail = detailByKey.get(key);
                const eventsForDay = map.get(key) || [];
                eventsForDay.push(createDailyEvent({
                    key,
                    summaryKey,
                    summary,
                    date,
                    index: idx,
                    total: arr.length,
                    daySpecific: {
                        time: dayDetail?.time || (idx === 0 ? summary.time : ''),
                        notes: dayDetail?.notes || summary.notes,
                        location: dayDetail?.location || summary.location
                    }
                }));
                map.set(key, eventsForDay);
            });
        });

        return { map, summaries };
    }

    function ensureSummary(summaryMap, key, payload) {
        if (summaryMap) {
            let summary = summaryMap.get(key);
            if (!summary) {
                summary = createSummary(payload);
                summaryMap.set(key, summary);
                return summary;
            }

            if (payload.startDate && summary.startDate.getTime() > payload.startDate.getTime()) {
                summary.startDate = new Date(payload.startDate);
            }
            if (payload.endDate && summary.endDate.getTime() < payload.endDate.getTime()) {
                summary.endDate = new Date(payload.endDate);
            }
            if (!summary.location) {
                summary.location = payload.location || '';
            }
            if (!summary.notes) {
                summary.notes = payload.notes || '';
            }
            if (!summary.time) {
                summary.time = payload.time || '';
            }
            return summary;
        }

        return createSummary(payload);
    }

    function createSummary({ title, startDate, endDate, location, notes, time, source }) {
        const safeStart = startDate instanceof Date ? new Date(startDate) : new Date();
        const safeEnd = endDate instanceof Date ? new Date(endDate) : new Date(safeStart);
        return {
            title,
            startDate: safeStart,
            endDate: safeEnd < safeStart ? safeStart : safeEnd,
            location: location || '',
            notes: notes || '',
            time: time || '',
            source: source || 'default'
        };
    }

    function createDailyEvent({ key, summaryKey, summary, date, index, total, daySpecific }) {
        return {
            key,
            summaryKey,
            title: summary.title,
            date,
            time: daySpecific.time || '',
            location: daySpecific.location || '',
            notes: daySpecific.notes || '',
            source: summary.source,
            range: {
                start: new Date(summary.startDate),
                end: new Date(summary.endDate),
                isFirstDay: index === 0,
                isLastDay: index === total - 1,
                dayIndex: index,
                length: total
            }
        };
    }

    function groupDefaultEntries(entries) {
        const groups = [];
        let current = null;

        entries.forEach(entry => {
            if (!current) {
                current = createDefaultGroup(entry);
                groups.push(current);
                return;
            }

            const previous = current.values[current.values.length - 1];
            const contiguous = entry.title === current.title && diffInDays(previous.date, entry.date) <= 1;

            if (contiguous) {
                current.values.push(entry);
                current.endDate = entry.date;
            } else {
                current = createDefaultGroup(entry);
                groups.push(current);
            }
        });

        return groups;
    }

    function createDefaultGroup(entry) {
        return {
            title: entry.title,
            startDate: entry.date,
            endDate: entry.date,
            values: [entry]
        };
    }

    function collectDayEvents(map) {
        const allEvents = [];
        map.forEach(events => {
            events.forEach(event => allEvents.push(event));
        });
        return allEvents;
    }

    function sortSummaries(summaries) {
        return [...summaries].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }

    function renderCalendar() {
        const { month, year } = state;
        state.selectedKey = null;

        elements.monthLabel.textContent = `${MONTH_NAMES[month]} ${year}`;
        elements.grid.innerHTML = '';

        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const leadingEmpty = normalizeWeekday(firstDay.getDay());
        for (let i = 0; i < leadingEmpty; i++) {
            elements.grid.appendChild(createEmptyCell());
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            const key = formatDateKey(date);
            const events = [...(state.eventsMap.get(key) || [])].sort((a, b) => a.title.localeCompare(b.title));
            const isToday = date.getTime() === today.getTime();
            elements.grid.appendChild(createDayCell(day, key, events, isToday));
        }

        const totalCells = leadingEmpty + daysInMonth;
        const trailingEmpty = (7 - (totalCells % 7)) % 7;
        for (let i = 0; i < trailingEmpty; i++) {
            elements.grid.appendChild(createEmptyCell());
        }
    }

    function renderTimeline() {
        elements.timelineList.innerHTML = '';

        if (state.summaries.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'calendar-empty-note';
            empty.textContent = 'Aucune sortie enregistrée pour le moment.';
            elements.timelineList.appendChild(empty);
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        state.summaries.forEach(summary => {
            const item = document.createElement('div');
            const isPast = summary.endDate.getTime() < today.getTime();
            item.className = 'calendar-upcoming-item';
            if (isPast) {
                item.classList.add('calendar-upcoming-item--past');
            }

            const rangeLabel = formatRangeLabel(summary.startDate, summary.endDate);
            const sourceLabel = summary.source === 'default' ? 'Programme 2025-2026' : 'Publié via Supabase';

            item.innerHTML = `
                <div class="calendar-upcoming-date">${rangeLabel}</div>
                <div class="calendar-upcoming-title">${summary.title}</div>
                ${summary.location ? `<div class="calendar-upcoming-location">📍 ${summary.location}</div>` : ''}
                ${summary.time ? `<div class="calendar-upcoming-time">⏰ ${summary.time}</div>` : ''}
                ${summary.notes ? `<div class="calendar-upcoming-notes">${summary.notes}</div>` : ''}
                <div class="calendar-upcoming-source">${sourceLabel}</div>
            `;

            elements.timelineList.appendChild(item);
        });
    }

    function createDayCell(dayNumber, key, events, isToday) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-day';
        button.setAttribute('data-date-key', key);

        if (isToday) {
            button.classList.add('calendar-day--today');
        }

        if (events.length > 0) {
            button.classList.add('calendar-day--has-event');
            button.setAttribute('aria-label', buildAriaLabel(dayNumber, events));
        } else {
            button.setAttribute('aria-label', `Jour ${dayNumber}`);
        }

        button.innerHTML = `
            <span class="calendar-day-number">${dayNumber}</span>
            ${events.length > 0 ? `<span class="calendar-day-badge" aria-hidden="true">${events.length}</span>` : ''}
        `;

        button.addEventListener('click', () => {
            if (events.length === 0) {
                hideDetails();
                state.selectedKey = null;
                updateSelectedDay();
                return;
            }

            state.selectedKey = key;
            updateSelectedDay();
            showDetails(key, events);
        });

        return button;
    }

    function createEmptyCell() {
        const div = document.createElement('div');
        div.className = 'calendar-day calendar-day--empty';
        div.setAttribute('aria-hidden', 'true');
        return div;
    }

    function updateSelectedDay() {
        const buttons = elements.grid.querySelectorAll('.calendar-day');
        buttons.forEach(btn => {
            if (!btn.classList.contains('calendar-day--empty')) {
                const key = btn.getAttribute('data-date-key');
                if (key && key === state.selectedKey) {
                    btn.classList.add('calendar-day--selected');
                } else {
                    btn.classList.remove('calendar-day--selected');
                }
            }
        });
    }

    function showDetails(key, events) {
        const formattedDate = formatLongDate(events[0].date);
        elements.detailsContent.innerHTML = `
            <h3>${formattedDate}</h3>
            ${events.map(event => renderEventDetails(event)).join('')}
        `;
        elements.detailsCard.removeAttribute('hidden');
    }

    function renderEventDetails(event) {
        const rangeInfo = renderRangeInfo(event.range);
        return `
            <div class="calendar-detail-item">
                <div class="calendar-detail-title">${event.title}</div>
                ${rangeInfo ? `<div class="calendar-detail-line">${rangeInfo}</div>` : ''}
                ${event.time ? `<div class="calendar-detail-line">⏰ ${event.time}</div>` : ''}
                ${event.location ? `<div class="calendar-detail-line">📍 ${event.location}</div>` : ''}
                ${event.notes ? `<div class="calendar-detail-notes">${event.notes}</div>` : ''}
                <div class="calendar-detail-source">${event.source === 'default' ? 'Programme 2025-2026' : 'Publié via Supabase'}</div>
            </div>
        `;
    }

    function hideDetails() {
        if (elements.detailsCard) {
            elements.detailsCard.setAttribute('hidden', 'true');
            elements.detailsContent.innerHTML = '';
        }
    }

    function changeMonth(delta) {
        state.month += delta;
        if (state.month < 0) {
            state.month = 11;
            state.year -= 1;
        } else if (state.month > 11) {
            state.month = 0;
            state.year += 1;
        }
        renderCalendar();
        updateSelectedDay();
    }

    function goToToday() {
        const today = new Date();
        state.month = today.getMonth();
        state.year = today.getFullYear();
        renderCalendar();
        updateSelectedDay();
    }

    function setStatus(message) {
        if (!elements.status) {
            return;
        }

        elements.status.textContent = message || '';
        elements.status.style.display = message ? 'block' : 'none';
    }

    function setInfo(message) {
        if (!elements.info) {
            return;
        }

        elements.info.textContent = message || '';
        elements.info.style.display = message ? 'block' : 'none';
    }

    function normalizeWeekday(day) {
        return (day + 6) % 7;
    }

    function formatDateKey(date) {
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    }

    function parseKeyToDate(key) {
        const parts = key.split('-').map(Number);
        if (parts.length !== 3) {
            return null;
        }
        const [day, month, year] = parts;
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function getOutingStartDate(outing) {
        if (outing.startDate instanceof Date) {
            const date = new Date(outing.startDate);
            date.setHours(0, 0, 0, 0);
            return date;
        }

        if (outing.startAt) {
            const date = new Date(outing.startAt);
            if (!Number.isNaN(date.getTime())) {
                date.setHours(0, 0, 0, 0);
                return date;
            }
        }

        if (outing.start_at) {
            const date = new Date(outing.start_at);
            if (!Number.isNaN(date.getTime())) {
                date.setHours(0, 0, 0, 0);
                return date;
            }
        }

        return null;
    }

    function getOutingEndDate(outing) {
        if (outing.endDate instanceof Date) {
            const date = new Date(outing.endDate);
            date.setHours(0, 0, 0, 0);
            return date;
        }

        if (outing.endAt) {
            const date = new Date(outing.endAt);
            if (!Number.isNaN(date.getTime())) {
                date.setHours(0, 0, 0, 0);
                return date;
            }
        }

        if (outing.end_at) {
            const date = new Date(outing.end_at);
            if (!Number.isNaN(date.getTime())) {
                date.setHours(0, 0, 0, 0);
                return date;
            }
        }

        return null;
    }

    function formatOutingTime(outing) {
        if (outing.departureDetails) {
            return outing.departureDetails;
        }
        if (outing.departure_details) {
            return outing.departure_details;
        }
        if (outing.startAt) {
            return formatTimeFromDate(new Date(outing.startAt));
        }
        if (outing.start_at) {
            return formatTimeFromDate(new Date(outing.start_at));
        }
        return '';
    }

    function formatTimeFromDate(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return '';
        }
        return new Intl.DateTimeFormat('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    function formatLongDate(date) {
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }

    function enumerateDates(startDate, endDate) {
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end.getTime() < start.getTime()) {
            end.setTime(start.getTime());
        }

        const cursor = new Date(start);
        while (cursor.getTime() <= end.getTime()) {
            dates.push(new Date(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
        return dates;
    }

    function diffInDays(first, second) {
        const firstUtc = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate());
        const secondUtc = Date.UTC(second.getFullYear(), second.getMonth(), second.getDate());
        return Math.round((secondUtc - firstUtc) / (24 * 60 * 60 * 1000));
    }

    function renderRangeInfo(range) {
        if (!range || range.length <= 1) {
            return '';
        }

        const startLabel = formatShortDate(range.start);
        const endLabel = formatShortDate(range.end);

        if (range.isFirstDay) {
            return `📆 Du ${startLabel} au ${endLabel}`;
        }

        if (range.isLastDay) {
            return `🏁 Dernier jour (${range.dayIndex + 1}/${range.length})`;
        }

        return `➡️ Jour ${range.dayIndex + 1}/${range.length}`;
    }

    function formatRangeLabel(start, end) {
        if (start.getTime() === end.getTime()) {
            return formatLongDate(start);
        }
        return `Du ${formatLongDate(start)} au ${formatLongDate(end)}`;
    }

    function formatShortDate(date) {
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }

    function firstNonEmpty(values) {
        return values.find(value => value && value.trim && value.trim().length > 0) || '';
    }

    function buildAriaLabel(dayNumber, events) {
        const date = events[0]?.date || new Date(state.year, state.month, dayNumber);
        const dateLabel = formatLongDate(date);
        const titles = events.map(event => event.title).join(', ');
        return `${dateLabel} : ${titles}`;
    }

    document.addEventListener('DOMContentLoaded', init);
})();

