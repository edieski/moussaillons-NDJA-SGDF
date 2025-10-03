// Gestion des équipes de vie et de nuit
// Ce fichier gère les équipes de manière globale pour toutes les sorties

// Structure des équipes par défaut
const defaultTeams = {
    vie: {
        lions: {
            name: "🦁 Les Lions",
            color: "linear-gradient(135deg, var(--c-orange-600), var(--c-gold-400))",
            members: ["Oscar", "Jules R", "Dante", "Léopold", "Lev", "Alexia"]
        },
        aigles: {
            name: "🦅 Les Aigles", 
            color: "linear-gradient(135deg, var(--c-forest-700), var(--c-forest-500))",
            members: ["Alfred", "Jules P", "Felix", "Gabriel", "Octave", "Constance"]
        },
        loups: {
            name: "🐺 Les Loups",
            color: "linear-gradient(135deg, var(--c-marine-700), var(--c-marine-900))",
            members: ["Romane", "Louison", "Madeleine", "Claire", "Léa Leal", "Jeanne"]
        },
        renards: {
            name: "🦊 Les Renards",
            color: "linear-gradient(135deg, #fa709a, #fee140)",
            members: ["Gabrielle Wargnier", "Léa F", "Sybille", "Ambre"]
        }
    },
    nuit: {
        A: {
            name: "🌙 Équipe A",
            color: "linear-gradient(135deg, #2d3436, #636e72)",
            members: ["Oscar", "Jules R", "Dante", "Léopold", "Lev", "Alexia"]
        },
        B: {
            name: "🌙 Équipe B", 
            color: "linear-gradient(135deg, #2d3436, #636e72)",
            members: ["Alfred", "Jules P", "Felix", "Gabriel", "Octave", "Constance"]
        },
        C: {
            name: "🌙 Équipe C",
            color: "linear-gradient(135deg, #2d3436, #636e72)",
            members: ["Romane", "Louison", "Madeleine", "Claire", "Léa Leal", "Jeanne"]
        },
        D: {
            name: "🌙 Équipe D",
            color: "linear-gradient(135deg, #2d3436, #636e72)",
            members: ["Gabrielle Wargnier", "Léa F", "Sybille", "Ambre"]
        }
    }
};

// Charger les équipes depuis localStorage
function loadTeams() {
    const saved = localStorage.getItem('scout-teams');
    if (saved) {
        return JSON.parse(saved);
    }
    return defaultTeams;
}

// Sauvegarder les équipes dans localStorage
function saveTeams(teams) {
    localStorage.setItem('scout-teams', JSON.stringify(teams));
}

// Obtenir les équipes de vie
function getLifeTeams() {
    const teams = loadTeams();
    return teams.vie || {};
}

// Obtenir les équipes de nuit
function getNightTeams() {
    const teams = loadTeams();
    return teams.nuit || {};
}

// Mettre à jour une équipe de vie
function updateLifeTeam(teamId, teamData) {
    const teams = loadTeams();
    if (!teams.vie) teams.vie = {};
    teams.vie[teamId] = teamData;
    saveTeams(teams);
}

// Mettre à jour une équipe de nuit
function updateNightTeam(teamId, teamData) {
    const teams = loadTeams();
    if (!teams.nuit) teams.nuit = {};
    teams.nuit[teamId] = teamData;
    saveTeams(teams);
}

// Supprimer une équipe de vie
function deleteLifeTeam(teamId) {
    const teams = loadTeams();
    if (teams.vie && teams.vie[teamId]) {
        delete teams.vie[teamId];
        saveTeams(teams);
    }
}

// Supprimer une équipe de nuit
function deleteNightTeam(teamId) {
    const teams = loadTeams();
    if (teams.nuit && teams.nuit[teamId]) {
        delete teams.nuit[teamId];
        saveTeams(teams);
    }
}

// Créer une nouvelle équipe de vie
function createLifeTeam(name, color, members = []) {
    const teams = loadTeams();
    if (!teams.vie) teams.vie = {};
    
    const teamId = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    teams.vie[teamId] = {
        name: name,
        color: color,
        members: members
    };
    saveTeams(teams);
    return teamId;
}

// Créer une nouvelle équipe de nuit
function createNightTeam(name, color, members = []) {
    const teams = loadTeams();
    if (!teams.nuit) teams.nuit = {};
    
    const teamId = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    teams.nuit[teamId] = {
        name: name,
        color: color,
        members: members
    };
    saveTeams(teams);
    return teamId;
}

// Réinitialiser les équipes aux valeurs par défaut
function resetTeamsToDefault() {
    saveTeams(defaultTeams);
}

// Obtenir tous les membres de toutes les équipes de vie
function getAllLifeTeamMembers() {
    const teams = getLifeTeams();
    const allMembers = [];
    Object.values(teams).forEach(team => {
        allMembers.push(...team.members);
    });
    return [...new Set(allMembers)]; // Supprimer les doublons
}

// Obtenir tous les membres de toutes les équipes de nuit
function getAllNightTeamMembers() {
    const teams = getNightTeams();
    const allMembers = [];
    Object.values(teams).forEach(team => {
        allMembers.push(...team.members);
    });
    return [...new Set(allMembers)]; // Supprimer les doublons
}

// Vérifier si un membre est dans une équipe spécifique
function isMemberInTeam(memberName, teamType, teamId) {
    const teams = loadTeams();
    const teamTypeData = teams[teamType];
    if (teamTypeData && teamTypeData[teamId]) {
        return teamTypeData[teamId].members.includes(memberName);
    }
    return false;
}

// Déplacer un membre d'une équipe à une autre
function moveMemberToTeam(memberName, fromTeamType, fromTeamId, toTeamType, toTeamId) {
    const teams = loadTeams();
    
    // Retirer du team source
    if (teams[fromTeamType] && teams[fromTeamType][fromTeamId]) {
        teams[fromTeamType][fromTeamId].members = 
            teams[fromTeamType][fromTeamId].members.filter(m => m !== memberName);
    }
    
    // Ajouter au team destination
    if (teams[toTeamType] && teams[toTeamType][toTeamId]) {
        if (!teams[toTeamType][toTeamId].members.includes(memberName)) {
            teams[toTeamType][toTeamId].members.push(memberName);
        }
    }
    
    saveTeams(teams);
}

// Exporter les équipes pour sauvegarde
function exportTeams() {
    const teams = loadTeams();
    const dataStr = JSON.stringify(teams, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'equipes-scout.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Importer les équipes depuis un fichier
function importTeams(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedTeams = JSON.parse(e.target.result);
            saveTeams(importedTeams);
            alert('Équipes importées avec succès !');
            // Recharger l'interface si elle existe
            if (typeof refreshTeamsDisplay === 'function') {
                refreshTeamsDisplay();
            }
        } catch (error) {
            alert('Erreur lors de l\'importation : ' + error.message);
        }
    };
    reader.readAsText(file);
}