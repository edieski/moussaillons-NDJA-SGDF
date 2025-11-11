// Module partagé pour la gestion du covoiturage
// À utiliser dans admin.html ET covoiturage.html

(() => {
    'use strict';

    // Vérifier que Supabase est disponible
    if (!window.carpoolSupabase) {
        console.error('[Carpool] Client Supabase non disponible');
        return;
    }

    const supabase = window.carpoolSupabase;
    const LOG_PREFIX = '[Carpool]';

    // Cache pour éviter les requêtes répétées
    let tripsCache = [];
    let driversCache = {};
    let passengersCache = {};

    // ============================================
    // UTILITAIRES
    // ============================================

    function log(message, data) {
        if (data !== undefined) {
            console.log(`${LOG_PREFIX} ${message}`, data);
        } else {
            console.log(`${LOG_PREFIX} ${message}`);
        }
    }

    function notify(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`${LOG_PREFIX} [${type}] ${message}`);
        }
    }

    function normalizeId(value) {
        return value != null ? String(value) : null;
    }

    function sameId(a, b) {
        return normalizeId(a) === normalizeId(b);
    }

    const DIRECTIONS = Object.freeze({
        OUTBOUND: 'outbound',
        RETURN: 'return',
        ROUND_TRIP: 'round-trip'
    });

    function normalizeDirection(value, options = {}) {
        const {
            allowRoundTrip = true,
            defaultDirection = DIRECTIONS.ROUND_TRIP
        } = options;

        if (value == null || value === '') {
            return defaultDirection;
        }

        const raw = String(value).trim().toLowerCase();
        if (!raw) {
            return defaultDirection;
        }

        if (raw === 'outbound' || raw === 'aller' || raw === 'aller-seulement' || raw === 'aller_only') {
            return DIRECTIONS.OUTBOUND;
        }

        if (raw === 'return' || raw === 'retour' || raw === 'retour-seulement' || raw === 'retour_only') {
            return DIRECTIONS.RETURN;
        }

        if (allowRoundTrip && (raw === 'round-trip' || raw === 'roundtrip' || raw === 'round_trip' || raw === 'aller-retour')) {
            return DIRECTIONS.ROUND_TRIP;
        }

        return defaultDirection;
    }

    function normalizePassengerRow(row) {
        if (!row) return null;
        const direction = normalizeDirection(row.direction ?? row.round_trip ?? row.roundTrip, {
            allowRoundTrip: true,
            defaultDirection: DIRECTIONS.ROUND_TRIP
        });
        return {
            ...row,
            direction
        };
    }

    // ============================================
    // GESTION DES SORTIES (using OutingsService)
    // ============================================

    async function loadTrips() {
        log('Chargement des sorties via OutingsService...');

        try {
            if (!window.OutingsService) {
                throw new Error('OutingsService non disponible');
            }

            const outings = await window.OutingsService.list();
            tripsCache = outings.map(outing => window.OutingsService.toCarpoolTrip(outing));
            log(`${tripsCache.length} sortie(s) chargée(s)`, tripsCache);
            return tripsCache;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur lors du chargement`, error);
            notify(`Erreur de chargement: ${error.message}`, 'error');
            return [];
        }
    }

    async function createTrip(tripData) {
        log('Création d\'une sortie via OutingsService...', tripData);

        try {
            if (!window.OutingsService) {
                throw new Error('OutingsService non disponible');
            }

            // Demander le mot de passe si nécessaire
            const secret = prompt('Mot de passe chef requis pour créer une sortie:');
            if (!secret) {
                throw new Error('Mot de passe requis');
            }

            const outing = await window.OutingsService.create(tripData, secret);
            const trip = window.OutingsService.toCarpoolTrip(outing);
            tripsCache.push(trip);
            log('Sortie créée', trip);
            notify(`Sortie "${trip.title}" créée avec succès`, 'success');
            return trip;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur création`, error);
            notify(`Impossible de créer la sortie: ${error.message}`, 'error');
            return null;
        }
    }

    async function updateTrip(tripId, updates) {
        log('Mise à jour d\'une sortie via OutingsService...', { tripId, updates });

        try {
            if (!window.OutingsService) {
                throw new Error('OutingsService non disponible');
            }

            // Demander le mot de passe si nécessaire
            const secret = prompt('Mot de passe chef requis pour modifier une sortie:');
            if (!secret) {
                throw new Error('Mot de passe requis');
            }

            const outing = await window.OutingsService.update(tripId, updates, secret);
            const trip = window.OutingsService.toCarpoolTrip(outing);

            // Mettre à jour le cache
            const index = tripsCache.findIndex(t => sameId(t.id, tripId));
            if (index !== -1) {
                tripsCache[index] = trip;
            }

            log('Sortie mise à jour', trip);
            notify('Sortie mise à jour avec succès', 'success');
            return trip;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur mise à jour`, error);
            notify(`Impossible de mettre à jour: ${error.message}`, 'error');
            return null;
        }
    }

    async function deleteTrip(tripId) {
        log('Suppression d\'une sortie via OutingsService...', tripId);

        try {
            if (!window.OutingsService) {
                throw new Error('OutingsService non disponible');
            }

            // Demander le mot de passe si nécessaire
            const secret = prompt('Mot de passe chef requis pour supprimer une sortie:');
            if (!secret) {
                throw new Error('Mot de passe requis');
            }

            await window.OutingsService.remove(tripId, secret);

            // Mettre à jour le cache
            tripsCache = tripsCache.filter(t => !sameId(t.id, tripId));
            delete driversCache[tripId];
            delete passengersCache[tripId];

            log('Sortie supprimée');
            notify('Sortie supprimée avec succès', 'success');
            return true;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur suppression`, error);
            notify(`Impossible de supprimer: ${error.message}`, 'error');
            return false;
        }
    }

    // ============================================
    // GESTION DES CONDUCTEURS
    // ============================================

    function normalizeDriverRow(row, fallback = {}) {
        if (!row) return null;

        const kidSpots = row.kid_spots ?? row.seats_available ?? fallback.kid_spots ?? fallback.seats_available ?? 0;
        const adultSpots = row.adult_spots ?? fallback.adult_spots ?? 0;

        const hasExplicitRoundTrip = row.round_trip !== undefined && row.round_trip !== null && row.round_trip !== '';
        const fallbackRoundTrip = fallback.round_trip;
        const supportsOutbound = row.supports_outbound ?? fallback.supports_outbound ?? (row.is_round_trip ? true : undefined);
        const supportsReturn = row.supports_return ?? fallback.supports_return ?? (row.is_round_trip ? true : undefined);
        const inferredRoundTrip = (() => {
            if (hasExplicitRoundTrip) {
                return row.round_trip;
            }
            if (fallbackRoundTrip) {
                return fallbackRoundTrip;
            }
            if (supportsOutbound && supportsReturn) {
                return 'aller-retour';
            }
            if (supportsOutbound) {
                return 'aller-seulement';
            }
            if (supportsReturn) {
                return 'retour-seulement';
            }
            if (row.is_round_trip === false) {
                if (fallbackRoundTrip === 'retour-seulement') {
                    return 'retour-seulement';
                }
                return 'aller-seulement';
            }
            return 'aller-retour';
        })();

        const resolvedSupportsOutbound = supportsOutbound ?? (inferredRoundTrip === 'aller-retour' || inferredRoundTrip === 'aller-seulement');
        const resolvedSupportsReturn = supportsReturn ?? (inferredRoundTrip === 'aller-retour' || inferredRoundTrip === 'retour-seulement');
        const isRoundTrip = row.is_round_trip !== undefined ? row.is_round_trip : (resolvedSupportsOutbound && resolvedSupportsReturn);

        return {
            ...row,
            kid_spots: kidSpots,
            adult_spots: adultSpots,
            seats_available: row.seats_available ?? kidSpots,
            round_trip: inferredRoundTrip,
            is_round_trip: isRoundTrip,
            supports_outbound: resolvedSupportsOutbound,
            supports_return: resolvedSupportsReturn
        };
    }

    async function loadDrivers(outingId, force = false) {
        log('Chargement des conducteurs...', outingId);

        try {
            const { data, error } = await supabase
                .from('carpool_drivers')
                .select('*')
                .eq('outing_id', outingId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const rows = data || [];
            const normalized = rows.map(row => normalizeDriverRow(row));
            driversCache[outingId] = normalized;
            log(`${normalized.length} conducteur(s) chargé(s)`, normalized);
            return normalized;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur chargement conducteurs`, error);
            notify(`Erreur de chargement: ${error.message}`, 'error');
            return [];
        }
    }

    async function createDriver(driverData) {
        log('Création d\'un conducteur...', driverData);

        try {
            const outingId = driverData.outing_id || driverData.trip_id;
            const kidSpots = driverData.kid_spots || driverData.kidSpots || driverData.seats_available || 4;
            const adultSpots = driverData.adult_spots || driverData.adultSpots || 0;

            const selectedRoundTrip = driverData.round_trip || driverData.roundTrip || 'aller-retour';
            const isRoundTrip = driverData.is_round_trip !== undefined
                ? driverData.is_round_trip
                : (selectedRoundTrip === 'aller-retour');
            const supportsOutbound = driverData.supports_outbound ?? (selectedRoundTrip === 'aller-retour' || selectedRoundTrip === 'aller-seulement');
            const supportsReturn = driverData.supports_return ?? (selectedRoundTrip === 'aller-retour' || selectedRoundTrip === 'retour-seulement');

            const basePayload = {
                outing_id: outingId,
                name: driverData.name,
                phone: driverData.phone || null,
                seats_available: kidSpots, // Keep for backward compatibility
                kid_spots: kidSpots,
                adult_spots: adultSpots,
                departure_location: driverData.departure_location || '',
                notes: driverData.notes || '',
                supports_outbound: supportsOutbound,
                supports_return: supportsReturn,
                outbound_time: driverData.outbound_time || null,
                return_time: driverData.return_time || null
            };

            const extendedPayload = {
                ...basePayload,
                round_trip: selectedRoundTrip
            };

            async function tryInsert(payload) {
                const { is_round_trip: _omitIsRoundTrip, ...rest } = payload;
                return supabase
                    .from('carpool_drivers')
                    .insert(rest)
                    .select()
                    .single();
            }

            let data, error;
            ({ data, error } = await tryInsert(extendedPayload));

            const message = (error && error.message) || '';
            if (message && /is_round_trip/.test(message)) {
                ({ data, error } = await tryInsert({ ...basePayload, round_trip: selectedRoundTrip }));
            }
            if (error) {
                const msg2 = (error && error.message) || '';
                if (msg2 && /round_trip/.test(msg2)) {
                    ({ data, error } = await tryInsert(basePayload));
                }
            }

            if (error) throw error;

            // Mettre à jour le cache
            if (!driversCache[outingId]) {
                driversCache[outingId] = [];
            }
            const enrichedDriver = {
                ...data,
                round_trip: data?.round_trip || selectedRoundTrip,
                is_round_trip: data?.is_round_trip !== undefined ? data.is_round_trip : isRoundTrip,
                kid_spots: data?.kid_spots ?? kidSpots,
                adult_spots: data?.adult_spots ?? adultSpots
            };
            const normalizedDriver = normalizeDriverRow(enrichedDriver, {
                kid_spots: kidSpots,
                adult_spots: adultSpots,
                round_trip: selectedRoundTrip,
                supports_outbound: supportsOutbound,
                supports_return: supportsReturn
            });
            driversCache[outingId].push(normalizedDriver);

            log('Conducteur créé', normalizedDriver);
            notify('Conducteur ajouté avec succès', 'success');
            return normalizedDriver;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur création conducteur`, error);
            notify(`Impossible d'ajouter le conducteur: ${error.message}`, 'error');
            return null;
        }
    }

    async function updateDriver(driverId, updates) {
        log('Mise à jour d\'un conducteur...', { driverId, updates });
        
        try {
            const selectedRoundTrip = updates.round_trip || updates.roundTrip;
            const isRoundTrip = updates.is_round_trip;

            const baseUpdates = { ...updates };
            if ('roundTrip' in baseUpdates) {
                const rt = baseUpdates.roundTrip;
                baseUpdates.is_round_trip = rt === 'aller-retour';
                baseUpdates.round_trip = baseUpdates.round_trip || rt;
                delete baseUpdates.roundTrip;
            }
            if (selectedRoundTrip) {
                baseUpdates.is_round_trip = selectedRoundTrip === 'aller-retour';
                baseUpdates.supports_outbound ??= (selectedRoundTrip === 'aller-retour' || selectedRoundTrip === 'aller-seulement');
                baseUpdates.supports_return ??= (selectedRoundTrip === 'aller-retour' || selectedRoundTrip === 'retour-seulement');
            }
            if (updates.supports_outbound !== undefined) {
                baseUpdates.supports_outbound = updates.supports_outbound;
            }
            if (updates.supports_return !== undefined) {
                baseUpdates.supports_return = updates.supports_return;
            }
            if (baseUpdates.supports_outbound !== undefined && baseUpdates.supports_return !== undefined && selectedRoundTrip == null) {
                baseUpdates.is_round_trip = baseUpdates.supports_outbound && baseUpdates.supports_return;
            }

            async function tryUpdate(payload) {
                const { is_round_trip: _omitIsRoundTrip, ...rest } = payload;
                return supabase
                    .from('carpool_drivers')
                    .update(rest)
                    .eq('id', driverId)
                    .select()
                    .single();
            }

            let data, error;
            ({ data, error } = await tryUpdate(baseUpdates));

            if (error) {
                const message = error.message || '';
                if (/round_trip/.test(message)) {
                    const { round_trip, ...rest } = baseUpdates;
                    ({ data, error } = await tryUpdate(rest));
                }
            }

            if (error) throw error;

            const normalized = normalizeDriverRow(data, {
                round_trip: selectedRoundTrip,
                is_round_trip: isRoundTrip,
                supports_outbound: baseUpdates.supports_outbound,
                supports_return: baseUpdates.supports_return
            });

            // Mettre à jour le cache
            Object.keys(driversCache).forEach(tripId => {
                const index = driversCache[tripId].findIndex(d => sameId(d.id, driverId));
                if (index !== -1) {
                    driversCache[tripId][index] = normalized;
                }
            });

            log('Conducteur mis à jour', normalized);
            notify('Conducteur mis à jour avec succès', 'success');
            return normalized;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur mise à jour conducteur`, error);
            notify(`Impossible de mettre à jour: ${error.message}`, 'error');
            return null;
        }
    }

    async function deleteDriver(driverId) {
        log('Suppression d\'un conducteur...', driverId);
        
        try {
            // Détacher les passagers assignés à ce conducteur
            const { data: affectedPassengers, error: detachError } = await supabase
                .from('carpool_passengers')
                .update({ driver_id: null })
                .eq('driver_id', driverId)
                .select('id, outing_id');

            if (detachError) throw detachError;

            const { error } = await supabase
                .from('carpool_drivers')
                .delete()
                .eq('id', driverId);

            if (error) throw error;

            // Mettre à jour le cache des conducteurs
            Object.keys(driversCache).forEach(tripId => {
                driversCache[tripId] = (driversCache[tripId] || []).filter(d => !sameId(d.id, driverId));
            });

            // Mettre à jour le cache des passagers
            if (Array.isArray(affectedPassengers) && affectedPassengers.length) {
                affectedPassengers.forEach(passenger => {
                    const tripId = normalizeId(passenger.outing_id);
                    if (!tripId || !Array.isArray(passengersCache[tripId])) {
                        return;
                    }
                    passengersCache[tripId] = passengersCache[tripId].map(p => {
                        if (sameId(p.id, passenger.id)) {
                            return { ...p, driver_id: null };
                        }
                        return p;
                    });
                });
            }

            log('Conducteur supprimé et passagers détachés', {
                driverId,
                detachedPassengers: affectedPassengers ? affectedPassengers.length : 0
            });
            notify('Conducteur supprimé. Les enfants ont été replacés dans la liste sans voiture.', 'success');
            return true;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur suppression conducteur`, error);
            notify(`Impossible de supprimer: ${error.message}`, 'error');
            return false;
        }
    }

    // ============================================
    // GESTION DES PASSAGERS
    // ============================================

    async function loadPassengers(outingId, force = false) {
        log('Chargement des passagers...', outingId);

        try {
            const { data, error } = await supabase
                .from('carpool_passengers')
                .select('*')
                .eq('outing_id', outingId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const rows = (data || [])
                .map(normalizePassengerRow)
                .filter(Boolean);

            passengersCache[outingId] = rows;
            log(`${rows.length} passager(s) chargé(s)`, rows);
            return rows;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur chargement passagers`, error);
            notify(`Erreur de chargement: ${error.message}`, 'error');
            return [];
        }
    }

    async function createPassenger(passengerData) {
        log('Création d\'un passager...', passengerData);

        try {
            const outingId = passengerData.outing_id || passengerData.trip_id;
            const resolvedDirection = normalizeDirection(
                passengerData.direction ?? passengerData.roundTrip,
                { allowRoundTrip: true, defaultDirection: DIRECTIONS.ROUND_TRIP }
            );

            const insertPayload = {
                outing_id: outingId,
                driver_id: passengerData.driver_id || null,
                child_id: passengerData.child_id || passengerData.childId || null,
                child_name: passengerData.child_name || passengerData.name,
                guardian_name: passengerData.guardian_name || '',
                guardian_phone: passengerData.guardian_phone || '',
                notes: passengerData.notes || '',
                direction: resolvedDirection
            };

            const { data, error } = await supabase
                .from('carpool_passengers')
                .insert(insertPayload)
                .select()
                .single();

            if (error) throw error;

            // Mettre à jour le cache
            if (!passengersCache[outingId]) {
                passengersCache[outingId] = [];
            }
            const normalizedPassenger = normalizePassengerRow(data);
            if (normalizedPassenger) {
                passengersCache[outingId].push(normalizedPassenger);
            }

            log('Passager créé', normalizedPassenger || data);
            notify('Passager inscrit avec succès', 'success');
            return normalizedPassenger || data;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur création passager`, error);
            notify(`Impossible d'inscrire le passager: ${error.message}`, 'error');
            return null;
        }
    }

    async function updatePassenger(passengerId, updates) {
        log('Mise à jour d\'un passager...', { passengerId, updates });
        
        try {
            const baseUpdates = { ...updates };

            if ('roundTrip' in baseUpdates) {
                if (baseUpdates.roundTrip !== undefined && baseUpdates.roundTrip !== null && baseUpdates.direction == null) {
                    baseUpdates.direction = baseUpdates.roundTrip;
                }
                delete baseUpdates.roundTrip;
            }

            if (baseUpdates.direction !== undefined) {
                baseUpdates.direction = normalizeDirection(baseUpdates.direction, {
                    allowRoundTrip: true,
                    defaultDirection: DIRECTIONS.ROUND_TRIP
                });
            }

            const { data, error } = await supabase
                .from('carpool_passengers')
                .update(baseUpdates)
                .eq('id', passengerId)
                .select()
                .single();

            if (error) throw error;

            const normalized = normalizePassengerRow(data);

            // Mettre à jour le cache
            Object.keys(passengersCache).forEach(tripId => {
                const index = passengersCache[tripId].findIndex(p => sameId(p.id, passengerId));
                if (index !== -1) {
                    passengersCache[tripId][index] = normalized || data;
                }
            });

            log('Passager mis à jour', normalized || data);
            notify('Passager mis à jour avec succès', 'success');
            return normalized || data;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur mise à jour passager`, error);
            notify(`Impossible de mettre à jour: ${error.message}`, 'error');
            return null;
        }
    }

    async function deletePassenger(passengerId) {
        log('Suppression d\'un passager...', passengerId);
        
        try {
            const { error } = await supabase
                .from('carpool_passengers')
                .delete()
                .eq('id', passengerId);

            if (error) throw error;

            // Mettre à jour le cache
            Object.keys(passengersCache).forEach(tripId => {
                passengersCache[tripId] = passengersCache[tripId].filter(p => !sameId(p.id, passengerId));
            });

            log('Passager supprimé');
            notify('Passager supprimé avec succès', 'success');
            return true;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur suppression passager`, error);
            notify(`Impossible de supprimer: ${error.message}`, 'error');
            return false;
        }
    }

    // ============================================
    // FONCTIONS UTILITAIRES
    // ============================================

    function isDriverOutbound(driver) {
        return driver?.supports_outbound !== false;
    }

    function isDriverReturn(driver) {
        return driver?.supports_return !== false;
    }

    function passengerMatchesDirection(passenger, direction) {
        if (!passenger) return false;
        const passengerDirection = normalizeDirection(passenger.direction ?? passenger.roundTrip, {
            allowRoundTrip: true,
            defaultDirection: DIRECTIONS.ROUND_TRIP
        });
        const targetDirection = normalizeDirection(direction, {
            allowRoundTrip: false,
            defaultDirection: DIRECTIONS.OUTBOUND
        });

        if (passengerDirection === DIRECTIONS.ROUND_TRIP) {
            return targetDirection === DIRECTIONS.OUTBOUND || targetDirection === DIRECTIONS.RETURN;
        }

        return passengerDirection === targetDirection;
    }

    function getRemainingSeats(driver, passengers) {
        const seats = driver.seats_available || 0;
        const assigned = passengers.filter(p => sameId(p.driver_id, driver.id)).length;
        return Math.max(0, seats - assigned);
    }

    function getRemainingSeatsForDirection(driver, passengers, direction) {
        const seats = driver.seats_available || 0;
        const assigned = passengers.filter(p => sameId(p.driver_id, driver.id) && passengerMatchesDirection(p, direction)).length;
        return Math.max(0, seats - assigned);
    }

    function getDriverById(tripId, driverId) {
        const drivers = driversCache[tripId] || [];
        return drivers.find(d => sameId(d.id, driverId));
    }

    function getPassengersByDriver(tripId, driverId) {
        const passengers = passengersCache[tripId] || [];
        return passengers.filter(p => sameId(p.driver_id, driverId));
    }

    function clearCache() {
        tripsCache = [];
        driversCache = {};
        passengersCache = {};
        log('Cache vidé');
    }

    // ============================================
    // EXPORT PUBLIC
    // ============================================

    window.CarpoolManager = {
        // Sorties
        loadTrips,
        createTrip,
        updateTrip,
        deleteTrip,
        getTrips: () => [...tripsCache],
        
        // Conducteurs
        loadDrivers,
        createDriver,
        updateDriver,
        deleteDriver,
        getDrivers: (tripId) => driversCache[tripId] ? [...driversCache[tripId]] : [],
        
        // Passagers
        loadPassengers,
        createPassenger,
        updatePassenger,
        deletePassenger,
        getPassengers: (tripId) => passengersCache[tripId] ? [...passengersCache[tripId]] : [],
        
        // Utilitaires
        getRemainingSeats,
        getRemainingSeatsForDirection,
        isDriverOutbound,
        isDriverReturn,
        passengerMatchesDirection,
        getDriverById,
        getPassengersByDriver,
        clearCache,
        sameId,
        DIRECTIONS,
        normalizeDirection,
        
        // Pour le debugging
        log,
        notify
    };

    log('Module CarpoolManager initialisé et disponible');
})();
