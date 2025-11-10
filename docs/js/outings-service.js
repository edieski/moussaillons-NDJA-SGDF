(function () {
    'use strict';

    if (window.OutingsService) {
        return;
    }

    const LOG_PREFIX = '[OutingsService]';
    const CACHE_TTL_MS = 60 * 1000; // 1 minute

    let cache = [];
    let lastFetch = 0;
    const listeners = new Set();

    function log(message, data) {
        if (data !== undefined) {
            console.log(`${LOG_PREFIX} ${message}`, data);
        } else {
            console.log(`${LOG_PREFIX} ${message}`);
        }
    }

    function ensureClient() {
        const client = window.carpoolSupabase;
        if (!client) {
            console.error(`${LOG_PREFIX} Supabase client manquant. Assurez-vous que supabaseClient.js est chargé.`);
        }
        return client;
    }

    function slugify(input) {
        if (!input) return '';
        return input
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
            .replace(/-{2,}/g, '-');
    }

    function toIso(value) {
        if (!value) return null;
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (typeof value === 'string') {
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
        }
        return null;
    }

    function parseDateFlexible(value) {
        if (!value) return null;
        let s = String(value).trim();
        // Normalize space to 'T'
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?(?:[.+-].*)?$/.test(s)) {
            s = s.replace(' ', 'T');
        }
        // Normalize timezone '+00', '+0000', '+00:00' to 'Z'
        s = s.replace(/\+00(?::?00)?$/, 'Z');
        // If no timezone marker at all, assume UTC
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(s)) {
            s = s + 'Z';
        }
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    function normalizeOuting(row) {
        if (!row) return null;

        const startDate = parseDateFlexible(row.start_at);
        const endDate = parseDateFlexible(row.end_at);

        const normalized = {
            id: row.id,
            slug: row.slug,
            title: row.title,
            startAt: startDate ? startDate.toISOString() : (row.start_at || null),
            endAt: endDate ? endDate.toISOString() : (row.end_at || null),
            startDate,
            endDate,
            location: row.location || '',
            meetingPoint: row.meeting_point || '',
            departureDetails: row.departure_details || '',
            returnDetails: row.return_details || '',
            notes: row.notes || '',
            autoCarpool: Boolean(row.auto_carpool),
            createdAt: row.created_at || null,
            updatedAt: row.updated_at || null,
            raw: row
        };

        return normalized;
    }

    function toCarpoolTrip(outing) {
        if (!outing) return null;
        const source = outing.raw || outing;
        return {
            id: outing.id,
            slug: outing.slug,
            title: outing.title,
            date: outing.startAt,
            start_at: outing.startAt,
            end_at: outing.endAt,
            location: outing.location,
            meeting_point: outing.meetingPoint,
            departure_time: outing.departureDetails,
            return_details: outing.returnDetails,
            notes: outing.notes,
            auto_carpool: outing.autoCarpool,
            raw: source,
            outing
        };
    }

    function notify(event, payload) {
        listeners.forEach(listener => {
            try {
                listener(event, payload, [...cache]);
            } catch (error) {
                console.error(`${LOG_PREFIX} Listener error`, error);
            }
        });
    }

    function sortCache() {
        cache.sort((a, b) => {
            const aTime = a.startDate ? a.startDate.getTime() : 0;
            const bTime = b.startDate ? b.startDate.getTime() : 0;
            return aTime - bTime;
        });
    }

    async function list(options = {}) {
        const { force = false } = options;
        const now = Date.now();
        if (!force && cache.length > 0 && now - lastFetch < CACHE_TTL_MS) {
            return [...cache];
        }

        const client = ensureClient();
        if (!client) {
            return [];
        }

        const { data, error } = await client
            .from('outings')
            .select('id, slug, title, start_at, end_at, location, meeting_point, departure_details, return_details, notes, auto_carpool, created_at, updated_at')
            .order('start_at', { ascending: true });
        try {
            console.debug('[OutingsService] fetch result', {
                count: Array.isArray(data) ? data.length : 0,
                sampleKeys: Array.isArray(data) && data[0] ? Object.keys(data[0]) : []
            });
        } catch (_) {}

        if (error) {
            console.error(`${LOG_PREFIX} Erreur de chargement`, error);
            throw error;
        }

        cache = (data || []).map(normalizeOuting);
        sortCache();
        lastFetch = now;

        notify('list', [...cache]);
        return [...cache];
    }

    function getCachedList() {
        return [...cache];
    }

    function getById(id) {
        if (!id) return null;
        const normalizedId = id.toString();
        return cache.find(outing => outing.id === normalizedId) || null;
    }

    function buildCreatePayload(input = {}) {
        const slugSource = input.slug || input.title || '';
        const slug = slugify(slugSource);

        return {
            slug,
            title: input.title,
            start_at: toIso(input.start_at || input.startAt || input.date),
            end_at: toIso(input.end_at || input.endAt || input.endDate),
            location: input.location || '',
            meeting_point: input.meeting_point || input.meetingPoint || '',
            departure_details: input.departure_details || input.departureDetails || input.departure_time || '',
            return_details: input.return_details || input.returnDetails || input.return_time || '',
            notes: input.notes || input.description || '',
            auto_carpool: Boolean(input.auto_carpool ?? input.autoCarpool)
        };
    }

    async function create(input, secret) {
        if (!secret) {
            throw new Error('Le mot de passe chef est requis pour créer une sortie.');
        }

        const client = ensureClient();
        if (!client) return null;

        const payload = buildCreatePayload(input);
        if (!payload.title || !payload.start_at) {
            throw new Error('Un titre et une date de début sont requis pour créer une sortie.');
        }

        const { data, error } = await client.rpc('create_outing_with_secret', {
            p_secret: secret,
            p_slug: payload.slug,
            p_title: payload.title,
            p_start_at: payload.start_at,
            p_end_at: payload.end_at,
            p_location: payload.location,
            p_meeting_point: payload.meeting_point,
            p_departure_details: payload.departure_details,
            p_return_details: payload.return_details,
            p_notes: payload.notes,
            p_auto_carpool: payload.auto_carpool
        });

        if (error) {
            console.error(`${LOG_PREFIX} Erreur de création`, error);
            throw error;
        }

        const outing = normalizeOuting(data);
        cache.push(outing);
        sortCache();
        notify('created', outing);
        return outing;
    }

    async function update(id, input, secret) {
        if (!secret) {
            throw new Error('Le mot de passe chef est requis pour modifier une sortie.');
        }

        const client = ensureClient();
        if (!client) return null;

        const updatePayload = buildCreatePayload(input);

        const { data, error } = await client.rpc('update_outing_with_secret', {
            p_secret: secret,
            p_id: id,
            p_title: updatePayload.title || null,
            p_start_at: updatePayload.start_at,
            p_end_at: updatePayload.end_at,
            p_location: updatePayload.location || null,
            p_meeting_point: updatePayload.meeting_point || null,
            p_departure_details: updatePayload.departure_details || null,
            p_return_details: updatePayload.return_details || null,
            p_notes: updatePayload.notes || null,
            p_auto_carpool: updatePayload.auto_carpool
        });

        if (error) {
            console.error(`${LOG_PREFIX} Erreur de mise à jour`, error);
            throw error;
        }

        const updated = normalizeOuting(data);
        const index = cache.findIndex(outing => outing.id === updated.id);
        if (index !== -1) {
            cache[index] = updated;
        } else {
            cache.push(updated);
        }
        sortCache();
        notify('updated', updated);
        return updated;
    }

    async function remove(id, secret) {
        if (!secret) {
            throw new Error('Le mot de passe chef est requis pour supprimer une sortie.');
        }

        const client = ensureClient();
        if (!client) return false;

        const { error } = await client.rpc('delete_outing_with_secret', {
            p_secret: secret,
            p_id: id
        });

        if (error) {
            console.error(`${LOG_PREFIX} Erreur de suppression`, error);
            throw error;
        }

        cache = cache.filter(outing => outing.id !== id);
        notify('deleted', id);
        return true;
    }

    function clearCache() {
        cache = [];
        lastFetch = 0;
        notify('cleared', null);
    }

    function subscribe(listener) {
        if (typeof listener === 'function') {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
        return () => {};
    }

    function unsubscribe(listener) {
        listeners.delete(listener);
    }

    window.OutingsService = {
        list,
        getCachedList,
        getById,
        create,
        update,
        remove,
        clearCache,
        subscribe,
        unsubscribe,
        toCarpoolTrip,
        normalizeOuting,
        slugify
    };

    log('Initialisation terminée');
})();


