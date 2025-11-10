(function () {
    'use strict';

    if (window.ScoutsRoster) {
        return;
    }

    const LOG_PREFIX = '[ScoutsRoster]';
    const FALLBACK_CHILDREN = [
        'DESCAMPS JEANNE',
        'LAURENT BILLET CLAIRE',
        'PICHEREAU JULES',
        'POTTER FELIX',
        'ROUSSEAU LEOPOLD',
        'JEANJEAN MADELEINE',
        'LALIGAND LEA',
        'MILLART CONSTANCE',
        'REYNAL DE SAINT MICHEL ALEXIA',
        "D'ANDREA DANTE",
        'JANDARD LEV',
        'ROIG OCTAVE',
        'RUEF ALFRED',
        'MATHIEN AMBRE',
        'FAUGERE LEA',
        'GENTIL CONSTANCE',
        'HUCHEZ SIBYLLE',
        'LANASPRE ROMANE',
        'NIERAT ZOE',
        'SERVONNAT LOUISON',
        'WARGNIER GABRIELLE',
        'POTTER OSCAR',
        'ROIG JULES',
        'TALPAERT GABRIEL'
    ];

    const collator = new Intl.Collator('fr-FR', { sensitivity: 'base', ignorePunctuation: true });

    function normalize(value) {
        return (value || '')
            .toString()
            .trim()
            .replace(/\s+/g, ' ')
            .toUpperCase();
    }

    function titleCase(value) {
        const lower = value.toLowerCase();
        return lower.replace(/(^|[\s\-'])([a-zàâçéèêëîïæœ])/g, (_match, prefix, letter) => prefix + letter.toUpperCase());
    }

    function collectFromTeams() {
        const collected = new Set();
        try {
            if (typeof getLifeTeams === 'function') {
                const lifeTeams = getLifeTeams();
                Object.values(lifeTeams || {}).forEach(team => {
                    (team.members || []).forEach(member => {
                        const normalized = normalize(member);
                        if (normalized) {
                            collected.add(normalized);
                        }
                    });
                });
            }
        } catch (error) {
            console.warn(`${LOG_PREFIX} Impossible de récupérer les équipes`, error);
        }
        return collected;
    }

    function buildRoster() {
        const uniqueNames = new Map();
        const teamNames = collectFromTeams();
        const sources = teamNames.size ? Array.from(teamNames) : FALLBACK_CHILDREN;

        sources.forEach(name => {
            const normalized = normalize(name);
            if (!normalized) {
                return;
            }
            if (!uniqueNames.has(normalized)) {
                uniqueNames.set(normalized, titleCase(normalized));
            }
        });

        // Toujours ajouter le fallback complet pour garantir la couverture
        FALLBACK_CHILDREN.forEach(name => {
            const normalized = normalize(name);
            if (!uniqueNames.has(normalized)) {
                uniqueNames.set(normalized, titleCase(normalized));
            }
        });

        const entries = Array.from(uniqueNames.entries())
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => collator.compare(a.value, b.value));

        return {
            entries,
            map: new Map(entries.map(entry => [entry.value, entry]))
        };
    }

    const roster = buildRoster();

    function getEntries() {
        return roster.entries.slice();
    }

    function getChildren() {
        return roster.entries.map(entry => entry.value);
    }

    function find(name) {
        const normalized = normalize(name);
        return roster.map.get(normalized) || null;
    }

    function resolve(name) {
        const entry = find(name);
        return entry ? entry.value : normalize(name);
    }

    window.ScoutsRoster = {
        getEntries,
        getChildren,
        find,
        resolve,
        normalize
    };
})();
