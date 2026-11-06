/**
 * Portfolia — preview.js
 * Renders portfolio data into HTML using the selected template.
 * Works both for live editor preview and the standalone preview page.
 */

(function() {

  // ── Template renderers ──────────────────────────────────────
  const TEMPLATES = {
    editorial: renderEditorial,
    playful:   renderPlayful,
    minimal:   renderMinimal,
    dark:      renderDark
  };

  /**
   * Main render entry point.
   * Renders portfolio data into the target element.
   * @param {Object} data - Portfolio data object
   * @param {HTMLElement} [targetEl] - Target container (defaults to #previewFrame)
   */
  function render(data, targetEl) {
    const frame = targetEl || document.getElementById('previewFrame');
    if (!frame) return;

    const template = (data.settings?.template || 'editorial').toLowerCase();
    const renderer = TEMPLATES[template] || renderEditorial;

    frame.innerHTML = renderer(data);
    // Apply theme variables
    applyThemeToFrame(frame, data.settings);
  }

  function applyThemeToFrame(frame, settings) {
    if (!settings) return;
    frame.style.setProperty('--preview-accent', settings.accentColor || '#B7A5D6');
    frame.style.setProperty('--preview-bg', settings.backgroundColor || '#F7F5F0');
    frame.style.setProperty('--preview-font', getTypographyFont(settings.typographyStyle));
  }

  function getTypographyFont(style) {
    switch (style) {
      case 'sans': return "'Inter', -apple-system, sans-serif";
      case 'mono': return "'Courier New', Courier, monospace";
      default: return "'Playfair Display', Georgia, serif";
    }
  }

  // ── Shared rendering helpers ────────────────────────────────

  function renderNav(data, template) {
    const p = data.profile;
    const accent = data.settings?.accentColor || '#B7A5D6';
    return `
      <nav style="display:flex;align-items:center;justify-content:space-between;padding:1.25rem 2rem;border-bottom:1px solid rgba(0,0,0,0.06);background:inherit;">
        <div style="font-family:${getTypographyFont(data.settings?.typographyStyle)};font-size:1.2rem;font-weight:700;letter-spacing:-0.02em;">
          ${escapeHtml(p.name) || 'Portfolio'}
        </div>
        <div style="display:flex;gap:1.5rem;font-size:0.82rem;font-weight:500;">
          ${data.settings?.sections?.about !== false ? `<a href="#about-section" style="color:inherit;opacity:0.7;text-decoration:none;">About</a>` : ''}
          ${data.settings?.sections?.projects !== false ? `<a href="#projects-section" style="color:inherit;opacity:0.7;text-decoration:none;">Work</a>` : ''}
          ${data.settings?.sections?.contact !== false ? `<a href="#contact-section" style="color:inherit;opacity:0.7;text-decoration:none;">Contact</a>` : ''}
        </div>
      </nav>`;
  }

  function renderProjectsGrid(data) {
    if (!data.projects?.length) return `<p style="opacity:0.5;font-style:italic;">No projects added yet.</p>`;
    const layout = data.settings?.gridLayout || 'masonry';
    const accent = data.settings?.accentColor || '#B7A5D6';

    if (layout === 'list') {
      return data.projects.map(p => renderProjectListItem(p, accent)).join('');
    }
    return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1.25rem;">
      ${data.projects.map(p => renderProjectCard(p, accent)).join('')}
    </div>`;
  }

  function renderProjectCard(p, accent) {
    const thumbBg = p.image ? '' : `background:${lightenColor(accent, 0.75)};`;
    return `
      <div style="border-radius:12px;overflow:hidden;border:1.5px solid rgba(0,0,0,0.07);background:#fff;">
        <div style="${thumbBg}aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">
          ${p.image
            ? `<img src="${p.image}" alt="${escapeHtml(p.title)}" style="width:100%;height:100%;object-fit:cover;display:block;position:absolute;inset:0;" />`
            : `<span style="font-size:2rem;opacity:0.3;">🎨</span>`
          }
        </div>
        <div style="padding:1rem;">
          <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${accent};margin-bottom:0.3rem;">${escapeHtml(p.category)}</div>
          <div style="font-weight:600;font-size:0.95rem;margin-bottom:0.3rem;">${escapeHtml(p.title)}</div>
          <div style="font-size:0.78rem;opacity:0.6;line-height:1.5;">${escapeHtml((p.description || '').slice(0, 100))}${(p.description || '').length > 100 ? '…' : ''}</div>
          ${p.year ? `<div style="font-size:0.72rem;opacity:0.5;margin-top:0.5rem;">${escapeHtml(p.year)}</div>` : ''}
        </div>
      </div>`;
  }

  function renderProjectListItem(p, accent) {
    return `
      <div style="display:flex;gap:1rem;padding:1rem 0;border-bottom:1px solid rgba(0,0,0,0.06);align-items:flex-start;">
        ${p.image
          ? `<img src="${p.image}" alt="${escapeHtml(p.title)}" style="width:70px;height:70px;border-radius:8px;object-fit:cover;flex-shrink:0;" />`
          : `<div style="width:70px;height:70px;border-radius:8px;background:${lightenColor(accent, 0.8)};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.5rem;opacity:0.5;">🎨</div>`
        }
        <div>
          <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:${accent};margin-bottom:0.2rem;">${escapeHtml(p.category)} · ${escapeHtml(p.year)}</div>
          <div style="font-weight:600;font-size:0.95rem;margin-bottom:0.3rem;">${escapeHtml(p.title)}</div>
          <div style="font-size:0.82rem;opacity:0.6;">${escapeHtml((p.description || '').slice(0, 140))}${(p.description || '').length > 140 ? '…' : ''}</div>
        </div>
      </div>`;
  }

  function renderSkillsChips(skills, accent) {
    if (!skills?.length) return '';
    return skills.map(s => `
      <span style="display:inline-flex;padding:0.3rem 0.85rem;background:${lightenColor(accent, 0.85)};color:inherit;border-radius:20px;font-size:0.78rem;font-weight:500;margin:0.2rem;">
        ${escapeHtml(s)}
      </span>`).join('');
  }

  function renderSocialLinks(links) {
    if (!links?.length) return '';
    return links.filter(l => l.url).map(l => `
      <a href="${safeUrl(l.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:0.4rem;font-size:0.85rem;opacity:0.75;text-decoration:none;color:inherit;transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.75">
        ${escapeHtml(l.platform)} ↗
      </a>`).join('');
  }

  // ── Color utility ──────────────────────────────────────────
  function lightenColor(hex, amount) {
    try {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      const lr = Math.round(r + (255 - r) * amount);
      const lg = Math.round(g + (255 - g) * amount);
      const lb = Math.round(b + (255 - b) * amount);
      return `rgb(${lr},${lg},${lb})`;
    } catch { return hex; }
  }

  // ──────────────────────────────────────────────────────────
  // TEMPLATE 1: EDITORIAL
  // ──────────────────────────────────────────────────────────
  function renderEditorial(data) {
    const p = data.profile;
    const s = data.settings;
    const accent = s?.accentColor || '#B7A5D6';
    const bg = s?.backgroundColor || '#F7F5F0';
    const fontFamily = getTypographyFont(s?.typographyStyle);
    const isDark = isDarkColor(bg);
    const textColor = isDark ? '#FFFFFF' : '#242424';
    const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : '#6B6B6B';

    return `
      <div style="font-family:${fontFamily};background:${bg};color:${textColor};min-height:600px;">
        ${renderNav(data, 'editorial')}

        <!-- Hero -->
        <section style="padding:4rem 2rem 3rem;max-width:900px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;">
          <div>
            <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:${accent};margin-bottom:1rem;">Creative Portfolio</div>
            <h1 style="font-size:clamp(2rem,5vw,3.5rem);line-height:1.1;letter-spacing:-0.03em;margin-bottom:1rem;font-family:${fontFamily};">${escapeHtml(p.name) || 'Your Name'}</h1>
            <p style="font-size:1rem;color:${accent};font-style:italic;margin-bottom:1rem;">${escapeHtml(p.title) || 'Creative Professional'}</p>
            <p style="font-size:0.9rem;line-height:1.7;color:${mutedColor};max-width:380px;">${escapeHtml(p.bio) || ''}</p>
            ${p.location || p.email ? `
              <div style="margin-top:1.5rem;font-size:0.8rem;color:${mutedColor};display:flex;gap:1.5rem;flex-wrap:wrap;">
                ${p.location ? `<span>📍 ${escapeHtml(p.location)}</span>` : ''}
                ${p.email ? `<a href="mailto:${escapeHtml(p.email)}" style="color:inherit;text-decoration:none;">${escapeHtml(p.email)}</a>` : ''}
              </div>` : ''}
            ${data.socialLinks?.length ? `
              <div style="margin-top:1.25rem;display:flex;gap:1rem;flex-wrap:wrap;">
                ${renderSocialLinks(data.socialLinks)}
              </div>` : ''}
          </div>
          <div style="text-align:right;">
            ${p.profileImage
              ? `<img src="${p.profileImage}" alt="${escapeHtml(p.name)}" style="width:220px;height:280px;object-fit:cover;border-radius:16px;margin-left:auto;box-shadow:0 20px 60px rgba(0,0,0,0.15);" />`
              : `<div style="width:220px;height:280px;background:${lightenColor(accent, 0.7)};border-radius:16px;margin-left:auto;display:flex;align-items:center;justify-content:center;font-size:4rem;opacity:0.5;">👤</div>`
            }
          </div>
        </section>

        ${data.settings?.sections?.about !== false ? `
        <!-- About -->
        <section id="about-section" style="padding:3rem 2rem;max-width:900px;margin:0 auto;border-top:1px solid rgba(0,0,0,0.08);">
          <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:${accent};margin-bottom:1.5rem;">About</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;">
            <div>
              <p style="font-size:0.9rem;line-height:1.8;color:${mutedColor};">${escapeHtml(data.about) || ''}</p>
            </div>
            ${data.settings?.sections?.skills !== false && data.skills?.length ? `
            <div>
              <div style="font-size:0.8rem;font-weight:600;margin-bottom:0.75rem;">Skills</div>
              <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
                ${renderSkillsChips(data.skills, accent)}
              </div>
            </div>` : ''}
          </div>
        </section>` : ''}

        ${data.settings?.sections?.projects !== false ? `
        <!-- Projects -->
        <section id="projects-section" style="padding:3rem 2rem;max-width:900px;margin:0 auto;border-top:1px solid rgba(0,0,0,0.08);">
          <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:${accent};margin-bottom:1.5rem;">Selected Work</div>
          ${renderProjectsGrid(data)}
        </section>` : ''}

        ${data.settings?.sections?.contact !== false ? `
        <!-- Contact -->
        <section id="contact-section" style="padding:3rem 2rem 4rem;max-width:900px;margin:0 auto;border-top:1px solid rgba(0,0,0,0.08);">
          <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:${accent};margin-bottom:1rem;">Contact</div>
          <h3 style="font-size:1.8rem;font-family:${fontFamily};margin-bottom:1rem;">Let's work together.</h3>
          <div style="font-size:0.9rem;color:${mutedColor};display:flex;gap:2rem;flex-wrap:wrap;">
            ${p.email ? `<a href="mailto:${escapeHtml(p.email)}" style="color:${accent};text-decoration:none;">${escapeHtml(p.email)}</a>` : ''}
            ${p.website ? `<a href="${safeUrl(p.website)}" target="_blank" style="color:inherit;text-decoration:none;opacity:0.75;">${escapeHtml(p.website)}</a>` : ''}
          </div>
        </section>` : ''}

        <footer style="padding:1.5rem 2rem;border-top:1px solid rgba(0,0,0,0.06);text-align:center;font-size:0.75rem;color:${mutedColor};">
          ${escapeHtml(p.name)} · Portfolio
        </footer>
      </div>`;
  }

  // ──────────────────────────────────────────────────────────
  // TEMPLATE 2: PLAYFUL
  // ──────────────────────────────────────────────────────────
  function renderPlayful(data) {
    const p = data.profile;
    const s = data.settings;
    const accent = s?.accentColor || '#FF6B9D';
    const bg = s?.backgroundColor || '#fff8f5';
    const fontFamily = getTypographyFont(s?.typographyStyle);
    const isDark = isDarkColor(bg);
    const textColor = isDark ? '#FFFFFF' : '#2a2a2a';
    const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : '#666';

    return `
      <div style="font-family:${fontFamily};background:${bg};color:${textColor};min-height:600px;">
        ${renderNav(data, 'playful')}

        <!-- Hero -->
        <section style="padding:3rem 2rem 2rem;text-align:center;position:relative;">
          <div style="display:inline-block;background:${lightenColor(accent, 0.8)};border-radius:50%;padding:0.3rem 0.8rem;font-size:0.78rem;font-weight:600;color:${accent};margin-bottom:1rem;">✦ Creative Portfolio</div>
          <br/>
          ${p.profileImage
            ? `<img src="${p.profileImage}" alt="${escapeHtml(p.name)}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid ${accent};margin:1rem auto;display:block;" />`
            : `<div style="width:100px;height:100px;border-radius:50%;background:${lightenColor(accent,0.7)};border:4px solid ${accent};margin:1rem auto;display:flex;align-items:center;justify-content:center;font-size:2.5rem;">👤</div>`
          }
          <h1 style="font-size:clamp(1.8rem,4vw,3rem);line-height:1.15;margin-bottom:0.5rem;font-family:${fontFamily};">${escapeHtml(p.name) || 'Your Name'}</h1>
          <p style="font-size:1rem;color:${accent};font-weight:600;margin-bottom:0.75rem;">${escapeHtml(p.title) || 'Creative Professional'}</p>
          <p style="font-size:0.88rem;line-height:1.7;color:${mutedColor};max-width:480px;margin:0 auto 1.5rem;">${escapeHtml(p.bio) || ''}</p>
          ${data.socialLinks?.filter(l=>l.url).length ? `
          <div style="display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;">
            ${renderSocialLinks(data.socialLinks)}
          </div>` : ''}
        </section>

        ${data.settings?.sections?.about !== false || data.settings?.sections?.skills !== false ? `
        <!-- About & Skills -->
        <section id="about-section" style="padding:2rem;max-width:800px;margin:0 auto;">
          <div style="display:grid;grid-template-columns:${data.settings?.sections?.skills !== false && data.skills?.length ? '1fr 1fr' : '1fr'};gap:2rem;">
            ${data.settings?.sections?.about !== false ? `
            <div style="background:#fff;border-radius:20px;padding:1.5rem;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <div style="font-weight:700;font-size:1rem;margin-bottom:0.75rem;">About Me ✍️</div>
              <p style="font-size:0.875rem;line-height:1.7;color:${mutedColor};">${escapeHtml(data.about) || ''}</p>
            </div>` : ''}
            ${data.settings?.sections?.skills !== false && data.skills?.length ? `
            <div style="background:#fff;border-radius:20px;padding:1.5rem;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
              <div style="font-weight:700;font-size:1rem;margin-bottom:0.75rem;">My Skills 🎯</div>
              <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
                ${renderSkillsChips(data.skills, accent)}
              </div>
            </div>` : ''}
          </div>
        </section>` : ''}

        ${data.settings?.sections?.projects !== false ? `
        <!-- Projects -->
        <section id="projects-section" style="padding:2rem;max-width:800px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:2rem;">
            <h2 style="font-size:1.8rem;font-family:${fontFamily};">My Creative Work 🎨</h2>
          </div>
          ${renderProjectsGrid(data)}
        </section>` : ''}

        ${data.settings?.sections?.contact !== false ? `
        <!-- Contact -->
        <section id="contact-section" style="padding:2rem 2rem 4rem;max-width:800px;margin:0 auto;text-align:center;">
          <div style="background:${lightenColor(accent, 0.88)};border-radius:24px;padding:2.5rem;border:2px solid ${lightenColor(accent, 0.7)};">
            <h2 style="font-family:${fontFamily};margin-bottom:0.75rem;">Say Hello! 👋</h2>
            <p style="color:${mutedColor};margin-bottom:1.5rem;font-size:0.9rem;">I'm open to new projects and collaborations.</p>
            ${p.email ? `<a href="mailto:${escapeHtml(p.email)}" style="display:inline-block;background:${accent};color:#fff;padding:0.75rem 2rem;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.9rem;">${escapeHtml(p.email)}</a>` : ''}
          </div>
        </section>` : ''}
      </div>`;
  }

  // ──────────────────────────────────────────────────────────
  // TEMPLATE 3: MINIMAL
  // ──────────────────────────────────────────────────────────
  function renderMinimal(data) {
    const p = data.profile;
    const s = data.settings;
    const accent = s?.accentColor || '#333333';
    const bg = s?.backgroundColor || '#FAFAFA';
    const fontFamily = "'Inter', -apple-system, sans-serif"; // Always sans for minimal
    const isDark = isDarkColor(bg);
    const textColor = isDark ? '#FFFFFF' : '#111111';
    const mutedColor = isDark ? 'rgba(255,255,255,0.55)' : '#888888';
    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#E5E5E5';

    return `
      <div style="font-family:${fontFamily};background:${bg};color:${textColor};min-height:600px;">
        ${renderNav(data, 'minimal')}

        <!-- Hero: minimal two-line intro -->
        <section style="padding:4rem 2rem 3rem;max-width:760px;margin:0 auto;border-bottom:1px solid ${borderColor};">
          <div style="display:flex;align-items:flex-start;gap:2rem;justify-content:space-between;">
            <div>
              <h1 style="font-size:clamp(1.6rem,3.5vw,2.5rem);font-weight:700;letter-spacing:-0.04em;line-height:1.1;margin-bottom:0.5rem;">${escapeHtml(p.name) || 'Your Name'}</h1>
              <p style="font-size:0.9rem;color:${accent};font-weight:500;margin-bottom:1rem;">${escapeHtml(p.title) || ''}</p>
              <p style="font-size:0.85rem;color:${mutedColor};line-height:1.7;max-width:460px;">${escapeHtml(p.bio) || ''}</p>
              <div style="margin-top:1.25rem;font-size:0.8rem;color:${mutedColor};display:flex;gap:1.5rem;flex-wrap:wrap;">
                ${p.location ? `<span>${escapeHtml(p.location)}</span>` : ''}
                ${p.email ? `<a href="mailto:${escapeHtml(p.email)}" style="color:inherit;text-decoration:none;">${escapeHtml(p.email)}</a>` : ''}
                ${p.website ? `<a href="${safeUrl(p.website)}" style="color:inherit;text-decoration:none;">${escapeHtml(p.website)}</a>` : ''}
              </div>
            </div>
            ${p.profileImage
              ? `<img src="${p.profileImage}" alt="${escapeHtml(p.name)}" style="width:80px;height:80px;border-radius:8px;object-fit:cover;flex-shrink:0;" />`
              : ''
            }
          </div>
        </section>

        ${data.settings?.sections?.about !== false && data.about ? `
        <section id="about-section" style="padding:2.5rem 2rem;max-width:760px;margin:0 auto;border-bottom:1px solid ${borderColor};">
          <div style="display:grid;grid-template-columns:160px 1fr;gap:2rem;">
            <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${mutedColor};padding-top:0.2rem;">About</div>
            <div>
              <p style="font-size:0.875rem;line-height:1.8;color:${mutedColor};">${escapeHtml(data.about)}</p>
              ${data.settings?.sections?.skills !== false && data.skills?.length ? `
              <div style="margin-top:1.25rem;display:flex;flex-wrap:wrap;gap:0.4rem;">
                ${renderSkillsChips(data.skills, accent)}
              </div>` : ''}
            </div>
          </div>
        </section>` : ''}

        ${data.settings?.sections?.projects !== false ? `
        <section id="projects-section" style="padding:2.5rem 2rem;max-width:760px;margin:0 auto;border-bottom:1px solid ${borderColor};">
          <div style="display:grid;grid-template-columns:160px 1fr;gap:2rem;">
            <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${mutedColor};padding-top:0.2rem;">Work</div>
            <div>
              ${renderProjectsGrid(data)}
            </div>
          </div>
        </section>` : ''}

        ${data.settings?.sections?.contact !== false ? `
        <section id="contact-section" style="padding:2.5rem 2rem 4rem;max-width:760px;margin:0 auto;">
          <div style="display:grid;grid-template-columns:160px 1fr;gap:2rem;">
            <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${mutedColor};padding-top:0.2rem;">Contact</div>
            <div>
              <p style="font-size:0.875rem;color:${mutedColor};margin-bottom:1rem;">Available for freelance projects and collaborations.</p>
              <div style="display:flex;gap:1.5rem;flex-wrap:wrap;font-size:0.875rem;">
                ${p.email ? `<a href="mailto:${escapeHtml(p.email)}" style="color:${accent};text-decoration:none;font-weight:500;">${escapeHtml(p.email)}</a>` : ''}
                ${renderSocialLinks(data.socialLinks)}
              </div>
            </div>
          </div>
        </section>` : ''}
      </div>`;
  }

  // ──────────────────────────────────────────────────────────
  // TEMPLATE 4: DARK CANVAS
  // ──────────────────────────────────────────────────────────
  function renderDark(data) {
    const p = data.profile;
    const s = data.settings;
    const accent = s?.accentColor || '#B7A5D6';
    const bg = isDarkColor(s?.backgroundColor || '#1a1a2e') ? (s?.backgroundColor || '#1a1a2e') : '#1a1a2e';
    const fontFamily = getTypographyFont(s?.typographyStyle);
    const textColor = '#FFFFFF';
    const mutedColor = 'rgba(255,255,255,0.55)';
    const cardBg = 'rgba(255,255,255,0.05)';
    const borderColor = 'rgba(255,255,255,0.1)';

    return `
      <div style="font-family:${fontFamily};background:${bg};color:${textColor};min-height:600px;">
        ${renderNav(data, 'dark')}

        <!-- Hero -->
        <section style="padding:4rem 2rem 3rem;max-width:900px;margin:0 auto;position:relative;">
          <!-- Glow effect -->
          <div style="position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:${accent};border-radius:50%;filter:blur(120px);opacity:0.12;pointer-events:none;"></div>
          <div style="position:relative;z-index:1;">
            <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;color:${accent};margin-bottom:1.25rem;">✦ Portfolio</div>
            <div style="display:flex;align-items:flex-start;gap:2.5rem;">
              <div style="flex:1;">
                <h1 style="font-size:clamp(2rem,5vw,4rem);line-height:1.05;letter-spacing:-0.03em;margin-bottom:0.75rem;font-family:${fontFamily};">${escapeHtml(p.name) || 'Your Name'}</h1>
                <p style="font-size:1rem;color:${accent};margin-bottom:1rem;font-weight:500;">${escapeHtml(p.title) || 'Creative Professional'}</p>
                <p style="font-size:0.88rem;line-height:1.8;color:${mutedColor};max-width:480px;margin-bottom:1.5rem;">${escapeHtml(p.bio) || ''}</p>
                <div style="font-size:0.8rem;color:${mutedColor};display:flex;gap:1.5rem;flex-wrap:wrap;margin-bottom:1rem;">
                  ${p.location ? `<span>📍 ${escapeHtml(p.location)}</span>` : ''}
                  ${p.email ? `<a href="mailto:${escapeHtml(p.email)}" style="color:inherit;text-decoration:none;">${escapeHtml(p.email)}</a>` : ''}
                </div>
                ${data.socialLinks?.filter(l=>l.url).length ? `
                <div style="display:flex;gap:1rem;flex-wrap:wrap;">${renderSocialLinks(data.socialLinks)}</div>` : ''}
              </div>
              ${p.profileImage
                ? `<img src="${p.profileImage}" alt="${escapeHtml(p.name)}" style="width:180px;height:220px;object-fit:cover;border-radius:12px;flex-shrink:0;border:2px solid ${borderColor};" />`
                : `<div style="width:180px;height:220px;border-radius:12px;background:rgba(255,255,255,0.04);border:2px solid ${borderColor};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:3.5rem;opacity:0.3;">👤</div>`
              }
            </div>
          </div>
        </section>

        ${data.settings?.sections?.about !== false || data.settings?.sections?.skills !== false ? `
        <section id="about-section" style="padding:2.5rem 2rem;max-width:900px;margin:0 auto;border-top:1px solid ${borderColor};">
          <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:${accent};margin-bottom:1.5rem;">About</div>
          <div style="display:grid;grid-template-columns:${data.skills?.length ? '1fr 1fr' : '1fr'};gap:2.5rem;">
            ${data.settings?.sections?.about !== false ? `
            <p style="font-size:0.9rem;line-height:1.8;color:${mutedColor};">${escapeHtml(data.about) || ''}</p>` : ''}
            ${data.settings?.sections?.skills !== false && data.skills?.length ? `
            <div>
              <div style="font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${mutedColor};margin-bottom:1rem;">Skills</div>
              <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
                ${data.skills.map(s => `<span style="background:${cardBg};border:1px solid ${borderColor};padding:0.3rem 0.75rem;border-radius:20px;font-size:0.78rem;font-weight:500;">${escapeHtml(s)}</span>`).join('')}
              </div>
            </div>` : ''}
          </div>
        </section>` : ''}

        ${data.settings?.sections?.projects !== false ? `
        <section id="projects-section" style="padding:2.5rem 2rem;max-width:900px;margin:0 auto;border-top:1px solid ${borderColor};">
          <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:${accent};margin-bottom:1.5rem;">Selected Work</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;">
            ${data.projects?.length ? data.projects.map(proj => `
              <div style="border-radius:10px;overflow:hidden;background:${cardBg};border:1px solid ${borderColor};">
                ${proj.image
                  ? `<img src="${proj.image}" alt="${escapeHtml(proj.title)}" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block;" />`
                  : `<div style="aspect-ratio:4/3;background:linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02));display:flex;align-items:center;justify-content:center;font-size:2rem;opacity:0.3;">🎨</div>`
                }
                <div style="padding:0.9rem;">
                  <div style="font-size:0.68rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${accent};margin-bottom:0.25rem;">${escapeHtml(proj.category)}</div>
                  <div style="font-weight:600;font-size:0.9rem;margin-bottom:0.25rem;">${escapeHtml(proj.title)}</div>
                  <div style="font-size:0.75rem;color:${mutedColor};">${escapeHtml((proj.description || '').slice(0,90))}${(proj.description||'').length>90?'…':''}</div>
                </div>
              </div>`).join('') : `<p style="color:${mutedColor};font-style:italic;font-size:0.9rem;">No projects added yet.</p>`}
          </div>
        </section>` : ''}

        ${data.settings?.sections?.contact !== false ? `
        <section id="contact-section" style="padding:2.5rem 2rem 5rem;max-width:900px;margin:0 auto;border-top:1px solid ${borderColor};">
          <div style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:${accent};margin-bottom:1rem;">Get In Touch</div>
          <h2 style="font-size:2rem;margin-bottom:1rem;font-family:${fontFamily};">Let's create something<br>remarkable.</h2>
          <div style="display:flex;gap:1.5rem;flex-wrap:wrap;font-size:0.875rem;">
            ${p.email ? `<a href="mailto:${escapeHtml(p.email)}" style="color:${accent};text-decoration:none;font-weight:500;">${escapeHtml(p.email)}</a>` : ''}
            ${p.website ? `<a href="${safeUrl(p.website)}" target="_blank" style="color:${mutedColor};text-decoration:none;">${escapeHtml(p.website)}</a>` : ''}
          </div>
        </section>` : ''}

        <footer style="padding:1.5rem 2rem;border-top:1px solid ${borderColor};text-align:center;font-size:0.72rem;color:${mutedColor};">
          ${escapeHtml(p.name)} · Portfolio
        </footer>
      </div>`;
  }

  // ── Utility functions ────────────────────────────────────────
  function isDarkColor(hex) {
    try {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      // Perceived luminance
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return lum < 0.45;
    } catch { return false; }
  }

  // ── Shared escaping / URL (from app.js, but also local fallback) ──
  function escapeHtml(str) {
    if (window.escapeHtml) return window.escapeHtml(str);
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function safeUrl(url) {
    if (window.safeUrl) return window.safeUrl(url);
    if (!url) return '#';
    try {
      const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '#';
    } catch { return '#'; }
  }

  // ── Export API ──────────────────────────────────────────────
  window.PortfoliaPreview = { render, renderEditorial, renderPlayful, renderMinimal, renderDark };

})();
