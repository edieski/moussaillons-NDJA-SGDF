(function () {
    'use strict';

    if (window.RegistrationsService) {
        return;
    }

    const LOG_PREFIX = '[RegistrationsService]';
    const CACHE_TTL_MS = 30 * 1000;

    const cache = new Map(); // outingId -> { records, fetchedAt }
    const listeners = new Set();

    function log(message, data) {
        if (data !== undefined) {
            console.log(`${LOG_PREFIX} ${message}`, data);
        } else {
            console.log(`${LOG_PREFIX} ${message}`);
        }
    }

    function warn(message, data) {
        if (data !== undefined) {
            console.warn(`${LOG_PREFIX} ${message}`, data);
        } else {
            console.warn(`${LOG_PREFIX} ${message}`);
        }
    }

    function ensureClient() {
        const client = window.carpoolSupabase;
        if (!client) {
            console.error(`${LOG_PREFIX} Supabase client non disponible. Chargez supabaseClient.js avant registrations-service.js`);
        }
        return client;
    }

    function normalizeUuid(value) {
        if (!value) return null;
        try {
            return String(value);
        } catch (_error) {
            return null;
        }
    }

    function normalizeRecord(row) {
        if (!row) return null;
        return {
            id: row.id,
            outing_id: row.outing_id,
            child_id: normalizeUuid(row.child_id),
            scout_name: row.scout_name,
            scout_team: row.scout_team || null,
            status: row.status || 'absent',
            notes: row.notes || '',
            marked_at: row.marked_at || null,
            marked_by: row.marked_by || '',
            parent_confirmed: row.parent_confirmed === true,
            parent_confirmed_at: row.parent_confirmed_at || null,
            leader_validated: row.leader_validated === true,
            leader_validated_at: row.leader_validated_at || null,
            raw: row
        };
    }

    function toKey(outingId) {
        if (!outingId) return null;
        return outingId.toString();
    }

    function getCacheEntry(outingId) {
        const key = toKey(outingId);
        if (!key) return null;
        if (!cache.has(key)) {
            cache.set(key, { records: [], fetchedAt: 0 });
        }
        return cache.get(key);
    }

    function setCache(outingId, records) {
        const entry = getCacheEntry(outingId);
        if (!entry) return;
        entry.records = records;
        entry.fetchedAt = Date.now();
    }

    function mergeRecordIntoCache(outingId, record) {
        const entry = getCacheEntry(outingId);
        if (!entry) return;
        const index = entry.records.findIndex(item => item.scout_name === record.scout_name);
        if (index === -1) {
            entry.records.push(record);
            entry.records.sort((a, b) => a.scout_name.localeCompare(b.scout_name));
        } else {
            entry.records[index] = record;
        }
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
        const key = toKey(outingId);
        if (!key) {
            throw new Error('outingId requis pour charger les confirmations');
        }

        const entry = getCacheEntry(key);
        if (!force && entry.records.length > 0 && Date.now() - entry.fetchedAt < CACHE_TTL_MS) {
            return entry.records.slice();
        }

        const client = ensureClient();
        if (!client) return [];

        const { data, error } = await client
            .from('attendance_records')
            .select('id, outing_id, child_id, scout_name, scout_team, status, notes, marked_at, marked_by, parent_confirmed, parent_confirmed_at, leader_validated, leader_validated_at')
            .eq('outing_id', key)
            .order('scout_name', { ascending: true });

        if (error) {
            console.error(`${LOG_PREFIX} Erreur de chargement`, error);
            throw error;
        }

        const normalized = (data || []).map(normalizeRecord);
        setCache(key, normalized);
        notify('list', { outingId: key, records: normalized.slice() });
        return normalized.slice();
    }

    function getCached(outingId) {
        const entry = getCacheEntry(outingId);
        if (!entry) return [];
        return entry.records.slice();
    }

    function extractBoolean(value) {
        if (value === null || value === undefined) return null;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            const lower = value.toLowerCase();
            if (lower === 'true' || lower === '1' || lower === 't') return true;
            if (lower === 'false' || lower === '0' || lower === 'f') return false;
        }
        if (typeof value === 'number') {
            return value !== 0;
        }
        return null;
    }

    async function upsertWithSecret(options) {
        const {
            outingId,
            scoutName,
            childId = null,
            secret,
            status,
            notes,
            markedBy,
            scoutTeam,
            parentConfirmed,
            leaderValidated
        } = options;

        if (!secret) {
            throw new Error('Le mot de passe chef est requis pour cette action.');
        }
        const client = ensureClient();
        if (!client) return null;

        const cacheEntry = getCacheEntry(outingId);
        const existing = cacheEntry
            ? cacheEntry.records.find(item => item.scout_name === scoutName)
            : null;

        const payload = {
            p_secret: secret,
            p_outing_id: outingId,
            p_scout_name: scoutName,
            p_status: status ?? existing?.status ?? 'present',
            p_notes: notes ?? existing?.notes ?? '',
            p_marked_by: markedBy ?? existing?.marked_by ?? 'chef',
            p_scout_team: scoutTeam ?? existing?.scout_team ?? null,
            p_child_id: childId ?? existing?.child_id ?? null,
            p_parent_confirmed: parentConfirmed,
            p_leader_validated: leaderValidated
        };

        const { data, error } = await client.rpc('upsert_attendance_with_secret', payload);
        if (error) {
            console.error(`${LOG_PREFIX} Erreur d'enregistrement`, error);
            throw error;
        }

        const normalized = normalizeRecord(data);
        mergeRecordIntoCache(outingId, normalized);
        notify('upsert', { outingId, record: normalized });
        return normalized;
    }

    async function setParentConfirmation(options) {
        const {
            outingId,
            childId = null,
            scoutName,
            confirmed,
            secret = null
        } = options || {};

        if (!outingId) {
            throw new Error('outingId requis');
        }
        if (!scoutName) {
            throw new Error('scoutName requis');
        }
        const confirmedValue = extractBoolean(confirmed);
        if (confirmedValue === null) {
            throw new Error('confirmed doit être un booléen');
        }

        if (secret) {
            return upsertWithSecret({
                outingId,
                scoutName,
                childId,
                secret,
                parentConfirmed: confirmedValue
            });
        }

        const client = ensureClient();
        if (!client) return null;

        const { data, error } = await client.rpc('set_parent_confirmation', {
            p_outing_id: outingId,
            p_child_id: childId,
            p_scout_name: scoutName,
            p_confirmed: confirmedValue
        });

        if (error) {
            console.error(`${LOG_PREFIX} Erreur de confirmation parent`, error);
            throw error;
        }

        const normalized = normalizeRecord(data);
        mergeRecordIntoCache(outingId, normalized);
        notify('parent_confirmation', { outingId, record: normalized });
        return normalized;
    }

    async function setLeaderValidation(options) {
        const {
            outingId,
            childId = null,
            scoutName,
            validated,
            secret,
            status,
            notes,
            markedBy,
            scoutTeam,
            parentConfirmed
        } = options || {};

        const validatedValue = extractBoolean(validated);
        if (validatedValue === null) {
            throw new Error('validated doit être un booléen');
        }

        return upsertWithSecret({
            outingId,
            scoutName,
            childId,
            secret,
            status,
            notes,
            markedBy,
            scoutTeam,
            parentConfirmed: parentConfirmed !== undefined ? extractBoolean(parentConfirmed) : null,
            leaderValidated: validatedValue
        });
    }

    function clearCache(outingId) {
        if (outingId) {
            const key = toKey(outingId);
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
        warn('Listener invalide fourni à subscribe');
        return () => {};
    }

    function unsubscribe(listener) {
        listeners.delete(listener);
    }

    window.RegistrationsService = {
        list,
        getCached,
        setParentConfirmation,
        setLeaderValidation,
        upsertWithSecret,
        clearCache,
        subscribe,
        unsubscribe,
        normalizeRecord
    };

    log('Initialisation terminée');
})();


