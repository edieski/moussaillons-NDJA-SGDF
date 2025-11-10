(function () {
    const DEFAULT_EVENTS = {
        // Septembre 2025
        '28-9-2025': {
            title: '👨‍👩‍👧‍👦 Réunion parents',
            time: 'Dimanche',
            description: 'Réunion d\'information pour les parents'
        },

        // Octobre 2025
        '3-10-2025': {
            title: '🏕️ Weekend de Groupe',
            time: 'Vendredi - Départ',
            description: 'Weekend de groupe avec activités scoutes'
        },
        '4-10-2025': {
            title: '🏕️ Weekend de Groupe',
            time: 'Samedi - Retour',
            description: 'Weekend de groupe avec activités scoutes'
        },
        '12-10-2025': {
            title: '⛵ Sortie voile',
            time: 'Dimanche',
            description: 'Sortie voile à Verneuil sur Seine'
        },

        // Novembre 2025
        '15-11-2025': {
            title: '⛪ Weekend Abbaye d\'Epernon',
            time: 'Samedi - Départ',
            description: 'Weekend au Prieuré Saint Thomas'
        },
        '16-11-2025': {
            title: '⛪ Weekend Abbaye d\'Epernon',
            time: 'Dimanche - Retour',
            description: 'Weekend au Prieuré Saint Thomas'
        },

        // Décembre 2025
        '14-12-2025': {
            title: '🕯️ Lumière de Bethléem',
            time: 'Dimanche',
            description: 'Lumière de Bethléem + Crèche vivante'
        },

        // Janvier 2026
        '18-1-2026': {
            title: '⚓ Sortie Musée de la Marine',
            time: 'Dimanche',
            description: 'Sortie Musée de la Marine + galettes'
        },

        // Février 2026
        '8-2-2026': {
            title: '🗼 Sortie Montmartre',
            time: 'Dimanche',
            description: 'Découverte de Montmartre et du Sacré-Cœur'
        },

        // Mars 2026
        '14-3-2026': {
            title: '🌸 Weekend de mars',
            time: 'Samedi - Départ',
            description: 'Weekend de printemps avec activités nature'
        },
        '15-3-2026': {
            title: '🌸 Weekend de mars',
            time: 'Dimanche - Retour',
            description: 'Weekend de printemps avec activités nature'
        },

        // Avril 2026
        '12-4-2026': {
            title: '🏰 Sortie château',
            time: 'Dimanche',
            description: 'Visite d\'un château historique'
        },

        // Mai 2026
        '15-5-2026': {
            title: '🏰 Mini-camp Mont Saint-Michel',
            time: 'Vendredi - Départ',
            description: 'Mini-camp au Mont Saint-Michel'
        },
        '16-5-2026': {
            title: '🏰 Mini-camp Mont Saint-Michel',
            time: 'Samedi',
            description: 'Mini-camp au Mont Saint-Michel'
        },
        '17-5-2026': {
            title: '🏰 Mini-camp Mont Saint-Michel',
            time: 'Dimanche - Retour',
            description: 'Mini-camp au Mont Saint-Michel'
        },

        // Juin 2026
        '12-6-2026': {
            title: '👨‍👩‍👧‍👦 Réunion présentation camp',
            time: 'Vendredi 18h-20h',
            description: 'Réunion de présentation du camp d\'été'
        },
        '13-6-2026': {
            title: '🌸 Weekend de juin',
            time: 'Samedi - Départ',
            description: 'Weekend de fin d\'année'
        },
        '14-6-2026': {
            title: '🌸 Weekend de juin',
            time: 'Dimanche - Retour',
            description: 'Weekend de fin d\'année'
        },

        // Juillet 2026
        '5-7-2026': {
            title: '🏕️ Camp d\'été',
            time: 'Départ',
            description: 'Camp d\'été (première quinzaine des vacances Zone C)'
        },
        '19-7-2026': {
            title: '🏕️ Camp d\'été',
            time: 'Retour',
            description: 'Fin du camp d\'été (dates exactes à confirmer)'
        }
    };

    function cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    window.getDefaultCalendarEvents = function () {
        return cloneObject(DEFAULT_EVENTS);
    };

    window.getDefaultCalendarEventsList = function () {
        return Object.entries(DEFAULT_EVENTS).map(([dateKey, value]) => ({
            dateKey,
            ...cloneObject(value)
        }));
    };
})();

