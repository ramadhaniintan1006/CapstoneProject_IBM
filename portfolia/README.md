# Portfolia

**Your creativity, beautifully presented.**

A browser-based portfolio website builder for creative professionals — digital illustrators, graphic designers, UI/UX designers, visual artists, and more.

---

## 🚀 Quick Start

Portfolia runs entirely in your browser — no server, no database, no installation required.

**To run locally:**

1. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
2. That's it!

**Or use a local server (recommended for best experience):**

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .

# Then open: http://localhost:8080
```

---

## 📁 Project Structure

```
portfolia/
├── index.html          ← Landing page
├── editor.html         ← Portfolio editor
├── preview.html        ← Full-screen preview
├── css/
│   ├── style.css       ← Global design system
│   ├── landing.css     ← Landing page extras
│   ├── editor.css      ← Editor UI styles
│   └── preview.css     ← Preview page styles
├── js/
│   ├── app.js          ← Shared utilities & landing page interactions
│   ├── storage.js      ← Local Storage data model
│   ├── editor.js       ← Editor controller (forms, uploads, events)
│   ├── preview.js      ← Portfolio renderer (4 templates)
│   └── export.js       ← Standalone HTML export
└── assets/
    └── images/         ← (placeholder for future static assets)
```

---

## ✍️ How to Use the Portfolio Editor

1. **Open `editor.html`** in your browser
2. **Profile tab** — enter your name, title, bio, location, email, website, and upload a profile photo
3. **About tab** — write your story and add your skills (press Enter after each skill)
4. **Projects tab** — click "Add New Project", fill in details, and upload a cover image
5. **Theme tab** — choose a template, customize colors, typography, and layout
6. Your changes **save automatically** to browser Local Storage

---

## 👁 Live Preview

The right panel of the editor shows a **live preview** that updates instantly as you type and make changes. Click **Full Preview** to open a dedicated full-screen preview in a new tab.

---

## 📦 Exporting Your Portfolio

1. In the editor, click **Export HTML** (top right)
2. A standalone `your-name.html` file downloads to your computer
3. This file works **completely independently** — open it in any browser or host it on any web server

**The exported file includes:**
- All your content and images (embedded as Base64)
- Full CSS styling for the chosen template
- Responsive layout for desktop, tablet, and mobile
- Your custom colors and typography

---

## 🎨 Templates

| Template | Style |
|----------|-------|
| **Editorial** | Elegant serif typography, spacious layout, sophisticated |
| **Playful** | Colorful, rounded, expressive, bold |
| **Minimal** | Clean, structured grid, professional, sans-serif |
| **Dark Canvas** | Dark background, dramatic, high-contrast |

---

## 💾 Data Storage

All data is stored in your browser's **Local Storage** under the key `portfolia_data`. Your data:
- Persists across browser sessions
- Never leaves your device
- Can be reset from the editor (Reset button)

**Image size limit:** 2MB per image. Large images will show a warning.

---

## 🧪 Tested Features

- ✅ Landing page loads and navigates correctly
- ✅ Editor profile form saves and restores data
- ✅ Profile image upload and preview
- ✅ Adding, editing, and deleting projects
- ✅ Project image upload with drag-and-drop
- ✅ Skills tag input with Enter key and backspace removal
- ✅ Social links management
- ✅ Template switching (all 4 templates)
- ✅ Accent color and background color customization
- ✅ Typography style selection
- ✅ Grid layout options (masonry, grid, list)
- ✅ Section visibility toggles
- ✅ Live preview updates immediately
- ✅ Auto-save to Local Storage
- ✅ Reset with confirmation dialog
- ✅ Full preview page
- ✅ HTML export downloads standalone file
- ✅ Responsive layouts (desktop, tablet, mobile)

---

## ⚠️ Known Limitations

- **No undo/redo** — changes are auto-saved immediately
- **Local Storage limit** — browsers typically allow ~5MB; very large images may fill this up
- **No multi-portfolio support** — one portfolio per browser session
- **Images require internet** if hosted from the exported HTML (unless embedded as Base64, which they are by default)
- **Google Fonts** in the export require an internet connection to load; system fonts are used as fallback

---

## 🛠 Technical Details

- **No dependencies** — pure HTML5, CSS3, and vanilla JavaScript (ES6+)
- **No build step** — works directly from the file system
- **No backend** — entirely client-side
- **No accounts** — zero signup or login required
- **Browser support** — Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

---

*Built with ♥ for creative professionals.*
