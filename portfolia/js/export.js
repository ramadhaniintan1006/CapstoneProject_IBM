/**
 * Portfolia — export.js
 * Generates a standalone HTML portfolio file with all assets embedded.
 * The exported file works independently without the Portfolia application.
 */

(function() {

  /**
   * Export portfolio as a downloadable standalone HTML file
   * @param {Object} data - Portfolio data object
   */
  function exportHTML(data) {
    showToast('Generating your portfolio...', 'info', 2000);

    try {
      const template = (data.settings?.template || 'editorial').toLowerCase();
      const rendererName = 'render' + template.charAt(0).toUpperCase() + template.slice(1);
      const renderer = window.PortfoliaPreview?.[rendererName];

      let portfolioBody;
      if (renderer) {
        portfolioBody = renderer(data);
      } else {
        portfolioBody = window.PortfoliaPreview?.renderEditorial?.(data) || '<p>Error rendering portfolio.</p>';
      }

      const fullHtml = buildStandaloneHtml(data, portfolioBody);
      downloadHtml(fullHtml, generateFilename(data));
      showToast('Portfolio exported successfully!', 'success');
    } catch (err) {
      console.error('Portfolia Export Error:', err);
      showToast('Export failed. Please try again.', 'error');
    }
  }

  /**
   * Build a complete standalone HTML document
   */
  function buildStandaloneHtml(data, portfolioBody) {
    const p = data.profile;
    const s = data.settings || {};
    const accent = s.accentColor || '#B7A5D6';
    const bg = s.backgroundColor || '#F7F5F0';
    const font = getTypographyFont(s.typographyStyle);
    const name = escapeAttr(p?.name || 'My Portfolio');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Portfolio of ${name}" />
  <title>${name} — Portfolio</title>
  <style>
    /* ── Base Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; font-size: 16px; }
    body {
      font-family: ${font};
      background: ${bg};
      color: ${isDarkColor(bg) ? '#ffffff' : '#242424'};
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }
    img { max-width: 100%; height: auto; display: block; }
    a { color: inherit; text-decoration: none; }

    /* ── CSS Variables ── */
    :root {
      --accent: ${accent};
      --bg: ${bg};
      --text: ${isDarkColor(bg) ? '#ffffff' : '#242424'};
      --muted: ${isDarkColor(bg) ? 'rgba(255,255,255,0.6)' : '#6B6B6B'};
      --border: ${isDarkColor(bg) ? 'rgba(255,255,255,0.1)' : '#E0DDD7'};
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      section > div[style*="grid-template-columns:1fr 1fr"],
      section > div[style*="grid-template-columns: 1fr 1fr"] {
        grid-template-columns: 1fr !important;
      }
      section > div[style*="grid-template-columns:160px"] {
        grid-template-columns: 1fr !important;
      }
      h1 { font-size: 2rem !important; }
      h2 { font-size: 1.5rem !important; }
      nav { padding: 1rem !important; }
      section { padding: 2rem 1rem !important; }
    }
    @media (max-width: 480px) {
      h1 { font-size: 1.7rem !important; }
      img[style*="width:220px"] { width: 150px !important; height: 190px !important; }
    }

    /* ── Project grid responsive ── */
    @media (max-width: 640px) {
      div[style*="grid-template-columns:repeat(auto-fill"] {
        grid-template-columns: 1fr !important;
      }
    }

    /* ── Utility ── */
    .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
  </style>
  <!-- Google Fonts — loads when online, degrades gracefully offline -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
</head>
<body>
${portfolioBody}
<footer style="text-align:center;padding:2rem;font-size:0.72rem;opacity:0.4;border-top:1px solid var(--border);margin-top:2rem;">
  Created with <a href="https://portfolia.app" style="color:var(--accent);">Portfolia</a>
</footer>
</body>
</html>`;
  }

  /**
   * Trigger download of HTML string as a file
   */
  function downloadHtml(html, filename) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 1000);
  }

  /**
   * Generate a safe filename from the portfolio owner's name
   */
  function generateFilename(data) {
    const name = data?.profile?.name || 'portfolio';
    const safe = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return `${safe || 'my-portfolio'}.html`;
  }

  // ── Utilities ──────────────────────────────────────────────

  function escapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function getTypographyFont(style) {
    switch (style) {
      case 'sans': return "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      case 'mono': return "'Courier New', Courier, monospace";
      default: return "'Playfair Display', 'Georgia', serif";
    }
  }

  function isDarkColor(hex) {
    try {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
    } catch { return false; }
  }

  function showToast(msg, type, duration) {
    if (window.showToast) window.showToast(msg, type, duration);
  }

  // ── Export API ──────────────────────────────────────────────
  window.PortfoliaExport = { exportHTML };

})();
