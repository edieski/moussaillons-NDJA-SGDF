(function () {
    'use strict';

    if (window.AttendanceService) {
        return;
    }

    const LOG_PREFIX = '[AttendanceService]';
    const CACHE_TTL_MS = 30 * 1000;
    const VALID_STATUSES = new Set(['present', 'absent', 'late', 'excused']);

    const cache = new Map(); // outingId -> { items, fetchedAt }
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
            console.error(`${LOG_PREFIX} Supabase client manquant. Chargez supabaseClient.js avant attendance-service.js`);
        }
        return client;
    }

    function normalizeStatus(status) {
        if (!status) return 'absent';
        const normalized = status.toLowerCase();
        return VALID_STATUSES.has(normalized) ? normalized : 'absent';
    }

    function normalizeRecord(row) {
        if (!row) return null;
        return {
            id: row.id,
            outing_id: row.outing_id,
            scout_name: row.scout_name,
            scout_team: row.scout_team || null,
            status: normalizeStatus(row.status),
            notes: row.notes || '',
            marked_at: row.marked_at || null,
            marked_by: row.marked_by || '',
            raw: row
        };
    }

    function getCacheEntry(outingId) {
        const key = outingId ? outingId.toString() : '';
        if (!cache.has(key)) {
            cache.set(key, { items: [], fetchedAt: 0 });
        }
        return cache.get(key);
    }

    function setCache(outingId, items) {
        const entry = getCacheEntry(outingId);
        entry.items = items;
        entry.fetchedAt = Date.now();
    }

    function notify(event, payload) {
        listeners.forEach(listener => {
            try {
                listener(event, payload);
            } catch (error) {
                console.error(`${LOG_PREFIX} Listener error`, error);
            }
        });
    }

    async function list(outingId, options = {}) {
        const { force = false } = options;
        const key = outingId ? outingId.toString() : '';
        if (!key) {
            throw new Error('outingId requis pour charger les présences');
        }

        const entry = getCacheEntry(key);
        if (!force && entry.items.length > 0 && Date.now() - entry.fetchedAt < CACHE_TTL_MS) {
            return [...entry.items];
        }

        const client = ensureClient();
        if (!client) return [];

        const { data, error } = await client
            .from('attendance_records')
            .select('*')
            .eq('outing_id', key)
            .order('scout_name', { ascending: true });

        if (error) {
            console.error(`${LOG_PREFIX} Erreur de chargement`, error);
            throw error;
        }

        const normalized = (data || []).map(normalizeRecord);
        setCache(key, normalized);
        notify('list', { outingId: key, records: [...normalized] });
        return [...normalized];
    }

    function getCached(outingId) {
        const key = outingId ? outingId.toString() : '';
        const entry = getCacheEntry(key);
        return [...entry.items];
    }

    async function upsert(outingId, record, secret) {
        if (!secret) {
            throw new Error('Le mot de passe chef est requis pour modifier la présence.');
        }

        const key = outingId ? outingId.toString() : '';
        if (!key) {
            throw new Error('outingId requis pour modifier la présence.');
        }

        const client = ensureClient();
        if (!client) return null;

        const payload = {
            p_secret: secret,
            p_outing_id: key,
            p_scout_name: record.scout_name,
            p_status: normalizeStatus(record.status),
            p_notes: record.notes || '',
            p_marked_by: record.marked_by || record.markedBy || '',
            p_scout_team: record.scout_team || record.scoutTeam || null
        };

        const { data, error } = await client.rpc('upsert_attendance_with_secret', payload);

        if (error) {
            console.error(`${LOG_PREFIX} Erreur d\'enregistrement`, error);
            throw error;
        }

        const normalized = normalizeRecord(data);

        const entry = getCacheEntry(key);
        const index = entry.items.findIndex(item => item.scout_name === normalized.scout_name);
        if (index !== -1) {
            entry.items[index] = normalized;
        } else {
            entry.items.push(normalized);
            entry.items.sort((a, b) => a.scout_name.localeCompare(b.scout_name));
        }
        entry.fetchedAt = Date.now();

        notify('upsert', { outingId: key, record: normalized });
        return normalized;
    }

    async function bulkUpsert(outingId, records, secret) {
        if (!Array.isArray(records) || records.length === 0) {
            return [];
        }

        if (!secret) {
            throw new Error('Le mot de passe chef est requis pour modifier la présence.');
        }

        const key = outingId ? outingId.toString() : '';
        if (!key) {
            throw new Error('outingId requis pour modifier la présence.');
        }

        const client = ensureClient();
        if (!client) return [];

        const payloadRecords = records.map(record => ({
            scout_name: record.scout_name,
            status: normalizeStatus(record.status),
            notes: record.notes || '',
            marked_by: record.marked_by || record.markedBy || '',
            scout_team: record.scout_team || record.scoutTeam || null
        }));

        const { data, error } = await client.rpc('bulk_upsert_attendance_with_secret', {
            p_secret: secret,
            p_outing_id: key,
            p_records: payloadRecords
        });

        if (error) {
            console.error(`${LOG_PREFIX} Erreur bulk upsert`, error);
            throw error;
        }

        const normalized = (data || []).map(normalizeRecord);
        setCache(key, normalized);
        notify('bulk_upsert', { outingId: key, records: [...normalized] });
        return [...normalized];
    }

    async function clear(outingId, secret) {
        if (!secret) {
            throw new Error('Le mot de passe chef est requis pour effacer la présence.');
        }

        const key = outingId ? outingId.toString() : '';
        if (!key) {
            throw new Error('outingId requis pour effacer la présence.');
        }

        const client = ensureClient();
        if (!client) return false;

        const { error } = await client.rpc('clear_attendance_with_secret', {
            p_secret: secret,
            p_outing_id: key
        });

        if (error) {
            console.error(`${LOG_PREFIX} Erreur clear`, error);
            throw error;
        }

        setCache(key, []);
        notify('cleared', { outingId: key });
        return true;
    }

    function clearCache(outingId) {
        if (outingId) {
            const key = outingId.toString();
            cache.delete(key);
        } else {
            cache.clear();
        }
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

    window.AttendanceService = {
        list,
        getCached,
        upsert,
        bulkUpsert,
        clear,
        clearCache,
        subscribe,
        unsubscribe,
        normalizeRecord,
        normalizeStatus,
        VALID_STATUSES: new Set(VALID_STATUSES)
    };

    log('Initialisation terminée');
})();


