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

    function escapeCsv(value) {
        const stringValue = value == null ? '' : String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    function downloadCsv(filename, rows) {
        if (!Array.isArray(rows) || !rows.length) {
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
        if (!state.selectedOutingId) {
            return null;
        }
        const target = state.selectedOutingId.toString();
        return state.outings.find(outing => {
            const candidates = [outing.id, outing.slug];
            return candidates.some(value => value != null && value.toString() === target);
        }) || null;
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
        const hasFilter = stats.filteredCount < stats.total;
        const items = [
            { label: 'Enfants affichés', value: stats.filteredCount, color: '#4CAF50' },
            { label: 'Confirmés par les parents', value: stats.filteredParentConfirmed, color: '#2196F3' }
        ];

        if (state.isAdminMode) {
            items.push({ label: 'Validés par les chefs', value: stats.filteredLeaderValidated, color: '#F57C00' });
        }

        if (hasFilter) {
            items.push({ label: 'Parents OK (toute la sortie)', value: stats.parentConfirmed, color: '#009688' });
            if (state.isAdminMode) {
                items.push({ label: 'Chefs OK (toute la sortie)', value: stats.leaderValidated, color: '#6A1B9A' });
            }
        }

        dom.statsContent.innerHTML = items.map(item => `
            <div style="padding: 1rem; border-radius: var(--r-sm); border: 2px solid var(--c-ink-900); background: ${item.color}; color: white; text-align: center;">
                <div style="font-size: 1.8rem; font-weight: bold;">${item.value}</div>
                <div style="font-size: 0.95rem;">${item.label}</div>
            </div>
        `).join('');

        dom.statsCard.style.display = 'block';
    }

    function updateExportButtonState() {
        if (!dom.exportButton) return;
        if (!state.selectedOutingId) {
            dom.exportButton.disabled = true;
            dom.exportButton.textContent = '⬇️ Exporter la présence (CSV)';
            return;
        }
        const filteredCount = filterChildrenList(state.children).length;
        dom.exportButton.disabled = filteredCount === 0;
        if (filteredCount > 0) {
            dom.exportButton.textContent = `⬇️ Exporter ${filteredCount} fiche${filteredCount > 1 ? 's' : ''} (CSV)`;
        } else {
            dom.exportButton.textContent = '⬇️ Exporter la présence (CSV)';
        }
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
                    <label class="presence-toggle ${parentConfirmed ? 'presence-toggle--checked' : ''}">
                        <input type="checkbox" class="presence-toggle-parent" ${parentConfirmed ? 'checked' : ''}>
                        <span class="presence-toggle-label">✓ Il ou elle vient</span>
                    </label>
                    <button type="button" class="presence-btn-not-coming" title="Signaler que mon enfant ne participe pas à cette sortie">
                        <span class="presence-btn-icon">✗</span> Mon enfant ne vient pas
                    </button>
                    ${parentAt ? `<div class="presence-meta">Dernière confirmation : ${parentAt}</div>` : ''}
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
            updateExportButtonState();
            return;
        }

        const filtered = filterChildrenList(state.children);

        if (!filtered.length) {
            dom.listContainer.innerHTML = '';
            dom.emptyState.style.display = 'block';
            dom.emptyState.textContent = 'Aucun enfant ne correspond au filtre actuel.';
            updateExportButtonState();
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
            const notComingBtn = card.querySelector('.presence-btn-not-coming');
            if (notComingBtn) {
                notComingBtn.addEventListener('click', () => handleChildNotComing(card));
            }
            if (state.isAdminMode) {
                const leaderToggle = card.querySelector('.presence-toggle-leader');
                if (leaderToggle) {
                    leaderToggle.addEventListener('change', () => handleLeaderToggle(card, leaderToggle.checked));
                }
            }
        });

        renderStats();
        updateExportButtonState();
    }

    async function handleChildNotComing(card) {
        state.notComingFromButton = true;
        await handleParentToggle(card, false);
        state.notComingFromButton = false;
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
            const message = confirmed
                ? `${scoutName} confirmé(e) par les parents.`
                : (state.notComingFromButton ? `Merci, nous avons bien noté que ${scoutName} ne vient pas.` : `${scoutName} retiré(e) de la confirmation parent.`);
            notify(message, 'success');
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

            // Trier les sorties par date de début (comme dans le calendrier et le covoiturage)
            state.outings = [...outings].sort((a, b) => {
                const at = a.startDate ? a.startDate.getTime() : 0;
                const bt = b.startDate ? b.startDate.getTime() : 0;
                return at - bt;
            });

            // Si aucune sortie n'est encore sélectionnée, pré‑sélectionner la prochaine à venir
            if (!state.selectedOutingId && state.outings.length) {
                const now = Date.now();
                const upcoming = state.outings.find(outing => outing.startDate && outing.startDate.getTime() >= now);
                const selected = upcoming || state.outings[0];
                state.selectedOutingId = (selected.id || selected.slug || '').toString() || null;
            }

            renderOutingOptions();

            // Charger immédiatement les confirmations pour la sortie pré‑sélectionnée
            if (state.selectedOutingId) {
                await refreshRegistrations(true);
            }
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

    function handleExportClick() {
        if (!state.selectedOutingId) {
            notify('Sélectionnez une sortie avant d\'exporter.', 'warning');
            return;
        }
        const filtered = filterChildrenList(state.children);
        if (!filtered.length) {
            notify('Aucune fiche à exporter pour ce filtre.', 'info');
            return;
        }
        const outing = findSelectedOuting();
        const outingLabel = outing?.title || outing?.name || 'Sortie';
        const rows = [
            ['Sortie', 'Nom', 'Équipe', 'Parents confirmés', 'Date confirmation parent', 'Chefs validés', 'Date validation chef']
        ];

        filtered.forEach(child => {
            const record = findRecordForChild(child);
            const parentConfirmed = record?.parent_confirmed === true;
            const leaderValidated = record?.leader_validated === true;
            rows.push([
                outingLabel,
                computeChildDisplayName(child) || 'Enfant',
                getChildTeam(child) || '',
                parentConfirmed ? 'Oui' : 'Non',
                parentConfirmed ? formatDate(record?.parent_confirmed_at) : '',
                leaderValidated ? 'Oui' : 'Non',
                leaderValidated ? formatDate(record?.leader_validated_at) : ''
            ]);
        });

        const slugSource = outing?.slug || outing?.id || outingLabel || 'sortie';
        const slug = slugSource.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        downloadCsv(`presence_${slug}.csv`, rows);
        notify('Export CSV généré.', 'success');
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
        if (dom.exportButton) dom.exportButton.addEventListener('click', handleExportClick);
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
            .presence-child-actions {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            .presence-toggle {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.6rem;
                font-size: 1rem;
                font-weight: 600;
                color: var(--c-ink-800);
                border: 2px solid #81C784;
                padding: 0.75rem 1rem;
                border-radius: 12px;
                cursor: pointer;
                background: rgba(129, 199, 132, 0.15);
                transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.2s ease;
                user-select: none;
            }
            .presence-toggle:hover {
                background: rgba(129, 199, 132, 0.3);
                transform: translateY(-1px);
            }
            .presence-toggle:has(input:focus-visible) {
                outline: 2px solid #2E7D32;
                outline-offset: 2px;
            }
            .presence-toggle.presence-toggle--checked,
            .presence-toggle:has(input:checked) {
                background: #2E7D32;
                border-color: #1B5E20;
                color: white;
            }
            .presence-toggle.presence-toggle--checked:hover,
            .presence-toggle:has(input:checked):hover {
                background: #1B5E20;
                border-color: #0D3D0D;
            }
            .presence-toggle input[type="checkbox"] {
                width: 1.25rem;
                height: 1.25rem;
                accent-color: white;
                cursor: pointer;
                flex-shrink: 0;
            }
            .presence-toggle-label {
                pointer-events: none;
            }
            .presence-child-card.presence-loading {
                opacity: 0.6;
                pointer-events: none;
            }
            .presence-meta {
                font-size: 0.8rem;
                color: var(--c-ink-600);
                margin-left: 0;
            }
            .presence-btn-not-coming {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0.75rem 1rem;
                font-size: 1rem;
                font-weight: 600;
                border: 2px solid #e57373;
                border-radius: 12px;
                background: rgba(229, 115, 115, 0.12);
                color: #c62828;
                cursor: pointer;
                transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.2s ease, box-shadow 0.2s ease;
            }
            .presence-btn-not-coming:hover {
                background: #e57373;
                border-color: #c62828;
                color: white;
                transform: translateY(-1px);
                box-shadow: 0 3px 10px rgba(198, 40, 40, 0.25);
            }
            .presence-btn-not-coming:active {
                transform: translateY(0);
                box-shadow: none;
            }
            .presence-btn-not-coming:focus-visible {
                outline: 2px solid #c62828;
                outline-offset: 2px;
            }
            .presence-btn-icon {
                font-size: 1.1rem;
                opacity: 0.95;
            }
            #presencePage .presence-btn-export,
            .presence-btn-export {
                background: #1E88E5;
                padding: 0.75rem 1.5rem;
                min-width: 220px;
                font-size: 1rem;
                font-weight: 600;
                border: 2px solid #1565C0;
                border-radius: 12px;
                transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.2s ease;
            }
            .presence-btn-export:hover:not(:disabled) {
                background: #1565C0;
                transform: translateY(-1px);
                box-shadow: 0 3px 10px rgba(21, 101, 192, 0.3);
            }
            .presence-btn-export:active:not(:disabled) {
                transform: translateY(0);
            }
            .presence-btn-export:focus-visible {
                outline: 2px solid #1565C0;
                outline-offset: 2px;
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
        dom.exportButton = document.getElementById('presenceExportButton');

        applyMode();
        attachEvents();
        injectStyles();
        updateExportButtonState();

        if (!window.RegistrationsService) {
            notify('Service des confirmations indisponible.', 'error');
            return;
        }

        window.RegistrationsService.subscribe((eventName, payload) => {
            if (payload?.outingId && payload.outingId === state.selectedOutingId) {
                renderChildren();
            }
        });

        // Charger d'abord les enfants (Supabase) pour avoir la liste complète (25), puis les sorties
        (async function initAsync() {
            await loadChildren();
            await loadOutings();
        })();
    }

    ready(init);
})();


