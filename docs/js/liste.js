(() => {
    const STORAGE_KEY = 'scout-list';
    const CONFETTI_COUNT = 40;
    const confettiEmojis = ['🎉', '✨', '🌟', '🍃', '🪵'];
    let checkboxes = [];
    let lastPercentage = 0;

    function getElements() {
        return {
            checkedCount: document.getElementById('checkedCount'),
            percentComplete: document.getElementById('percentComplete'),
            progressBar: document.getElementById('progressBar'),
            backpackContent: document.getElementById('backpackContent'),
            backpackProgressBar: document.getElementById('backpackProgressBar'),
            backpackStatus: document.getElementById('backpackStatus'),
            backpackText: document.getElementById('backpackText'),
            particles: document.getElementById('particles')
        };
    }


    function saveState() {
        const state = checkboxes.map(cb => cb.checked);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function createParticles(emoji) {
        const { particles } = getElements();
        if (!particles) {
            return;
        }

        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.textContent = emoji;
            particle.style.position = 'absolute';
            particle.style.left = `${20 + Math.random() * 60}%`;
            particle.style.bottom = '0';
            particle.style.fontSize = '1.5rem';
            particle.style.opacity = '1';
            particle.style.transition = 'transform 1s ease-out, opacity 1s ease-out';

            requestAnimationFrame(() => {
                particle.style.transform = `translate(${(Math.random() - 0.5) * 60}px, -120px)`;
                particle.style.opacity = '0';
            });

            particles.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    }

    function createConfetti() {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < CONFETTI_COUNT; i++) {
            const confetti = document.createElement('div');
            confetti.textContent = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
            confetti.style.position = 'fixed';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = '-40px';
            confetti.style.fontSize = '1.5rem';
            confetti.style.zIndex = '5000';
            confetti.style.pointerEvents = 'none';
            confetti.style.transition = 'transform 3s linear, opacity 3s linear';

            requestAnimationFrame(() => {
                confetti.style.transform = `translateY(${window.innerHeight + 80}px) rotate(${Math.random() * 360}deg)`;
                confetti.style.opacity = '0';
            });

            fragment.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
        document.body.appendChild(fragment);
    }

    function updateBackpack(percentage) {
        const { backpackContent, backpackProgressBar, backpackStatus, backpackText } = getElements();
        if (!backpackContent || !backpackProgressBar || !backpackStatus || !backpackText) {
            return;
        }

        backpackContent.style.transform = `scaleY(${percentage / 100})`;
        backpackProgressBar.style.width = `${percentage}%`;
        backpackProgressBar.textContent = `${percentage}%`;

        if (percentage === 0) {
            backpackText.textContent = '🎒';
            backpackStatus.textContent = '🎒 Sac vide - Commencez à cocher les éléments !';
            backpackStatus.style.color = 'var(--c-forest-700)';
        } else if (percentage < 25) {
            backpackText.textContent = '🧭';
            backpackStatus.textContent = '🧭 Sac en préparation...';
            backpackStatus.style.color = '#FF9800';
            createParticles('🧭');
        } else if (percentage < 50) {
            backpackText.textContent = '🔥';
            backpackStatus.textContent = '🔥 Sac bien avancé !';
            backpackStatus.style.color = '#FF9800';
            createParticles('🔥');
        } else if (percentage < 75) {
            backpackText.textContent = '🌲';
            backpackStatus.textContent = '🌲 Sac presque prêt !';
            backpackStatus.style.color = '#4CAF50';
            createParticles('🌲');
        } else if (percentage < 100) {
            backpackText.textContent = '⭐';
            backpackStatus.textContent = '⭐ Plus que quelques éléments !';
            backpackStatus.style.color = '#4CAF50';
            createParticles('⭐');
        } else {
            backpackText.textContent = '🏕️';
            backpackStatus.textContent = '🏕️ Sac prêt pour l\'aventure !';
            backpackStatus.style.color = '#2E7D32';
            createParticles('🏕️');
        }
    }

    function updateProgress() {
        const { checkedCount, percentComplete, progressBar } = getElements();
        const total = checkboxes.length;
        const checked = checkboxes.filter(cb => cb.checked).length;
        const percentage = total === 0 ? 0 : Math.round((checked / total) * 100);

        if (checkedCount) {
            checkedCount.textContent = checked;
        }
        if (percentComplete) {
            percentComplete.textContent = `${percentage}%`;
        }
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            if (percentage === 0) {
                progressBar.textContent = '0% - Prêt pour l\'aventure ?';
            } else if (percentage < 100) {
                progressBar.textContent = `${percentage}% - Continue !`;
            } else {
                progressBar.textContent = '100% - Bravo ! Ton sac est prêt !';
            }
        }

        if (percentage === 100 && lastPercentage < 100) {
            createConfetti();
        }
        lastPercentage = percentage;

        updateBackpack(percentage);
    }

    function restoreState() {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        checkboxes.forEach((checkbox, index) => {
            if (saved[index]) {
                checkbox.checked = true;
            }
        });
    }

    function handleCheckboxChange() {
        saveState();
        updateProgress();
    }

    function initChecklist() {
        checkboxes = Array.from(document.querySelectorAll('#liste input[type="checkbox"]'));
        restoreState();
        checkboxes.forEach(checkbox => checkbox.addEventListener('change', handleCheckboxChange));
        updateProgress();
    }

    function toggleCategory(categoryId) {
        const content = document.getElementById(`${categoryId}-content`);
        const arrow = document.getElementById(`${categoryId}-arrow`);
        if (!content) {
            return;
        }

        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        if (arrow) {
            arrow.textContent = isHidden ? '▼' : '▲';
        }
    }

    function ouvrirJeuSac() {
        const features = 'width=1200,height=800,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no';
        const popup = window.open('scout_bag_game (1).html', 'JeuSacScout', features);
        if (popup) {
            popup.focus();
        } else {
            window.open('scout_bag_game (1).html', '_blank');
        }
    }

    document.addEventListener('DOMContentLoaded', initChecklist);
    window.toggleCategory = toggleCategory;
    window.ouvrirJeuSac = ouvrirJeuSac;
})();

