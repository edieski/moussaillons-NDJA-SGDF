# 🚀 Guide de Démarrage Rapide

## ⚡ Lancer l'Application

### Option 1 : Ouvrir Directement

1. Navigue vers le dossier `scout-checklist-project/src/`
2. Ouvre `main.html` dans ton navigateur
3. C'est tout ! ✨

### Option 2 : Serveur Local (Recommandé)

```bash
# Dans le dossier scout-checklist-project/src/
python -m http.server 8000
# Puis va sur http://localhost:8000/main.html
```

## 📁 Structure Simple

```
scout-checklist-project/
├── src/
│   ├── main.html              ← 🎯 COMMENCE ICI
│   ├── pages/                 ← 📄 Toutes les pages
│   ├── js/                    ← ⚡ Code JavaScript
│   └── styles/                ← 🎨 Styles CSS
└── docs/                      ← 📚 Documentation
```

## 🎯 Pages Disponibles

| Onglet      | Fichier              | Description                 |
| ----------- | -------------------- | --------------------------- |
| 📋 Ma Liste | `pages/liste.html`   | Checklist interactive       |
| ⛺ La Tente | `pages/tente.html`   | Tutoriel montage tente      |
| 🎵 Musique  | `pages/musique.html` | Playlists et paroles        |
| 📱 Infos    | `pages/infos.html`   | Contacts et infos pratiques |
| 👥 Équipes  | `pages/equipes.html` | Composition des équipes     |

## 🛠️ Modifications Rapides

### Changer les Couleurs

Ouvre `styles/main.css` et modifie :

```css
:root {
    --c-orange-600: #F77F00;  ← Change cette couleur
    --c-forest-700: #2E7D32;  ← Ou celle-ci
}
```

### Ajouter un Item à la Checklist

Ouvre `pages/liste.html` et ajoute :

```html
<div class="fey-item">
  <input type="checkbox" id="item40" />
  <label for="item40">Mon nouvel item</label>
</div>
```

### Ajouter une Chanson

Ouvre `js/music.js` et ajoute dans `scoutPlaylists` :

```javascript
{
    title: "Ma Nouvelle Chanson",
    artist: "Mon Artiste",
    lyrics: "Paroles de la chanson..."
}
```

## 🎨 Personnalisation Rapide

### Changer le Titre

Dans `main.html`, ligne 14 :

```html
<h1 class="fey-title">🌲 Mon Nouveau Titre 🌲</h1>
```

### Modifier les Équipes

Dans `pages/equipes.html`, remplace les noms dans les équipes.

### Ajouter des Animations

Dans `js/magical-animations.js`, modifie le nombre d'éléments :

```javascript
for (let i = 0; i < 15; i++) {  // Change 15 par le nombre voulu
```

## 🔧 Débogage Rapide

### Problème : Page ne se charge pas

1. Ouvre la Console (F12)
2. Vérifie les erreurs en rouge
3. Vérifie que tous les fichiers existent

### Problème : Animations ne marchent pas

1. Vérifie que `animations.css` est chargé
2. Vérifie la console pour les erreurs JavaScript
3. Teste avec un autre navigateur

### Problème : Checklist ne sauvegarde pas

1. Vérifie que JavaScript est activé
2. Vérifie les permissions du navigateur
3. Teste en mode incognito

## 📚 Documentation Complète

- **`docs/BEGINNER-GUIDE.md`** : Guide complet pour débutants
- **`docs/TECHNICAL-DOCS.md`** : Documentation technique avancée
- **`README.md`** : Vue d'ensemble du projet

## 🎯 Prochaines Étapes

1. **Explorer** : Regarde tous les fichiers pour comprendre
2. **Modifier** : Change les couleurs et textes
3. **Expérimenter** : Ajoute tes propres éléments
4. **Apprendre** : Lis la documentation complète

## 💡 Conseils

- **Commence petit** : Modifie une chose à la fois
- **Teste souvent** : Actualise la page après chaque changement
- **Sauvegarde** : Fais des copies de tes fichiers
- **Explore** : N'hésite pas à essayer des choses

---

**🎉 Tu es prêt à commencer ! Ouvre `main.html` et explore !** 🌲✨
