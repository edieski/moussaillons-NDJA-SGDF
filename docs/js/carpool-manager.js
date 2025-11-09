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

    // ============================================
    // GESTION DES SORTIES
    // ============================================

    async function loadTrips() {
        log('Chargement des sorties...');
        
        try {
            const { data, error } = await supabase
                .from('carpool_trips')
                .select('*')
                .order('date', { ascending: true })
                .order('created_at', { ascending: true });

            if (error) throw error;

            tripsCache = data || [];
            log(`${tripsCache.length} sortie(s) chargée(s)`, tripsCache);
            return tripsCache;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur lors du chargement`, error);
            notify(`Erreur de chargement: ${error.message}`, 'error');
            return [];
        }
    }

    async function createTrip(tripData) {
        log('Création d\'une sortie...', tripData);
        
        try {
            const { data, error } = await supabase
                .from('carpool_trips')
                .insert({
                    title: tripData.title,
                    date: tripData.date || null,
                    location: tripData.location || '',
                    description: tripData.description || '',
                    departure_time: tripData.departure_time || null,
                    meeting_point: tripData.meeting_point || ''
                })
                .select()
                .single();

            if (error) throw error;

            tripsCache.push(data);
            log('Sortie créée', data);
            notify(`Sortie "${data.title}" créée avec succès`, 'success');
            return data;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur création`, error);
            notify(`Impossible de créer la sortie: ${error.message}`, 'error');
            return null;
        }
    }

    async function updateTrip(tripId, updates) {
        log('Mise à jour d\'une sortie...', { tripId, updates });
        
        try {
            const { data, error } = await supabase
                .from('carpool_trips')
                .update(updates)
                .eq('id', tripId)
                .select()
                .single();

            if (error) throw error;

            // Mettre à jour le cache
            const index = tripsCache.findIndex(t => sameId(t.id, tripId));
            if (index !== -1) {
                tripsCache[index] = data;
            }

            log('Sortie mise à jour', data);
            notify('Sortie mise à jour avec succès', 'success');
            return data;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur mise à jour`, error);
            notify(`Impossible de mettre à jour: ${error.message}`, 'error');
            return null;
        }
    }

    async function deleteTrip(tripId) {
        log('Suppression d\'une sortie...', tripId);
        
        try {
            const { error } = await supabase
                .from('carpool_trips')
                .delete()
                .eq('id', tripId);

            if (error) throw error;

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

    async function loadDrivers(tripId) {
        log('Chargement des conducteurs...', tripId);
        
        try {
            const { data, error } = await supabase
                .from('carpool_drivers')
                .select('*')
                .eq('trip_id', tripId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            driversCache[tripId] = data || [];
            log(`${data.length} conducteur(s) chargé(s)`, data);
            return data;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur chargement conducteurs`, error);
            notify(`Erreur de chargement: ${error.message}`, 'error');
            return [];
        }
    }

    async function createDriver(driverData) {
        log('Création d\'un conducteur...', driverData);
        
        try {
            const { data, error } = await supabase
                .from('carpool_drivers')
                .insert({
                    trip_id: driverData.trip_id,
                    name: driverData.name,
                    phone: driverData.phone || null,
                    seats_available: driverData.seats_available || 4,
                    departure_location: driverData.departure_location || '',
                    notes: driverData.notes || ''
                })
                .select()
                .single();

            if (error) throw error;

            // Mettre à jour le cache
            if (!driversCache[driverData.trip_id]) {
                driversCache[driverData.trip_id] = [];
            }
            driversCache[driverData.trip_id].push(data);

            log('Conducteur créé', data);
            notify('Conducteur ajouté avec succès', 'success');
            return data;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur création conducteur`, error);
            notify(`Impossible d'ajouter le conducteur: ${error.message}`, 'error');
            return null;
        }
    }

    async function updateDriver(driverId, updates) {
        log('Mise à jour d\'un conducteur...', { driverId, updates });
        
        try {
            const { data, error } = await supabase
                .from('carpool_drivers')
                .update(updates)
                .eq('id', driverId)
                .select()
                .single();

            if (error) throw error;

            // Mettre à jour le cache
            Object.keys(driversCache).forEach(tripId => {
                const index = driversCache[tripId].findIndex(d => sameId(d.id, driverId));
                if (index !== -1) {
                    driversCache[tripId][index] = data;
                }
            });

            log('Conducteur mis à jour', data);
            notify('Conducteur mis à jour avec succès', 'success');
            return data;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur mise à jour conducteur`, error);
            notify(`Impossible de mettre à jour: ${error.message}`, 'error');
            return null;
        }
    }

    async function deleteDriver(driverId) {
        log('Suppression d\'un conducteur...', driverId);
        
        try {
            const { error } = await supabase
                .from('carpool_drivers')
                .delete()
                .eq('id', driverId);

            if (error) throw error;

            // Mettre à jour le cache
            Object.keys(driversCache).forEach(tripId => {
                driversCache[tripId] = driversCache[tripId].filter(d => !sameId(d.id, driverId));
            });

            log('Conducteur supprimé');
            notify('Conducteur supprimé avec succès', 'success');
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

    async function loadPassengers(tripId) {
        log('Chargement des passagers...', tripId);
        
        try {
            const { data, error } = await supabase
                .from('carpool_passengers')
                .select('*')
                .eq('trip_id', tripId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            passengersCache[tripId] = data || [];
            log(`${data.length} passager(s) chargé(s)`, data);
            return data;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur chargement passagers`, error);
            notify(`Erreur de chargement: ${error.message}`, 'error');
            return [];
        }
    }

    async function createPassenger(passengerData) {
        log('Création d\'un passager...', passengerData);
        
        try {
            const { data, error } = await supabase
                .from('carpool_passengers')
                .insert({
                    trip_id: passengerData.trip_id,
                    driver_id: passengerData.driver_id || null,
                    name: passengerData.name
                })
                .select()
                .single();

            if (error) throw error;

            // Mettre à jour le cache
            if (!passengersCache[passengerData.trip_id]) {
                passengersCache[passengerData.trip_id] = [];
            }
            passengersCache[passengerData.trip_id].push(data);

            log('Passager créé', data);
            notify('Passager inscrit avec succès', 'success');
            return data;
        } catch (error) {
            console.error(`${LOG_PREFIX} Erreur création passager`, error);
            notify(`Impossible d'inscrire le passager: ${error.message}`, 'error');
            return null;
        }
    }

    async function updatePassenger(passengerId, updates) {
        log('Mise à jour d\'un passager...', { passengerId, updates });
        
        try {
            const { data, error } = await supabase
                .from('carpool_passengers')
                .update(updates)
                .eq('id', passengerId)
                .select()
                .single();

            if (error) throw error;

            // Mettre à jour le cache
            Object.keys(passengersCache).forEach(tripId => {
                const index = passengersCache[tripId].findIndex(p => sameId(p.id, passengerId));
                if (index !== -1) {
                    passengersCache[tripId][index] = data;
                }
            });

            log('Passager mis à jour', data);
            notify('Passager mis à jour avec succès', 'success');
            return data;
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

    function getRemainingSeats(driver, passengers) {
        const seats = driver.seats_available || 0;
        const assigned = passengers.filter(p => sameId(p.driver_id, driver.id)).length;
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
        getDriverById,
        getPassengersByDriver,
        clearCache,
        sameId,
        
        // Pour le debugging
        log,
        notify
    };

    log('Module CarpoolManager initialisé et disponible');
})();
