        // Override showPage function to add page-specific loading
        const originalShowPage = window.showPage;
        window.showPage = function(pageId) {
            // Call the original function
            originalShowPage(pageId);
            
            // Add page-specific functionality
            if (pageId === 'calendrier') {
                setTimeout(() => {
                    if (typeof loadCalendar === 'function') {
                        loadCalendar();
                    }
                }, 100);
            }
            
            // Charger les sorties pour le registre d'appel
            if (pageId === 'registre') {
                setTimeout(() => {
                    if (typeof loadTripsFromCalendar === 'function') {
                        loadTripsFromCalendar();
                    }
                }, 100);
            }
        };


        // Créer arbres magiques - Réduit pour les performances
        const treesContainer = document.getElementById('trees');
        for (let i = 0; i < 5; i++) {
            const tree = document.createElement('div');
            tree.className = 'magic-tree';
            tree.textContent = ['î▓', 'î│', 'î'][Math.floor(Math.random() * 3)];
            tree.style.left = Math.random() * 100 + '%';
            tree.style.animationDelay = Math.random() * 6 + 's';
            treesContainer.appendChild(tree);
        }

        // Créer feuilles tombantes - Réduit pour les performances
        const leavesContainer = document.getElementById('leaves');
        for (let i = 0; i < 6; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'fey-leaf';
            leaf.textContent = ['ìé', 'ìâ', 'î', 'ì'][Math.floor(Math.random() * 4)];
            leaf.style.left = Math.random() * 100 + '%';
            leaf.style.animationDelay = Math.random() * 8 + 's';
            leaf.style.animationDuration = (8 + Math.random() * 4) + 's';
            leavesContainer.appendChild(leaf);
        }

        // Créer lucioles - Réduit pour les performances
        const firefliesContainer = document.getElementById('fireflies');
        for (let i = 0; i < 8; i++) {
            const firefly = document.createElement('div');
            firefly.className = 'fey-firefly';
            firefly.style.left = Math.random() * 100 + '%';
            firefly.style.top = Math.random() * 100 + '%';
            firefly.style.animationDelay = Math.random() * 3 + 's';
            firefliesContainer.appendChild(firefly);
        }

        // Créer étincelles de fée - Réduit pour les performances
        const sparklesContainer = document.getElementById('sparkles');
        for (let i = 0; i < 10; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'fairy-sparkle';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.animationDelay = Math.random() * 4 + 's';
            sparklesContainer.appendChild(sparkle);
        }

        // Créer ailes de fée - Réduit pour les performances
        const wingsContainer = document.getElementById('wings');
        for (let i = 0; i < 3; i++) {
            const wing = document.createElement('div');
            wing.className = 'fairy-wing';
            wing.style.left = Math.random() * 100 + '%';
            wing.style.top = Math.random() * 80 + '%';
            wing.style.animationDelay = Math.random() * 5 + 's';
            wingsContainer.appendChild(wing);
        }

        // Créer champignons magiques - Réduit pour les performances
        const mushroomsContainer = document.getElementById('mushrooms');
        for (let i = 0; i < 5; i++) {
            const mushroom = document.createElement('div');
            mushroom.className = 'magic-mushroom';
            mushroom.textContent = ['ìä', ''][Math.floor(Math.random() * 2)];
            mushroom.style.left = Math.random() * 100 + '%';
            mushroom.style.animationDelay = Math.random() * 4 + 's';
            mushroomsContainer.appendChild(mushroom);
        }

        // Créer étoiles scintillantes - Réduit pour les performances
        const starsContainer = document.getElementById('stars');
        for (let i = 0; i < 8; i++) {
            const star = document.createElement('div');
            star.className = 'twinkle-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            starsContainer.appendChild(star);
        }

        // Gamification
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        function updateProgress() {
            const total = checkboxes.length;
            const checked = document.querySelectorAll('input[type="checkbox"]:checked').length;
            const percentage = Math.round((checked / total) * 100);

            const progressBar = document.getElementById('progressBar');
            progressBar.style.width = percentage + '%';

            if (percentage === 0) {
                progressBar.textContent = '0% - Prêt pour l\'aventure ?';
            } else if (percentage < 100) {
                progressBar.textContent = percentage + '% - Continue !';
            } else {
                progressBar.textContent = 'ë Bravo ! Ton sac est prêt ! ';
                createConfetti();
            }

            document.getElementById('checkedCount').textContent = checked;
            document.getElementById('percentComplete').textContent = percentage + '%';

            // Animation du sac á dos
            updateBackpackAnimation(percentage);
        }

        function createConfetti() {
            const emojis = ['ìé', 'ìâ', 'î', '', 'î', 'ì️', 'ï', 'î', 'î', 'ìä', '', ''];
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-20px';
                confetti.style.fontSize = '2rem';
                confetti.style.zIndex = '9999';
                confetti.style.pointerEvents = 'none';
                confetti.style.animation = 'leavesFall 4s linear';
                confetti.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))';
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 4000);
            }
        }

        // Fonction pour animer le sac á dos
        function updateBackpackAnimation(percentage) {
            const backpackContent = document.getElementById('backpackContent');
            const backpackProgressBar = document.getElementById('backpackProgressBar');
            const backpackStatus = document.getElementById('backpackStatus');
            const backpackText = document.getElementById('backpackText');

            if (!backpackContent || !backpackProgressBar || !backpackStatus || !backpackText) {
                return; // ëléments pas encore chargés
            }

            // Animation du remplissage du sac
            backpackContent.style.transform = `scaleY(${percentage / 100})`;
            backpackProgressBar.style.width = percentage + '%';

            // Mise á jour du texte et des particules
            if (percentage === 0) {
                backpackText.textContent = '';
                backpackStatus.textContent = ' Sac vide - Commencez á cocher les éléments !';
                backpackStatus.style.color = 'var(--c-forest-700)';
            } else if (percentage < 25) {
                backpackText.textContent = '';
                backpackStatus.textContent = ' Sac commence á se remplir...';
                backpackStatus.style.color = '#FF9800';
                createParticles('');
            } else if (percentage < 50) {
                backpackText.textContent = '';
                backpackStatus.textContent = ' Sac se remplit bien !';
                backpackStatus.style.color = '#FF9800';
                createParticles('');
            } else if (percentage < 75) {
                backpackText.textContent = '';
                backpackStatus.textContent = ' Sac presque plein !';
                backpackStatus.style.color = '#4CAF50';
                createParticles('');
            } else if (percentage < 100) {
                backpackText.textContent = '';
                backpackStatus.textContent = ' Sac presque prêt !';
                backpackStatus.style.color = '#4CAF50';
                createParticles('');
            } else {
                backpackText.textContent = 'ë';
                backpackStatus.textContent = 'ë Sac prêt pour l\'aventure !';
                backpackStatus.style.color = '#2E7D32';
                createParticles('ë');
                // Animation de secousse pour le sac plein
                const backpack = document.getElementById('backpack');
                if (backpack) {
                    backpack.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        backpack.style.animation = '';
                    }, 500);
                }
            }
        }

        // Fonction pour créer des particules d'animation
        function createParticles(emoji) {
            const particlesContainer = document.getElementById('particles');
            const backpack = document.getElementById('backpack');
            
            if (!particlesContainer || !backpack) {
                return; // ëléments pas encore chargés
            }

            const backpackRect = backpack.getBoundingClientRect();
            
            // Créer 3-5 particules
            for (let i = 0; i < 3; i++) {
                const particle = document.createElement('div');
                particle.textContent = emoji;
                particle.style.cssText = `
                    position: absolute;
                    font-size: 1.5rem;
                    pointer-events: none;
                    z-index: 20;
                    animation: floatUp 1s ease-out forwards;
                `;
                
                // Position aléatoire autour du sac
                const x = backpackRect.left + Math.random() * backpackRect.width;
                const y = backpackRect.top + Math.random() * backpackRect.height;
                
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                
                particlesContainer.appendChild(particle);
                
                // Supprimer la particule après l'animation
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 1000);
            }
        }

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateProgress();
                localStorage.setItem('scout-list', JSON.stringify(
                    Array.from(checkboxes).map(cb => cb.checked)
                ));
            });
        });

        // Charger état sauvegardé
        window.addEventListener('load', () => {
            const saved = JSON.parse(localStorage.getItem('scout-list') || '[]');
            checkboxes.forEach((checkbox, index) => {
                if (saved[index]) {
                    checkbox.checked = true;
                }
            });
            updateProgress();
        });

        updateProgress();

        // Jeu de la Promesse - La Quête des Sylphes
        function commencerJeu(sylphe) {
            document.getElementById('jeu-accueil').style.display = 'none';
            document.getElementById('defi-loi').style.display = 'block';
            initialiserDefiLoi();
        }

        // Initialiser le défi de la loi scoute
        function initialiserDefiLoi() {
            const loiScoute = [
                "Le louveteau écoute les anciens.",
                "Le louveteau pense d'abord aux autres.",
                "Le louveteau dit toujours la vérité.",
                "Le louveteau est propre et ordonné.",
                "Le louveteau est toujours joyeux.",
                "Le louveteau est économe et soigneux.",
                "Le louveteau est courageux.",
                "Le louveteau est respectueux.",
                "Le louveteau est bon frère et bon ami.",
                "Le louveteau est discipliné."
            ];

            const loiMelangee = [...loiScoute].sort(() => Math.random() - 0.5);
            const jeuLoi = document.getElementById("jeu-loi");
            jeuLoi.innerHTML = '';
            loiMelangee.forEach(article => {
                const div = document.createElement("div");
                div.style.cssText = "background: var(--c-orange-600); color: white; padding: 0.75rem; margin: 0.25rem; border-radius: var(--r-sm); cursor: move; display: inline-block; border: 2px solid var(--c-ink-900); font-size: 0.9rem;";
                div.textContent = article;
                div.draggable = true;
                div.ondragstart = (e) => {
                    e.dataTransfer.setData("text/plain", article);
                };
                jeuLoi.appendChild(div);
            });

            const zoneDepot = document.getElementById("zone-depot");
            zoneDepot.innerHTML = '<p style="text-align: center; color: var(--c-orange-600); font-weight: bold;">Dépose les articles ici dans le bon ordre</p>';
            zoneDepot.ondragover = (e) => {
                e.preventDefault();
            };

            zoneDepot.ondrop = (e) => {
                e.preventDefault();
                const article = e.dataTransfer.getData("text/plain");
                const div = document.createElement("div");
                div.style.cssText = "background: var(--c-forest-700); color: white; padding: 0.75rem; margin: 0.25rem; border-radius: var(--r-sm); display: inline-block; border: 2px solid var(--c-ink-900); font-size: 0.9rem;";
                div.textContent = article;
                zoneDepot.appendChild(div);
            };
        }

        // Vérifier l'ordre de la loi scoute
        function verifierOrdreLoi() {
            const loiScoute = [
                "Le louveteau écoute les anciens.",
                "Le louveteau pense d'abord aux autres.",
                "Le louveteau dit toujours la vérité.",
                "Le louveteau est propre et ordonné.",
                "Le louveteau est toujours joyeux.",
                "Le louveteau est économe et soigneux.",
                "Le louveteau est courageux.",
                "Le louveteau est respectueux.",
                "Le louveteau est bon frère et bon ami.",
                "Le louveteau est discipliné."
            ];

            const articlesDeposes = Array.from(document.getElementById("zone-depot").children).slice(1).map(el => el.textContent);
            if (JSON.stringify(articlesDeposes) === JSON.stringify(loiScoute)) {
                alert("ë Bravo ! Tu as retrouvé la loi scoute dans le bon ordre !");
                document.getElementById('defi-loi').style.display = 'none';
                document.getElementById('defi-priere').style.display = 'block';
                initialiserDefiPriere();
            } else {
                alert("î Ce n'est pas encore ça. Réessaye !");
            }
        }

        // Initialiser le défi de la prière scoute
        function initialiserDefiPriere() {
            const priereScoute = [
                "Seigneur Jésus,",
                "apprends-nous á être généreux,",
                "á te servir comme tu le mérites,",
                "á donner sans compter,",
                "á combattre sans souci des blessures,",
                "á travailler sans chercher le repos,",
                "á nous donner sans attendre de récompense,",
                "sauf celle de savoir que nous faisons ta volonté."
            ];

            const priereMelangee = [...priereScoute].sort(() => Math.random() - 0.5);
            const jeuPriere = document.getElementById("jeu-priere");
            jeuPriere.innerHTML = '';
            priereMelangee.forEach(mot => {
                const div = document.createElement("div");
                div.style.cssText = "background: var(--c-marine-700); color: white; padding: 0.75rem; margin: 0.25rem; border-radius: var(--r-sm); cursor: move; display: inline-block; border: 2px solid var(--c-ink-900); font-size: 0.9rem;";
                div.textContent = mot;
                div.draggable = true;
                div.ondragstart = (e) => {
                    e.dataTransfer.setData("text/plain", mot);
                };
                jeuPriere.appendChild(div);
            });

            const zoneDepotPriere = document.getElementById("zone-depot-priere");
            zoneDepotPriere.innerHTML = '<p style="text-align: center; color: var(--c-orange-600); font-weight: bold;">Dépose les mots ici dans le bon ordre</p>';
            zoneDepotPriere.ondragover = (e) => {
                e.preventDefault();
            };

            zoneDepotPriere.ondrop = (e) => {
                e.preventDefault();
                const mot = e.dataTransfer.getData("text/plain");
                const div = document.createElement("div");
                div.style.cssText = "background: var(--c-forest-700); color: white; padding: 0.75rem; margin: 0.25rem; border-radius: var(--r-sm); display: inline-block; border: 2px solid var(--c-ink-900); font-size: 0.9rem;";
                div.textContent = mot;
                zoneDepotPriere.appendChild(div);
            };
        }

        // Vérifier l'ordre de la prière scoute
        function verifierOrdrePriere() {
            const priereScoute = [
                "Seigneur Jésus,",
                "apprends-nous á être généreux,",
                "á te servir comme tu le mérites,",
                "á donner sans compter,",
                "á combattre sans souci des blessures,",
                "á travailler sans chercher le repos,",
                "á nous donner sans attendre de récompense,",
                "sauf celle de savoir que nous faisons ta volonté."
            ];

            const motsDeposes = Array.from(document.getElementById("zone-depot-priere").children).slice(1).map(el => el.textContent);
            if (JSON.stringify(motsDeposes) === JSON.stringify(priereScoute)) {
                alert("ë Bravo ! Tu as retrouvé la prière scoute dans le bon ordre !");
                document.getElementById('defi-priere').style.display = 'none';
                document.getElementById('defi-quiz').style.display = 'block';
                initialiserQuiz();
            } else {
                alert("î Ce n'est pas encore ça. Réessaye !");
            }
        }

        // Initialiser le quiz
        function initialiserQuiz() {
            const questions = [
                {
                    question: "Quel est le premier article de la loi scoute ?",
                    options: [
                        "Le louveteau écoute les anciens.",
                        "Le louveteau pense d'abord aux autres.",
                        "Le louveteau dit toujours la vérité."
                    ],
                    reponse: 0
                },
                {
                    question: "Que dit la prière scoute sur le service ?",
                    options: [
                        "á te servir comme tu le mérites",
                        "á donner sans compter",
                        "á combattre sans souci des blessures"
                    ],
                    reponse: 0
                },
                {
                    question: "Quel est le dernier article de la loi scoute ?",
                    options: [
                        "Le louveteau est discipliné.",
                        "Le louveteau est respectueux.",
                        "Le louveteau est courageux."
                    ],
                    reponse: 0
                }
            ];

            const quiz = document.getElementById("quiz");
            quiz.innerHTML = '';
            questions.forEach((q, index) => {
                const divQuestion = document.createElement("div");
                divQuestion.style.cssText = "background: rgba(255, 255, 255, 0.7); padding: 1rem; margin: 1rem 0; border-radius: var(--r-sm); border: 2px solid var(--c-ink-900);";
                divQuestion.innerHTML = `<h4 style="font-family: 'Patrick Hand', cursive; color: var(--c-orange-600); margin-bottom: 0.5rem;">${index + 1}. ${q.question}</h4>`;
                const optionsDiv = document.createElement("div");
                optionsDiv.style.cssText = "display: flex; flex-direction: column; gap: 0.5rem; margin-left: 1rem;";
                q.options.forEach((option, i) => {
                    const divOption = document.createElement("div");
                    divOption.style.cssText = "display: flex; align-items: center; gap: 0.5rem;";
                    divOption.innerHTML = `
                        <input type="radio" id="q${index}-option${i}" name="q${index}" value="${i}" style="margin: 0;">
                        <label for="q${index}-option${i}" style="cursor: pointer; font-size: 0.9rem;">${option}</label>
                    `;
                    optionsDiv.appendChild(divOption);
                });
                divQuestion.appendChild(optionsDiv);
                quiz.appendChild(divQuestion);
            });
        }

        // Vérifier les réponses du quiz
        function verifierReponsesQuiz() {
            const questions = [
                { reponse: 0 },
                { reponse: 0 },
                { reponse: 0 }
            ];

            let toutesCorrectes = true;
            questions.forEach((q, index) => {
                const reponse = document.querySelector(`input[name="q${index}"]:checked`);
                if (!reponse || parseInt(reponse.value) !== q.reponse) {
                    toutesCorrectes = false;
                }
            });
            if (toutesCorrectes) {
                alert("ë Bravo ! Tu as réussi le quiz des sylphes !");
                document.getElementById('defi-quiz').style.display = 'none';
                document.getElementById('jeu-fin').style.display = 'block';
            } else {
                alert("î Ce n'est pas encore ça. Réessaye !");
            }
        }

        // Recommencer le jeu
        function recommencerJeu() {
            document.getElementById('jeu-fin').style.display = 'none';
            document.getElementById('jeu-accueil').style.display = 'block';
        }

        // ==================== JEU DES SYLPHES ====================

        // Données des Sylphes
        const sylphes = {
            yzo: {
                name: "Yz",
                icon: "î",
                image: "./images/yzo.png",
                trait: "FRANC",
                description: "Je dis toujours ce que je pense, je fais ce que je dis !",
                color: "#8e44ad"
            },
            kawane: {
                name: "Kawane",
                icon: "️",
                image: "./images/kawane.png",
                trait: "RESPECTUEUX",
                description: "Je prends soin de moi et des autres.",
                color: "#27ae60"
            },
            laline: {
                name: "Laline",
                icon: "",
                image: "./images/laline.png",
                trait: "DYNAMIQUE",
                description: "Je suis actif et bon joueur.",
                color: "#e74c3c"
            },
            mayls: {
                name: "Mals",
                icon: "ìä",
                image: "./images/mayls.png",
                trait: "CURIEUX DE DIEU",
                description: "J'apprends á dire qui est Jésus pour moi.",
                color: "#95a5a6"
            },
            thela: {
                name: "Théla",
                icon: "îè",
                image: "./images/thela.png",
                trait: "DëBROUILLARD",
                description: "Je découvre le monde et je crée de mes mains, je protège notre planète.",
                color: "#f39c12"
            },
            blogane: {
                name: "Blogane",
                icon: "î",
                image: "./images/blogane.png",
                trait: "SOLIDAIRE",
                description: "Je suis copain avec tous, ici et ailleurs !",
                color: "#e91e63"
            }
        };

        // Situations á associer
        const situations = [
            {
                id: 1,
                text: "Tu vois quelqu'un seul dans son coin pendant la récréation",
                emoji: "æ",
                correctSylphe: "blogane",
                explanation: "Blogane est solidaire : être copain avec tous, c'est aller vers ceux qui sont seuls !"
            },
            {
                id: 2,
                text: "Tu as cassé quelque chose par accident et personne ne t'a vu",
                emoji: "",
                correctSylphe: "yzo",
                explanation: "Yz est franc : dire la vérité même quand c'est difficile, c'est du courage !"
            },
            {
                id: 3,
                text: "Ton équipe perd au jeu mais vous vous êtes bien amusés",
                emoji: "▓",
                correctSylphe: "laline",
                explanation: "Laline est dynamique : être bon joueur, c'est savoir perdre avec le sourire !"
            },
            {
                id: 4,
                text: "Tu trouves un oiseau blessé dans la forêt",
                emoji: "",
                correctSylphe: "kawane",
                explanation: "Kawane est respectueux : prendre soin des animaux, c'est respecter la nature !"
            },
            {
                id: 5,
                text: "Il faut réparer la cabane avec du matériel recyclé",
                emoji: "╗️",
                correctSylphe: "thela",
                explanation: "Théla est débrouillard : créer et protéger la planète, c'est utiliser nos talents !"
            },
            {
                id: 6,
                text: "Tu veux dire merci pour cette belle journée ensemble",
                emoji: "",
                correctSylphe: "mayls",
                explanation: "Mals est curieux de Dieu : prier et remercier, c'est grandir spirituellement !"
            }
        ];

        // Variables globales
        let associations = {};
        let draggedElement = null;

        // Sélection du mode
        function selectMode(mode) {
            document.getElementById('jeu-accueil').style.display = 'none';
            if (mode === 'association') {
                document.getElementById('section-association').style.display = 'block';
                initAssociationMode();
            } else if (mode === 'scenarios') {
                document.getElementById('section-scenarios').style.display = 'block';
                initScenariosMode();
            }
        }

        // Retour au menu
        function retourMenu() {
            document.getElementById('jeu-accueil').style.display = 'block';
            document.getElementById('section-association').style.display = 'none';
            document.getElementById('section-scenarios').style.display = 'none';
            resetAssociations();
        }

        // Initialiser le mode association
        function initAssociationMode() {
            associations = {};
            const situationsList = document.getElementById('situations-list');
            const sylphesZones = document.getElementById('sylphes-zones');

            // Créer les situations
            situationsList.innerHTML = '';
            situations.forEach(situation => {
                const div = document.createElement('div');
                div.className = 'situation-item';
                div.draggable = true;
                div.dataset.situationId = situation.id;
                div.style.cssText = "background: linear-gradient(135deg, #fff3e0, #ffe0b2); border: 2px solid var(--c-orange-600); border-radius: var(--r-sm); padding: 1rem; margin-bottom: 1rem; cursor: move; transition: all 0.3s ease; font-size: 0.95rem;";
                div.innerHTML = `
                    <span style="font-size: 1.5rem; margin-right: 0.5rem;">${situation.emoji}</span>
                    ${situation.text}
                `;
                div.addEventListener('dragstart', handleDragStart);
                div.addEventListener('dragend', handleDragEnd);
                situationsList.appendChild(div);
            });

            // Créer les zones de dépt pour chaque Sylphe
            sylphesZones.innerHTML = '';
            Object.keys(sylphes).forEach(key => {
                const sylphe = sylphes[key];
                const zone = document.createElement('div');
                zone.className = 'sylphe-drop-zone';
                zone.dataset.sylpheKey = key;
                zone.style.cssText = "background: rgba(255, 255, 255, 0.5); border: 2px dashed var(--c-forest-700); border-radius: var(--r-sm); padding: 1rem; margin-bottom: 1rem; min-height: 100px; transition: all 0.3s ease;";
                zone.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.8rem; padding: 0.5rem; background: white; border-radius: var(--r-sm);">
                        <img src="${sylphe.image}" alt="${sylphe.name}" style="width: 70px; height: 70px; object-fit: contain;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                        <span style="display:none; font-size: 2.5rem;">${sylphe.icon}</span>
                        <div style="flex: 1;">
                            <div style="font-family: 'Patrick Hand', cursive; font-size: 1.1rem; color: var(--c-orange-600); font-weight: bold;">${sylphe.name}</div>
                            <div style="font-size: 0.85rem; color: var(--c-forest-700); font-weight: bold;">${sylphe.trait}</div>
                        </div>
                    </div>
                    <div class="drop-area" data-sylphe="${key}">
                        <!-- Situations déposées ici -->
                    </div>
                `;
                zone.addEventListener('dragover', handleDragOver);
                zone.addEventListener('drop', handleDrop);
                zone.addEventListener('dragleave', handleDragLeave);
                zone.addEventListener('dragenter', handleDragEnter);
                sylphesZones.appendChild(zone);
            });

            updateAssociationCount();
        }

        // Gestion du drag and drop
        function handleDragStart(e) {
            draggedElement = e.target;
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.innerHTML);
        }

        function handleDragEnd(e) {
            e.target.classList.remove('dragging');
        }

        function handleDragOver(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            return false;
        }

        function handleDragEnter(e) {
            if (e.target.classList.contains('sylphe-drop-zone') ||
                e.target.closest('.sylphe-drop-zone')) {
                const zone = e.target.classList.contains('sylphe-drop-zone') ?
                    e.target : e.target.closest('.sylphe-drop-zone');
                zone.classList.add('drag-over');
                zone.style.background = 'rgba(46, 125, 50, 0.1)';
                zone.style.borderColor = 'var(--c-orange-600)';
                zone.style.borderStyle = 'solid';
                zone.style.transform = 'scale(1.02)';
            }
        }

        function handleDragLeave(e) {
            if (e.target.classList.contains('sylphe-drop-zone')) {
                e.target.classList.remove('drag-over');
                e.target.style.background = 'rgba(255, 255, 255, 0.5)';
                e.target.style.borderColor = 'var(--c-forest-700)';
                e.target.style.borderStyle = 'dashed';
                e.target.style.transform = 'scale(1)';
            }
        }

        function handleDrop(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }

            const zone = e.target.classList.contains('sylphe-drop-zone') ?
                e.target : e.target.closest('.sylphe-drop-zone');

            if (zone && draggedElement) {
                zone.classList.remove('drag-over');
                zone.style.background = 'rgba(255, 255, 255, 0.5)';
                zone.style.borderColor = 'var(--c-forest-700)';
                zone.style.borderStyle = 'dashed';
                zone.style.transform = 'scale(1)';

                const situationId = parseInt(draggedElement.dataset.situationId);
                const sylpheKey = zone.dataset.sylpheKey;

                // Créer l'élément déposé
                const dropArea = zone.querySelector('.drop-area');
                const droppedDiv = document.createElement('div');
                droppedDiv.className = 'dropped-situation';
                droppedDiv.style.cssText = "background: linear-gradient(135deg, #e3f2fd, #bbdefb); border: 2px solid #2196f3; border-radius: var(--r-sm); padding: 0.8rem; margin-top: 0.5rem; font-size: 0.9rem;";
                droppedDiv.innerHTML = draggedElement.innerHTML;
                droppedDiv.dataset.situationId = situationId;

                // Supprimer l'ancienne association si elle existe
                Object.keys(associations).forEach(key => {
                    if (associations[key] === situationId) {
                        delete associations[key];
                    }
                });

                // Supprimer les anciennes versions de cette situation
                document.querySelectorAll(`[data-situation-id="${situationId}"]`).forEach(el => {
                    if (el.classList.contains('dropped-situation')) {
                        el.remove();
                    }
                });

                dropArea.appendChild(droppedDiv);

                // Enregistrer l'association
                associations[sylpheKey] = situationId;

                // Cacher la situation originale
                draggedElement.style.display = 'none';

                updateAssociationCount();
            }

            return false;
        }

        // Mettre á jour le compteur
        function updateAssociationCount() {
            const count = Object.keys(associations).length;
            document.getElementById('association-count').textContent = count;
        }

        // Vérifier les associations
        function verifierAssociations() {
            if (Object.keys(associations).length < 6) {
                alert('î Tu dois associer toutes les situations avant de vérifier !');
                return;
            }

            let correctCount = 0;
            const feedback = document.getElementById('feedback-association');
            let feedbackHTML = '';

            // Vérifier chaque association
            Object.keys(associations).forEach(sylpheKey => {
                const situationId = associations[sylpheKey];
                const situation = situations.find(s => s.id === situationId);
                const isCorrect = situation.correctSylphe === sylpheKey;

                const zone = document.querySelector(`[data-sylphe-key="${sylpheKey}"]`);
                if (isCorrect) {
                    zone.style.background = 'rgba(46, 125, 50, 0.2)';
                    zone.style.borderColor = '#2e7d32';
                    correctCount++;
                    feedbackHTML += `<p>à <strong>${sylphes[sylpheKey].name}</strong> : ${situation.explanation}</p>`;
                } else {
                    zone.style.background = 'rgba(211, 47, 47, 0.2)';
                    zone.style.borderColor = '#d32f2f';
                    const correctSylphe = sylphes[situation.correctSylphe];
                    feedbackHTML += `<p>î Cette situation correspond plutt á <strong>${correctSylphe.name}</strong> (${correctSylphe.trait})</p>`;
                }
            });

            // Afficher le feedback
            feedback.style.display = 'block';
            if (correctCount === 6) {
                feedback.style.background = 'linear-gradient(135deg, #c8e6c9, #a5d6a7)';
                feedback.style.borderColor = '#2e7d32';
                feedback.innerHTML = `
                    <div style="font-family: 'Patrick Hand', cursive; font-size: 1.8rem; margin-bottom: 1rem; text-align: center;">ë Parfait ! 6/6 ! ë</div>
                    <div style="line-height: 1.6; margin-bottom: 1rem; font-size: 1.1rem;">
                        <p>Bravo ! Tu as parfaitement compris la loi des Sylphes !</p>
                        ${feedbackHTML}
                    </div>
                `;
            } else {
                feedback.style.background = 'linear-gradient(135deg, #fff9c4, #fff59d)';
                feedback.style.borderColor = '#fbc02d';
                feedback.innerHTML = `
                    <div style="font-family: 'Patrick Hand', cursive; font-size: 1.8rem; margin-bottom: 1rem; text-align: center;">æì Bien joué ! ${correctCount}/6</div>
                    <div style="line-height: 1.6; margin-bottom: 1rem; font-size: 1.1rem;">
                        ${feedbackHTML}
                    </div>
                `;
            }

            // Défiler vers le feedback
            feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Recommencer le mode association
        function recommencerAssociation() {
            // Réinitialiser les zones
            document.querySelectorAll('.sylphe-drop-zone').forEach(zone => {
                zone.style.background = 'rgba(255, 255, 255, 0.5)';
                zone.style.borderColor = 'var(--c-forest-700)';
                zone.style.borderStyle = 'dashed';
                const dropArea = zone.querySelector('.drop-area');
                if (dropArea) {
                    dropArea.innerHTML = '';
                }
            });

            // Réafficher toutes les situations
            document.querySelectorAll('.situation-item').forEach(item => {
                item.style.display = 'block';
            });

            // Cacher le feedback
            const feedback = document.getElementById('feedback-association');
            feedback.style.display = 'none';
            feedback.innerHTML = '';

            // Réinitialiser les associations
            associations = {};
            updateAssociationCount();

            // Défiler vers le haut
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Réinitialiser complètement
        function resetAssociations() {
            associations = {};
            document.getElementById('situations-list').innerHTML = '';
            document.getElementById('sylphes-zones').innerHTML = '';
            const feedback = document.getElementById('feedback-association');
            feedback.style.display = 'none';
            feedback.innerHTML = '';
        }

        // ==================== MODE SCëNARIOS ====================

        // Scénarios avec choix multiples
        const scenarios = [
            {
                id: 1,
                situation: "️ Pendant le camp, tu remarques qu'un autre scout a oublié son sac de couchage. Il fait froid ce soir.",
                choices: [
                    {
                        emoji: "",
                        text: "Je lui prête ma couverture de secours même si j'aurai un peu froid",
                        correct: true,
                        sylphe: "kawane",
                        feedback: "Excellent ! Tu prends soin des autres comme Kawane. Le respect et l'entraide sont essentiels.",
                        points: 20
                    },
                    {
                        emoji: "ê",
                        text: "Je fais comme si je n'avais rien vu, ce n'est pas mon problème",
                        correct: false,
                        feedback: "Un scout ne laisse jamais un camarade dans le besoin. La solidarité est une valeur fondamentale.",
                        points: 0
                    },
                    {
                        emoji: "í",
                        text: "Je vais voir les chefs pour trouver une solution ensemble",
                        correct: true,
                        sylphe: "thela",
                        feedback: "Très bien ! Tu es débrouillard et tu cherches des solutions comme Théla.",
                        points: 20
                    }
                ]
            },
            {
                id: 2,
                situation: " Ton équipe doit monter la tente, mais certains scouts veulent jouer au lieu d'aider.",
                choices: [
                    {
                        emoji: "",
                        text: "Je monte la tente tout seul sans rien dire",
                        correct: false,
                        feedback: "Le travail d'équipe est important. Il faut communiquer avec les autres !",
                        points: 0
                    },
                    {
                        emoji: "",
                        text: "Je dis clairement qu'on doit tous participer et j'explique pourquoi c'est important",
                        correct: true,
                        sylphe: "yzo",
                        feedback: "Parfait ! Tu dis la vérité avec honnêteté comme Yz. La communication est essentielle.",
                        points: 20
                    },
                    {
                        emoji: "",
                        text: "Je transforme le montage en jeu amusant pour motiver tout le monde",
                        correct: true,
                        sylphe: "laline",
                        feedback: "Génial ! Tu es dynamique et bon joueur comme Laline. Tu sais motiver l'équipe !",
                        points: 20
                    }
                ]
            },
            {
                id: 3,
                situation: "î▓ En randonnée, vous trouvez un joli endroit avec des fleurs rares. Tes amis veulent en cueillir.",
                choices: [
                    {
                        emoji: "îì",
                        text: "J'explique qu'il faut protéger la nature et je propose de prendre des photos á la place",
                        correct: true,
                        sylphe: "thela",
                        feedback: "Excellent ! Tu protèges la planète comme Théla. Un scout respecte la nature.",
                        points: 20
                    },
                    {
                        emoji: "î",
                        text: "Je cueille quelques fleurs, ce n'est pas grave",
                        correct: false,
                        feedback: "Un scout protège la nature et respecte l'environnement. Les fleurs rares doivent rester dans leur habitat.",
                        points: 0
                    },
                    {
                        emoji: "",
                        text: "Je reste silencieux même si je pense que ce n'est pas bien",
                        correct: false,
                        feedback: "Il faut oser dire ce qu'on pense quand c'est important ! Le courage de ses convictions est essentiel.",
                        points: 0
                    }
                ]
            },
            {
                id: 4,
                situation: "ì️ Pendant le repas, un nouveau scout est seul dans son coin et ne parle á personne.",
                choices: [
                    {
                        emoji: "æï",
                        text: "Je vais le voir et je l'invite á venir manger avec notre groupe",
                        correct: true,
                        sylphe: "blogane",
                        feedback: "Parfait ! Tu es solidaire comme Blogane. L'inclusion est une valeur scoute essentielle.",
                        points: 20
                    },
                    {
                        emoji: "",
                        text: "Je reste avec mes amis, il viendra bien quand il voudra",
                        correct: false,
                        feedback: "Un scout fait toujours le premier pas pour accueillir quelqu'un. L'accueil est au c┼ur du scoutisme.",
                        points: 0
                    },
                    {
                        emoji: "️",
                        text: "Je lui demande comment il se sent et ce qu'il aime faire",
                        correct: true,
                        sylphe: "kawane",
                        feedback: "Très bien ! Tu es attentif aux autres comme Kawane. L'écoute est précieuse.",
                        points: 20
                    }
                ]
            },
            {
                id: 5,
                situation: " Pendant le grand jeu, ton équipe perd. Certains scouts sont déçus et en colère.",
                choices: [
                    {
                        emoji: "è",
                        text: "Je dis que ce n'est pas grave, l'important c'est de s'être amusés et d'avoir fait de notre mieux",
                        correct: true,
                        sylphe: "laline",
                        feedback: "Super ! Tu es bon joueur comme Laline. L'esprit sportif est important.",
                        points: 20
                    },
                    {
                        emoji: "á",
                        text: "Je me plains et je dis que ce n'est pas juste",
                        correct: false,
                        feedback: "Un scout sait perdre avec élégance et apprend de ses erreurs. La défaite fait partie du jeu.",
                        points: 0
                    },
                    {
                        emoji: "",
                        text: "Je prends un moment pour remercier mon équipe et on réfléchit á ce qu'on peut améliorer",
                        correct: true,
                        sylphe: "yzo",
                        feedback: "Excellent ! Tu es honnête et constructif comme Yz. Apprendre de ses erreurs est important.",
                        points: 20
                    }
                ]
            }
        ];

        // Variables du mode scénarios
        let currentScenarioIndex = 0;
        let scenariosScore = 0;
        let scenariosCorrectAnswers = 0;
        let selectedChoice = null;

        // Initialiser le mode scénarios
        function initScenariosMode() {
            currentScenarioIndex = 0;
            scenariosScore = 0;
            scenariosCorrectAnswers = 0;
            selectedChoice = null;

            document.getElementById('scenarios-final').style.display = 'none';
            document.getElementById('scenarios-score-display').style.display = 'block';
            document.getElementById('total-scenarios').textContent = scenarios.length;

            displayScenario();
        }

        // Afficher un scénario
        function displayScenario() {
            const scenario = scenarios[currentScenarioIndex];
            const container = document.getElementById('scenario-container');

            let html = `
                <div style="background: linear-gradient(135deg, #fff3e0, #ffe0b2); border: 3px solid var(--c-orange-600); border-radius: var(--r-md); padding: 2rem; margin: 2rem 0;">
                    <h3 style="font-family: 'Patrick Hand', cursive; font-size: 1.8rem; color: var(--c-orange-600); margin-bottom: 1rem; text-align: center;">Scénario ${currentScenarioIndex + 1}</h3>
                    <div style="background: white; padding: 1.5rem; border-radius: var(--r-sm); border-left: 4px solid var(--c-orange-600); margin-bottom: 1.5rem; font-size: 1.1rem; line-height: 1.6;">${scenario.situation}</div>
                    <p style="text-align: center; font-weight: bold; color: var(--c-orange-600); margin-bottom: 1rem;">
                        Que ferais-tu ? 
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 1rem; margin: 2rem 0;">
            `;

            scenario.choices.forEach((choice, index) => {
                html += `
                    <button style="background: white; border: 3px solid var(--c-ink-900); border-radius: var(--r-md); padding: 1.5rem; text-align: left; cursor: pointer; transition: all 0.3s ease; font-family: 'Nunito', sans-serif; font-size: 1rem; line-height: 1.5; display: flex; align-items: flex-start; gap: 1rem;" onclick="selectScenarioChoice(${index})" data-choice-index="${index}">
                        <span style="font-size: 2rem; flex-shrink: 0;">${choice.emoji}</span>
                        <span style="flex: 1;">${choice.text}</span>
                    </button>
                `;
            });

            html += `
                    </div>
                </div>
            `;

            container.innerHTML = html;

            // Cacher le feedback
            const feedback = document.getElementById('scenario-feedback');
            feedback.style.display = 'none';
            feedback.innerHTML = '';

            // Mettre á jour le numéro de scénario
            document.getElementById('scenario-number').textContent = currentScenarioIndex + 1;
            document.getElementById('scenarios-score').textContent = scenariosScore;

            selectedChoice = null;
        }

        // Sélectionner un choix
        function selectScenarioChoice(choiceIndex) {
            const scenario = scenarios[currentScenarioIndex];
            const choice = scenario.choices[choiceIndex];
            const buttons = document.querySelectorAll('[data-choice-index]');

            // Désactiver tous les boutons
            buttons.forEach(btn => {
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.7';
            });

            // Marquer le choix sélectionné
            const selectedButton = document.querySelector(`[data-choice-index="${choiceIndex}"]`);
            selectedButton.style.background = choice.correct ? 'rgba(46, 125, 50, 0.2)' : 'rgba(211, 47, 47, 0.2)';
            selectedButton.style.borderColor = choice.correct ? '#2e7d32' : '#d32f2f';

            selectedChoice = choiceIndex;

            // Mettre á jour le score
            if (choice.correct) {
                scenariosScore += choice.points;
                scenariosCorrectAnswers++;
                document.getElementById('scenarios-score').textContent = scenariosScore;
            }

            // Afficher le feedback
            showScenarioFeedback(choice);

            // Afficher le bouton suivant après un délai
            setTimeout(() => {
                const feedback = document.getElementById('scenario-feedback');
                const nextBtn = document.createElement('div');
                nextBtn.style.textAlign = 'center';
                nextBtn.style.margin = '2rem 0';
                nextBtn.innerHTML = `
                    <button class="fey-btn" onclick="nextScenario()">
                        ${currentScenarioIndex < scenarios.length - 1 ? 'í️ Scénario Suivant' : 'ë Voir les Résultats'}
                    </button>
                `;
                feedback.appendChild(nextBtn);
            }, 500);
        }

        // Afficher le feedback d'un choix
        function showScenarioFeedback(choice) {
            const feedback = document.getElementById('scenario-feedback');
            feedback.style.display = 'block';
            feedback.style.background = choice.correct ? 'linear-gradient(135deg, #c8e6c9, #a5d6a7)' : 'linear-gradient(135deg, #ffcdd2, #ffab91)';
            feedback.style.borderColor = choice.correct ? '#2e7d32' : '#d32f2f';

            let reactionHTML = '';
            if (choice.correct && choice.sylphe) {
                const sylphe = sylphes[choice.sylphe];
                reactionHTML = `
                    <div style="background: rgba(255, 255, 255, 0.9); padding: 1rem; border-radius: var(--r-sm); border-left: 4px solid var(--c-orange-600); margin-top: 1rem; font-style: italic; display: flex; align-items: center; gap: 1rem;">
                        <img src="${sylphe.image}" alt="${sylphe.name}" style="width: 60px; height: 60px; object-fit: contain; flex-shrink: 0;" onerror="this.style.display='none';">
                        <div>
                            <strong>${sylphe.icon} ${sylphe.name} dit :</strong><br>
                            ${choice.feedback}
                        </div>
                    </div>
                `;
            } else {
                reactionHTML = `
                    <div style="background: rgba(255, 255, 255, 0.9); padding: 1rem; border-radius: var(--r-sm); border-left: 4px solid var(--c-orange-600); margin-top: 1rem; font-style: italic; display: flex; align-items: center; gap: 1rem;">
                        <div style="font-size: 2rem;"></div>
                        <div>${choice.feedback}</div>
                    </div>
                `;
            }

            feedback.innerHTML = `
                <div style="font-family: 'Patrick Hand', cursive; font-size: 1.8rem; margin-bottom: 1rem; text-align: center;">
                    ${choice.correct ? 'à Bien joué !' : 'î Pas tout á fait...'}
                </div>
                ${reactionHTML}
            `;

            // Défiler vers le feedback
            feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Scénario suivant
        function nextScenario() {
            currentScenarioIndex++;
            if (currentScenarioIndex < scenarios.length) {
                displayScenario();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                showScenariosResult();
            }
        }

        // Afficher les résultats finaux
        function showScenariosResult() {
            document.getElementById('scenario-container').style.display = 'none';
            document.getElementById('scenario-feedback').style.display = 'none';
            document.getElementById('scenarios-score-display').style.display = 'none';
            document.getElementById('scenarios-final').style.display = 'block';

            const percentage = Math.round((scenariosCorrectAnswers / scenarios.length) * 100);

            document.getElementById('final-scenarios-score').textContent = scenariosScore;
            document.getElementById('final-correct-answers').textContent = scenariosCorrectAnswers;
            document.getElementById('final-total-questions').textContent = scenarios.length;

            let message = '';
            if (percentage === 100) {
                message = "î Incroyable ! Tu es un vrai scout ! Tous les Sylphes sont fiers de toi. Tu as compris l'esprit du scoutisme !";
            } else if (percentage >= 80) {
                message = "è Bravo ! Tu as très bien réussi ! Les Sylphes te félicitent. Continue sur cette voie !";
            } else if (percentage >= 60) {
                message = "æì Bien joué ! Tu es sur la bonne voie. Les Sylphes t'encouragent á continuer d'apprendre !";
            } else {
                message = " Continue tes efforts ! Les Sylphes croient en toi. Chaque jour est une nouvelle chance d'apprendre !";
            }

            document.getElementById('final-sylphes-message').textContent = message;

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Recommencer le mode scénarios
        function recommencerScenarios() {
            document.getElementById('scenario-container').style.display = 'block';
            document.getElementById('scenario-feedback').style.display = 'block';
            initScenariosMode();
        }

        // Ouvrir le jeu de tente 1
        function ouvrirJeuTente() {
            const windowFeatures = 'width=900,height=700,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no';
            const jeuWindow = window.open('jeu_tente.html', 'JeuTente', windowFeatures);

            if (jeuWindow) {
                // Centrer la fenêtre
                jeuWindow.moveTo(
                    (screen.width - 900) / 2,
                    (screen.height - 700) / 2
                );
                jeuWindow.focus();
            } else {
                // Si les popups sont bloqués, ouvrir dans un nouvel onglet
                window.open('jeu_tente.html', '_blank');
            }
        }

        // Ouvrir le jeu de tente 2
        function ouvrirJeuTente2() {
            const windowFeatures = 'width=900,height=700,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no';
            const jeuWindow = window.open('jeu_tente2.html', 'JeuTente2', windowFeatures);

            if (jeuWindow) {
                // Centrer la fenêtre
                jeuWindow.moveTo(
                    (screen.width - 900) / 2,
                    (screen.height - 700) / 2
                );
                jeuWindow.focus();
            } else {
                // Si les popups sont bloqués, ouvrir dans un nouvel onglet
                window.open('jeu_tente2.html', '_blank');
            }
        }

        // Ouvrir le jeu de sac scout
        function ouvrirJeuSac() {
            const windowFeatures = 'width=1200,height=800,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no';
            const jeuWindow = window.open('scout_bag_game (1).html', 'JeuSacScout', windowFeatures);

            if (jeuWindow) {
                // Centrer la fenêtre
                jeuWindow.moveTo(
                    (screen.width - 1200) / 2,
                    (screen.height - 800) / 2
                );
                jeuWindow.focus();
            } else {
                // Si les popups sont bloqués, ouvrir dans un nouvel onglet
                window.open('scout_bag_game (1).html', '_blank');
            }
        }

        // Ouvrir la vidéo tutoriel
        function ouvrirVideoTutorial() {
            // Ouvrir la vidéo YouTube dans un nouvel onglet
            window.open('https://www.youtube.com/watch?v=1s6PgZ0o-vk', '_blank');

            // Afficher un message informatif
            alert(' La vidéo s\'ouvre dans un nouvel onglet !\n\ní Conseil : Mets la vidéo en plein écran pour mieux voir les détails du montage de tente.');
        }

        // Ouvrir Google Maps
        function ouvrirMaps() {
            window.open('https://maps.google.com/?q=Jambville+78440', '_blank');
        }

        // Ouvrir WhatsApp
        function ouvrirWhatsApp() {
            window.open('https://chat.whatsapp.com/F2crLBuVQ17L5VbrzoR0xX', '_blank');
        }

        // Fonction supprimée - le calendrier est maintenant intégré directement dans la page

        // Variables globales pour le calendrier
        let currentCalendarMonth = new Date().getMonth();
        let currentCalendarYear = new Date().getFullYear();

        // Fonction pour charger le calendrier
        function loadCalendar() {
            const calendarContainer = document.getElementById('calendar-container');
            if (!calendarContainer) return;

            const monthNames = [
                'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Ao╗t', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
            ];

            const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
            const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
            const today = new Date();

            let calendarHTML = `
                <div style="background: white; padding: 1rem; height: 100%; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <button onclick="changeMonth(-1)" style="
                            background: var(--c-orange-600);
                            color: white;
                            border: 2px solid var(--c-ink-900);
                            border-radius: var(--r-sm);
                            padding: 0.5rem 1rem;
                            cursor: pointer;
                            font-family: 'Patrick Hand', cursive;
                            font-size: 1rem;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.background='var(--c-gold-400)'" onmouseout="this.style.background='var(--c-orange-600)'">
                            à️ Mois précédent
                        </button>
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <h3 style="font-family: 'Patrick Hand', cursive; color: var(--c-orange-600); font-size: 1.5rem; margin: 0;">
                                ${monthNames[currentCalendarMonth]} ${currentCalendarYear}
                            </h3>
                            <button onclick="goToToday()" style="
                                background: var(--c-forest-700);
                                color: white;
                                border: 2px solid var(--c-ink-900);
                                border-radius: var(--r-sm);
                                padding: 0.25rem 0.75rem;
                                cursor: pointer;
                                font-family: 'Patrick Hand', cursive;
                                font-size: 0.8rem;
                                transition: all 0.3s ease;
                                margin-top: 0.25rem;
                            " onmouseover="this.style.background='var(--c-forest-500)'" onmouseout="this.style.background='var(--c-forest-700)'">
                                à Aujourd'hui
                            </button>
                        </div>
                        <button onclick="changeMonth(1)" style="
                            background: var(--c-orange-600);
                            color: white;
                            border: 2px solid var(--c-ink-900);
                            border-radius: var(--r-sm);
                            padding: 0.5rem 1rem;
                            cursor: pointer;
                            font-family: 'Patrick Hand', cursive;
                            font-size: 1rem;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.background='var(--c-gold-400)'" onmouseout="this.style.background='var(--c-orange-600)'">
                            Mois suivant í️
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 1rem;">
                        <div style="text-align: center; font-weight: bold; padding: 0.5rem; background: var(--c-orange-600); color: white; border-radius: var(--r-sm);">Lun</div>
                        <div style="text-align: center; font-weight: bold; padding: 0.5rem; background: var(--c-orange-600); color: white; border-radius: var(--r-sm);">Mar</div>
                        <div style="text-align: center; font-weight: bold; padding: 0.5rem; background: var(--c-orange-600); color: white; border-radius: var(--r-sm);">Mer</div>
                        <div style="text-align: center; font-weight: bold; padding: 0.5rem; background: var(--c-orange-600); color: white; border-radius: var(--r-sm);">Jeu</div>
                        <div style="text-align: center; font-weight: bold; padding: 0.5rem; background: var(--c-orange-600); color: white; border-radius: var(--r-sm);">Ven</div>
                        <div style="text-align: center; font-weight: bold; padding: 0.5rem; background: var(--c-orange-600); color: white; border-radius: var(--r-sm);">Sam</div>
                        <div style="text-align: center; font-weight: bold; padding: 0.5rem; background: var(--c-orange-600); color: white; border-radius: var(--r-sm);">Dim</div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;">
            `;

            // Ajouter les jours vides du début du mois
            for (let i = 0; i < firstDay; i++) {
                calendarHTML += `<div style="padding: 0.5rem; min-height: 40px;"></div>`;
            }

            // Ajouter les jours du mois
            for (let day = 1; day <= daysInMonth; day++) {
                const isToday = day === today.getDate() &&
                               currentCalendarMonth === today.getMonth() &&
                               currentCalendarYear === today.getFullYear();
                const isEvent = hasEventOnDay(day, currentCalendarMonth + 1, currentCalendarYear);

                let dayStyle = `
                    padding: 0.5rem;
                    min-height: 40px;
                    border: 2px solid var(--c-ink-900);
                    border-radius: var(--r-sm);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: ${isToday ? 'var(--c-orange-600)' : isEvent ? 'var(--c-forest-700)' : 'white'};
                    color: ${isToday || isEvent ? 'white' : 'var(--c-ink-900)'};
                `;

                calendarHTML += `
                    <div style="${dayStyle}" onclick="showEventDetails(${day}, ${currentCalendarMonth + 1}, ${currentCalendarYear})">
                        <div style="font-weight: bold; margin-bottom: 0.25rem;">${day}</div>
                        ${isEvent ? '<div style="font-size: 0.7rem;"></div>' : ''}
                    </div>
                `;
            }

            calendarHTML += `</div></div>`;
            calendarContainer.innerHTML = calendarHTML;
        }

        // Fonction pour charger les sorties du calendrier dans le registre
        function loadTripsFromCalendar() {
            console.log('ä Chargement des sorties du calendrier...');
            
            const outingsList = document.getElementById('outingsList');
            if (!outingsList) {
                console.error('î outingsList non trouvé');
                alert('î outingsList non trouvé');
                return;
            }

            console.log('à outingsList trouvé');

            // Récupérer les événements
            const events = getCalendarEvents();
            console.log('à ëvénements récupérés:', Object.keys(events).length);
            
            if (Object.keys(events).length === 0) {
                outingsList.innerHTML = '<div style="text-align: center; color: #666; padding: 2rem;">á️ Aucune sortie trouvée dans le calendrier</div>';
                return;
            }
            
            // Construire le HTML des cases á cocher
            let checkboxesHTML = '';
            let count = 0;
            
            Object.entries(events).forEach(([dateKey, event]) => {
                console.log(`à Ajout: ${dateKey} - ${event.title}`);
                
                // Créer un ID simple
                const tripId = dateKey.replace(/-/g, '_');
                
                // Créer une case á cocher
                checkboxesHTML += `
                    <div style="display: flex; align-items: center; padding: 0.5rem; border-bottom: 1px solid #eee;">
                        <input type="checkbox" id="outing_${tripId}" value="${tripId}" onchange="selectOuting('${tripId}')" style="margin-right: 0.75rem; transform: scale(1.2);">
                        <label for="outing_${tripId}" style="flex: 1; cursor: pointer; font-size: 1rem;">
                            <strong>${event.title}</strong>
                            <br><small style="color: #666;">${dateKey}</small>
                        </label>
                    </div>
                `;
                count++;
                
                console.log(`à Case á cocher ajoutée: ${event.title}`);
            });
            
            // Remplacer le contenu
            outingsList.innerHTML = checkboxesHTML;
            
            console.log(`à ${count} sorties ajoutées avec cases á cocher`);
            alert(`à ${count} sorties chargées avec cases á cocher`);
        }
        
        // Fonction pour gérer la sélection d'une sortie
        function selectOuting(tripId) {
            console.log(' Sortie sélectionnée:', tripId);
            
            // Décocher toutes les autres cases
            const allCheckboxes = document.querySelectorAll('#outingsList input[type="checkbox"]');
            allCheckboxes.forEach(checkbox => {
                if (checkbox.value !== tripId) {
                    checkbox.checked = false;
                }
            });
            
            // Charger les détails de la sortie sélectionnée
            if (document.getElementById(`outing_${tripId}`).checked) {
                loadAttendanceForOuting(tripId);
            } else {
                // Masquer les détails si décoché
                const outingInfo = document.getElementById('outingInfo');
                if (outingInfo) {
                    outingInfo.style.display = 'none';
                }
            }
        }

        // Fonction pour récupérer les événements du calendrier
        function getCalendarEvents() {
            // Récupérer les sorties depuis le localStorage (admin-outings)
            const adminOutings = JSON.parse(localStorage.getItem('admin-outings') || '[]');
            
            // Convertir les sorties admin en format événements calendrier
            const events = {};
            
            adminOutings.forEach(outing => {
                // Convertir la date au format DD-MM-YYYY pour la clé
                const dateKey = outing.startDate.split('-').reverse().join('-');
                
                events[dateKey] = {
                    title: outing.name,
                    time: outing.departureTime || 'Non spécifiée',
                    description: outing.description || 'Aucune description'
                };
            });
            
            // Si aucune sortie admin, utiliser les sorties par défaut du programme 2025-2026
            if (Object.keys(events).length === 0) {
                return getDefaultCalendarEvents();
            }
            
            // Code de fallback (ne devrait plus être utilisé)
            return {
                // Décembre 2024
                '15-12-2024': {
                    title: '️ Lumière de Bethléem 2024',
                    time: 'Dimanche',
                    description: 'Lumière de Bethléem + Crèche vivante'
                },
                '21-12-2024': {
                    title: 'ä Réunion de Fin d\'Année',
                    time: 'Samedi',
                    description: 'Réunion de clture de l\'année 2024'
                },
                '22-12-2024': {
                    title: 'ä Réunion de Fin d\'Année',
                    time: 'Dimanche',
                    description: 'Réunion de clture de l\'année 2024'
                },

                // Janvier 2025
                '5-1-2025': {
                    title: 'ï Réunion de Rentrée',
                    time: 'Dimanche',
                    description: 'Réunion de rentrée pour l\'année 2025'
                },
                '19-1-2025': {
                    title: '⚓ Sortie Musée de la Marine',
                    time: 'Dimanche',
                    description: 'Sortie Musée de la Marine + galettes'
                },
                '26-1-2025': {
                    title: 'ä️ Weekend de Janvier',
                    time: 'Samedi - Départ',
                    description: 'Weekend d\'hiver avec activités scoutes'
                },
                '27-1-2025': {
                    title: 'ä️ Weekend de Janvier',
                    time: 'Dimanche - Retour',
                    description: 'Weekend d\'hiver avec activités scoutes'
                },

                // Février 2025
                '2-2-2025': {
                    title: 'ä️ Weekend de Février',
                    time: 'Dimanche - Retour',
                    description: 'Weekend d\'hiver avec activités scoutes'
                },
                '9-2-2025': {
                    title: ' Sortie Montmartre',
                    time: 'Dimanche',
                    description: 'Découverte de Montmartre'
                },
                '16-2-2025': {
                    title: 'ä️ Weekend de Février',
                    time: 'Samedi - Départ',
                    description: 'Weekend d\'hiver avec activités scoutes'
                },
                '23-2-2025': {
                    title: ' Sortie Chteau',
                    time: 'Dimanche',
                    description: 'Visite d\'un chteau historique'
                },

                // Mars 2025
                '2-3-2025': {
                    title: 'î Weekend de Mars',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de printemps'
                },
                '9-3-2025': {
                    title: 'î Sortie Nature',
                    time: 'Dimanche',
                    description: 'Sortie découverte de la nature'
                },
                '16-3-2025': {
                    title: 'î Weekend de Mars',
                    time: 'Samedi - Départ',
                    description: 'Weekend de printemps'
                },
                '23-3-2025': {
                    title: ' Sortie Culturelle',
                    time: 'Dimanche',
                    description: 'Sortie culturelle et artistique'
                },
                '30-3-2025': {
                    title: 'î Weekend de Mars',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de printemps'
                },

                // Avril 2025
                '6-4-2025': {
                    title: ' Weekend de Pques',
                    time: 'Samedi - Départ',
                    description: 'Weekend de Pques avec activités spéciales'
                },
                '13-4-2025': {
                    title: ' Weekend de Pques',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de Pques avec activités spéciales'
                },
                '20-4-2025': {
                    title: 'î Sortie Nature',
                    time: 'Dimanche',
                    description: 'Sortie découverte de la nature printanière'
                },
                '27-4-2025': {
                    title: 'î Weekend d\'Avril',
                    time: 'Samedi - Départ',
                    description: 'Weekend de printemps'
                },

                // Mai 2025
                '4-5-2025': {
                    title: 'î Weekend de Mai',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de printemps'
                },
                '11-5-2025': {
                    title: ' Sortie Voile',
                    time: 'Dimanche',
                    description: 'Sortie voile á Verneuil sur Seine'
                },
                '18-5-2025': {
                    title: 'î Weekend de Mai',
                    time: 'Samedi - Départ',
                    description: 'Weekend de printemps'
                },
                '25-5-2025': {
                    title: ' Sortie Culturelle',
                    time: 'Dimanche',
                    description: 'Sortie culturelle et artistique'
                },

                // Juin 2025
                '1-6-2025': {
                    title: '️ Weekend de Juin',
                    time: 'Dimanche - Retour',
                    description: 'Weekend d\'été'
                },
                '8-6-2025': {
                    title: 'î Sortie Nature',
                    time: 'Dimanche',
                    description: 'Sortie découverte de la nature estivale'
                },
                '15-6-2025': {
                    title: '️ Weekend de Juin',
                    time: 'Samedi - Départ',
                    description: 'Weekend d\'été'
                },
                '22-6-2025': {
                    title: ' Sortie Finale',
                    time: 'Dimanche',
                    description: 'Sortie de clture de l\'année scolaire'
                },
                '29-6-2025': {
                    title: 'ï Réunion de Fin d\'Année',
                    time: 'Dimanche',
                    description: 'Réunion de clture de l\'année scolaire'
                },

                // Juillet 2025 - Camp d'été
                '6-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Début du camp',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '7-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 2',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '8-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 3',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '9-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 4',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '10-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 5',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '11-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 6',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '12-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 7',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '13-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 8',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '14-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 9',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '15-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 10',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '16-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 11',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '17-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 12',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '18-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 13',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '19-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Fin du camp',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },

                // Octobre 2025
                '3-10-2025': {
                    title: '️ Weekend de Groupe',
                    time: 'Samedi - Départ',
                    description: 'Weekend de groupe avec activités scoutes'
                },
                '4-10-2025': {
                    title: '️ Weekend de Groupe',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de groupe avec activités scoutes'
                },
                '12-10-2025': {
                    title: ' Sortie Voile',
                    time: 'Dimanche',
                    description: 'Sortie voile á Verneuil sur Seine'
                },

                // Novembre 2025
                '15-11-2025': {
                    title: ' Weekend Abbaye d\'Epernon',
                    time: 'Samedi - Départ',
                    description: 'Weekend á l\'Abbaye d\'Epernon'
                },
                '16-11-2025': {
                    title: ' Weekend Abbaye d\'Epernon',
                    time: 'Dimanche - Retour',
                    description: 'Weekend á l\'Abbaye d\'Epernon'
                }
            };
        }

        // Fonction pour charger le registre d'une sortie
        function loadTripRegistry() {
            const tripSelector = document.getElementById('tripSelector');
            const tripRegistry = document.getElementById('tripRegistry');
            const registryContent = document.getElementById('registryContent');

            if (!tripSelector || !tripRegistry || !registryContent) return;

            const selectedTripId = tripSelector.value;
            
            if (!selectedTripId) {
                tripRegistry.style.display = 'none';
                return;
            }

            // Afficher le registre
            tripRegistry.style.display = 'block';

            // Charger les données de la sortie depuis le calendrier
            const calendarEvents = getCalendarEvents();
            let selectedTrip = null;
            let selectedDate = null;

            // Trouver la sortie sélectionnée
            Object.entries(calendarEvents).forEach(([dateKey, event]) => {
                const tripId = dateKey.replace(/-/g, '_');
                if (tripId === selectedTripId) {
                    selectedTrip = event;
                    selectedDate = dateKey;
                }
            });

            if (!selectedTrip) {
                registryContent.innerHTML = '<p>î Sortie non trouvée dans le calendrier</p>';
                return;
            }

            // Créer le contenu du registre
            const tripDate = new Date(selectedDate.split('-').reverse().join('-'));
            const formattedDate = tripDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            registryContent.innerHTML = `
                <div style="background: linear-gradient(135deg, #E8F5E8, #C8E6C9); padding: 1rem; border-radius: var(--r-sm); margin-bottom: 1rem;">
                    <h4 style="margin: 0 0 0.5rem 0; color: var(--c-forest-700);">${selectedTrip.title}</h4>
                    <p style="margin: 0; color: var(--c-forest-600);">à ${formattedDate}</p>
                    ${selectedTrip.description ? `<p style="margin: 0.5rem 0 0 0; color: var(--c-forest-600);">${selectedTrip.description}</p>` : ''}
                </div>
                
                <div style="background: white; padding: 1rem; border-radius: var(--r-sm); border: 2px solid var(--c-ink-900);">
                    <h5 style="margin: 0 0 1rem 0; color: var(--c-ink-900);"> Registre de présence</h5>
                    <p style="color: var(--c-ink-600); margin: 0;">Le registre de présence sera disponible ici pour cette sortie.</p>
                    <div style="margin-top: 1rem; padding: 1rem; background: var(--c-gold-100); border-radius: var(--r-sm); border-left: 4px solid var(--c-gold-600);">
                        <strong>í Fonctionnalité en développement</strong><br>
                        Le système de registre de présence sera bientt intégré avec les données des équipes.
                    </div>
                </div>
            `;
        }

        // Fonction pour changer de mois
        function changeMonth(direction) {
            currentCalendarMonth += direction;

            // Gérer le changement d'année
            if (currentCalendarMonth < 0) {
                currentCalendarMonth = 11;
                currentCalendarYear--;
            } else if (currentCalendarMonth > 11) {
                currentCalendarMonth = 0;
                currentCalendarYear++;
            }

            // Recharger le calendrier
            loadCalendar();
        }

        // Fonction pour revenir au mois actuel
        function goToToday() {
            const today = new Date();
            currentCalendarMonth = today.getMonth();
            currentCalendarYear = today.getFullYear();
            loadCalendar();
        }

        // Fonction pour vérifier s'il y a un événement un jour donné
        function hasEventOnDay(day, month, year) {
            const events = {
                // Décembre 2024
                '15-12-2024': true, // Lumière de Bethléem 2024
                '21-12-2024': true, // Réunion de fin d'année
                '22-12-2024': true, // Réunion de fin d'année

                // Janvier 2025
                '12-1-2025': true, // Réunion de rentrée
                '19-1-2025': true, // Sortie Musée de la Marine
                '26-1-2025': true, // Weekend de janvier

                // Février 2025
                '2-2-2025': true, // Weekend de février
                '9-2-2025': true, // Sortie Montmartre
                '16-2-2025': true, // Weekend de février
                '23-2-2025': true, // Sortie chteau

                // Mars 2025
                '2-3-2025': true, // Weekend de mars
                '9-3-2025': true, // Sortie nature
                '16-3-2025': true, // Weekend de mars
                '23-3-2025': true, // Sortie culturelle
                '30-3-2025': true, // Weekend de mars

                // Avril 2025
                '6-4-2025': true, // Weekend de Pques
                '13-4-2025': true, // Weekend de Pques
                '20-4-2025': true, // Sortie nature
                '27-4-2025': true, // Weekend d'avril

                // Mai 2025
                '4-5-2025': true, // Weekend de mai
                '11-5-2025': true, // Sortie voile
                '18-5-2025': true, // Weekend de mai
                '25-5-2025': true, // Sortie culturelle

                // Juin 2025
                '1-6-2025': true, // Weekend de juin
                '8-6-2025': true, // Sortie nature
                '15-6-2025': true, // Weekend de juin
                '22-6-2025': true, // Sortie finale
                '29-6-2025': true, // Réunion de fin d'année

                // Juillet 2025
                '6-7-2025': true, // Camp d'été (début)
                '7-7-2025': true, // Camp d'été
                '8-7-2025': true, // Camp d'été
                '9-7-2025': true, // Camp d'été
                '10-7-2025': true, // Camp d'été
                '11-7-2025': true, // Camp d'été
                '12-7-2025': true, // Camp d'été
                '13-7-2025': true, // Camp d'été
                '14-7-2025': true, // Camp d'été
                '15-7-2025': true, // Camp d'été
                '16-7-2025': true, // Camp d'été
                '17-7-2025': true, // Camp d'été
                '18-7-2025': true, // Camp d'été
                '19-7-2025': true, // Camp d'été (fin)

                // Septembre 2025
                '28-9-2025': true, // Réunion parents

                // Octobre 2025
                '3-10-2025': true, // Weekend de Groupe (Jour 1)
                '4-10-2025': true, // Weekend de Groupe (Jour 2)
                '12-10-2025': true, // Sortie voile (Verneuil sur Seine)

                // Novembre 2025
                '15-11-2025': true, // Weekend Abbaye d'Epernon (Jour 1)
                '16-11-2025': true, // Weekend Abbaye d'Epernon (Jour 2)

                // Décembre 2025
                '14-12-2025': true, // Lumière de Bethléem + Crèche vivante

                // Janvier 2026
                '18-1-2026': true, // Sortie Musée de la Marine + galettes

                // Février 2026
                '8-2-2026': true, // Sortie Montmartre

                // Mars 2026
                '14-3-2026': true, // Weekend de mars (Jour 1)
                '15-3-2026': true, // Weekend de mars (Jour 2)

                // Avril 2026
                '5-4-2026': true, // Sortie chteau

                // Mai 2026
                '15-5-2026': true, // Mini-camp Mont Saint-Michel (Jour 1)
                '16-5-2026': true, // Mini-camp Mont Saint-Michel (Jour 2)
                '17-5-2026': true, // Mini-camp Mont Saint-Michel (Jour 3)

                // Juin 2026
                '12-6-2026': true, // Réunion présentation camp
                '13-6-2026': true, // Weekend de juin (Jour 1)
                '14-6-2026': true, // Weekend de juin (Jour 2)

                // Juillet 2026
                '5-7-2026': true, // Camp d'été (début)
                '6-7-2026': true, // Camp d'été
                '7-7-2026': true, // Camp d'été
                '8-7-2026': true, // Camp d'été
                '9-7-2026': true, // Camp d'été
                '10-7-2026': true, // Camp d'été
                '11-7-2026': true, // Camp d'été
                '12-7-2026': true, // Camp d'été
                '13-7-2026': true, // Camp d'été
                '14-7-2026': true, // Camp d'été
                '15-7-2026': true, // Camp d'été
                '16-7-2026': true, // Camp d'été
                '17-7-2026': true, // Camp d'été
                '18-7-2026': true, // Camp d'été
                '19-7-2026': true  // Camp d'été (fin)
            };

            const dateKey = `${day}-${month}-${year}`;
            return events[dateKey] || false;
        }

        // Fonction pour afficher les détails d'un événement
        function showEventDetails(day, month, year) {
            const events = {
                // Décembre 2024
                '15-12-2024': {
                    title: '️ Lumière de Bethléem 2024',
                    time: 'Dimanche',
                    description: 'Lumière de Bethléem + Crèche vivante'
                },
                '21-12-2024': {
                    title: 'ä Réunion de Fin d\'Année',
                    time: 'Samedi',
                    description: 'Réunion de clture de l\'année 2024'
                },
                '22-12-2024': {
                    title: 'ä Réunion de Fin d\'Année',
                    time: 'Dimanche',
                    description: 'Réunion de clture de l\'année 2024'
                },

                // Janvier 2025
                '12-1-2025': {
                    title: 'ï Réunion de Rentrée',
                    time: 'Dimanche',
                    description: 'Réunion de rentrée pour l\'année 2025'
                },
                '19-1-2025': {
                    title: '⚓ Sortie Musée de la Marine',
                    time: 'Dimanche',
                    description: 'Sortie Musée de la Marine + galettes'
                },
                '26-1-2025': {
                    title: 'ä️ Weekend de Janvier',
                    time: 'Samedi - Départ',
                    description: 'Weekend d\'hiver avec activités scoutes'
                },

                // Février 2025
                '2-2-2025': {
                    title: 'ä️ Weekend de Février',
                    time: 'Dimanche - Retour',
                    description: 'Weekend d\'hiver avec activités scoutes'
                },
                '9-2-2025': {
                    title: ' Sortie Montmartre',
                    time: 'Dimanche',
                    description: 'Découverte de Montmartre'
                },
                '16-2-2025': {
                    title: 'ä️ Weekend de Février',
                    time: 'Samedi - Départ',
                    description: 'Weekend d\'hiver avec activités scoutes'
                },
                '23-2-2025': {
                    title: ' Sortie Chteau',
                    time: 'Dimanche',
                    description: 'Visite d\'un chteau historique'
                },

                // Mars 2025
                '2-3-2025': {
                    title: 'î Weekend de Mars',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de printemps'
                },
                '9-3-2025': {
                    title: 'î Sortie Nature',
                    time: 'Dimanche',
                    description: 'Sortie découverte de la nature'
                },
                '16-3-2025': {
                    title: 'î Weekend de Mars',
                    time: 'Samedi - Départ',
                    description: 'Weekend de printemps'
                },
                '23-3-2025': {
                    title: ' Sortie Culturelle',
                    time: 'Dimanche',
                    description: 'Sortie culturelle et artistique'
                },
                '30-3-2025': {
                    title: 'î Weekend de Mars',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de printemps'
                },

                // Avril 2025
                '6-4-2025': {
                    title: ' Weekend de Pques',
                    time: 'Samedi - Départ',
                    description: 'Weekend de Pques avec activités spéciales'
                },
                '13-4-2025': {
                    title: ' Weekend de Pques',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de Pques avec activités spéciales'
                },
                '20-4-2025': {
                    title: 'î Sortie Nature',
                    time: 'Dimanche',
                    description: 'Sortie découverte de la nature printanière'
                },
                '27-4-2025': {
                    title: 'î Weekend d\'Avril',
                    time: 'Samedi - Départ',
                    description: 'Weekend de printemps'
                },

                // Mai 2025
                '4-5-2025': {
                    title: 'î Weekend de Mai',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de printemps'
                },
                '11-5-2025': {
                    title: ' Sortie Voile',
                    time: 'Dimanche',
                    description: 'Sortie voile á Verneuil sur Seine'
                },
                '18-5-2025': {
                    title: 'î Weekend de Mai',
                    time: 'Samedi - Départ',
                    description: 'Weekend de printemps'
                },
                '25-5-2025': {
                    title: ' Sortie Culturelle',
                    time: 'Dimanche',
                    description: 'Sortie culturelle et artistique'
                },

                // Juin 2025
                '1-6-2025': {
                    title: '️ Weekend de Juin',
                    time: 'Dimanche - Retour',
                    description: 'Weekend d\'été'
                },
                '8-6-2025': {
                    title: 'î Sortie Nature',
                    time: 'Dimanche',
                    description: 'Sortie découverte de la nature estivale'
                },
                '15-6-2025': {
                    title: '️ Weekend de Juin',
                    time: 'Samedi - Départ',
                    description: 'Weekend d\'été'
                },
                '22-6-2025': {
                    title: ' Sortie Finale',
                    time: 'Dimanche',
                    description: 'Sortie de clture de l\'année scolaire'
                },
                '29-6-2025': {
                    title: 'ï Réunion de Fin d\'Année',
                    time: 'Dimanche',
                    description: 'Réunion de clture de l\'année scolaire'
                },

                // Juillet 2025 - Camp d'été
                '6-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Début du camp',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '7-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 2',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '8-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 3',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '9-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 4',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '10-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 5',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '11-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 6',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '12-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 7',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '13-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 8',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '14-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 9',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '15-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 10',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '16-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 11',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '17-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 12',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '18-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Jour 13',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '19-7-2025': {
                    title: '️ Camp d\'ëté 2025',
                    time: 'Fin du camp',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },

                // Septembre 2025
                '28-9-2025': {
                    title: 'æìæìæìæ Réunion Parents',
                    time: 'Dimanche',
                    description: 'Réunion d\'information pour les parents'
                },

                // Octobre 2025
                '3-10-2025': {
                    title: '️ Weekend de Groupe',
                    time: 'Samedi - Départ',
                    description: 'Weekend de groupe avec activités scoutes'
                },
                '4-10-2025': {
                    title: '️ Weekend de Groupe',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de groupe avec activités scoutes'
                },
                '12-10-2025': {
                    title: ' Sortie Voile',
                    time: 'Dimanche',
                    description: 'Sortie voile á Verneuil sur Seine'
                },

                // Novembre 2025
                '15-11-2025': {
                    title: ' Weekend Abbaye d\'Epernon',
                    time: 'Samedi - Départ',
                    description: 'Weekend au Prieuré Saint Thomas'
                },
                '16-11-2025': {
                    title: ' Weekend Abbaye d\'Epernon',
                    time: 'Dimanche - Retour',
                    description: 'Weekend au Prieuré Saint Thomas'
                },

                // Décembre 2025
                '14-12-2025': {
                    title: '️ Lumière de Bethléem',
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
                    title: ' Sortie Montmartre',
                    time: 'Dimanche',
                    description: 'Découverte de Montmartre'
                },

                // Mars 2026
                '14-3-2026': {
                    title: 'î Weekend de Mars',
                    time: 'Samedi - Départ',
                    description: 'Weekend de printemps'
                },
                '15-3-2026': {
                    title: 'î Weekend de Mars',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de printemps'
                },

                // Avril 2026
                '5-4-2026': {
                    title: ' Sortie Chteau',
                    time: 'Dimanche',
                    description: 'Visite d\'un chteau historique'
                },

                // Mai 2026
                '15-5-2026': {
                    title: ' Mini-camp Mont Saint-Michel',
                    time: 'Vendredi - Départ',
                    description: 'Mini-camp de 3 jours au Mont Saint-Michel'
                },
                '16-5-2026': {
                    title: ' Mini-camp Mont Saint-Michel',
                    time: 'Samedi',
                    description: 'Mini-camp de 3 jours au Mont Saint-Michel'
                },
                '17-5-2026': {
                    title: ' Mini-camp Mont Saint-Michel',
                    time: 'Dimanche - Retour',
                    description: 'Mini-camp de 3 jours au Mont Saint-Michel'
                },

                // Juin 2026
                '12-6-2026': {
                    title: 'ï Réunion Présentation Camp',
                    time: 'Vendredi 18h-20h',
                    description: 'Réunion de présentation du camp d\'été'
                },
                '13-6-2026': {
                    title: '️ Weekend de Juin',
                    time: 'Samedi - Départ',
                    description: 'Weekend d\'été'
                },
                '14-6-2026': {
                    title: '️ Weekend de Juin',
                    time: 'Dimanche - Retour',
                    description: 'Weekend d\'été'
                },

                // Juillet 2026 - Camp d'été
                '5-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Début du camp',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '6-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 2',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '7-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 3',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '8-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 4',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '9-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 5',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '10-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 6',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '11-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 7',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '12-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 8',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '13-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 9',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '14-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 10',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '15-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 11',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '16-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 12',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '17-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 13',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '18-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Jour 14',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                },
                '19-7-2026': {
                    title: '️ Camp d\'ëté',
                    time: 'Fin du camp',
                    description: 'Camp d\'été - Première quinzaine des vacances Zone C'
                }
            };

            const dateKey = `${day}-${month}-${year}`;
            const event = events[dateKey];

            if (event) {
                alert(`à ${event.title}\n ${event.time}\n ${event.description}`);
            } else {
                alert(`à ${day}/${month}/${year}\nAucun événement prévu ce jour.`);
            }
        }

        // Gestion des formulaires de covoiturage
        document.addEventListener('DOMContentLoaded', function() {
            // Charger les notes admin
            loadAdminNotes();
            updateMainPageNotes();
            
            // Gérer tous les formulaires de covoiturage
            const carpoolForms = document.querySelectorAll('.carpool-form');
            carpoolForms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();

                    const formData = new FormData(form);
                    const sectionId = form.id.replace('carpoolForm-', '');

                    const carpoolData = {
                        parentName: formData.get('parentName'),
                        parentPhone: formData.get('parentPhone'),
                        childName: formData.get('childName'),
                        childSeats: formData.get('childSeats'),
                        adultSeats: formData.get('adultSeats'),
                        departurePoint: formData.get('departurePoint'),
                        roundTrip: formData.get('roundTrip'),
                        timePreference: formData.get('timePreference'),
                        comments: formData.get('comments'),
                        id: Date.now(),
                        date: new Date().toISOString()
                    };

                    // Sauvegarder en localStorage pour cette section
                    const existingCarpools = JSON.parse(localStorage.getItem(`carpools-${sectionId}`) || '[]');
                    existingCarpools.push(carpoolData);
                    localStorage.setItem(`carpools-${sectionId}`, JSON.stringify(existingCarpools));

                    // Afficher confirmation
                    const sectionNames = {
                        'weekend-groupe': 'Weekend Groupe',
                        'sortie-voile': 'Sortie Voile',
                        'jambville': 'Jambville',
                        'autres': 'Autres Sorties'
                    };

                    alert(` Inscription au covoiturage ${sectionNames[sectionId]} enregistrée !\n\nMerci de votre participation écologique ! î`);

                    // Réinitialiser le formulaire
                    form.reset();

                    // Recharger la liste des covoiturages pour cette section
                    loadCarpoolListForSection(sectionId);
                });
            });

            // Charger la liste des covoiturages pour la section par défaut
            loadCarpoolListForSection('weekend-groupe');
        });

        // Liste des enfants scouts
        const scoutChildren = [
            { nom: 'DESCAMPS', prenom: 'JEANNE' },
            { nom: 'LAURENT BILLET', prenom: 'CLAIRE' },
            { nom: 'PICHEREAU', prenom: 'JULES' },
            { nom: 'POTTER', prenom: 'FELIX' },
            { nom: 'ROUSSEAU', prenom: 'LEOPOLD' },
            { nom: 'JEANJEAN', prenom: 'MADELEINE' },
            { nom: 'LALIGAND', prenom: 'LEA' },
            { nom: 'MILLART', prenom: 'CONSTANCE' },
            { nom: 'REYNAL DE SAINT MICHEL', prenom: 'ALEXIA' },
            { nom: 'D\'ANDREA', prenom: 'DANTE' },
            { nom: 'JANDARD', prenom: 'LEV' },
            { nom: 'ROIG', prenom: 'OCTAVE' },
            { nom: 'RUEF', prenom: 'ALFRED' },
            { nom: 'MATHIEN', prenom: 'AMBRE' },
            { nom: 'FAUGERE', prenom: 'LEA' },
            { nom: 'GENTIL', prenom: 'CONSTANCE' },
            { nom: 'HUCHEZ', prenom: 'SIBYLLE' },
            { nom: 'LANASPRE', prenom: 'ROMANE' },
            { nom: 'NIERAT', prenom: 'ZOE' },
            { nom: 'SERVONNAT', prenom: 'LOUISON' },
            { nom: 'WARGNIER', prenom: 'GABRIELLE' },
            { nom: 'POTTER', prenom: 'OSCAR' },
            { nom: 'ROIG', prenom: 'JULES' },
            { nom: 'TALPAERT', prenom: 'GABRIEL' }
        ];

        // Fonction pour afficher les sous-onglets de covoiturage
        function showCarpoolTab(tabId) {
            // Masquer toutes les sections
            document.querySelectorAll('.carpool-section').forEach(section => {
                section.style.display = 'none';
            });

            // Désactiver tous les onglets
            document.querySelectorAll('.carpool-tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // Afficher la section sélectionnée
            document.getElementById(tabId).style.display = 'block';

            // Activer l'onglet sélectionné
            document.querySelector(`[onclick="showCarpoolTab('${tabId}')"]`).classList.add('active');

            // Charger les données pour cette section
            loadCarpoolListForSection(tabId);
        }

        // Fonction pour charger la liste des covoiturages pour une section spécifique
        function loadCarpoolListForSection(sectionId) {
            const carpoolList = document.getElementById(`carpoolList-${sectionId}`);
            if (!carpoolList) return;

            const carpoolData = JSON.parse(localStorage.getItem(`carpools-${sectionId}`) || '[]');

            if (carpoolData.length === 0) {
                carpoolList.innerHTML = `
                    <div class="fey-item" style="text-align: center; color: var(--c-forest-700);">
                        <strong> Aucun covoiturage enregistré pour le moment</strong><br>
                        <span style="font-size: 0.9rem;">Soyez le premier á proposer un covoiturage !</span>
                    </div>
                `;
                return;
            }

            let html = '';
            carpoolData.forEach(carpool => {
                const colors = [
                    'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
                    'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
                    'linear-gradient(135deg, #E8F5E8, #C8E6C9)',
                    'linear-gradient(135deg, #F3E5F5, #E1BEE7)'
                ];
                const borders = ['#2196F3', '#FF9800', '#4CAF50', '#9C27B0'];
                const randomIndex = Math.floor(Math.random() * colors.length);

                const roundTripText = {
                    'aller-seulement': 'Aller seulement',
                    'retour-seulement': 'Retour seulement',
                    'aller-retour': 'Aller et Retour'
                };

                html += `
                    <div class="fey-item" style="background: ${colors[randomIndex]}; border-left: 4px solid ${borders[randomIndex]};">
                        <strong>æ ${carpool.parentName}</strong> - <span style="color: var(--c-forest-700);">${carpool.childSeats} enfant${carpool.childSeats > 1 ? 's' : ''} / ${carpool.adultSeats} adulte${carpool.adultSeats > 1 ? 's' : ''}</span><br>
                        <span style="font-size: 0.9rem;">ì Départ: ${carpool.departurePoint} -  ${carpool.parentPhone}</span><br>
                        <span style="font-size: 0.9rem; color: var(--c-ink-900);"> ${roundTripText[carpool.roundTrip]} -  ${carpool.timePreference || 'Aucune préférence'}</span><br>
                        <span style="font-size: 0.9rem; color: var(--c-ink-900);"> "${carpool.comments || 'Aucun commentaire'}"</span>
                    </div>
                `;
            });

            carpoolList.innerHTML = html;
        }

        // Fonction pour charger la liste des covoiturages (ancienne version pour compatibilité)
        function loadCarpoolList() {
            loadCarpoolListForSection('weekend');
        }

        // Fonction pour créer une voiture
        function createCar(sectionId) {
            const form = document.getElementById(`carForm-${sectionId}`);
            const formData = new FormData(form);

            const carData = {
                parentName: formData.get('parentName'),
                parentPhone: formData.get('parentPhone'),
                departurePoint: 'Place de la Mairie', // Fixé par admin
                arrivalPoint: 'Jambville', // Fixé par admin
                childSeats: formData.get('childSeats'),
                adultSeats: formData.get('adultSeats'),
                comments: formData.get('comments'),
                id: Date.now(),
                date: new Date().toISOString(),
                children: [], // Liste des enfants ajoutés par les parents
                status: 'available' // available, full
            };

            // Sauvegarder la voiture comme disponible
            const existingCars = JSON.parse(localStorage.getItem(`available-cars-${sectionId}`) || '[]');
            existingCars.push(carData);
            localStorage.setItem(`available-cars-${sectionId}`, JSON.stringify(existingCars));

            // Afficher confirmation
            alert('à Voiture créée et disponible !\n\nLes parents peuvent maintenant ajouter leurs enfants.');

            // Recharger les listes
            loadAvailableCars(sectionId);
            loadChildrenWithoutCar(sectionId, 'aller');
            loadChildrenWithoutCar(sectionId, 'retour');

            // Réinitialiser le formulaire
            form.reset();
        }

        // Fonction pour afficher la sélection des enfants
        function showChildrenSelection(sectionId, carData) {
            // Masquer le formulaire de voiture
            document.getElementById(`carForm-${sectionId}`).parentElement.style.display = 'none';

            // Afficher la sélection des enfants
            const childrenSelection = document.getElementById(`children-selection-${sectionId}`);
            childrenSelection.style.display = 'block';

            // Afficher les informations de la voiture
            const carInfo = document.getElementById(`selected-car-info-${sectionId}`);
            carInfo.innerHTML = `
                <strong> Votre voiture :</strong><br>
                <strong>æ ${carData.parentName}</strong> -  ${carData.parentPhone}<br>
                <strong>ì ${carData.departurePoint} å ${carData.arrivalPoint}</strong><br>
                <strong>æ ${carData.childSeats} enfant${carData.childSeats > 1 ? 's' : ''} / æìæìæìæ ${carData.adultSeats} adulte${carData.adultSeats > 1 ? 's' : ''}</strong><br>
                <strong> ${carData.roundTrip}</strong> -  ${carData.timePreference || 'Aucune préférence'}
            `;

            // Charger la liste des enfants disponibles
            loadChildrenCheckboxes(sectionId);
        }

        // Fonction pour charger les cases á cocher des enfants
        function loadChildrenCheckboxes(sectionId) {
            const container = document.getElementById(`children-checkboxes-${sectionId}`);
            let html = '';

            scoutChildren.forEach(child => {
                const fullName = `${child.nom} ${child.prenom}`;
                html += `
                    <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border: 1px solid var(--c-ink-900); border-radius: var(--r-sm); background: rgba(255, 255, 255, 0.7);">
                        <input type="checkbox" id="child-${child.nom}-${child.prenom}-${sectionId}" value="${fullName}" style="transform: scale(1.2);">
                        <label for="child-${child.nom}-${child.prenom}-${sectionId}" style="cursor: pointer; font-weight: bold;">${fullName}</label>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        // Fonction pour confirmer la sélection des enfants
        function confirmChildrenSelection(sectionId) {
            const checkboxes = document.querySelectorAll(`#children-checkboxes-${sectionId} input[type="checkbox"]:checked`);
            const selectedChildren = Array.from(checkboxes).map(cb => cb.value);

            if (selectedChildren.length === 0) {
                alert('á️ Veuillez sélectionner au moins un enfant !');
                return;
            }

            // Récupérer les données de la voiture
            const carData = JSON.parse(localStorage.getItem(`car-${sectionId}`) || '{}');

            // Créer les covoiturages pour chaque enfant sélectionné
            selectedChildren.forEach(childName => {
                const carpoolData = {
                    ...carData,
                    childName: childName,
                    id: Date.now() + Math.random()
                };

                // Sauvegarder le covoiturage
                const existingCarpools = JSON.parse(localStorage.getItem(`carpools-${sectionId}`) || '[]');
                existingCarpools.push(carpoolData);
                localStorage.setItem(`carpools-${sectionId}`, JSON.stringify(existingCarpools));
            });

            // Afficher confirmation
            alert(`à Covoiturage créé pour ${selectedChildren.length} enfant${selectedChildren.length > 1 ? 's' : ''} !\n\nMerci de votre participation écologique ! î`);

            // Recharger les listes
            loadCarpoolListForSection(sectionId);
            loadChildrenWithoutCar(sectionId);

            // Réinitialiser le formulaire
            document.getElementById(`carForm-${sectionId}`).reset();
            document.getElementById(`children-selection-${sectionId}`).style.display = 'none';
            document.getElementById(`carForm-${sectionId}`).parentElement.style.display = 'block';
        }

        // Fonction pour charger les voitures disponibles
        function loadAvailableCars(sectionId) {
            const allerContainer = document.getElementById(`carpoolList-${sectionId}-aller`);
            const retourContainer = document.getElementById(`carpoolList-${sectionId}-retour`);

            if (!allerContainer || !retourContainer) return;

            const availableCars = JSON.parse(localStorage.getItem(`available-cars-${sectionId}`) || '[]');

            // Afficher les voitures pour l'aller
            let allerHtml = '';
            availableCars.forEach(car => {
                const remainingChildSeats = car.childSeats - car.children.length;
                const remainingAdultSeats = car.adultSeats;
                const status = remainingChildSeats <= 0 ? 'COMPLET' : 'DISPONIBLE';
                const statusColor = remainingChildSeats <= 0 ? '#F44336' : '#4CAF50';

                allerHtml += `
                    <div class="fey-item" style="background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border-left: 4px solid #2196F3;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <strong> ${car.parentName}</strong>
                            <span style="background: ${statusColor}; color: white; padding: 0.25rem 0.5rem; border-radius: var(--r-sm); font-size: 0.8rem; font-weight: bold;">
                                ${status}
                            </span>
                        </div>
                        <div style="font-size: 0.9rem; color: var(--c-forest-700); margin-bottom: 0.5rem;">
                             ${car.parentPhone}
                        </div>
                        <div style="font-size: 0.9rem; color: var(--c-forest-700); margin-bottom: 0.5rem;">
                            æ Places enfants: ${remainingChildSeats}/${car.childSeats} | æìæìæìæ Places adultes: ${remainingAdultSeats}/${car.adultSeats}
                        </div>
                        <div style="font-size: 0.9rem; color: var(--c-forest-700); margin-bottom: 0.5rem;">
                            ì ${car.departurePoint} å ${car.arrivalPoint}
                        </div>
                        ${car.comments ? `<div style="font-size: 0.8rem; color: var(--c-ink-700); font-style: italic;"> ${car.comments}</div>` : ''}
                        <div style="margin-top: 0.5rem;">
                            <button class="fey-btn" onclick="addChildToCar('${sectionId}', '${car.id}', 'aller')" style="background: #4CAF50; font-size: 0.8rem; padding: 0.25rem 0.5rem;" ${remainingChildSeats <= 0 ? 'disabled' : ''}>
                                 Ajouter Enfant
                            </button>
                        </div>
                    </div>
                `;
            });

            allerContainer.innerHTML = allerHtml;
            retourContainer.innerHTML = allerHtml; // Même affichage pour le retour
        }

        // Fonction pour charger la liste des enfants sans voiture
        function loadChildrenWithoutCar(sectionId, direction) {
            const container = document.getElementById(`children-list-${sectionId}-${direction}`);
            if (!container) return;

            // Récupérer toutes les voitures disponibles
            const availableCars = JSON.parse(localStorage.getItem(`available-cars-${sectionId}`) || '[]');
            const childrenWithCar = [];

            availableCars.forEach(car => {
                car.children.forEach(child => {
                    childrenWithCar.push(child);
                });
            });

            // Filtrer les enfants sans voiture
            const childrenWithoutCar = scoutChildren.filter(child => {
                const fullName = `${child.nom} ${child.prenom}`;
                return !childrenWithCar.includes(fullName);
            });

            if (childrenWithoutCar.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; color: #4CAF50; font-weight: bold; padding: 1rem;">
                        ë Tous les enfants ont un covoiturage !
                    </div>
                `;
                return;
            }

            let html = '';
            childrenWithoutCar.forEach(child => {
                const fullName = `${child.nom} ${child.prenom}`;
                html += `
                    <div style="background: linear-gradient(135deg, #FFE0E0, #FFB3B3); border: 2px solid #F44336; border-radius: var(--r-sm); padding: 0.5rem; text-align: center; font-weight: bold; color: #D32F2F;">
                        æ ${fullName}
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        // Fonction pour afficher les onglets du dashboard
        function showDashboardTab(sectionId, direction) {
            // Masquer toutes les sections
            document.querySelectorAll(`#children-without-car-${sectionId}-aller, #children-without-car-${sectionId}-retour`).forEach(section => {
                section.style.display = 'none';
            });

            // Afficher la section sélectionnée
            document.getElementById(`children-without-car-${sectionId}-${direction}`).style.display = 'block';

            // Mettre á jour les onglets actifs
            document.querySelectorAll(`.dashboard-tab`).forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.classList.add('active');
        }

        // Fonction pour ajouter un enfant á une voiture
        function addChildToCar(sectionId, carId, direction) {
            const availableCars = JSON.parse(localStorage.getItem(`available-cars-${sectionId}`) || '[]');
            const car = availableCars.find(c => c.id == carId);

            if (!car) return;

            if (car.children.length >= car.childSeats) {
                alert('á️ Cette voiture est complète !');
                return;
            }

            // Créer une liste des enfants disponibles
            const availableChildren = scoutChildren.filter(child => {
                const fullName = `${child.nom} ${child.prenom}`;
                return !car.children.includes(fullName);
            });

            if (availableChildren.length === 0) {
                alert('á️ Aucun enfant disponible !');
                return;
            }

            // Créer une modal pour la sélection
            showChildSelectionModal(sectionId, carId, direction, availableChildren, car);
        }

        // Fonction pour afficher la modal de sélection d'enfants
        function showChildSelectionModal(sectionId, carId, direction, availableChildren, car) {
            // Créer la modal
            const modal = document.createElement('div');
            modal.id = 'childSelectionModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
            `;

            modal.innerHTML = `
                <div style="
                    background: white;
                    border-radius: var(--r-md);
                    padding: 2rem;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    border: 3px solid var(--c-ink-900);
                ">
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <h3 style="color: var(--c-forest-700); margin: 0;">æ Ajouter des Enfants</h3>
                        <p style="color: var(--c-ink-700); margin: 0.5rem 0;">Voiture de <strong>${car.parentName}</strong></p>
                        <p style="color: var(--c-ink-700); margin: 0; font-size: 0.9rem;">Places disponibles: ${car.childSeats - car.children.length}/${car.childSeats}</p>
                    </div>

                    <div id="childrenCheckboxes" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; margin-bottom: 1.5rem;">
                        ${availableChildren.map(child => {
                            const fullName = `${child.nom} ${child.prenom}`;
                            return `
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.5rem;
                                    padding: 0.75rem;
                                    border: 2px solid var(--c-ink-900);
                                    border-radius: var(--r-sm);
                                    background: rgba(255, 255, 255, 0.8);
                                    cursor: pointer;
                                    transition: all 0.2s;
                                " onclick="toggleChildCheckbox('${fullName}')">
                                    <input type="checkbox" id="child-${fullName.replace(/\s+/g, '-')}" value="${fullName}" style="transform: scale(1.3);">
                                    <label for="child-${fullName.replace(/\s+/g, '-')}" style="cursor: pointer; font-weight: bold; color: var(--c-forest-700);">
                                        ${fullName}
                                    </label>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="confirmChildSelection('${sectionId}', '${carId}', '${direction}')" class="fey-btn" style="background: #4CAF50; padding: 0.75rem 1.5rem;">
                            à Confirmer
                        </button>
                        <button onclick="closeChildSelectionModal()" class="fey-btn" style="background: #F44336; padding: 0.75rem 1.5rem;">
                            î Annuler
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        }

        // Fonction pour basculer la case á cocher
        function toggleChildCheckbox(childName) {
            const checkbox = document.getElementById(`child-${childName.replace(/\s+/g, '-')}`);
            checkbox.checked = !checkbox.checked;
        }

        // Fonction pour confirmer la sélection
        function confirmChildSelection(sectionId, carId, direction) {
            const checkboxes = document.querySelectorAll('#childSelectionModal input[type="checkbox"]:checked');
            const selectedChildren = Array.from(checkboxes).map(cb => cb.value);

            if (selectedChildren.length === 0) {
                alert('á️ Veuillez sélectionner au moins un enfant !');
                return;
            }

            const availableCars = JSON.parse(localStorage.getItem(`available-cars-${sectionId}`) || '[]');
            const car = availableCars.find(c => c.id == carId);

            if (car.children.length + selectedChildren.length > car.childSeats) {
                alert('á️ Trop d\'enfants sélectionnés ! Vérifiez les places disponibles.');
                return;
            }

            // Ajouter les enfants sélectionnés
            selectedChildren.forEach(childName => {
                car.children.push(childName);
            });

            localStorage.setItem(`available-cars-${sectionId}`, JSON.stringify(availableCars));

            alert(`à ${selectedChildren.length} enfant${selectedChildren.length > 1 ? 's' : ''} ajouté${selectedChildren.length > 1 ? 's' : ''} á la voiture de ${car.parentName} !`);

            // Fermer la modal
            closeChildSelectionModal();

            // Recharger les listes
            loadAvailableCars(sectionId);
            loadChildrenWithoutCar(sectionId, 'aller');
            loadChildrenWithoutCar(sectionId, 'retour');
        }

        // Fonction pour fermer la modal
        function closeChildSelectionModal() {
            const modal = document.getElementById('childSelectionModal');
            if (modal) {
                modal.remove();
            }
        }

        // Fonctions pour la gestion des sorties en mode admin
        function showCreateTripModal() {
            document.getElementById('createTripModal').style.display = 'block';
        }

        function hideCreateTripModal() {
            document.getElementById('createTripModal').style.display = 'none';
        }

        // Gestion du formulaire de création de sortie
        document.addEventListener('DOMContentLoaded', function() {
            const createTripForm = document.getElementById('createTripForm');
            if (createTripForm) {
                createTripForm.addEventListener('submit', function(e) {
                    e.preventDefault();

                    const formData = new FormData(createTripForm);
                    const tripData = {
                        name: formData.get('tripName'),
                        startDate: formData.get('startDate'),
                        endDate: formData.get('endDate'),
                        departurePoint: formData.get('departurePoint'),
                        arrivalPoint: formData.get('arrivalPoint'),
                        departureTime: formData.get('departureTime'),
                        returnTime: formData.get('returnTime'),
                        description: formData.get('description'),
                        id: Date.now()
                    };

                    // Sauvegarder la sortie
                    const existingTrips = JSON.parse(localStorage.getItem('admin-trips') || '[]');
                    existingTrips.push(tripData);
                    localStorage.setItem('admin-trips', JSON.stringify(existingTrips));

                    alert('à Sortie créée avec succès !');
                    hideCreateTripModal();
                    createTripForm.reset();
                });
            }

            // Gérer les formulaires de voiture
            const carForms = document.querySelectorAll('[id^="carForm-"]');
            carForms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const sectionId = form.id.replace('carForm-', '');
                    createCar(sectionId);
                });
            });

            // Charger les enfants sans voiture pour toutes les sections
            loadChildrenWithoutCar('weekend-groupe');
        });

        // Fonction pour activer le mode admin - sera redéfinie plus tard        // Fonctions pour gérer les notes admin
        function saveAdminNotes() {
            const notes = document.getElementById('adminNotes').value;
            if (notes.trim()) {
                localStorage.setItem('adminNotes', notes);
                showNotification('Notes sauvegardées avec succès !', 'success');
                updateMainPageNotes();
            } else {
                showNotification('Veuillez saisir des notes avant de sauvegarder.', 'warning');
            }
        }

        function clearAdminNotes() {
            if (confirm('ètes-vous s╗r de vouloir effacer toutes les notes ?')) {
                document.getElementById('adminNotes').value = '';
                localStorage.removeItem('adminNotes');
                showNotification('Notes effacées !', 'info');
                updateMainPageNotes();
            }
        }

        function previewAdminNotes() {
            const notes = document.getElementById('adminNotes').value;
            const preview = document.getElementById('adminNotesPreview');
            const content = document.getElementById('previewContent');
            
            if (notes.trim()) {
                content.innerHTML = notes.replace(/\n/g, '<br>');
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        }

        function loadAdminNotes() {
            const notes = localStorage.getItem('adminNotes');
            if (notes) {
                document.getElementById('adminNotes').value = notes;
            }
        }

        function updateMainPageNotes() {
            const notes = localStorage.getItem('adminNotes');
            const notesContainer = document.getElementById('adminNotesDisplay');
            
            if (notes && notes.trim()) {
                if (!notesContainer) {
                    // Créer le conteneur de notes s'il n'existe pas
                    const messageCard = document.querySelector('.fey-card:has(.fey-card-header:contains("Message pour les Parents"))');
                    if (messageCard) {
                        const notesContainer = document.createElement('div');
                        notesContainer.id = 'adminNotesDisplay';
                        notesContainer.className = 'fey-card';
                        notesContainer.style.cssText = 'background: linear-gradient(135deg, #FFF8E1, #FFECB3); border-left: 6px solid #FFC107; margin-bottom: 2rem;';
                        notesContainer.innerHTML = `
                            <div class="fey-card-header"> Message de l'Administrateur</div>
                            <div class="fey-note" style="background: transparent; border: none; margin: 0;">
                                <div id="adminNotesContent"></div>
                            </div>
                        `;
                        messageCard.parentNode.insertBefore(notesContainer, messageCard.nextSibling);
                    }
                }
                
                const content = document.getElementById('adminNotesContent');
                if (content) {
                    content.innerHTML = notes.replace(/\n/g, '<br>');
                }
            } else if (notesContainer) {
                notesContainer.remove();
            }
        }

        function showNotification(message, type = 'info') {
            // Créer une notification temporaire
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 2rem;
                border-radius: var(--r-sm);
                color: white;
                font-weight: bold;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                max-width: 300px;
            `;
            
            const colors = {
                success: '#4CAF50',
                warning: '#FF9800',
                error: '#f44336',
                info: '#2196F3'
            };
            
            notification.style.backgroundColor = colors[type] || colors.info;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Gestionnaire d'événement supprimé - la fonction authenticate() gère maintenant tout

        // Fonctions de personnalisation
        function applyCustomization() {
            // Récupérer les nouvelles couleurs
            const orangeColor = document.getElementById('colorOrange').value;
            const forestColor = document.getElementById('colorForest').value;
            const goldColor = document.getElementById('colorGold').value;
            const marineColor = document.getElementById('colorMarine').value;
            
            // Récupérer les nouveaux textes
            const mainTitle = document.getElementById('mainTitle').value;
            const subtitle = document.getElementById('subtitle').value;
            
            // Appliquer les couleurs via CSS custom properties
            document.documentElement.style.setProperty('--c-orange-600', orangeColor);
            document.documentElement.style.setProperty('--c-forest-700', forestColor);
            document.documentElement.style.setProperty('--c-gold-400', goldColor);
            document.documentElement.style.setProperty('--c-marine-900', marineColor);
            
            // Appliquer les textes
            const titleElement = document.querySelector('.fey-title');
            const subtitleElement = document.querySelector('.fey-subtitle');
            
            if (titleElement) titleElement.textContent = mainTitle;
            if (subtitleElement) subtitleElement.textContent = subtitle;
            
            // Sauvegarder les préférences
            const customization = {
                colors: {
                    orange: orangeColor,
                    forest: forestColor,
                    gold: goldColor,
                    marine: marineColor
                },
                texts: {
                    mainTitle: mainTitle,
                    subtitle: subtitle
                }
            };
            
            localStorage.setItem('admin-customization', JSON.stringify(customization));
            
            alert('à Personnalisation appliquée avec succès !');
        }
        
        function resetCustomization() {
            // Réinitialiser aux valeurs par défaut
            document.getElementById('colorOrange').value = '#F77F00';
            document.getElementById('colorForest').value = '#2E7D32';
            document.getElementById('colorGold').value = '#FFD166';
            document.getElementById('colorMarine').value = '#1B1F3B';
            document.getElementById('mainTitle').value = 'Mon carnet d\'aventure';
            document.getElementById('subtitle').value = 'Prochaine sortie á Jambville  Octobre 2025';
            
            // Supprimer la personnalisation sauvegardée
            localStorage.removeItem('admin-customization');
            
            // Réappliquer les valeurs par défaut
            document.documentElement.style.setProperty('--c-orange-600', '#F77F00');
            document.documentElement.style.setProperty('--c-forest-700', '#2E7D32');
            document.documentElement.style.setProperty('--c-gold-400', '#FFD166');
            document.documentElement.style.setProperty('--c-marine-900', '#1B1F3B');
            
            const titleElement = document.querySelector('.fey-title');
            const subtitleElement = document.querySelector('.fey-subtitle');
            
            if (titleElement) titleElement.textContent = 'Mon carnet d\'aventure';
            if (subtitleElement) subtitleElement.textContent = 'Prochaine sortie á Jambville  Octobre 2025';
            
            alert('ä Personnalisation réinitialisée !');
        }
        
        // Charger la personnalisation au démarrage
        function loadCustomization() {
            const customization = JSON.parse(localStorage.getItem('admin-customization') || '{}');
            
            if (customization.colors) {
                document.documentElement.style.setProperty('--c-orange-600', customization.colors.orange);
                document.documentElement.style.setProperty('--c-forest-700', customization.colors.forest);
                document.documentElement.style.setProperty('--c-gold-400', customization.colors.gold);
                document.documentElement.style.setProperty('--c-marine-900', customization.colors.marine);
            }
            
            if (customization.texts) {
                const titleElement = document.querySelector('.fey-title');
                const subtitleElement = document.querySelector('.fey-subtitle');
                
                if (titleElement) titleElement.textContent = customization.texts.mainTitle;
                if (subtitleElement) subtitleElement.textContent = customization.texts.subtitle;
            }
        }
        
        // Appeler la fonction au chargement
        document.addEventListener('DOMContentLoaded', loadCustomization);
        
        // Fonctions pour les listes déroulantes
        function toggleCategory(categoryId) {
            const content = document.getElementById(categoryId + '-content');
            const arrow = document.getElementById(categoryId + '-arrow');
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                arrow.textContent = '';
            } else {
                content.style.display = 'none';
                arrow.textContent = '▶';
            }
        }
        
        // Fonction pour démarrer le jeu de sac scout
        function startScoutBagGame() {
            // Créer une modal pour le jeu
            const modal = document.createElement('div');
            modal.id = 'scoutBagGameModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow-y: auto;
            `;

            modal.innerHTML = `
                <div style="
                    background: var(--parchment);
                    border-radius: 24px;
                    padding: 2rem;
                    max-width: 1200px;
                    width: 95%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    border: 4px solid var(--wood);
                    position: relative;
                ">
                    <button onclick="closeScoutBagGame()" style="
                        position: absolute;
                        top: 1rem;
                        right: 1rem;
                        background: #F44336;
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        font-size: 1.2rem;
                        cursor: pointer;
                        z-index: 10;
                    "></button>
                    
                    <div class="scout-bag-game" id="scoutBagGameContent">
                        <!-- Le contenu du jeu sera chargé ici -->
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // Charger le contenu du jeu
            loadScoutBagGameContent();
        }
        
        function closeScoutBagGame() {
            const modal = document.getElementById('scoutBagGameModal');
            if (modal) {
                modal.remove();
            }
        }
        
        function loadScoutBagGameContent() {
            const gameContent = document.getElementById('scoutBagGameContent');
            
            gameContent.innerHTML = `
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="font-family: 'Patrick Hand', cursive; color: var(--forest); font-size: 2.5rem; margin-bottom: 1rem;">
                         Prépare ton Sac de Scout ! ️
                    </h1>
                    <p style="color: var(--ink); font-size: 1.2rem; margin-bottom: 2rem;">
                        Glisse les objets dans le sac dans le bon ordre pour être prêt pour l'aventure !
                    </p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <!-- Zone des objets á ranger -->
                    <div style="background: linear-gradient(135deg, #E8F5E8, #C8E6C9); border-radius: 16px; padding: 1.5rem; border: 3px solid var(--forest);">
                        <h3 style="color: var(--forest); margin-bottom: 1rem; text-align: center;"> Objets á Ranger</h3>
                        <div id="items-to-pack" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
                            <!-- Les objets seront générés dynamiquement -->
                        </div>
                    </div>

                    <!-- Zone du sac -->
                    <div style="background: linear-gradient(135deg, #FFF3E0, #FFE0B2); border-radius: 16px; padding: 1.5rem; border: 3px solid var(--orange);">
                        <h3 style="color: var(--orange); margin-bottom: 1rem; text-align: center;"> Ton Sac</h3>
                        <div id="scout-bag" style="
                            min-height: 300px;
                            border: 3px dashed var(--orange);
                            border-radius: 12px;
                            padding: 1rem;
                            background: rgba(255, 255, 255, 0.5);
                        ">
                            <p style="text-align: center; color: var(--orange); font-style: italic;">
                                Glisse les objets ici dans le bon ordre !
                            </p>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="background: linear-gradient(135deg, var(--forest), #4CAF50); color: white; padding: 1rem; border-radius: 12px; display: inline-block;">
                        <strong>Score: </strong><span id="game-score">0</span> / <span id="max-score">0</span>
                    </div>
                </div>

                <div style="text-align: center;">
                    <button onclick="resetScoutBagGame()" class="fey-btn" style="background: #FF9800; margin-right: 1rem;">
                        ä Recommencer
                    </button>
                    <button onclick="checkScoutBagGame()" class="fey-btn" style="background: #4CAF50;">
                        à Vérifier
                    </button>
                </div>
            `;
            
            // Initialiser le jeu
            initScoutBagGame();
        }
        
        // Variables du jeu
        let gameItems = [];
        let bagItems = [];
        let gameScore = 0;
        let maxScore = 0;
        
        function initScoutBagGame() {
            // Définir les objets du jeu avec leur ordre correct
            gameItems = [
                { id: 1, name: ' Chaussettes', emoji: '', order: 1 },
                { id: 2, name: 'æ T-shirt', emoji: 'æ', order: 2 },
                { id: 3, name: 'æ Pantalon', emoji: 'æ', order: 3 },
                { id: 4, name: ' Pull', emoji: '', order: 4 },
                { id: 5, name: ' Gants', emoji: '', order: 5 },
                { id: 6, name: ' Casquette', emoji: '', order: 6 },
                { id: 7, name: 'æ Chaussures', emoji: 'æ', order: 7 },
                { id: 8, name: ' Sac á dos', emoji: '', order: 8 }
            ];
            
            maxScore = gameItems.length;
            bagItems = [];
            gameScore = 0;
            
            // Mélanger les objets
            const shuffledItems = [...gameItems].sort(() => Math.random() - 0.5);
            
            // Afficher les objets
            const itemsContainer = document.getElementById('items-to-pack');
            itemsContainer.innerHTML = '';
            
            shuffledItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'game-item';
                itemElement.draggable = true;
                itemElement.dataset.itemId = item.id;
                itemElement.style.cssText = `
                    background: linear-gradient(135deg, var(--orange), var(--gold));
                    color: white;
                    padding: 1rem;
                    border-radius: 12px;
                    text-align: center;
                    cursor: move;
                    border: 3px solid var(--ink);
                    font-weight: bold;
                    transition: all 0.3s ease;
                    user-select: none;
                `;
                itemElement.innerHTML = `
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">${item.emoji}</div>
                    <div style="font-size: 0.9rem;">${item.name}</div>
                `;
                
                // ëvénements de drag
                itemElement.addEventListener('dragstart', handleDragStart);
                itemElement.addEventListener('dragend', handleDragEnd);
                
                itemsContainer.appendChild(itemElement);
            });
            
            // Configurer la zone de dépt
            const bagContainer = document.getElementById('scout-bag');
            bagContainer.addEventListener('dragover', handleDragOver);
            bagContainer.addEventListener('drop', handleDrop);
            bagContainer.addEventListener('dragenter', handleDragEnter);
            bagContainer.addEventListener('dragleave', handleDragLeave);
            
            updateGameScore();
        }
        
        function handleDragStart(e) {
            e.dataTransfer.setData('text/plain', e.target.dataset.itemId);
            e.target.style.opacity = '0.5';
        }
        
        function handleDragEnd(e) {
            e.target.style.opacity = '1';
        }
        
        function handleDragOver(e) {
            e.preventDefault();
        }
        
        function handleDragEnter(e) {
            e.preventDefault();
            e.target.style.background = 'rgba(76, 175, 80, 0.3)';
        }
        
        function handleDragLeave(e) {
            e.target.style.background = 'rgba(255, 255, 255, 0.5)';
        }
        
        function handleDrop(e) {
            e.preventDefault();
            e.target.style.background = 'rgba(255, 255, 255, 0.5)';
            
            const itemId = parseInt(e.dataTransfer.getData('text/plain'));
            const item = gameItems.find(i => i.id === itemId);
            
            if (item && !bagItems.find(bi => bi.id === itemId)) {
                bagItems.push(item);
                
                // Créer l'élément dans le sac
                const bagElement = document.createElement('div');
                bagElement.className = 'bag-item';
                bagElement.dataset.itemId = itemId;
                bagElement.style.cssText = `
                    background: linear-gradient(135deg, #4CAF50, #66BB6A);
                    color: white;
                    padding: 0.75rem;
                    border-radius: 8px;
                    text-align: center;
                    margin: 0.5rem;
                    display: inline-block;
                    border: 2px solid var(--ink);
                    font-weight: bold;
                    transition: all 0.3s ease;
                `;
                bagElement.innerHTML = `
                    <div style="font-size: 1.5rem;">${item.emoji}</div>
                    <div style="font-size: 0.8rem;">${item.name}</div>
                `;
                
                e.target.appendChild(bagElement);
                
                // Retirer l'objet de la zone source
                const sourceElement = document.querySelector(`[data-item-id="${itemId}"]`);
                if (sourceElement && sourceElement.parentElement.id === 'items-to-pack') {
                    sourceElement.remove();
                }
                
                updateGameScore();
            }
        }
        
        function updateGameScore() {
            document.getElementById('game-score').textContent = bagItems.length;
            document.getElementById('max-score').textContent = maxScore;
        }
        
        function checkScoutBagGame() {
            // Vérifier l'ordre
            let correctOrder = true;
            for (let i = 0; i < bagItems.length; i++) {
                if (bagItems[i].order !== i + 1) {
                    correctOrder = false;
                    break;
                }
            }
            
            if (correctOrder && bagItems.length === maxScore) {
                alert('ë Bravo ! Tu as parfaitement rangé ton sac ! Tu es prêt pour l\'aventure ! ️');
            } else if (bagItems.length === maxScore) {
                alert('î Presque ! L\'ordre n\'est pas tout á fait correct. Essaie de nouveau !');
            } else {
                alert('î Il manque encore des objets dans ton sac !');
            }
        }
        
        function resetScoutBagGame() {
            // Vider le sac
            bagItems = [];
            document.getElementById('scout-bag').innerHTML = '<p style="text-align: center; color: var(--orange); font-style: italic;">Glisse les objets ici dans le bon ordre !</p>';
            
            // Réinitialiser le jeu
            initScoutBagGame();
        }
        
        // Fonctions de gestion des sorties
        function showCreateOutingModal() {
            const modal = document.createElement('div');
            modal.id = 'createOutingModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
            `;

            modal.innerHTML = `
                <div style="
                    background: white;
                    border-radius: var(--r-md);
                    padding: 2rem;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    border: 3px solid var(--c-ink-900);
                ">
                    <div class="fey-card-header"> Créer une Nouvelle Sortie</div>
                    <form id="createOutingForm" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">️ Nom de la Sortie</label>
                                <input type="text" name="outingName" required style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">à Date</label>
                                <input type="date" name="outingDate" required style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">ì Lieu</label>
                                <input type="text" name="outingLocation" required style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Heure Départ</label>
                                <input type="time" name="departureTime" required style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                            </div>
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Heure Retour</label>
                            <input type="time" name="returnTime" required style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Description</label>
                            <textarea name="description" required style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); height: 80px; resize: vertical;"></textarea>
                        </div>

                        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                            <button type="submit" class="fey-btn" style="background: #4CAF50; padding: 0.75rem 1.5rem;">
                                à Créer la Sortie
                            </button>
                            <button type="button" onclick="closeCreateOutingModal()" class="fey-btn" style="background: #F44336; padding: 0.75rem 1.5rem;">
                                î Annuler
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            // Gérer la soumission du formulaire
            document.getElementById('createOutingForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const outingData = {
                    name: formData.get('outingName'),
                    date: formData.get('outingDate'),
                    location: formData.get('outingLocation'),
                    departureTime: formData.get('departureTime'),
                    returnTime: formData.get('returnTime'),
                    description: formData.get('description'),
                    id: Date.now()
                };

                // Sauvegarder la sortie
                const existingOutings = JSON.parse(localStorage.getItem('admin-outings') || '[]');
                existingOutings.push(outingData);
                localStorage.setItem('admin-outings', JSON.stringify(existingOutings));

                alert('à Sortie créée avec succès !');
                closeCreateOutingModal();
                loadOutings(); // Recharger la liste
            });
        }
        
        function closeCreateOutingModal() {
            const modal = document.getElementById('createOutingModal');
            if (modal) {
                modal.remove();
            }
        }
        
        function loadOutings() {
            const outings = JSON.parse(localStorage.getItem('admin-outings') || '[]');
            const container = document.getElementById('outings-list');
            
            if (outings.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666;">Aucune sortie programmée</p>';
                return;
            }
            
            let html = '<h3 style="color: var(--c-forest-700); margin-bottom: 1rem; font-size: 1.2rem;">à Sorties Programmées</h3>';
            
            outings.forEach(outing => {
                html += `
                    <div class="fey-item" style="background: linear-gradient(135deg, #E8F5E8, #C8E6C9); border-left: 4px solid #4CAF50; margin-bottom: 1rem;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; align-items: center;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">️ Nom de la Sortie</label>
                                <input type="text" value="${outing.name}" style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">à Date</label>
                                <input type="date" value="${outing.date}" style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">ì Lieu</label>
                                <input type="text" value="${outing.location}" style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Heure Départ</label>
                                <input type="time" value="${outing.departureTime}" style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Heure Retour</label>
                                <input type="time" value="${outing.returnTime}" style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                            </div>
                        </div>
                        <div style="margin-top: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Description</label>
                            <textarea style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); height: 60px; resize: vertical;">${outing.description}</textarea>
                        </div>
                        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                            <button class="fey-btn" onclick="saveOuting(${outing.id})" style="background: #4CAF50; font-size: 0.9rem; padding: 0.5rem 1rem;"> Sauvegarder</button>
                            <button class="fey-btn" onclick="deleteOuting(${outing.id})" style="background: #F44336; font-size: 0.9rem; padding: 0.5rem 1rem;">æ️ Supprimer</button>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }
        
        function saveOuting(outingId) {
            // Logique pour sauvegarder les modifications
            alert('à Sortie sauvegardée !');
        }
        
        function deleteOuting(outingId) {
            if (confirm('ètes-vous s╗r de vouloir supprimer cette sortie ?')) {
                const outings = JSON.parse(localStorage.getItem('admin-outings') || '[]');
                const updatedOutings = outings.filter(outing => outing.id !== outingId);
                localStorage.setItem('admin-outings', JSON.stringify(updatedOutings));
                loadOutings();
                alert('à Sortie supprimée !');
            }
            
            console.log('à ëvénements récupérés:', Object.keys(events).length);
            console.log('à Détails des événements:', events);
            
            return events;
        }

        // Fonction pour obtenir les événements par défaut du programme 2025-2026
        function getDefaultCalendarEvents() {
            return {
                // Septembre 2025
                '28-9-2025': {
                    title: 'æìæìæìæ Réunion parents',
                    time: 'Dimanche',
                    description: 'Réunion d\'information pour les parents'
                },

                // Octobre 2025
                '3-10-2025': {
                    title: '️ Weekend de Groupe',
                    time: 'Vendredi - Départ',
                    description: 'Weekend de groupe avec activités scoutes'
                },
                '4-10-2025': {
                    title: '️ Weekend de Groupe',
                    time: 'Samedi - Retour',
                    description: 'Weekend de groupe avec activités scoutes'
                },
                '12-10-2025': {
                    title: ' Sortie voile',
                    time: 'Dimanche',
                    description: 'Sortie voile á Verneuil sur Seine'
                },

                // Novembre 2025
                '15-11-2025': {
                    title: ' Weekend Abbaye d\'Epernon',
                    time: 'Samedi - Départ',
                    description: 'Weekend au Prieuré Saint Thomas'
                },
                '16-11-2025': {
                    title: ' Weekend Abbaye d\'Epernon',
                    time: 'Dimanche - Retour',
                    description: 'Weekend au Prieuré Saint Thomas'
                },

                // Décembre 2025
                '14-12-2025': {
                    title: '️ Lumière de Bethléem',
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
                    title: ' Sortie Montmartre',
                    time: 'Dimanche',
                    description: 'Découverte de Montmartre et du Sacré-C┼ur'
                },

                // Mars 2026
                '14-3-2026': {
                    title: 'î Weekend de mars',
                    time: 'Samedi - Départ',
                    description: 'Weekend de printemps avec activités nature'
                },
                '15-3-2026': {
                    title: 'î Weekend de mars',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de printemps avec activités nature'
                },

                // Avril 2026
                '12-4-2026': {
                    title: ' Sortie chteau',
                    time: 'Dimanche',
                    description: 'Visite d\'un chteau historique'
                },

                // Mai 2026
                '15-5-2026': {
                    title: ' Mini-camp Mont Saint-Michel',
                    time: 'Vendredi - Départ',
                    description: 'Mini-camp au Mont Saint-Michel'
                },
                '16-5-2026': {
                    title: ' Mini-camp Mont Saint-Michel',
                    time: 'Samedi',
                    description: 'Mini-camp au Mont Saint-Michel'
                },
                '17-5-2026': {
                    title: ' Mini-camp Mont Saint-Michel',
                    time: 'Dimanche - Retour',
                    description: 'Mini-camp au Mont Saint-Michel'
                },

                // Juin 2026
                '12-6-2026': {
                    title: 'æìæìæìæ Réunion présentation camp',
                    time: 'Vendredi 18h-20h',
                    description: 'Réunion de présentation du camp d\'été'
                },
                '13-6-2026': {
                    title: 'î Weekend de juin',
                    time: 'Samedi - Départ',
                    description: 'Weekend de fin d\'année'
                },
                '14-6-2026': {
                    title: 'î Weekend de juin',
                    time: 'Dimanche - Retour',
                    description: 'Weekend de fin d\'année'
                },

                // Juillet 2026
                '5-7-2026': {
                    title: '️ Camp d\'été',
                    time: 'Départ',
                    description: 'Camp d\'été (première quinzaine des vacances Zone C)'
                },
                '19-7-2026': {
                    title: '️ Camp d\'été',
                    time: 'Retour',
                    description: 'Fin du camp d\'été (dates exactes á confirmer)'
                }
            };
        }
        
        // Charger les sorties au démarrage
        document.addEventListener('DOMContentLoaded', function() {
            if (document.getElementById('outings-list')) {
                loadOutings();
            }
            // Charger les sorties pour le registre d'appel
            loadOutingsForAttendance();
        });

        // ===============================
        // FONCTIONS REGISTRE D'APPEL
        // ===============================

        // Charger les sorties dans le sélecteur du registre d'appel
        function loadOutingsForAttendance() {
            const outings = JSON.parse(localStorage.getItem('admin-outings') || '[]');
            const select = document.getElementById('selectedOuting');
            
            if (!select) return;
            
            // Vider le sélecteur
            select.innerHTML = '<option value="">-- Sélectionnez une sortie --</option>';
            
            // Ajouter chaque sortie
            outings.forEach(outing => {
                const option = document.createElement('option');
                option.value = outing.id;
                option.textContent = `${outing.name} - ${new Date(outing.startDate).toLocaleDateString('fr-FR')}`;
                select.appendChild(option);
            });
        }

        // Charger le registre d'appel pour une sortie sélectionnée
        function loadAttendanceForOuting(tripId) {
            if (!tripId) {
                document.getElementById('outingInfo').style.display = 'none';
                document.getElementById('participantsList').style.display = 'none';
                return;
            }

            // Récupérer les détails de la sortie depuis le calendrier
            const events = getCalendarEvents();
            const dateKey = tripId.replace(/_/g, '-');
            const event = events[dateKey];
            
            if (!event) {
                console.error('Sortie non trouvée:', tripId);
                return;
            }

            // Afficher les informations de la sortie
displayOutingInfo(event, dateKey);
            
            // Créer la liste d'appel
            createAttendanceList(tripId, event);
            document.getElementById('outingInfo').style.display = 'block';
            document.getElementById('participantsList').style.display = 'block';
        }

        // Afficher les informations de la sortie
        function displayOutingInfo(event, dateKey) {
            const detailsContainer = document.getElementById('outingDetails');
            if (detailsContainer) {
            detailsContainer.innerHTML = `
                <div style="background: linear-gradient(135deg, #E3F2FD, #BBDEFB); padding: 1rem; border-radius: var(--r-sm); border: 2px solid var(--c-ink-900);">
                        <strong>️ ${event.title}</strong><br>
                        <small>${dateKey}</small>
                </div>
                <div style="background: linear-gradient(135deg, #F3E5F5, #E1BEE7); padding: 1rem; border-radius: var(--r-sm); border: 2px solid var(--c-ink-900);">
                        <strong> Heure</strong><br>
                        <small>${event.time || 'Non spécifiée'}</small>
                </div>
                <div style="background: linear-gradient(135deg, #E8F5E8, #C8E6C9); padding: 1rem; border-radius: var(--r-sm); border: 2px solid var(--c-ink-900);">
                    <strong> Description</strong><br>
                        <small>${event.description || 'Aucune description'}</small>
                </div>
            `;
            }
        }
        
        // Créer la liste d'appel avec les enfants
        function createAttendanceList(tripId, event) {
            const participantsList = document.getElementById('participantsList');
            if (!participantsList) return;
            
            // Liste des enfants scouts (copie directe pour éviter les problèmes de portée)
            const children = [
                'DESCAMPS JEANNE',
                'LAURENT BILLET CLAIRE', 
                'PICHEREAU JULES',
                'POTTER FELIX',
                'ROUSSEAU LEOPOLD',
                'JEANJEAN MADELEINE',
                'LALIGAND LEA',
                'MILLART CONSTANCE',
                'REYNAL DE SAINT MICHEL ALEXIA',
                'D\'ANDREA DANTE',
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
            
            console.log('æ Enfants chargés:', children);
            
            // Récupérer les présences sauvegardées
            const savedAttendance = JSON.parse(localStorage.getItem(`attendance_${tripId}`) || '{}');
            
            let attendanceHTML = `
                <div class="fey-card">
                    <div class="fey-card-header">ï Liste d'Appel - ${event.title}</div>
                    <div style="margin-bottom: 1rem;">
                        <p><strong>à Date :</strong> ${tripId.replace(/_/g, '-')}</p>
                        <p><strong>æ Nombre d'enfants :</strong> ${children.length}</p>
                    </div>
                    <div style="max-height: 400px; overflow-y: auto; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 1rem;">
            `;
            
            children.forEach((child, index) => {
                const isPresent = savedAttendance[child] || false;
                attendanceHTML += `
                    <div style="display: flex; align-items: center; padding: 0.75rem; border-bottom: 1px solid #eee; background: ${isPresent ? '#e8f5e8' : '#fff'};">
                        <input type="checkbox" 
                               id="attendance_${tripId}_${index}" 
                               ${isPresent ? 'checked' : ''} 
                               onchange="updateAttendance('${tripId}', '${child}', this.checked)"
                               style="margin-right: 1rem; transform: scale(1.3);">
                        <label for="attendance_${tripId}_${index}" style="flex: 1; cursor: pointer; font-size: 1.1rem;">
                            <strong>${child}</strong>
                            <span id="status_${tripId}_${index}" style="color: ${isPresent ? '#2e7d32' : '#666'}; margin-left: 0.5rem;">
                                ${isPresent ? 'à Présent' : 'î Absent'}
                            </span>
                        </label>
                    </div>
                `;
            });
            
            attendanceHTML += `
                    </div>
                    <div style="margin-top: 1rem; text-align: center;">
                        <button onclick="saveAttendance('${tripId}')" class="fey-btn" style="background: #4CAF50; padding: 0.75rem 1.5rem; margin-right: 1rem;">
                             Sauvegarder l'Appel
                        </button>
                        <button onclick="exportAttendance('${tripId}')" class="fey-btn" style="background: #2196F3; padding: 0.75rem 1.5rem;">
                            è Exporter
                        </button>
                    </div>
                </div>
            `;
            
            participantsList.innerHTML = attendanceHTML;
        }
        
        // Mettre á jour la présence d'un enfant
        function updateAttendance(tripId, childName, isPresent) {
            const savedAttendance = JSON.parse(localStorage.getItem(`attendance_${tripId}`) || '{}');
            savedAttendance[childName] = isPresent;
            localStorage.setItem(`attendance_${tripId}`, JSON.stringify(savedAttendance));
            
            // Mettre á jour l'affichage en trouvant l'élément par l'index
            const children = [
                'DESCAMPS JEANNE',
                'LAURENT BILLET CLAIRE', 
                'PICHEREAU JULES',
                'POTTER FELIX',
                'ROUSSEAU LEOPOLD',
                'JEANJEAN MADELEINE',
                'LALIGAND LEA',
                'MILLART CONSTANCE',
                'REYNAL DE SAINT MICHEL ALEXIA',
                'D\'ANDREA DANTE',
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
            const childIndex = children.indexOf(childName);
            
            if (childIndex !== -1) {
                const statusSpan = document.getElementById(`status_${tripId}_${childIndex}`);
                if (statusSpan) {
                    statusSpan.textContent = isPresent ? 'à Présent' : 'î Absent';
                    statusSpan.style.color = isPresent ? '#2e7d32' : '#666';
                }
                
                // Changer la couleur de fond
                const container = document.getElementById(`attendance_${tripId}_${childIndex}`).closest('div');
                if (container) {
                    container.style.background = isPresent ? '#e8f5e8' : '#fff';
                }
            }
        }
        
        // Sauvegarder l'appel
        function saveAttendance(tripId) {
            const savedAttendance = JSON.parse(localStorage.getItem(`attendance_${tripId}`) || '{}');
            const presentCount = Object.values(savedAttendance).filter(present => present).length;
            const totalCount = Object.keys(savedAttendance).length;
            
            // Sauvegarder dans l'historique
            const history = JSON.parse(localStorage.getItem('attendance-history') || '[]');
            const event = getCalendarEvents()[tripId.replace(/_/g, '-')];
            
            const record = {
                id: tripId,
                title: event.title,
                date: tripId.replace(/_/g, '-'),
                attendance: savedAttendance,
                presentCount: presentCount,
                totalCount: totalCount,
                timestamp: new Date().toISOString()
            };
            
            // Supprimer l'ancien enregistrement s'il existe
            const existingIndex = history.findIndex(h => h.id === tripId);
            if (existingIndex !== -1) {
                history[existingIndex] = record;
            } else {
                history.push(record);
            }
            
            localStorage.setItem('attendance-history', JSON.stringify(history));
            
            // Recharger l'historique pour l'afficher
            loadAttendanceHistory();
            
            alert(`à Appel sauvegardé !\næ Présents: ${presentCount}/${totalCount}`);
        }
        
        // Exporter l'appel
        function exportAttendance(tripId) {
            const savedAttendance = JSON.parse(localStorage.getItem(`attendance_${tripId}`) || '{}');
            const event = getCalendarEvents()[tripId.replace(/_/g, '-')];
            
            let csvContent = `Appel - ${event.title} (${tripId.replace(/_/g, '-')})\n`;
            csvContent += `Nom,Présent\n`;
            
            Object.entries(savedAttendance).forEach(([child, isPresent]) => {
                csvContent += `${child},${isPresent ? 'Oui' : 'Non'}\n`;
            });
            
            // Créer et télécharger le fichier
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `appel_${tripId.replace(/_/g, '-')}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        }
        
        // Nettoyer l'historique des entrées invalides
        function cleanAttendanceHistory() {
            const history = JSON.parse(localStorage.getItem('attendance-history') || '[]');
            const events = getCalendarEvents();
            
            // Filtrer les entrées valides
            const validHistory = history.filter(record => {
                const event = events[record.date];
                return event && event.title !== undefined;
            });
            
            // Mettre á jour les titres des entrées existantes
            validHistory.forEach(record => {
                const event = events[record.date];
                if (event) {
                    record.title = event.title;
                }
            });
            
            localStorage.setItem('attendance-history', JSON.stringify(validHistory));
            loadAttendanceHistory();
            
            alert(` Historique nettoyé ! ${history.length - validHistory.length} entrées invalides supprimées.`);
        }
        
        // Supprimer tout l'historique
        function clearAllAttendanceHistory() {
            if (confirm('á️ ètes-vous s╗r de vouloir supprimer TOUT l\'historique des appels ? Cette action est irréversible.')) {
                localStorage.removeItem('attendance-history');
                loadAttendanceHistory();
                alert('æ️ Historique complètement supprimé !');
            }
        }

        // Charger la liste des participants pour le registre d'appel
        function loadParticipantsForAttendance(outing) {
            // Récupérer les équipes
            const lifeTeams = JSON.parse(localStorage.getItem('life-teams') || '[]');
            const nightTeams = JSON.parse(localStorage.getItem('night-teams') || '[]');

            // Récupérer le registre d'appel existant pour cette sortie
            const attendanceRecords = JSON.parse(localStorage.getItem('attendance-records') || '{}');
            const currentAttendance = attendanceRecords[outing.id] || {};

            let participants = [];
            
            // Ajouter les membres des équipes de vie
            lifeTeams.forEach(team => {
                team.members.forEach(member => {
                    participants.push({
                        id: `life_${team.name}_${member}`,
                        name: member,
                        team: team.name,
                        teamType: 'life',
                        attendance: currentAttendance[`life_${team.name}_${member}`] || 'unknown'
                    });
                });
            });

            // Ajouter les membres des équipes de nuit
            nightTeams.forEach(team => {
                team.members.forEach(member => {
                    participants.push({
                        id: `night_${team.name}_${member}`,
                        name: member,
                        team: team.name,
                        teamType: 'night',
                        attendance: currentAttendance[`night_${team.name}_${member}`] || 'unknown'
                    });
                });
            });

            // Générer le tableau des participants
            generateParticipantsTable(participants);
            updateAttendanceStats(participants);
        }

        // Générer le tableau des participants
        function generateParticipantsTable(participants) {
            const tableContainer = document.getElementById('participantsTable');
            
            if (participants.length === 0) {
                tableContainer.innerHTML = `
                    <div class="fey-note" style="text-align: center; padding: 2rem;">
                        <strong>æ Aucun participant trouvé</strong><br>
                        <small>Assurez-vous que les équipes sont configurées dans le panneau admin.</small>
                    </div>
                `;
                return;
            }

            let html = `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; border: 2px solid var(--c-ink-900);">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #FF5722, #FF7043); color: white;">
                                <th style="padding: 1rem; border: 1px solid var(--c-ink-900); text-align: left;">æ Participant</th>
                                <th style="padding: 1rem; border: 1px solid var(--c-ink-900); text-align: left;">æ ëquipe</th>
                                <th style="padding: 1rem; border: 1px solid var(--c-ink-900); text-align: center;">à Présent</th>
                                <th style="padding: 1rem; border: 1px solid var(--c-ink-900); text-align: center;">î Absent</th>
                                <th style="padding: 1rem; border: 1px solid var(--c-ink-900); text-align: center;"> Justifié</th>
                                <th style="padding: 1rem; border: 1px solid var(--c-ink-900); text-align: left;"> Commentaire</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            participants.forEach(participant => {
                const presentChecked = participant.attendance === 'present' ? 'checked' : '';
                const absentChecked = participant.attendance === 'absent' ? 'checked' : '';
                const justifiedChecked = participant.attendance === 'justified' ? 'checked' : '';
                
                html += `
                    <tr style="border-bottom: 1px solid var(--c-ink-900);">
                        <td style="padding: 0.75rem; border: 1px solid var(--c-ink-900);">
                            <strong>${participant.name}</strong><br>
                            <small style="color: #666;">${participant.teamType === 'life' ? '️ Vie' : 'î Nuit'}</small>
                        </td>
                        <td style="padding: 0.75rem; border: 1px solid var(--c-ink-900);">
                            ${participant.team}
                        </td>
                        <td style="padding: 0.75rem; border: 1px solid var(--c-ink-900); text-align: center;">
                            <input type="radio" name="attendance_${participant.id}" value="present" ${presentChecked} 
                                   onchange="updateParticipantAttendance('${participant.id}', 'present')" 
                                   style="transform: scale(1.2);">
                        </td>
                        <td style="padding: 0.75rem; border: 1px solid var(--c-ink-900); text-align: center;">
                            <input type="radio" name="attendance_${participant.id}" value="absent" ${absentChecked}
                                   onchange="updateParticipantAttendance('${participant.id}', 'absent')"
                                   style="transform: scale(1.2);">
                        </td>
                        <td style="padding: 0.75rem; border: 1px solid var(--c-ink-900); text-align: center;">
                            <input type="radio" name="attendance_${participant.id}" value="justified" ${justifiedChecked}
                                   onchange="updateParticipantAttendance('${participant.id}', 'justified')"
                                   style="transform: scale(1.2);">
                        </td>
                        <td style="padding: 0.75rem; border: 1px solid var(--c-ink-900);">
                            <input type="text" id="comment_${participant.id}" placeholder="Commentaire..." 
                                   value="${participant.comment || ''}" 
                                   onchange="updateParticipantComment('${participant.id}', this.value)"
                                   style="width: 100%; padding: 0.25rem; border: 1px solid #ccc; border-radius: 4px;">
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            tableContainer.innerHTML = html;
        }

        // Mettre á jour l'attendance d'un participant
        function updateParticipantAttendance(participantId, status) {
            const outingId = document.getElementById('selectedOuting').value;
            if (!outingId) return;

            const attendanceRecords = JSON.parse(localStorage.getItem('attendance-records') || '{}');
            if (!attendanceRecords[outingId]) {
                attendanceRecords[outingId] = {};
            }
            
            attendanceRecords[outingId][participantId] = status;
            localStorage.setItem('attendance-records', JSON.stringify(attendanceRecords));
            
            // Mettre á jour les statistiques
            updateAttendanceStatsFromCurrent();
        }

        // Mettre á jour le commentaire d'un participant
        function updateParticipantComment(participantId, comment) {
            const outingId = document.getElementById('selectedOuting').value;
            if (!outingId) return;

            const attendanceRecords = JSON.parse(localStorage.getItem('attendance-records') || '{}');
            if (!attendanceRecords[outingId]) {
                attendanceRecords[outingId] = {};
            }
            
            if (!attendanceRecords[outingId][participantId]) {
                attendanceRecords[outingId][participantId] = 'unknown';
            }
            
            // Stocker le commentaire séparément
            const comments = JSON.parse(localStorage.getItem('attendance-comments') || '{}');
            if (!comments[outingId]) {
                comments[outingId] = {};
            }
            comments[outingId][participantId] = comment;
            localStorage.setItem('attendance-comments', JSON.stringify(comments));
        }

        // Mettre á jour les statistiques d'attendance
        function updateAttendanceStats(participants) {
            let present = 0, absent = 0, justified = 0, total = participants.length;
            
            participants.forEach(participant => {
                switch(participant.attendance) {
                    case 'present': present++; break;
                    case 'absent': absent++; break;
                    case 'justified': justified++; break;
                }
            });

            document.getElementById('presentCount').textContent = present;
            document.getElementById('absentCount').textContent = absent;
            document.getElementById('justifiedCount').textContent = justified;
            document.getElementById('totalCount').textContent = total;
        }

        // Mettre á jour les statistiques depuis les données actuelles
        function updateAttendanceStatsFromCurrent() {
            const outingId = document.getElementById('selectedOuting').value;
            if (!outingId) return;

            const attendanceRecords = JSON.parse(localStorage.getItem('attendance-records') || '{}');
            const currentAttendance = attendanceRecords[outingId] || {};
            
            let present = 0, absent = 0, justified = 0, total = 0;
            
            Object.values(currentAttendance).forEach(status => {
                total++;
                switch(status) {
                    case 'present': present++; break;
                    case 'absent': absent++; break;
                    case 'justified': justified++; break;
                }
            });

            document.getElementById('presentCount').textContent = present;
            document.getElementById('absentCount').textContent = absent;
            document.getElementById('justifiedCount').textContent = justified;
            document.getElementById('totalCount').textContent = total;
        }

        // Marquer tous les participants comme présents
        function markAllPresent() {
            const outingId = document.getElementById('selectedOuting').value;
            if (!outingId) return;

            const attendanceRecords = JSON.parse(localStorage.getItem('attendance-records') || '{}');
            if (!attendanceRecords[outingId]) {
                attendanceRecords[outingId] = {};
            }

            // Marquer tous les participants comme présents
            document.querySelectorAll('input[type="radio"][value="present"]').forEach(radio => {
                radio.checked = true;
                const participantId = radio.name.replace('attendance_', '');
                attendanceRecords[outingId][participantId] = 'present';
            });

            localStorage.setItem('attendance-records', JSON.stringify(attendanceRecords));
            updateAttendanceStatsFromCurrent();
            
            alert('à Tous les participants ont été marqués comme présents !');
        }

        // Marquer tous les participants comme absents
        function markAllAbsent() {
            const outingId = document.getElementById('selectedOuting').value;
            if (!outingId) return;

            const attendanceRecords = JSON.parse(localStorage.getItem('attendance-records') || '{}');
            if (!attendanceRecords[outingId]) {
                attendanceRecords[outingId] = {};
            }

            // Marquer tous les participants comme absents
            document.querySelectorAll('input[type="radio"][value="absent"]').forEach(radio => {
                radio.checked = true;
                const participantId = radio.name.replace('attendance_', '');
                attendanceRecords[outingId][participantId] = 'absent';
            });

            localStorage.setItem('attendance-records', JSON.stringify(attendanceRecords));
            updateAttendanceStatsFromCurrent();
            
            alert('î Tous les participants ont été marqués comme absents !');
        }

        // Effacer toutes les données d'attendance
        function clearAttendance() {
            if (!confirm('á️ ètes-vous s╗r de vouloir effacer toutes les données d\'attendance pour cette sortie ?')) {
                return;
            }

            const outingId = document.getElementById('selectedOuting').value;
            if (!outingId) return;

            // Décocher tous les boutons radio
            document.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.checked = false;
            });

            // Effacer les commentaires
            document.querySelectorAll('input[type="text"]').forEach(input => {
                if (input.placeholder === 'Commentaire...') {
                    input.value = '';
                }
            });

            // Supprimer les données du localStorage
            const attendanceRecords = JSON.parse(localStorage.getItem('attendance-records') || '{}');
            delete attendanceRecords[outingId];
            localStorage.setItem('attendance-records', JSON.stringify(attendanceRecords));

            const comments = JSON.parse(localStorage.getItem('attendance-comments') || '{}');
            delete comments[outingId];
            localStorage.setItem('attendance-comments', JSON.stringify(comments));

            updateAttendanceStatsFromCurrent();
            alert('ä Toutes les données d\'attendance ont été effacées !');
        }

        // Filtrer par équipe
        function filterByTeam() {
            const filter = document.getElementById('teamFilter').value;
            const rows = document.querySelectorAll('#participantsTable tbody tr');
            
            rows.forEach(row => {
                const teamType = row.querySelector('td:first-child small').textContent.includes('Vie') ? 'life' : 'night';
                if (filter === '' || teamType === filter) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        // Sauvegarder le registre d'attendance
        function saveAttendanceRecord() {
            const outingId = document.getElementById('selectedOuting').value;
            if (!outingId) return;

            const attendanceRecords = JSON.parse(localStorage.getItem('attendance-records') || '{}');
            const comments = JSON.parse(localStorage.getItem('attendance-comments') || '{}');
            
            const record = {
                outingId: outingId,
                timestamp: new Date().toISOString(),
                attendance: attendanceRecords[outingId] || {},
                comments: comments[outingId] || {}
            };

            // Sauvegarder dans l'historique
            const history = JSON.parse(localStorage.getItem('attendance-history') || '[]');
            const existingIndex = history.findIndex(h => h.outingId === outingId);
            
            if (existingIndex >= 0) {
                history[existingIndex] = record;
            } else {
                history.push(record);
            }
            
            localStorage.setItem('attendance-history', JSON.stringify(history));
            
            alert(' Registre d\'appel sauvegardé avec succès !');
            loadAttendanceHistory();
        }

        // Exporter les données d'attendance
        function exportAttendanceData() {
            const attendanceHistory = JSON.parse(localStorage.getItem('attendance-history') || '[]');
            const outings = JSON.parse(localStorage.getItem('admin-outings') || '[]');
            
            if (attendanceHistory.length === 0) {
                alert('è Aucune donnée d\'attendance á exporter.');
                return;
            }

            let csvContent = "Sortie,Date,Participant,ëquipe,Présence,Commentaire\n";
            
            attendanceHistory.forEach(record => {
                const outing = outings.find(o => o.id === record.outingId);
                const outingName = outing ? outing.name : 'Sortie inconnue';
                const date = new Date(record.timestamp).toLocaleDateString('fr-FR');
                
                Object.entries(record.attendance).forEach(([participantId, status]) => {
                    const [teamType, teamName, participantName] = participantId.split('_');
                    const comment = record.comments[participantId] || '';
                    const statusText = status === 'present' ? 'Présent' : status === 'absent' ? 'Absent' : 'Justifié';
                    
                    csvContent += `"${outingName}","${date}","${participantName}","${teamName}","${statusText}","${comment}"\n`;
                });
            });

            // Télécharger le fichier CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `registre_appel_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('è Données exportées avec succès !');
        }

        // Créer un nouveau registre d'attendance
        function createNewAttendanceRecord() {
            const outings = JSON.parse(localStorage.getItem('admin-outings') || '[]');
            
            if (outings.length === 0) {
                alert('á️ Aucune sortie disponible. Créez d\'abord une sortie dans le panneau admin.');
                return;
            }

            // Créer un modal pour sélectionner la sortie
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.5); z-index: 1000; display: flex; 
                align-items: center; justify-content: center;
            `;
            
            modal.innerHTML = `
                <div class="fey-card" style="max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                    <div class="fey-card-header"> Créer un Nouveau Registre d'Appel</div>
                    <div style="padding: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">à Sélectionner la sortie :</label>
                        <select id="newOutingSelect" style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); margin-bottom: 1rem;">
                            <option value="">-- Choisir une sortie --</option>
                        </select>
                        <div style="text-align: center; margin-top: 1rem;">
                            <button class="fey-btn" onclick="createAttendanceForSelectedOuting()" style="background: #4CAF50; margin-right: 1rem;">
                                à Créer
                            </button>
                            <button class="fey-btn" onclick="closeAttendanceModal()" style="background: #F44336;">
                                î Annuler
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Remplir le sélecteur
            const select = modal.querySelector('#newOutingSelect');
            outings.forEach(outing => {
                const option = document.createElement('option');
                option.value = outing.id;
                option.textContent = `${outing.name} - ${new Date(outing.startDate).toLocaleDateString('fr-FR')}`;
                select.appendChild(option);
            });

            // Fonctions pour le modal
            window.createAttendanceForSelectedOuting = function() {
                const selectedOutingId = select.value;
                if (!selectedOutingId) {
                    alert('á️ Veuillez sélectionner une sortie.');
                    return;
                }

                // Sélectionner la sortie dans le sélecteur principal
                document.getElementById('selectedOuting').value = selectedOutingId;
                loadAttendanceForOuting();
                closeAttendanceModal();
            };

            window.closeAttendanceModal = function() {
                document.body.removeChild(modal);
                delete window.createAttendanceForSelectedOuting;
                delete window.closeAttendanceModal;
            };
        }

        // Charger l'historique des registres
        function loadAttendanceHistory() {
            const history = JSON.parse(localStorage.getItem('attendance-history') || '[]');
            const outings = JSON.parse(localStorage.getItem('admin-outings') || '[]');
            const historyContainer = document.getElementById('attendanceHistory');
            
            if (history.length === 0) {
                historyContainer.innerHTML = `
                    <div class="fey-note" style="text-align: center; padding: 2rem;">
                        <strong> Aucun registre d'appel enregistré</strong><br>
                        <small>Les registres d'appel apparaîtront ici une fois sauvegardés.</small>
                    </div>
                `;
                return;
            }

            let html = '';
            history.forEach(record => {
                const outing = outings.find(o => o.id === record.outingId);
                const outingName = outing ? outing.name : 'Sortie inconnue';
                const date = new Date(record.timestamp).toLocaleDateString('fr-FR');
                const time = new Date(record.timestamp).toLocaleTimeString('fr-FR');
                
                const stats = {
                    present: 0,
                    absent: 0,
                    justified: 0,
                    total: Object.keys(record.attendance).length
                };
                
                Object.values(record.attendance).forEach(status => {
                    switch(status) {
                        case 'present': stats.present++; break;
                        case 'absent': stats.absent++; break;
                        case 'justified': stats.justified++; break;
                    }
                });

                html += `
                    <div class="fey-item" style="background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border-left: 4px solid #2196F3; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <h4 style="margin: 0; color: var(--c-marine-700);">à ${outingName}</h4>
                            <small style="color: #666;">${date} á ${time}</small>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;">
                            <div style="text-align: center; background: white; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--c-ink-900);">
                                <strong style="color: #4CAF50;">${stats.present}</strong><br>
                                <small>à Présents</small>
                            </div>
                            <div style="text-align: center; background: white; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--c-ink-900);">
                                <strong style="color: #F44336;">${stats.absent}</strong><br>
                                <small>î Absents</small>
                            </div>
                            <div style="text-align: center; background: white; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--c-ink-900);">
                                <strong style="color: #FF9800;">${stats.justified}</strong><br>
                                <small> Justifiés</small>
                            </div>
                            <div style="text-align: center; background: white; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--c-ink-900);">
                                <strong style="color: #2196F3;">${stats.total}</strong><br>
                                <small>æ Total</small>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <button class="fey-btn" onclick="viewAttendanceRecord('${record.outingId}')" style="background: #2196F3; font-size: 0.9rem; padding: 0.5rem 1rem; margin-right: 0.5rem;">
                                æ️ Consulter
                            </button>
                            <button class="fey-btn" onclick="deleteAttendanceRecord('${record.outingId}')" style="background: #F44336; font-size: 0.9rem; padding: 0.5rem 1rem;">
                                æ️ Supprimer
                            </button>
                        </div>
                    </div>
                `;
            });

            historyContainer.innerHTML = html;
        }

        // Consulter un registre d'attendance
        function viewAttendanceRecord(outingId) {
            document.getElementById('selectedOuting').value = outingId;
            loadAttendanceForOuting();
            showPage('registre');
        }

        // Supprimer un registre d'attendance
        function deleteAttendanceRecord(outingId) {
            if (!confirm('á️ ètes-vous s╗r de vouloir supprimer ce registre d\'appel ? Cette action est irréversible.')) {
                return;
            }

            const history = JSON.parse(localStorage.getItem('attendance-history') || '[]');
            const updatedHistory = history.filter(record => record.outingId !== outingId);
            localStorage.setItem('attendance-history', JSON.stringify(updatedHistory));
            
            // Supprimer aussi les données actuelles
            const attendanceRecords = JSON.parse(localStorage.getItem('attendance-records') || '{}');
            delete attendanceRecords[outingId];
            localStorage.setItem('attendance-records', JSON.stringify(attendanceRecords));
            
            const comments = JSON.parse(localStorage.getItem('attendance-comments') || '{}');
            delete comments[outingId];
            localStorage.setItem('attendance-comments', JSON.stringify(comments));
            
            loadAttendanceHistory();
            alert('æ️ Registre d\'appel supprimé avec succès !');
        }

        // Imprimer le registre d'attendance
        function printAttendanceRecord() {
            const outingId = document.getElementById('selectedOuting').value;
            if (!outingId) return;

            const outings = JSON.parse(localStorage.getItem('admin-outings') || '[]');
            const outing = outings.find(o => o.id === outingId);
            const attendanceRecords = JSON.parse(localStorage.getItem('attendance-records') || '{}');
            const comments = JSON.parse(localStorage.getItem('attendance-comments') || '{}');
            
            const currentAttendance = attendanceRecords[outingId] || {};
            const currentComments = comments[outingId] || {};

            if (!outing) {
                alert('á️ Sortie non trouvée.');
                return;
            }

            // Créer une fenêtre d'impression
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Registre d'Appel - ${outing.name}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                            .outing-info { margin-bottom: 30px; }
                            .info-row { margin-bottom: 10px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
                            th { background-color: #f0f0f0; font-weight: bold; }
                            .stats { display: flex; justify-content: space-around; margin-top: 30px; }
                            .stat-box { text-align: center; padding: 10px; border: 1px solid #333; }
                            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>ï REGISTRE D'APPEL</h1>
                            <h2>${outing.name}</h2>
                        </div>
                        
                        <div class="outing-info">
                            <div class="info-row"><strong>Date :</strong> ${new Date(outing.startDate).toLocaleDateString('fr-FR')}</div>
                            <div class="info-row"><strong>Lieu :</strong> ${outing.location || 'Non spécifié'}</div>
                            <div class="info-row"><strong>Heure de départ :</strong> ${outing.departureTime || 'Non spécifié'}</div>
                            <div class="info-row"><strong>Description :</strong> ${outing.description || 'Aucune description'}</div>
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Participant</th>
                                    <th>ëquipe</th>
                                    <th>Présent</th>
                                    <th>Absent</th>
                                    <th>Justifié</th>
                                    <th>Commentaire</th>
                                    <th>Signature</th>
                                </tr>
                            </thead>
                            <tbody>
            `);

            // Ajouter les participants
            const lifeTeams = JSON.parse(localStorage.getItem('life-teams') || '[]');
            const nightTeams = JSON.parse(localStorage.getItem('night-teams') || '[]');
            
            [...lifeTeams, ...nightTeams].forEach(team => {
                team.members.forEach(member => {
                    const participantId = `${team.name.includes('Vie') ? 'life' : 'night'}_${team.name}_${member}`;
                    const attendance = currentAttendance[participantId] || 'unknown';
                    const comment = currentComments[participantId] || '';
                    
                    printWindow.document.write(`
                        <tr>
                            <td>${member}</td>
                            <td>${team.name}</td>
                            <td>${attendance === 'present' ? '' : ''}</td>
                            <td>${attendance === 'absent' ? '' : ''}</td>
                            <td>${attendance === 'justified' ? '' : ''}</td>
                            <td>${comment}</td>
                            <td></td>
                        </tr>
                    `);
                });
            });

            // Calculer les statistiques
            const stats = { present: 0, absent: 0, justified: 0, total: 0 };
            Object.values(currentAttendance).forEach(status => {
                stats.total++;
                switch(status) {
                    case 'present': stats.present++; break;
                    case 'absent': stats.absent++; break;
                    case 'justified': stats.justified++; break;
                }
            });

            printWindow.document.write(`
                            </tbody>
                        </table>
                        
                        <div class="stats">
                            <div class="stat-box">
                                <strong>${stats.present}</strong><br>
                                Présents
                            </div>
                            <div class="stat-box">
                                <strong>${stats.absent}</strong><br>
                                Absents
                            </div>
                            <div class="stat-box">
                                <strong>${stats.justified}</strong><br>
                                Justifiés
                            </div>
                            <div class="stat-box">
                                <strong>${stats.total}</strong><br>
                                Total
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>Registre généré le ${new Date().toLocaleDateString('fr-FR')} á ${new Date().toLocaleTimeString('fr-FR')}</p>
                        </div>
                    </body>
                </html>
            `);
            
            printWindow.document.close();
            printWindow.print();
        }

        // Activer l'onglet registre d'appel pour les admins
        function enableRegistreTab() {
            const registreTab = document.getElementById('registreTab');
            if (registreTab) {
                registreTab.style.display = 'inline-block';
            }
        }

        // Fonction enableAdminMode complète
        function enableAdminMode() {
            // Utiliser notre nouveau système d'onglets admin
            if (typeof showAdminTabs === 'function') {
                showAdminTabs();
            }
            
            // Activer aussi le registre d'appel
            if (typeof enableRegistreTab === 'function') {
                enableRegistreTab();
            }
            
            // Charger les éléments de la checklist
            setTimeout(() => {
                if (typeof loadChecklistItems === 'function') {
                    loadChecklistItems();
                }
                if (typeof loadCalendarTrips === 'function') {
                    loadCalendarTrips();
                }
            }, 100);
        }

        // Fonction pour charger les sorties du calendrier dans l'admin
        function loadCalendarTrips() {
            const calendarTripsList = document.getElementById('calendar-trips-list');
            if (!calendarTripsList) return;

            const events = getCalendarEvents();
            const trips = [];

            // Parcourir TOUS les événements du calendrier (pas de filtre)
            Object.entries(events).forEach(([dateKey, event]) => {
                const tripDate = new Date(dateKey.split('-').reverse().join('-'));
                const formattedDate = tripDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

                trips.push({
                    id: dateKey.replace(/-/g, '_'),
                    title: event.title,
                    date: formattedDate,
                    description: event.description || '',
                    rawDate: dateKey
                });
            });

            // Trier les sorties par date
            trips.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

            // Charger les sélections sauvegardées (seulement pour le covoiturage)
            const savedCarpoolSelections = JSON.parse(localStorage.getItem('carpool-selections') || '{}');

            // Créer l'interface
            let html = '';
            trips.forEach(trip => {
                const hasCarpool = savedCarpoolSelections[trip.id] || false;
                html += `
                    <div class="fey-item" style="background: linear-gradient(135deg, #E8F5E8, #C8E6C9); border-left: 4px solid #4CAF50; margin-bottom: 1rem;">
                        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; align-items: center;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Sortie</label>
                                <div style="font-weight: bold; color: var(--c-forest-700);">${trip.title}</div>
                                <div style="font-size: 0.9rem; color: var(--c-forest-600);">${trip.date}</div>
                                ${trip.description ? `<div style="font-size: 0.8rem; color: var(--c-ink-600); margin-top: 0.25rem;">${trip.description}</div>` : ''}
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">ï Registre d'Appel</label>
                                <div style="font-size: 0.9rem; color: var(--c-forest-700); font-weight: bold;">
                                    à Automatique
                                </div>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Covoiturage</label>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <input type="checkbox" id="carpool-${trip.id}" ${hasCarpool ? 'checked' : ''} onchange="updateCarpoolSelection('${trip.id}', this.checked)">
                                    <label for="carpool-${trip.id}" style="font-size: 0.9rem;">Activer le covoiturage</label>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            calendarTripsList.innerHTML = html;
            console.log(`à ${trips.length} sorties chargées dans l'admin`);
            
            // Charger aussi les sorties avec covoiturage dans la section dédiée
            loadCarpoolTripsInAdmin();
        }

        // Fonction pour charger les sorties avec covoiturage dans la section admin
        function loadCarpoolTripsInAdmin() {
            console.log('ä Chargement des sorties covoiturage dans l\'admin...');
            
            const tripsManagement = document.getElementById('trips-management');
            if (!tripsManagement) return;
            
            // Récupérer les sélections de covoiturage sauvegardées
            const savedCarpoolSelections = JSON.parse(localStorage.getItem('carpool-selections') || '{}');
            const events = getCalendarEvents();
            
            // Filtrer les sorties qui ont le covoiturage activé
            const carpoolTrips = [];
            Object.entries(events).forEach(([dateKey, event]) => {
                const tripId = dateKey.replace(/-/g, '_');
                if (savedCarpoolSelections[tripId]) {
                    const tripDate = new Date(dateKey.split('-').reverse().join('-'));
                    const formattedDate = tripDate.toISOString().split('T')[0]; // Format YYYY-MM-DD pour input date
                    
                    carpoolTrips.push({
                        id: tripId,
                        title: event.title,
                        date: formattedDate,
                        description: event.description || '',
                        rawDate: dateKey
                    });
                }
            });
            
            // Trier par date
            carpoolTrips.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
            
            console.log(` ${carpoolTrips.length} sorties avec covoiturage trouvées pour l'admin`);
            
            // Charger les données sauvegardées
            const carpoolTripsData = JSON.parse(localStorage.getItem('carpool-trips-data') || '{}');
            
            // Créer l'interface pour chaque sortie avec covoiturage
            let html = '';
            if (carpoolTrips.length === 0) {
                html = `
                    <div class="fey-note" style="background: linear-gradient(135deg, #FFF3E0, #FFE0B2); border-left: 4px solid #FF9800;">
                        <strong> Aucune sortie avec covoiturage :</strong> Activez le covoiturage pour des sorties dans la section ci-dessus.
                    </div>
                `;
            } else {
                carpoolTrips.forEach(trip => {
                    // Récupérer les données sauvegardées pour cette sortie
                    const savedData = carpoolTripsData[trip.id] || {};
                    const title = savedData.title || trip.title;
                    const date = savedData.date || trip.date;
                    const departureTime = savedData.departureTime || '08:00';
                    const returnTime = savedData.returnTime || '17:00';
                    
                    html += `
                        <div class="fey-item" style="background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border-left: 4px solid #2196F3; margin-bottom: 1rem;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: center;">
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Nom de la Sortie</label>
                                    <input type="text" value="${title}" style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);" data-trip-id="${trip.id}" disabled>
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">à Date</label>
                                    <input type="date" value="${date}" style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);" data-trip-id="${trip.id}" disabled>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">ì Point de Départ (FIXë)</label>
                                    <input type="text" value="Place de la Mairie" readonly style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); background: #f5f5f5;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">ì Point d'Arrivée (FIXë)</label>
                                    <input type="text" value="Jambville" readonly style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); background: #f5f5f5;">
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Heure Départ</label>
                                    <input type="time" value="${departureTime}" style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);" data-trip-id="${trip.id}" disabled>
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Heure Retour</label>
                                    <input type="time" value="${returnTime}" style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);" data-trip-id="${trip.id}" disabled>
                                </div>
                            </div>
                            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                                <button class="fey-btn" onclick="saveCarpoolTrip('${trip.id}')" style="background: #4CAF50; font-size: 0.9rem; padding: 0.5rem 1rem;"> Sauvegarder</button>
                                <button class="fey-btn" onclick="editCarpoolTrip('${trip.id}')" style="background: #FF9800; font-size: 0.9rem; padding: 0.5rem 1rem;">️ Modifier</button>
                                <button class="fey-btn" onclick="removeCarpoolTrip('${trip.id}')" style="background: #F44336; font-size: 0.9rem; padding: 0.5rem 1rem;">æ️ Supprimer</button>
                            </div>
                        </div>
                    `;
                });
            }
            
            tripsManagement.innerHTML = html;
            
            // Ajouter un bouton de rechargement si il y a des sorties
            if (carpoolTrips.length > 0) {
                const refreshButton = `
                    <div style="margin-top: 1rem; text-align: center;">
                        <button onclick="loadCarpoolTripsInAdmin()" class="fey-btn" style="background: #2196F3;">
                            ä Recharger les sorties covoiturage
                        </button>
                    </div>
                `;
                tripsManagement.insertAdjacentHTML('beforeend', refreshButton);
            }
        }

        // Fonction pour mettre á jour la sélection de covoiturage d'une sortie
        function updateCarpoolSelection(tripId, hasCarpool) {
            const savedCarpoolSelections = JSON.parse(localStorage.getItem('carpool-selections') || '{}');
            savedCarpoolSelections[tripId] = hasCarpool;
            localStorage.setItem('carpool-selections', JSON.stringify(savedCarpoolSelections));
            
            console.log(` Covoiturage ${hasCarpool ? 'activé' : 'désactivé'} pour ${tripId}`);
            
            // Recharger la section covoiturage si elle est visible
            const covoituragePage = document.getElementById('covoiturage');
            if (covoituragePage && covoituragePage.classList.contains('active')) {
                loadCarpoolTripsFromCalendar();
            }
            
            // Recharger la section admin des sorties covoiturage
            loadCarpoolTripsInAdmin();
        }

        // Fonction pour sauvegarder toutes les sélections
        function saveTripSelections() {
            const savedCarpoolSelections = JSON.parse(localStorage.getItem('carpool-selections') || '{}');
            const selectedCarpoolTrips = Object.keys(savedCarpoolSelections).filter(id => savedCarpoolSelections[id]);
            
            localStorage.setItem('carpool-selections', JSON.stringify(savedCarpoolSelections));
            alert(` ${selectedCarpoolTrips.length} sorties avec covoiturage sauvegardées !`);
            
            // Recharger la liste du registre d'appel
            loadTripsFromCalendar();
            
            // Recharger la section covoiturage si elle est visible
            const covoituragePage = document.getElementById('covoiturage');
            if (covoituragePage && covoituragePage.classList.contains('active')) {
                loadCarpoolTripsFromCalendar();
            }
            
            // Recharger la section admin des sorties covoiturage
            loadCarpoolTripsInAdmin();
        }

        // Fonctions pour gérer les sorties covoiturage dans l'admin
        function saveCarpoolTrip(tripId) {
            console.log(` Sauvegarde de la sortie covoiturage: ${tripId}`);
            // Récupérer les données du formulaire
            const tripContainer = document.querySelector(`[data-trip-id="${tripId}"]`).closest('.fey-item');
            const title = tripContainer.querySelector('input[type="text"]').value;
            const date = tripContainer.querySelector('input[type="date"]').value;
            const departureTime = tripContainer.querySelector('input[type="time"]').value;
            const returnTime = tripContainer.querySelectorAll('input[type="time"]')[1].value;
            
            // Sauvegarder dans le localStorage
            const carpoolTripsData = JSON.parse(localStorage.getItem('carpool-trips-data') || '{}');
            carpoolTripsData[tripId] = {
                title: title,
                date: date,
                departureTime: departureTime,
                returnTime: returnTime,
                departurePoint: 'Place de la Mairie',
                arrivalPoint: 'Jambville'
            };
            localStorage.setItem('carpool-trips-data', JSON.stringify(carpoolTripsData));
            
            alert(`à Sortie "${title}" sauvegardée avec succès !`);
        }

        function editCarpoolTrip(tripId) {
            console.log(`️ Modification de la sortie covoiturage: ${tripId}`);
            const tripContainer = document.querySelector(`[data-trip-id="${tripId}"]`).closest('.fey-item');
            const inputs = tripContainer.querySelectorAll('input:not([readonly])');
            
            // Activer l'édition
            inputs.forEach(input => {
                input.disabled = false;
                input.style.background = '#fff';
            });
            
            // Changer le bouton en "Confirmer"
            const editBtn = tripContainer.querySelector(`button[onclick="editCarpoolTrip('${tripId}')"]`);
            editBtn.innerHTML = 'à Confirmer';
            editBtn.onclick = () => confirmCarpoolTripEdit(tripId);
        }

        function confirmCarpoolTripEdit(tripId) {
            console.log(`à Confirmation de l'édition: ${tripId}`);
            const tripContainer = document.querySelector(`[data-trip-id="${tripId}"]`).closest('.fey-item');
            const inputs = tripContainer.querySelectorAll('input:not([readonly])');
            
            // Désactiver l'édition
            inputs.forEach(input => {
                input.disabled = true;
                input.style.background = '#f5f5f5';
            });
            
            // Remettre le bouton en "Modifier"
            const editBtn = tripContainer.querySelector(`button[onclick="confirmCarpoolTripEdit('${tripId}')"]`);
            editBtn.innerHTML = '️ Modifier';
            editBtn.onclick = () => editCarpoolTrip(tripId);
            
            // Sauvegarder automatiquement
            saveCarpoolTrip(tripId);
        }

        function removeCarpoolTrip(tripId) {
            if (confirm(`æ️ ètes-vous s╗r de vouloir supprimer cette sortie covoiturage ?`)) {
                console.log(`æ️ Suppression de la sortie covoiturage: ${tripId}`);
                
                // Désactiver le covoiturage pour cette sortie
                const savedCarpoolSelections = JSON.parse(localStorage.getItem('carpool-selections') || '{}');
                savedCarpoolSelections[tripId] = false;
                localStorage.setItem('carpool-selections', JSON.stringify(savedCarpoolSelections));
                
                // Supprimer les données de covoiturage
                const carpoolTripsData = JSON.parse(localStorage.getItem('carpool-trips-data') || '{}');
                delete carpoolTripsData[tripId];
                localStorage.setItem('carpool-trips-data', JSON.stringify(carpoolTripsData));
                
                // Recharger les sections
                loadCarpoolTripsInAdmin();
                loadCalendarTrips();
                
                alert(`à Sortie covoiturage supprimée ! Le covoiturage a été désactivé pour cette sortie.`);
            }
        }

        // Fonction pour charger les sorties avec covoiturage depuis le calendrier
        function loadCarpoolTripsFromCalendar() {
            console.log('ä Chargement des sorties avec covoiturage...');
            
            // Récupérer les sélections de covoiturage sauvegardées
            const savedCarpoolSelections = JSON.parse(localStorage.getItem('carpool-selections') || '{}');
            const events = getCalendarEvents();
            
            // Filtrer les sorties qui ont le covoiturage activé
            const carpoolTrips = [];
            Object.entries(events).forEach(([dateKey, event]) => {
                const tripId = dateKey.replace(/-/g, '_');
                if (savedCarpoolSelections[tripId]) {
                    const tripDate = new Date(dateKey.split('-').reverse().join('-'));
                    const formattedDate = tripDate.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    
                    carpoolTrips.push({
                        id: tripId,
                        title: event.title,
                        date: formattedDate,
                        description: event.description || '',
                        rawDate: dateKey
                    });
                }
            });
            
            // Trier par date
            carpoolTrips.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
            
            console.log(` ${carpoolTrips.length} sorties avec covoiturage trouvées`);
            
            // Mettre á jour l'interface covoiturage
            updateCarpoolInterface(carpoolTrips);
        }

        // Fonction pour mettre á jour l'interface covoiturage
        function updateCarpoolInterface(carpoolTrips) {
            // Trouver le conteneur des sorties covoiturage
            const carpoolContainer = document.querySelector('#covoiturage .fey-card:first-of-type');
            if (!carpoolContainer) return;
            
            // Nettoyer le contenu existant (garder seulement le header)
            const header = carpoolContainer.querySelector('.fey-card-header');
            if (header) {
                // Supprimer tous les éléments après le header
                let nextElement = header.nextElementSibling;
                while (nextElement) {
                    const toRemove = nextElement;
                    nextElement = nextElement.nextElementSibling;
                    toRemove.remove();
                }
            }
            
            // Créer la liste des sorties avec covoiturage
            let html = '';
            if (carpoolTrips.length === 0) {
                html = `
                    <div class="fey-note" style="background: linear-gradient(135deg, #FFF3E0, #FFE0B2); border-left: 4px solid #FF9800;">
                        <strong> Aucune sortie avec covoiturage :</strong> Activez le covoiturage pour des sorties dans la section Admin.
                    </div>
                `;
            } else {
                html = `
                    <div class="fey-note" style="background: linear-gradient(135deg, #E8F5E8, #C8E6C9); border-left: 4px solid #4CAF50;">
                        <strong> Sorties avec covoiturage activé :</strong> ${carpoolTrips.length} sortie(s) nécessitant du covoiturage.
                    </div>
                `;
                
                carpoolTrips.forEach(trip => {
                    html += `
                        <div class="fey-item" style="background: linear-gradient(135deg, #E3F2FD, #BBDEFB); border-left: 4px solid #2196F3; margin-bottom: 1rem;">
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; align-items: center;">
                                <div>
                                    <div style="font-weight: bold; color: var(--c-forest-700); font-size: 1.1rem;">${trip.title}</div>
                                    <div style="font-size: 0.9rem; color: var(--c-forest-600); margin-top: 0.25rem;">${trip.date}</div>
                                    ${trip.description ? `<div style="font-size: 0.8rem; color: var(--c-ink-600); margin-top: 0.25rem;">${trip.description}</div>` : ''}
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 0.9rem; color: var(--c-forest-700); font-weight: bold; margin-bottom: 0.5rem;"> Covoiturage</div>
                                    <div style="background: #4CAF50; color: white; padding: 0.5rem; border-radius: var(--r-sm); font-weight: bold;">
                                        à Activé
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            
            // Ajouter le contenu après le header
            if (header) {
                header.insertAdjacentHTML('afterend', html);
                
                // Ajouter un bouton de rechargement
                const refreshButton = `
                    <div style="margin-top: 1rem; text-align: center;">
                        <button onclick="loadCarpoolTripsFromCalendar()" class="fey-btn" style="background: #2196F3; margin-right: 1rem;">
                            ä Recharger les sorties
                        </button>
                        <button onclick="showPage('admin')" class="fey-btn" style="background: #9C27B0;">
                            ️ Gérer les sorties
                        </button>
                    </div>
                `;
                header.insertAdjacentHTML('afterend', refreshButton);
            }
        }

        // Fonction pour charger les éléments de la checklist
        function loadChecklistItems() {
            const container = document.getElementById('checklistItemsList');
            if (!container) return;

            const items = JSON.parse(localStorage.getItem('checklist-items') || '[]');
            
            if (items.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666;">Aucun élément personnalisé ajouté</p>';
                return;
            }

            let html = '<h4 style="color: var(--c-forest-700); margin-bottom: 1rem;">ï ëléments Personnalisés</h4>';
            
            items.forEach(item => {
                html += `
                    <div style="display: flex; align-items: center; gap: 1rem; padding: 0.5rem; border: 1px solid var(--c-ink-900); border-radius: var(--r-sm); margin-bottom: 0.5rem; background: ${item.isOptional ? 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' : 'linear-gradient(135deg, #E8F5E8, #C8E6C9)'};">
                        <div style="flex: 1;">
                            <div style="font-weight: bold;">${item.text}</div>
                            <div style="font-size: 0.9rem; color: #666;">
                                é ${item.category} ${item.isOptional ? ' (Facultatif)' : 'í (Obligatoire)'}
                            </div>
                            ${item.tooltip ? `<div style="font-size: 0.8rem; color: #888; font-style: italic;">í ${item.tooltip}</div>` : ''}
                        </div>
                        <button class="fey-btn" onclick="deleteChecklistItem(${item.id})" style="background: #F44336; font-size: 0.8rem; padding: 0.25rem 0.5rem;">
                            æ️
                        </button>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }

        // Fonction pour afficher le modal d'ajout d'élément
        function showAddItemModal() {
            const modal = document.createElement('div');
            modal.id = 'addItemModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: var(--c-parchment);
                    border-radius: var(--r-md);
                    padding: 2rem;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    border: 3px solid var(--c-ink-900);
                ">
                    <div class="fey-card-header"> Ajouter un ëlément á la Liste</div>
                    <form id="addItemForm" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Texte de l'élément</label>
                            <input type="text" name="itemText" placeholder="Ex: T-shirt de rechange" required style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">é Catégorie</label>
                            <select name="category" required style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                                <option value="sac-couchage"> Sac et couchage</option>
                                <option value="vêtements">æ Vêtements</option>
                                <option value="chaussures">æ Chaussures</option>
                                <option value="hygiène"> Hygiène</option>
                                <option value="matériel">á️ Matériel</option>
                                <option value="documents">ä Documents</option>
                                <option value="nourriture">ì Nourriture</option>
                                <option value="autre"> Autre</option>
                            </select>
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Lien exemple (optionnel)</label>
                            <input type="url" name="exampleLink" placeholder="https://exemple.com" style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">í Info-bulle (optionnel)</label>
                            <textarea name="tooltip" placeholder="Conseil ou information supplémentaire..." style="width: 100%; padding: 0.75rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); height: 60px; resize: vertical;"></textarea>
                        </div>

                        <div style="background: linear-gradient(135deg, #E3F2FD, #BBDEFB); padding: 1rem; border-radius: var(--r-sm); border: 2px solid var(--c-ink-900);">
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: bold; cursor: pointer;">
                                <input type="checkbox" name="isOptional" style="transform: scale(1.2);">
                                 ëlément facultatif
                            </label>
                            <small style="color: #666; margin-top: 0.5rem; display: block;">
                                Si coché, l'élément sera marqué comme facultatif dans la liste
                            </small>
                        </div>

                        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                            <button type="submit" class="fey-btn" style="background: #4CAF50; padding: 0.75rem 1.5rem;">
                                à Ajouter l'ëlément
                            </button>
                            <button type="button" onclick="closeAddItemModal()" class="fey-btn" style="background: #F44336; padding: 0.75rem 1.5rem;">
                                î Annuler
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            // Gérer la soumission du formulaire
            document.getElementById('addItemForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const itemData = {
                    id: Date.now(),
                    text: formData.get('itemText'),
                    category: formData.get('category'),
                    exampleLink: formData.get('exampleLink'),
                    tooltip: formData.get('tooltip'),
                    isOptional: formData.get('isOptional') === 'on',
                    isChecked: false
                };

                // Sauvegarder l'élément
                const existingItems = JSON.parse(localStorage.getItem('checklist-items') || '[]');
                existingItems.push(itemData);
                localStorage.setItem('checklist-items', JSON.stringify(existingItems));

                alert('à ëlément ajouté avec succès !');
                closeAddItemModal();
                loadChecklistItems();
            });
        }

        // Fonction pour fermer le modal d'ajout
        function closeAddItemModal() {
            const modal = document.getElementById('addItemModal');
            if (modal) {
                modal.remove();
            }
        }

        // Fonction pour afficher le modal de modification des éléments
        function showEditItemsModal() {
            const modal = document.createElement('div');
            modal.id = 'editItemsModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: var(--c-parchment);
                    border-radius: var(--r-md);
                    padding: 2rem;
                    max-width: 800px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    border: 3px solid var(--c-ink-900);
                ">
                    <div class="fey-card-header">️ Modifier les ëléments de la Liste</div>
                    <div id="editItemsList" style="max-height: 400px; overflow-y: auto; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 1rem; background: white; margin-bottom: 1rem;">
                        <!-- Les éléments seront chargés ici -->
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="fey-btn" onclick="saveChecklistItems()" style="background: #4CAF50; padding: 0.75rem 1.5rem;">
                             Sauvegarder les Modifications
                        </button>
                        <button class="fey-btn" onclick="closeEditItemsModal()" style="background: #F44336; padding: 0.75rem 1.5rem;">
                            î Fermer
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            loadEditItemsList();
        }

        // Fonction pour fermer le modal de modification
        function closeEditItemsModal() {
            const modal = document.getElementById('editItemsModal');
            if (modal) {
                modal.remove();
            }
        }

        // Fonction pour supprimer un élément
        function deleteChecklistItem(itemId) {
            if (confirm('ètes-vous s╗r de vouloir supprimer cet élément ?')) {
                const items = JSON.parse(localStorage.getItem('checklist-items') || '[]');
                const updatedItems = items.filter(item => item.id !== itemId);
                localStorage.setItem('checklist-items', JSON.stringify(updatedItems));
                loadChecklistItems();
                alert('à ëlément supprimé !');
            }
        }

        // Fonction pour réinitialiser la liste
        function resetChecklistItems() {
            if (confirm('ètes-vous s╗r de vouloir réinitialiser tous les éléments personnalisés ? Cette action est irréversible.')) {
                localStorage.removeItem('checklist-items');
                loadChecklistItems();
                alert('à Liste réinitialisée !');
            }
        }

        // Charger l'historique au démarrage
        document.addEventListener('DOMContentLoaded', function() {
            if (document.getElementById('attendanceHistory')) {
                loadAttendanceHistory();
            }
            // Charger les informations de contact
            loadContactInfo();
        });

        // ===============================
        // FONCTIONS GESTION DES CONTACTS
        // ===============================

        // Charger les informations de contact depuis le localStorage
        function loadContactInfo() {
            const contactInfo = JSON.parse(localStorage.getItem('contact-info') || '{}');
            
            // Charger les informations générales
            if (contactInfo.campLocation) document.getElementById('campLocation').value = contactInfo.campLocation;
            if (contactInfo.driveLink) document.getElementById('driveLink').value = contactInfo.driveLink;

            // Charger les contacts
            const contacts = contactInfo.contacts || [
                { id: 1, name: 'Marie Dupont', phone: '06.12.34.56.78', email: 'marie.dupont@email.com', role: 'Responsable' },
                { id: 2, name: 'Jean Martin', phone: '06.98.76.54.32', email: 'jean.martin@email.com', role: 'Urgence' }
            ];
            
            loadContactsManagement(contacts);
            updateInfoPage(contactInfo, contacts);
        }

        // Charger la gestion des contacts dans le panneau admin
        function loadContactsManagement(contacts) {
            const container = document.getElementById('contacts-management');
            
            if (!container) return;
            
            container.innerHTML = '';
            
            contacts.forEach(contact => {
                const contactDiv = document.createElement('div');
                contactDiv.className = 'fey-item';
                contactDiv.style.cssText = 'background: linear-gradient(135deg, #E8F5E8, #C8E6C9); border-left: 4px solid #4CAF50; margin-bottom: 1rem;';
                contactDiv.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1rem; align-items: center;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">æ Nom du Responsable</label>
                            <input type="text" value="${contact.name}" data-field="name" style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Téléphone</label>
                            <input type="tel" value="${contact.phone}" data-field="phone" style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Email <span style="color: #666; font-size: 0.8rem;">(optionnel)</span></label>
                            <input type="email" value="${contact.email || ''}" data-field="email" placeholder="email@exemple.com" style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;"> Rle <span style="color: #666; font-size: 0.8rem;">(optionnel)</span></label>
                            <input type="text" value="${contact.role || ''}" data-field="role" placeholder="ex: Responsable, Urgence, Transport..." style="width: 100%; padding: 0.5rem; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm);">
                        </div>
                    </div>
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="fey-btn" onclick="saveContact(${contact.id})" style="background: #4CAF50; font-size: 0.9rem; padding: 0.5rem 1rem;"> Sauvegarder</button>
                        <button class="fey-btn" onclick="deleteContact(${contact.id})" style="background: #F44336; font-size: 0.9rem; padding: 0.5rem 1rem;">æ️ Supprimer</button>
                    </div>
                `;
                container.appendChild(contactDiv);
            });
        }

        // Mettre á jour la page Infos avec les données
        function updateInfoPage(contactInfo, contacts) {
            // Mettre á jour les informations générales
            if (contactInfo.campLocation) document.getElementById('info-camp-location').textContent = contactInfo.campLocation;

            // Mettre á jour la liste des contacts
            const contactsContainer = document.getElementById('info-contacts-list');
            if (contactsContainer) {
                contactsContainer.innerHTML = '';
                contacts.forEach(contact => {
                    const contactDiv = document.createElement('div');
                    contactDiv.style.cssText = 'margin-bottom: 0.5rem; padding: 0.5rem; background: #f8f9fa; border-radius: 4px;';
                    contactDiv.innerHTML = `
                        <p><strong>${contact.role ? contact.role + ' :' : ''}</strong> ${contact.name}</p>
                        <p><strong>Téléphone :</strong> ${contact.phone}</p>
                        ${contact.email ? `<p><strong>Email :</strong> ${contact.email}</p>` : ''}
                    `;
                    contactsContainer.appendChild(contactDiv);
                });
            }
        }

        // Sauvegarder toutes les informations de contact
        function saveContactInfo() {
            const contactInfo = {
                campLocation: document.getElementById('campLocation').value,
                driveLink: document.getElementById('driveLink').value,
                contacts: getContactsFromForm()
            };

            localStorage.setItem('contact-info', JSON.stringify(contactInfo));
            
            // Mettre á jour la page Infos
            updateInfoPage(contactInfo, contactInfo.contacts);
            
            alert(' Informations de contact sauvegardées avec succès !');
        }

        // Récupérer les contacts depuis le formulaire
        function getContactsFromForm() {
            const contacts = [];
            const contactElements = document.querySelectorAll('#contacts-management .fey-item');
            
            contactElements.forEach((element, index) => {
                const inputs = element.querySelectorAll('input, select');
                const contact = {
                    id: index + 1,
                    name: inputs[0].value,
                    phone: inputs[1].value,
                    email: inputs[2].value,
                    role: inputs[3].value
                };
                contacts.push(contact);
            });
            
            return contacts;
        }

        // Sauvegarder un contact individuel
        function saveContact(contactId) {
            const contactElement = document.querySelector(`button[onclick="saveContact(${contactId})"]`).closest('.fey-item');
            const inputs = contactElement.querySelectorAll('input');
            
            const contact = {
                id: contactId,
                name: inputs[0].value,
                phone: inputs[1].value,
                email: inputs[2].value || '', // Champ optionnel
                role: inputs[3].value || '' // Champ optionnel
            };

            const contactInfo = JSON.parse(localStorage.getItem('contact-info') || '{}');
            const contacts = contactInfo.contacts || [];
            const existingIndex = contacts.findIndex(c => c.id === contactId);
            
            if (existingIndex >= 0) {
                contacts[existingIndex] = contact;
            } else {
                contacts.push(contact);
            }
            
            contactInfo.contacts = contacts;
            localStorage.setItem('contact-info', JSON.stringify(contactInfo));
            
            // Mettre á jour la page Infos
            updateInfoPage(contactInfo, contacts);
            
            alert(' Contact sauvegardé avec succès !');
        }

        // Ajouter un nouveau contact
        function addContact() {
            const contactInfo = JSON.parse(localStorage.getItem('contact-info') || '{}');
            const contacts = contactInfo.contacts || [];
            
            const newContact = {
                id: Math.max(...contacts.map(c => c.id), 0) + 1,
                name: 'Nouveau Contact',
                phone: '06.00.00.00.00',
                email: '', // Champ optionnel
                role: '' // Champ optionnel
            };
            
            contacts.push(newContact);
            contactInfo.contacts = contacts;
            localStorage.setItem('contact-info', JSON.stringify(contactInfo));
            
            loadContactsManagement(contacts);
            alert(' Nouveau contact ajouté !');
        }

        // Supprimer un contact
        function deleteContact(contactId) {
            if (!confirm('á️ ètes-vous s╗r de vouloir supprimer ce contact ?')) {
                return;
            }

            const contactInfo = JSON.parse(localStorage.getItem('contact-info') || '{}');
            const contacts = contactInfo.contacts || [];
            const updatedContacts = contacts.filter(c => c.id !== contactId);
            
            contactInfo.contacts = updatedContacts;
            localStorage.setItem('contact-info', JSON.stringify(contactInfo));
            
            loadContactsManagement(updatedContacts);
            updateInfoPage(contactInfo, updatedContacts);
            
            alert('æ️ Contact supprimé avec succès !');
        }

        // Réinitialiser les informations de contact
        function resetContactInfo() {
            if (!confirm('á️ ètes-vous s╗r de vouloir réinitialiser toutes les informations de contact ?')) {
                return;
            }

            localStorage.removeItem('contact-info');
            loadContactInfo();
            alert('ä Informations de contact réinitialisées !');
        }

        // Ouvrir le drive des documents
        function ouvrirDrive() {
            const contactInfo = JSON.parse(localStorage.getItem('contact-info') || '{}');
            const driveLink = contactInfo.driveLink || 'https://drive.google.com/drive/folders/1BiH607P0bDlCc7g8thPl5V-uZQ71qA_a';
            
            if (driveLink) {
                window.open(driveLink, '_blank');
            } else {
                alert('á️ Veuillez d\'abord configurer le lien du drive dans le panneau admin.');
            }
        }

        // Fonctions existantes (á conserver)
        function ouvrirMaps() {
            window.open('https://maps.google.com/?q=Jambville+78440', '_blank');
        }

        function ouvrirWhatsApp() {
            const contactInfo = JSON.parse(localStorage.getItem('contact-info') || '{}');
            const contacts = contactInfo.contacts || [];
            const responsable = contacts.find(c => c.role === 'Responsable');
            
            if (responsable && responsable.phone) {
                const phoneNumber = responsable.phone.replace(/[^0-9]/g, '');
                window.open(`https://wa.me/33${phoneNumber}`, '_blank');
            } else {
                alert('á️ Aucun numéro de responsable configuré. Veuillez configurer les contacts dans le panneau admin.');
            }
        }

        // === GESTION DES ëQUIPES ===
        
        // Charger et afficher les équipes de vie
        function loadVieTeams() {
            const container = document.getElementById('vieTeamsDisplay');
            if (!container) return;
            
            const vieTeams = getLifeTeams();
            let html = '';
            
            Object.values(vieTeams).forEach(team => {
                const rotation = Math.random() > 0.5 ? 'rotate(-1deg)' : 'rotate(1deg)';
                html += `
                    <div style="background: ${team.color}; color: white; padding: 1.5rem; border-radius: var(--r-md); border: 3px solid var(--c-ink-900); box-shadow: 4px 4px 0 var(--c-ink-900); transform: ${rotation};">
                        <h3 style="font-family: 'Patrick Hand', cursive; font-size: 1.5rem; margin-bottom: 1rem; border-bottom: 2px solid rgba(255, 255, 255, 0.3); padding-bottom: 0.5rem;">${team.name}</h3>
                        ${team.members.map(member => `<div style="padding: 0.5rem 0; font-size: 1rem;">• ${member}</div>`).join('')}
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }
        
        // Charger et afficher les équipes de nuit
        function loadNuitTeams() {
            const container = document.getElementById('nuitTeamsDisplay');
            if (!container) return;
            
            const nuitTeams = getNightTeams();
            let html = '';
            
            Object.values(nuitTeams).forEach(team => {
                html += `
                    <div style="background: ${team.color}; color: white; padding: 1rem; border-radius: var(--r-sm); border: 2px solid var(--c-ink-900); text-align: center;">
                        <h4 style="font-family: 'Patrick Hand', cursive; margin-bottom: 0.5rem;">${team.name}</h4>
                        <div style="font-size: 0.9rem; text-align: left; padding: 0.5rem;">
                            ${team.members.map(member => `• ${member}<br>`).join('')}
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }
        
        // Charger toutes les équipes
        function loadAllTeams() {
            loadVieTeams();
            loadNuitTeams();
        }
        
        // Mettre á jour l'éditeur d'équipes existant pour utiliser le système centralisé
        function updateTeamEditorWithCentralizedData() {
            // Cette fonction met á jour l'éditeur existant dans la page équipes
            const vieTeams = getLifeTeams();
            const nuitTeams = getNightTeams();
            
            // Mettre á jour les textareas existants si ils existent
            Object.entries(vieTeams).forEach(([teamId, team]) => {
                const textarea = document.getElementById(`team-${teamId}`);
                if (textarea) {
                    textarea.value = team.members.join('\n');
                }
            });
        }
        
        // Sauvegarder les changements d'équipes depuis l'éditeur existant
        function saveTeamChangesFromEditor() {
            const vieTeams = getLifeTeams();
            const updatedTeams = { ...vieTeams };
            
            // Lire les textareas existants
            Object.keys(vieTeams).forEach(teamId => {
                const textarea = document.getElementById(`team-${teamId}`);
                if (textarea) {
                    const members = textarea.value.split('\n').filter(m => m.trim() !== '');
                    updatedTeams[teamId].members = members;
                }
            });
            
            // Sauvegarder
            const teams = loadTeams();
            teams.vie = updatedTeams;
            saveTeams(teams);
            
            // Recharger l'affichage
            loadAllTeams();
            
            alert('à ëquipes sauvegardées !');
        }
        
        // Charger les équipes au démarrage de la page équipes
        document.addEventListener('DOMContentLoaded', function() {
            // Charger les équipes quand la page équipes est affichée
            const originalShowPage = window.showPage;
            window.showPage = function(pageId) {
                originalShowPage(pageId);

                // Charger les équipes si on affiche la page équipes
                if (pageId === 'equipes') {
                    setTimeout(() => {
                        loadAllTeams();
                        updateTeamEditorWithCentralizedData();
                        // Ajouter les boutons d'édition si admin connecté
                        addTeamEditingButtons();
                    }, 100);
                }
            };
        });

        // === GESTION ADMIN INFOS ===
        
        // Variables globales pour l'authentification
        let isAdminAuthenticated = false;        }        // Ajouter les boutons d'édition des équipes si admin connecté
        function addTeamEditingButtons() {
            const authStatus = localStorage.getItem('admin-authenticated');
            if (authStatus !== 'true') {
                removeTeamEditingButtons();
                return;
            }
            
            // Ajouter un bouton d'édition global des équipes
            const equipesHeader = document.querySelector('#equipes .fey-card-header');
            if (equipesHeader && !document.getElementById('editTeamsBtn')) {
                const editBtn = document.createElement('button');
                editBtn.id = 'editTeamsBtn';
                editBtn.innerHTML = '️ ëditer les ëquipes';
                editBtn.className = 'fey-btn';
                editBtn.style.cssText = 'background: #FF9800; margin-left: 1rem; font-size: 0.9rem;';
                editBtn.onclick = showTeamEditorModal;
                
                equipesHeader.style.display = 'flex';
                equipesHeader.style.justifyContent = 'space-between';
                equipesHeader.style.alignItems = 'center';
                equipesHeader.appendChild(editBtn);
            }
            
            // Ajouter des boutons d'édition sur chaque équipe
            const teamCards = document.querySelectorAll('#equipes [style*="background:"]');
            teamCards.forEach(card => {
                if (!card.querySelector('.team-edit-btn')) {
                    const editBtn = document.createElement('button');
                    editBtn.className = 'team-edit-btn';
                    editBtn.innerHTML = '️';
                    editBtn.style.cssText = 'position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 30px; height: 30px; font-size: 0.8rem; cursor: pointer; z-index: 10;';
                    editBtn.onclick = (e) => {
                        e.stopPropagation();
                        editTeamFromCard(card);
                    };
                    card.style.position = 'relative';
                    card.appendChild(editBtn);
                }
            });
        }
        
        // Supprimer les boutons d'édition des équipes
        function removeTeamEditingButtons() {
            const editBtn = document.getElementById('editTeamsBtn');
            if (editBtn) {
                editBtn.remove();
            }
            
            const teamEditBtns = document.querySelectorAll('.team-edit-btn');
            teamEditBtns.forEach(btn => btn.remove());
        }
        
        // Afficher le modal d'édition des équipes
        function showTeamEditorModal() {
            // Rediriger vers la page admin pour l'édition des équipes
            window.open('admin.html', '_blank');
        }
        
        // ëditer une équipe depuis sa carte
        function editTeamFromCard(card) {
            const teamName = card.querySelector('h5, h4, h3')?.textContent || 'ëquipe';
            const teamMembers = card.querySelector('small, p')?.textContent || '';
            
            const newName = prompt('Nom de l\'équipe:', teamName);
            if (newName === null) return;
            
            const newMembers = prompt('Membres (un par ligne):', teamMembers);
            if (newMembers === null) return;
            
            // Ici on pourrait implémenter la sauvegarde directe
            // Pour l'instant, on affiche un message
            alert('à ëquipe modifiée ! (Modification d\'urgence - Pour une édition complète, allez dans admin.html)');
        }
        
        // Charger les informations depuis localStorage
        function loadInfoData() {
            const data = JSON.parse(localStorage.getItem('scout-info-data') || '{}');
            
            // Données par défaut
            const defaultData = {
                nextOuting: {
                    title: 'Sortie en forêt',
                    date: '15 décembre 2024',
                    time: '09h00 - 17h00',
                    location: 'Forêt de Compiègne',
                    contact: 'Marie (06 12 34 56 78)'
                },
                meetingPlace: {
                    address: 'Local Scout, 123 Rue de la Paix, 60200 Compiègne',
                    time: '08h30',
                    contact: 'Jean (06 98 76 54 32)'
                },
                general: {
                    responsable: 'Marie Dubois',
                    phone: '06 12 34 56 78',
                    email: 'marie.dubois@scouts.fr',
                    hours: 'Samedi 09h-17h'
                }
            };

            const infoData = { ...defaultData, ...data };
            
            // Afficher les données
            document.getElementById('nextOutingTitle').textContent = infoData.nextOuting.title;
            document.getElementById('nextOutingDate').textContent = infoData.nextOuting.date;
            document.getElementById('nextOutingTime').textContent = infoData.nextOuting.time;
            document.getElementById('nextOutingLocation').textContent = infoData.nextOuting.location;
            document.getElementById('nextOutingContact').textContent = infoData.nextOuting.contact;

            document.getElementById('meetingPlaceAddress').textContent = infoData.meetingPlace.address;
            document.getElementById('meetingPlaceTime').textContent = infoData.meetingPlace.time;
            document.getElementById('meetingPlaceContact').textContent = infoData.meetingPlace.contact;

            document.getElementById('generalResponsable').textContent = infoData.general.responsable;
            document.getElementById('generalPhone').textContent = infoData.general.phone;
            document.getElementById('generalEmail').textContent = infoData.general.email;
            document.getElementById('generalHours').textContent = infoData.general.hours;
        }

        // === GESTION DES CONTACTS MULTIPLES ===
        
        // Charger les contacts
        function loadContacts() {
            const contacts = JSON.parse(localStorage.getItem('scout-contacts') || '[]');
            const container = document.getElementById('contactsList');
            
            if (contacts.length === 0) {
                // Contacts par défaut
                const defaultContacts = [
                    {
                        id: 1,
                        name: 'Marie Dubois',
                        role: 'Cheftaine principale',
                        phone: '06 12 34 56 78',
                        email: 'marie.dubois@scouts.fr',
                        period: 'Toute l\'année'
                    },
                    {
                        id: 2,
                        name: 'Jean Martin',
                        role: 'Assistant',
                        phone: '06 98 76 54 32',
                        email: 'jean.martin@scouts.fr',
                        period: 'Samedis'
                    }
                ];
                localStorage.setItem('scout-contacts', JSON.stringify(defaultContacts));
                displayContacts(defaultContacts);
            } else {
                displayContacts(contacts);
            }
        }
        
        // Afficher les contacts
        function displayContacts(contacts) {
            const container = document.getElementById('contactsList');
            
            if (contacts.length === 0) {
                container.innerHTML = '<p style="color: #666; text-align: center; font-style: italic;">Aucun contact configuré</p>';
                return;
            }
            
            const html = contacts.map(contact => `
                <div style="background: #f9f9f9; border: 2px solid var(--c-ink-900); border-radius: var(--r-sm); padding: 1rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 1rem;">
                        <div style="flex: 1;">
                            <h5 style="margin: 0 0 0.5rem 0; color: var(--c-orange-600);">${contact.name}</h5>
                            <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>Rle:</strong> ${contact.role}</p>
                            <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>Téléphone:</strong> ${contact.phone}</p>
                            <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>Email:</strong> ${contact.email}</p>
                            <p style="margin: 0.25rem 0; font-size: 0.9rem;"><strong>Période:</strong> ${contact.period}</p>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="editContact(${contact.id})" style="background: #2196F3; color: white; border: none; border-radius: 4px; padding: 0.5rem; font-size: 0.8rem; cursor: pointer;">️</button>
                            <button onclick="deleteContact(${contact.id})" style="background: #f44336; color: white; border: none; border-radius: 4px; padding: 0.5rem; font-size: 0.8rem; cursor: pointer;">æ️</button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = html;
        }
        
        // Ajouter un nouveau contact
        function addNewContact() {
            const name = prompt('Nom du contact:');
            if (!name) return;
            
            const role = prompt('Rle (ex: Cheftaine, Assistant, etc.):');
            if (!role) return;
            
            const phone = prompt('Téléphone:');
            if (!phone) return;
            
            const email = prompt('Email:');
            if (!email) return;
            
            const period = prompt('Période d\'activité (ex: Toute l\'année, Samedis, etc.):');
            if (!period) return;
            
            const contacts = JSON.parse(localStorage.getItem('scout-contacts') || '[]');
            const newContact = {
                id: Date.now(),
                name,
                role,
                phone,
                email,
                period
            };
            
            contacts.push(newContact);
            localStorage.setItem('scout-contacts', JSON.stringify(contacts));
            displayContacts(contacts);
        }
        
        // ëditer un contact
        function editContact(contactId) {
            const contacts = JSON.parse(localStorage.getItem('scout-contacts') || '[]');
            const contact = contacts.find(c => c.id === contactId);
            if (!contact) return;
            
            const name = prompt('Nom du contact:', contact.name);
            if (name === null) return;
            
            const role = prompt('Rle:', contact.role);
            if (role === null) return;
            
            const phone = prompt('Téléphone:', contact.phone);
            if (phone === null) return;
            
            const email = prompt('Email:', contact.email);
            if (email === null) return;
            
            const period = prompt('Période d\'activité:', contact.period);
            if (period === null) return;
            
            // Mettre á jour le contact
            contact.name = name;
            contact.role = role;
            contact.phone = phone;
            contact.email = email;
            contact.period = period;
            
            localStorage.setItem('scout-contacts', JSON.stringify(contacts));
            displayContacts(contacts);
        }
        
        // Supprimer un contact
        function deleteContact(contactId) {
            if (confirm('ètes-vous s╗r de vouloir supprimer ce contact ?')) {
                const contacts = JSON.parse(localStorage.getItem('scout-contacts') || '[]');
                const filtered = contacts.filter(c => c.id !== contactId);
                localStorage.setItem('scout-contacts', JSON.stringify(filtered));
                displayContacts(filtered);
            }
        }
        
        // ëditer la prochaine sortie
        function editNextOuting() {
            const currentData = JSON.parse(localStorage.getItem('scout-info-data') || '{}').nextOuting || {};
            
            const title = prompt('Titre de la sortie:', currentData.title || 'Sortie en forêt');
            if (title === null) return;
            
            const date = prompt('Date:', currentData.date || '15 décembre 2024');
            if (date === null) return;
            
            const time = prompt('Heures (ex: 09h00 - 17h00):', currentData.time || '09h00 - 17h00');
            if (time === null) return;
            
            const location = prompt('Lieu:', currentData.location || 'Forêt de Compiègne');
            if (location === null) return;
            
            const contact = prompt('Contact:', currentData.contact || 'Marie (06 12 34 56 78)');
            if (contact === null) return;

            // Mettre á jour les données
            const data = JSON.parse(localStorage.getItem('scout-info-data') || '{}');
            data.nextOuting = { title, date, time, location, contact };
            localStorage.setItem('scout-info-data', JSON.stringify(data));
            
            // Recharger l'affichage
            loadInfoData();
        }

        // ëditer le lieu de rendez-vous
        function editMeetingPlace() {
            const currentData = JSON.parse(localStorage.getItem('scout-info-data') || '{}').meetingPlace || {};
            
            const address = prompt('Adresse du lieu de rendez-vous:', currentData.address || 'Local Scout, 123 Rue de la Paix, 60200 Compiègne');
            if (address === null) return;
            
            const time = prompt('Heure habituelle:', currentData.time || '08h30');
            if (time === null) return;
            
            const contact = prompt('Contact local:', currentData.contact || 'Jean (06 98 76 54 32)');
            if (contact === null) return;

            // Mettre á jour les données
            const data = JSON.parse(localStorage.getItem('scout-info-data') || '{}');
            data.meetingPlace = { address, time, contact };
            localStorage.setItem('scout-info-data', JSON.stringify(data));
            
            // Recharger l'affichage
            loadInfoData();
        }

        // ëditer les informations générales
        function editGeneralInfo() {
            const currentData = JSON.parse(localStorage.getItem('scout-info-data') || '{}').general || {};
            
            const responsable = prompt('Responsable:', currentData.responsable || 'Marie Dubois');
            if (responsable === null) return;
            
            const phone = prompt('Téléphone:', currentData.phone || '06 12 34 56 78');
            if (phone === null) return;
            
            const email = prompt('Email:', currentData.email || 'marie.dubois@scouts.fr');
            if (email === null) return;
            
            const hours = prompt('Horaires habituels:', currentData.hours || 'Samedi 09h-17h');
            if (hours === null) return;

            // Mettre á jour les données
            const data = JSON.parse(localStorage.getItem('scout-info-data') || '{}');
            data.general = { responsable, phone, email, hours };
            localStorage.setItem('scout-info-data', JSON.stringify(data));
            
            // Recharger l'affichage
            loadInfoData();
        }

        // Sauvegarder toutes les informations
        function saveAllInfo() {
            alert('à Toutes les informations ont été sauvegardées automatiquement !');
        }

        // Réinitialiser toutes les informations
        function resetAllInfo() {
            if (confirm('á️ ètes-vous s╗r de vouloir réinitialiser toutes les informations ?')) {
                localStorage.removeItem('scout-info-data');
                loadInfoData();
                alert('à Informations réinitialisées !');
            }
        }

        // Charger les informations au démarrage
        document.addEventListener('DOMContentLoaded', function() {
            loadInfoData();
        });
