(function () {
    'use strict';

    const LOG_PREFIX = '[PresenceUI]';

    const state = {
        outings: [],
        children: [],
        registrations: [],
        selectedOutingId: null,
        leaderSecret: '',
        isAdminMode: false,
        loading: false,
        searchTerm: '',
        teamFilter: ''
    };

    const dom = {};

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function notify(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            const logger = type === 'error' ? console.error : console.log;
            logger(`${LOG_PREFIX} ${message}`);
        }
    }

    function normalizeName(value, fallback) {
        if (!value && fallback) {
            value = fallback;
        }
        if (!value) return '';
        if (window.ScoutsRoster && typeof window.ScoutsRoster.resolve === 'function') {
            return window.ScoutsRoster.resolve(value);
        }
        return value.toString().trim().replace(/\s+/g, ' ').toUpperCase();
    }

    function computeChildDisplayName(child) {
        if (!child) return '';
        const parts = [];
        if (child.last_name) parts.push(child.last_name.toUpperCase());
        if (child.first_name) parts.push(child.first_name);
        if (!parts.length && child.nom) parts.push(child.nom);
        if (!parts.length && child.prenom) parts.push(child.prenom);
        return parts.join(' ');
    }

    function extractScoutName(child, record) {
        if (record && record.scout_name) {
            return record.scout_name;
        }
        const full = computeChildDisplayName(child);
        return normalizeName(full || (child?.nom && child?.prenom ? `${child.nom} ${child.prenom}` : ''), full);
    }

    function parseQueryMode() {
        try {
            const search = new URLSearchParams(window.location.search);
            const mode = (search.get('mode') || '').toLowerCase();
            return mode === 'admin';
        } catch (_error) {
            return false;
        }
    }

    function formatDate(value) {
        if (!value) return '';
        try {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '';
            return date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
        } catch (_error) {
            return '';
        }
    }

    function getChildTeam(child) {
        if (!child) return '';
        return child.team || child.equipe || '';
    }

    function buildTeamOptions() {
        const teams = new Set();
        state.children.forEach(child => {
            const team = getChildTeam(child);
            if (team) {
                teams.add(team);
            }
        });
        const options = ['<option value="">Toutes les équipes</option>'];
        Array.from(teams).sort((a, b) => a.localeCompare(b)).forEach(team => {
            options.push(`<option value="${team}">${team}</option>`);
        });
        dom.teamFilter.innerHTML = options.join('');
    }

    function filterChildrenList(children) {
        const searchTerm = state.searchTerm.trim().toLowerCase();
        const teamFilter = state.teamFilter.trim().toLowerCase();

        return children.filter(child => {
            const name = computeChildDisplayName(child).toLowerCase();
            const matchesSearch = !searchTerm || name.includes(searchTerm);

            const team = getChildTeam(child).toLowerCase();
            const matchesTeam = !teamFilter || team === teamFilter;

            return matchesSearch && matchesTeam;
        });
    }

    function findRecordForChild(child) {
        if (!child) return null;
        const childId = child.id || null;
        if (childId) {
            const withId = state.registrations.find(record => record.child_id === childId);
            if (withId) return withId;
        }

        const name = normalizeName(computeChildDisplayName(child));
        return state.registrations.find(record => normalizeName(record.scout_name) === name) || null;
    }

    function computeStats() {
        const totalChildren = state.children.length;
        let parentConfirmed = 0;
        let leaderValidated = 0;

        const confirmedNames = new Set();

        state.registrations.forEach(record => {
            if (record.parent_confirmed) {
                parentConfirmed += 1;
                confirmedNames.add(record.scout_name);
            }
            if (record.leader_validated) {
                leaderValidated += 1;
            }
        });

        const filteredChildren = filterChildrenList(state.children);
        const filteredCount = filteredChildren.length;
        const filteredParentConfirmed = filteredChildren.reduce((sum, child) => {
            const record = findRecordForChild(child);
            return sum + (record?.parent_confirmed ? 1 : 0);
        }, 0);
        const filteredLeaderValidated = filteredChildren.reduce((sum, child) => {
            const record = findRecordForChild(child);
            return sum + (record?.leader_validated ? 1 : 0);
        }, 0);

        return {
            total: totalChildren,
            parentConfirmed,
            leaderValidated,
            filteredCount,
            filteredParentConfirmed,
            filteredLeaderValidated
        };
    }

    function renderStats() {
        if (!dom.statsCard || !dom.statsContent) return;
        if (!state.selectedOutingId) {
            dom.statsCard.style.display = 'none';
            dom.statsContent.innerHTML = '';
            return;
        }

        const stats = computeStats();
        const items = [
            { label: 'Enfants listés', value: stats.filteredCount, color: '#4CAF50' },
            { label: 'Parents confirmés (filtre)', value: stats.filteredParentConfirmed, color: '#2196F3' }
        ];

        if (state.isAdminMode) {
            items.push({ label: 'Chefs validés (filtre)', value: stats.filteredLeaderValidated, color: '#F57C00' });
        }

        items.push({ label: 'Total confirmés (parents)', value: stats.parentConfirmed, color: '#009688' });

        if (state.isAdminMode) {
            items.push({ label: 'Total validés (chefs)', value: stats.leaderValidated, color: '#6A1B9A' });
        }

        dom.statsContent.innerHTML = items.map(item => `
            <div style="padding: 1rem; border-radius: var(--r-sm); border: 2px solid var(--c-ink-900); background: ${item.color}; color: white; text-align: center;">
                <div style="font-size: 1.8rem; font-weight: bold;">${item.value}</div>
                <div style="font-size: 0.95rem;">${item.label}</div>
            </div>
        `).join('');

        dom.statsCard.style.display = 'block';
    }

    function renderChildRow(child) {
        const record = findRecordForChild(child);
        const parentConfirmed = record?.parent_confirmed === true;
        const leaderValidated = record?.leader_validated === true;
        const parentAt = parentConfirmed ? formatDate(record?.parent_confirmed_at) : '';
        const leaderAt = leaderValidated ? formatDate(record?.leader_validated_at) : '';

        const baseClasses = ['presence-child-card'];
        if (parentConfirmed) {
            baseClasses.push('presence-parent-confirmed');
        }

        const team = getChildTeam(child);

        return `
            <div class="${baseClasses.join(' ')}" data-child-id="${child.id || ''}" data-child-name="${encodeURIComponent(computeChildDisplayName(child))}">
                <div class="presence-child-header">
                    <div>
                        <div class="presence-child-name">${computeChildDisplayName(child) || 'Enfant'}</div>
                        ${team ? `<div class="presence-child-team">Équipe : ${team}</div>` : ''}
                    </div>
                    ${parentConfirmed ? `<div class="presence-chip presence-chip--parent">Parents OK</div>` : ''}
                    ${state.isAdminMode && leaderValidated ? `<div class="presence-chip presence-chip--leader">Chef OK</div>` : ''}
                </div>
                <div class="presence-child-actions">
                    <label class="presence-toggle">
                        <input type="checkbox" class="presence-toggle-parent" ${parentConfirmed ? 'checked' : ''}>
                        <span>Présence confirmée par les parents</span>
                    </label>
                    ${parentAt ? `<div class="presence-meta">Dernière confirmation parent : ${parentAt}</div>` : ''}
                    ${state.isAdminMode ? `
                        <label class="presence-toggle">
                            <input type="checkbox" class="presence-toggle-leader" ${leaderValidated ? 'checked' : ''}>
                            <span>Présence validée par les chefs</span>
                        </label>
                        ${leaderAt ? `<div class="presence-meta">Validation chef : ${leaderAt}</div>` : ''}
                    ` : ''}
                </div>
            </div>
        `;
    }

    function renderChildren() {
        if (!dom.listContainer) return;

        if (!state.selectedOutingId) {
            dom.listContainer.innerHTML = '<div class="fey-note" style="text-align: center; padding: 1rem;">Sélectionnez une sortie pour afficher la liste des enfants.</div>';
            dom.emptyState.style.display = 'none';
            return;
        }

        const filtered = filterChildrenList(state.children);

        if (!filtered.length) {
            dom.listContainer.innerHTML = '';
            dom.emptyState.style.display = 'block';
            dom.emptyState.textContent = 'Aucun enfant ne correspond au filtre actuel.';
            return;
        }

        dom.emptyState.style.display = 'none';
        dom.listContainer.innerHTML = `
            <div class="presence-grid">
                ${filtered.map(renderChildRow).join('')}
            </div>
        `;

        dom.listContainer.querySelectorAll('.presence-child-card').forEach(card => {
            const parentToggle = card.querySelector('.presence-toggle-parent');
            if (parentToggle) {
                parentToggle.addEventListener('change', () => handleParentToggle(card, parentToggle.checked));
            }
            if (state.isAdminMode) {
                const leaderToggle = card.querySelector('.presence-toggle-leader');
                if (leaderToggle) {
                    leaderToggle.addEventListener('change', () => handleLeaderToggle(card, leaderToggle.checked));
                }
            }
        });

        renderStats();
    }

    async function handleParentToggle(card, confirmed) {
        if (!state.selectedOutingId) return;
        const child = extractChildFromCard(card);
        if (!child) return;

        card.classList.add('presence-loading');
        try {
            const record = findRecordForChild(child);
            const scoutName = extractScoutName(child, record);
            await window.RegistrationsService.setParentConfirmation({
                outingId: state.selectedOutingId,
                childId: child.id || null,
                scoutName,
                confirmed,
                secret: state.isAdminMode && state.leaderSecret ? state.leaderSecret : null
            });
            notify(confirmed ? `${scoutName} confirmé(e) par les parents.` : `${scoutName} retiré(e) de la confirmation parent.`, 'success');
            await refreshRegistrations(false);
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur parent toggle`, error);
            notify(error.message || 'Impossible de mettre à jour la confirmation parent.', 'error');
            await refreshRegistrations(false);
        } finally {
            card.classList.remove('presence-loading');
        }
    }

    async function handleLeaderToggle(card, validated) {
        if (!state.selectedOutingId) return;
        if (!state.leaderSecret) {
            notify('Veuillez saisir le mot de passe chef avant de valider.', 'warning');
            const leaderToggle = card.querySelector('.presence-toggle-leader');
            if (leaderToggle) {
                leaderToggle.checked = !validated;
            }
            return;
        }

        const child = extractChildFromCard(card);
        if (!child) return;

        card.classList.add('presence-loading');
        try {
            const record = findRecordForChild(child);
            const scoutName = extractScoutName(child, record);
            await window.RegistrationsService.setLeaderValidation({
                outingId: state.selectedOutingId,
                childId: child.id || null,
                scoutName,
                validated,
                secret: state.leaderSecret,
                parentConfirmed: record ? record.parent_confirmed : null
            });
            notify(validated ? `${scoutName} validé(e) par les chefs.` : `${scoutName} retiré(e) de la validation chef.`, 'success');
            await refreshRegistrations(false);
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur leader toggle`, error);
            notify(error.message || 'Impossible de mettre à jour la validation chef.', 'error');
            await refreshRegistrations(false);
        } finally {
            card.classList.remove('presence-loading');
        }
    }

    function extractChildFromCard(card) {
        const childId = card.dataset.childId || null;
        let child = null;
        if (childId) {
            child = state.children.find(item => item.id === childId);
        }
        if (!child) {
            const encodedName = card.dataset.childName ? decodeURIComponent(card.dataset.childName) : '';
            child = state.children.find(item => computeChildDisplayName(item) === encodedName);
        }
        return child;
    }

    async function loadChildren() {
        if (!window.ChildrenService) {
            notify('Service enfants indisponible.', 'error');
            return;
        }
        try {
            const children = await window.ChildrenService.list();
            state.children = children;
            buildTeamOptions();
            renderChildren();
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur chargement enfants`, error);
            notify(error.message || 'Impossible de charger la liste des enfants.', 'error');
        }
    }

    async function loadOutings() {
        if (!window.OutingsService) {
            notify('Service des sorties indisponible.', 'error');
            return;
        }
        try {
            const outings = await window.OutingsService.list();
            state.outings = outings;
            renderOutingOptions();
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur chargement sorties`, error);
            notify(error.message || 'Impossible de charger les sorties.', 'error');
        }
    }

    async function refreshRegistrations(force = false) {
        if (!state.selectedOutingId) return;
        try {
            const records = await window.RegistrationsService.list(state.selectedOutingId, { force });
            state.registrations = records;
            renderChildren();
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur chargement confirmations`, error);
            notify(error.message || 'Impossible de récupérer les confirmations.', 'error');
        }
    }

    function renderOutingOptions() {
        if (!dom.outingSelect) return;
        dom.outingSelect.innerHTML = '<option value="">Choisissez une sortie...</option>';
        state.outings.forEach(outing => {
            const option = document.createElement('option');
            option.value = outing.id || outing.slug || '';
            option.textContent = outing.title || outing.name || 'Sortie';
            dom.outingSelect.appendChild(option);
        });
        if (state.outings.length === 1) {
            state.selectedOutingId = state.outings[0].id;
            dom.outingSelect.value = state.selectedOutingId;
            refreshRegistrations(true);
        }
    }

    function handleOutingChange(event) {
        state.selectedOutingId = event.target.value || null;
        if (!state.selectedOutingId) {
            state.registrations = [];
            renderChildren();
            renderStats();
            return;
        }
        refreshRegistrations(true);
    }

    function handleSearchInput(event) {
        state.searchTerm = event.target.value || '';
        renderChildren();
    }

    function handleTeamFilter(event) {
        state.teamFilter = event.target.value || '';
        renderChildren();
    }

    function handleLeaderSecretSave() {
        const value = dom.leaderSecretInput.value.trim();
        if (!value) {
            notify('Veuillez saisir le mot de passe chef.', 'warning');
            return;
        }
        state.leaderSecret = value;
        notify('Mot de passe chef enregistré pour cette session.', 'success');
    }

    function applyMode() {
        state.isAdminMode = parseQueryMode();
        if (!dom.adminPanel) return;
        if (state.isAdminMode) {
            dom.adminPanel.style.display = 'block';
            const subtitle = document.getElementById('pageSubtitle');
            if (subtitle) {
                subtitle.textContent = 'Validez la présence des enfants côté parents et chefs pour chaque sortie.';
            }
        } else {
            dom.adminPanel.style.display = 'none';
            const subtitle = document.getElementById('pageSubtitle');
            if (subtitle) {
                subtitle.textContent = 'Merci de confirmer la présence de votre enfant pour la prochaine sortie.';
            }
        }
    }

    function attachEvents() {
        if (dom.outingSelect) dom.outingSelect.addEventListener('change', handleOutingChange);
        if (dom.searchInput) dom.searchInput.addEventListener('input', handleSearchInput);
        if (dom.teamFilter) dom.teamFilter.addEventListener('change', handleTeamFilter);
        if (dom.leaderSecretButton) dom.leaderSecretButton.addEventListener('click', handleLeaderSecretSave);
    }

    function injectStyles() {
        const css = `
            .presence-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                gap: 1rem;
            }
            .presence-child-card {
                border: 2px solid var(--c-ink-900);
                border-radius: var(--r-sm);
                padding: 1rem;
                background: linear-gradient(135deg, #FFFFFF, #F9F9F9);
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                transition: box-shadow 0.2s ease, transform 0.2s ease;
            }
            .presence-child-card:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateY(-2px);
            }
            .presence-child-card.presence-parent-confirmed {
                border-color: #2E7D32;
                background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
            }
            .presence-child-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                justify-content: space-between;
            }
            .presence-child-name {
                font-size: 1.1rem;
                font-weight: bold;
                color: var(--c-ink-900);
            }
            .presence-child-team {
                font-size: 0.9rem;
                color: var(--c-ink-600);
            }
            .presence-chip {
                font-size: 0.75rem;
                font-weight: bold;
                padding: 0.3rem 0.6rem;
                border-radius: 999px;
                border: 2px solid var(--c-ink-900);
                background: #FFD54F;
                color: var(--c-ink-900);
            }
            .presence-chip--parent {
                background: #4CAF50;
                color: white;
            }
            .presence-chip--leader {
                background: #FF9800;
                color: white;
            }
            .presence-toggle {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.95rem;
                color: var(--c-ink-800);
                border: 2px dashed transparent;
                padding: 0.4rem;
                border-radius: var(--r-sm);
            }
            .presence-toggle input[type="checkbox"] {
                transform: scale(1.4);
                accent-color: #2E7D32;
            }
            .presence-child-card.presence-loading {
                opacity: 0.6;
                pointer-events: none;
            }
            .presence-meta {
                font-size: 0.8rem;
                color: var(--c-ink-600);
                margin-left: 2rem;
            }
        `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function init() {
        dom.outingSelect = document.getElementById('presenceOutingSelect');
        dom.searchInput = document.getElementById('presenceSearchInput');
        dom.teamFilter = document.getElementById('presenceTeamFilter');
        dom.listContainer = document.getElementById('presenceListContainer');
        dom.emptyState = document.getElementById('presenceEmptyState');
        dom.statsCard = document.getElementById('presenceStatsCard');
        dom.statsContent = document.getElementById('presenceStatsContent');
        dom.adminPanel = document.getElementById('presenceAdminPanel');
        dom.leaderSecretInput = document.getElementById('leaderSecretInput');
        dom.leaderSecretButton = document.getElementById('leaderSecretToggle');

        applyMode();
        attachEvents();
        injectStyles();

        if (!window.RegistrationsService) {
            notify('Service des confirmations indisponible.', 'error');
            return;
        }

        window.RegistrationsService.subscribe((eventName, payload) => {
            if (payload?.outingId && payload.outingId === state.selectedOutingId) {
                renderChildren();
            }
        });

        loadChildren();
        loadOutings();
    }

    ready(init);
})();


