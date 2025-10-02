# Scout Checklist Project

## Overview

The Scout Checklist Project is a beautiful, interactive web application designed to help scouts prepare for their camping adventures. The application features a magical forest theme with animated elements, comprehensive packing lists, and progress tracking.

## Features

- 🌲 **Magical Forest Theme**: Animated falling leaves and fireflies create an immersive outdoor atmosphere
- 📋 **Interactive Checklist**: Check off items as you pack with smooth animations
- 📊 **Progress Tracking**: Visual progress bar and statistics show completion status
- 🎯 **Multiple Sections**:
  - 📋 Packing list with categorized items
  - ⛺ Tent setup tutorial with video
  - 🎵 Music player with scout playlists and lyrics
  - 📱 Contact information and QR codes
  - 👥 Team assignments and missions
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 💾 **Local Storage**: Automatically saves your progress in the browser
- 🎮 **Gamification**: Fun animations and confetti celebration when packing is complete
- 🌐 **Multilingual**: French interface with scout terminology

## Project Structure

```
scout-checklist-project/
├── src/
│   ├── main.html         # Main application entry point
│   ├── pages/            # Individual page content
│   │   ├── liste.html    # Checklist page
│   │   ├── musique.html  # Music/Spotify page
│   │   ├── tente.html    # Tent tutorial page
│   │   ├── infos.html    # Information page
│   │   └── equipes.html  # Teams page
│   ├── js/               # JavaScript modules
│   │   ├── navigation.js # Page navigation system
│   │   ├── magical-animations.js # Forest animations
│   │   ├── checklist.js  # Checklist functionality
│   │   ├── music.js      # Music player features
│   │   └── page-loader.js # Dynamic page loading
│   └── styles/           # CSS stylesheets
│       ├── main.css      # Main application styles
│       └── animations.css # Magical forest animations
├── docs/                 # Documentation
│   ├── BEGINNER-GUIDE.md # Complete beginner tutorial
│   ├── TECHNICAL-DOCS.md # Technical documentation
│   └── QUICK-START.md    # Quick start guide
└── README.md             # This documentation
```

## Setup Instructions

### Option 1: Direct Browser Opening

1. **Navigate to the project directory**:

   ```
   cd scout-checklist-project
   ```

2. **Open the application**:
   - Open `src/main.html` directly in your web browser
   - Or serve it using a local web server for best performance

### Option 2: Local Web Server (Recommended)

1. **Navigate to the project directory**:

   ```
   cd scout-checklist-project
   ```

2. **Start a local server** (choose one):

   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (if you have http-server installed)
   npx http-server -p 8000

   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**:
   - Navigate to `http://localhost:8000/src/main.html`
   - The application will load with all features working properly

## Usage

### For Scouts

1. **Start Packing**: Open the checklist and begin checking off items as you pack
2. **Track Progress**: Watch the progress bar fill up as you complete your packing
3. **Learn Skills**: Use the tent setup section to learn proper camping techniques
4. **Enjoy Music**: Browse scout playlists and sing along with the lyrics
5. **Stay Connected**: Access team information and contact details
6. **Celebrate**: Enjoy the confetti animation when you finish packing!

### For Parents

- Click on the "exemple 🔗" links to see recommended equipment
- The application automatically saves progress, so scouts can continue later
- All information is stored locally in the browser (no external data collection)

## Technical Details

### Technologies Used

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Advanced styling with custom properties, animations, and responsive design
- **Vanilla JavaScript**: Interactive functionality and local storage
- **Google Fonts**: Custom typography (Patrick Hand, Nunito)

### Browser Compatibility

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (limited support)

### Performance Features

- Optimized animations with `prefers-reduced-motion` support
- Efficient local storage usage
- Responsive images and media queries
- Smooth 60fps animations

## Customization

### Adding New Items

Edit the HTML in `src/index.html` to add new checklist items:

```html
<div class="fey-item">
  <input type="checkbox" id="itemX" />
  <label for="itemX">Your new item</label>
</div>
```

### Styling Changes

Modify CSS custom properties in `src/styles/main.css`:

```css
:root {
  --c-orange-600: #f77f00; /* Change colors here */
  --c-forest-700: #2e7d32;
  /* ... other variables */
}
```

## 📚 Documentation

### For Beginners

- **`docs/QUICK-START.md`** - Get up and running in 5 minutes
- **`docs/BEGINNER-GUIDE.md`** - Complete tutorial explaining HTML, CSS, and JavaScript

### For Developers

- **`docs/TECHNICAL-DOCS.md`** - Technical architecture and implementation details
- **`README.md`** - This overview document

## Contributing

Contributions are welcome! Please feel free to:

- Submit pull requests for new features
- Open issues for bug reports
- Suggest improvements for the user experience
- Add translations for other languages
- Improve the documentation

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Support

For questions or support, please open an issue in the repository or contact the development team.
