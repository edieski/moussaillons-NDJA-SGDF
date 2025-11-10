(function () {
    'use strict';

    const LOG_PREFIX = '[AdminOutings]';

    function notify(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            const logger = type === 'error' ? console.error : console.log;
            logger(`${LOG_PREFIX} ${message}`);
            if (type === 'error') {
                alert(message);
            }
        }
    }

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function toISOString(value) {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return null;
        }
        return date.toISOString();
    }

    function toDateTimeLocal(iso) {
        if (!iso) return '';
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        const offset = date.getTimezoneOffset();
        const local = new Date(date.getTime() - offset * 60000);
        return local.toISOString().slice(0, 16);
    }

    const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'long',
        timeStyle: 'short'
    });

    function formatRange(outing) {
        if (!outing || !outing.startDate) {
            return 'Date à confirmer';
        }
        const startText = dateFormatter.format(outing.startDate);
        if (!outing.endDate) {
            return startText;
        }
        const endText = dateFormatter.format(outing.endDate);
        return `${startText} → ${endText}`;
    }

    function escapeAttr(value) {
        return (value ?? '').toString().replace(/"/g, '"');
    }

    function escapeHtml(value) {
        return (value ?? '').toString()
            .replace(/&/g, '&')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    ready(() => {
        const createForm = document.getElementById('createOutingForm');
        const listContainer = document.getElementById('outingsListContainer');
        const refreshButton = document.getElementById('refreshOutingsButton');

        if (!createForm || !listContainer) {
            return;
        }

        if (!window.OutingsService) {
            console.error(`${LOG_PREFIX} OutingsService manquant.`);
            notify('Le module Supabase n\'est pas chargé. Impossible de gérer les sorties.', 'error');
            return;
        }

        async function refreshOutings(force = false) {
            listContainer.innerHTML = `
                <div class="fey-note" style="text-align: center; padding: 2rem;">
                    <strong>🔄 Chargement des sorties...</strong>
                </div>
            `;

            try {
                const outings = await OutingsService.list({ force });
                renderOutings(outings || []);
            } catch (error) {
                console.error(`${LOG_PREFIX} Erreur de chargement`, error);
                listContainer.innerHTML = `
                    <div class="fey-note" style="text-align: center; padding: 2rem; color: #F44336;">
                        ❌ Impossible de charger les sorties : ${escapeHtml(error.message || 'erreur inconnue')}
                    </div>
                `;
            }
        }

        function renderOutings(outings) {
            if (!outings.length) {
                listContainer.innerHTML = `
                    <div class="fey-note" style="text-align: center; padding: 2rem;">
                        <strong>🗓️ Aucune sortie enregistrée pour le moment.</strong><br>
                        Utilisez le formulaire ci-dessus pour en créer une.
                    </div>
                `;
                return;
            }

            const cards = outings.map(outing => {
                const startLocal = toDateTimeLocal(outing.startAt);
                const endLocal = toDateTimeLocal(outing.endAt);
                const autoCarpool = outing.autoCarpool ? 'Oui' : 'Non';

                return `
                    <div class="fey-item" style="background: linear-gradient(135deg, #FFF3E0, #FFE0B2); border-left: 4px solid #FF9800; margin-bottom: 1rem;">
                        <details ${outings.length <= 3 ? 'open' : ''}>
                            <summary style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                <span style="font-weight: bold; font-size: 1.1rem;">${escapeHtml(outing.title)}</span>
                                <span style="font-size: 0.9rem; color: var(--c-ink-600);">${escapeHtml(formatRange(outing))}</span>
                            </summary>

                            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
                                <div style="background: rgba(255,255,255,0.8); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem;">
                                    <strong>📍 Lieu</strong><br>${escapeHtml(outing.location || ' définir')}
                                </div>
                                <div style="background: rgba(255,255,255,0.8); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem;">
                                    <strong>📍 Point de rendez-vous</strong><br>${escapeHtml(outing.meetingPoint || ' définir')}
                                </div>
                                <div style="background: rgba(255,255,255,0.8); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem;">
                                    <strong>🚗 Départ</strong><br>${escapeHtml(outing.departureDetails || ' préciser')}
                                </div>
                                <div style="background: rgba(255,255,255,0.8); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem;">
                                    <strong>🚗 Retour</strong><br>${escapeHtml(outing.returnDetails || ' préciser')}
                                </div>
                                <div style="background: rgba(255,255,255,0.8); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem;">
                                    <strong>🧠 Notes</strong><br>${escapeHtml(outing.notes || 'Aucune note')}
                                </div>
                                <div style="background: rgba(255,255,255,0.8); border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 0.75rem;">
                                    <strong>🚙 Auto-covoiturage</strong><br>${autoCarpool}
                                </div>
                            </div>

                            <form class="outing-edit-form" data-outing-id="${outing.id}" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; background: rgba(255,255,255,0.9); border: 2px dashed var(--c-ink-900); border-radius: var(--r-sm); padding: 1rem;">
                                <h4 style="margin: 0; color: var(--c-forest-700);">🛠️ Modifier cette sortie</h4>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">🗓️ Nom</label>
                                        <input type="text" name="title" value="${escapeAttr(outing.title)}" required style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">📅 Début</label>
                                        <input type="datetime-local" name="startAt" value="${escapeAttr(startLocal)}" required style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">📅 Fin</label>
                                        <input type="datetime-local" name="endAt" value="${escapeAttr(endLocal)}" style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">📍 Lieu</label>
                                        <input type="text" name="location" value="${escapeAttr(outing.location || '')}" style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">📍 Rendez-vous</label>
                                        <input type="text" name="meetingPoint" value="${escapeAttr(outing.meetingPoint || '')}" style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">🚗 Départ</label>
                                        <input type="text" name="departureDetails" value="${escapeAttr(outing.departureDetails || '')}" style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">🚗 Retour</label>
                                        <input type="text" name="returnDetails" value="${escapeAttr(outing.returnDetails || '')}" style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">🧠 Notes</label>
                                        <textarea name="notes" style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); resize: vertical;">${escapeHtml(outing.notes || '')}</textarea>
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">🚙 Auto-covoiturage</label>
                                        <select name="autoCarpool" style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                                            <option value="true" ${outing.autoCarpool ? 'selected' : ''}>Oui</option>
                                            <option value="false" ${!outing.autoCarpool ? 'selected' : ''}>Non</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">🔑 Mot de passe chef</label>
                                        <input type="password" name="secret" required placeholder="********" style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                                    </div>
                                </div>

                                <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: flex-end;">
                                    <button type="submit" class="fey-btn" style="background: #4CAF50;">💾 Enregistrer</button>
                                    <button type="button" data-action="refresh" class="fey-btn" style="background: #2196F3;">🔄 Réinitialiser</button>
                                    <button type="button" data-action="delete" class="fey-btn" style="background: #F44336;">🗑️ Supprimer</button>
                                </div>
                            </form>
                        </details>
                    </div>
                `;
            }).join('');

            listContainer.innerHTML = cards;

            listContainer.querySelectorAll('.outing-edit-form').forEach(form => {
                form.addEventListener('submit', handleUpdateOuting);
                const deleteButton = form.querySelector('button[data-action="delete"]');
                if (deleteButton) {
                    deleteButton.addEventListener('click', handleDeleteOuting);
                }
                const resetButton = form.querySelector('button[data-action="refresh"]');
                if (resetButton) {
                    resetButton.addEventListener('click', () => refreshOutings(true));
                }
            });
        }

        async function handleCreateOuting(event) {
            event.preventDefault();
            const formData = new FormData(createForm);
            const secret = (formData.get('secret') || '').trim();

            if (!secret) {
                notify('Veuillez saisir le mot de passe chef.', 'error');
                return;
            }

            const payload = {
                title: formData.get('title') || '',
                start_at: toISOString(formData.get('startAt')),
                end_at: toISOString(formData.get('endAt')),
                location: formData.get('location') || '',
                meeting_point: formData.get('meetingPoint') || '',
                departure_details: formData.get('departureDetails') || '',
                return_details: formData.get('returnDetails') || '',
                notes: formData.get('notes') || '',
                auto_carpool: (formData.get('autoCarpool') || 'false') === 'true'
            };

            if (!payload.start_at) {
                notify('La date de début n\'est pas valide.', 'error');
                return;
            }

            try {
                await OutingsService.create(payload, secret);
                notify(`La sortie "${payload.title}" a été créée.`, 'success');
                createForm.reset();
                await refreshOutings(true);
            } catch (error) {
                console.error(`${LOG_PREFIX} Erreur création`, error);
                notify(error.message || 'Impossible de créer la sortie.', 'error');
            }
        }

        async function handleUpdateOuting(event) {
            event.preventDefault();
            const form = event.currentTarget;
            const outingId = form.dataset.outingId;
            const formData = new FormData(form);
            const secret = (formData.get('secret') || '').trim();

            if (!secret) {
                notify('Veuillez saisir le mot de passe chef.', 'error');
                return;
            }

            const payload = {
                title: formData.get('title') || '',
                start_at: toISOString(formData.get('startAt')),
                end_at: toISOString(formData.get('endAt')),
                location: formData.get('location') || '',
                meeting_point: formData.get('meetingPoint') || '',
                departure_details: formData.get('departureDetails') || '',
                return_details: formData.get('returnDetails') || '',
                notes: formData.get('notes') || '',
                auto_carpool: (formData.get('autoCarpool') || 'false') === 'true'
            };

            if (!payload.start_at) {
                notify('La date de début n\'est pas valide.', 'error');
                return;
            }

            try {
                await OutingsService.update(outingId, payload, secret);
                notify('Sortie mise à jour avec succès.', 'success');
                await refreshOutings(true);
            } catch (error) {
                console.error(`${LOG_PREFIX} Erreur mise à jour`, error);
                notify(error.message || 'Impossible de mettre à jour la sortie.', 'error');
            }
        }

        async function handleDeleteOuting(event) {
            const form = event.currentTarget.closest('.outing-edit-form');
            if (!form) return;

            const outingId = form.dataset.outingId;
            const secretInput = form.querySelector('input[name="secret"]');
            const secret = secretInput ? secretInput.value.trim() : '';

            if (!secret) {
                notify('Veuillez saisir le mot de passe chef avant de supprimer.', 'error');
                return;
            }

            if (!confirm('Êtes-vous sr de vouloir supprimer cette sortie ? Cette action est définitive.')) {
                return;
            }

            try {
                await OutingsService.remove(outingId, secret);
                notify('Sortie supprimée.', 'success');
                await refreshOutings(true);
            } catch (error) {
                console.error(`${LOG_PREFIX} Erreur suppression`, error);
                notify(error.message || 'Impossible de supprimer la sortie.', 'error');
            }
        }

        createForm.addEventListener('submit', handleCreateOuting);

        if (refreshButton) {
            refreshButton.addEventListener('click', () => refreshOutings(true));
        }

        OutingsService.subscribe((eventName) => {
            if (eventName === 'created' || eventName === 'updated' || eventName === 'deleted') {
                refreshOutings();
            }
        });

        refreshOutings(true);
    });
})();
