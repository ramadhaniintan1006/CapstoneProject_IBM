/**
 * Portfolia — editor.js
 * Main editor controller: form bindings, project management,
 * image uploads, autosave, and UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── State ──────────────────────────────────────────────────
  let portfolioData = PortfoliaStorage.load();
  let saveTimeout = null;
  let isDirty = false;

  // ── Initialize editor ──────────────────────────────────────
  populateForm();
  renderProjects();
  renderSocialLinks();
  updateSaveStatus(false);

  // Trigger initial preview render
  if (window.PortfoliaPreview) {
    window.PortfoliaPreview.render(portfolioData);
  }

  // ── Tab switching ──────────────────────────────────────────
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel-section').forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
    });
  });

  // ── Profile form bindings ──────────────────────────────────
  function bindInput(id, path, transform) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const value = transform ? transform(el.value) : el.value;
      setNestedValue(portfolioData, path, value);
      scheduleAutoSave();
      triggerPreviewUpdate();
    });
  }

  bindInput('profileName', 'profile.name');
  bindInput('profileTitle', 'profile.title');
  bindInput('profileBio', 'profile.bio');
  bindInput('profileLocation', 'profile.location');
  bindInput('profileEmail', 'profile.email');
  bindInput('profileWebsite', 'profile.website');
  bindInput('aboutText', 'about');

  // Bio character counter
  const bioInput = document.getElementById('profileBio');
  const bioCount = document.getElementById('bioCount');
  if (bioInput && bioCount) {
    bioInput.addEventListener('input', () => {
      bioCount.textContent = bioInput.value.length;
    });
  }

  // ── Profile image upload ───────────────────────────────────
  const profileImageInput = document.getElementById('profileImageInput');
  if (profileImageInput) {
    profileImageInput.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      const validation = PortfoliaStorage.validateImageFile(file);
      if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
      }
      try {
        const dataUrl = await PortfoliaStorage.readFileAsDataURL(file);
        portfolioData.profile.profileImage = dataUrl;
        updateProfileImagePreview(dataUrl);
        scheduleAutoSave();
        triggerPreviewUpdate();
        showToast('Profile photo updated!', 'success');
      } catch {
        showToast('Failed to read image file.', 'error');
      }
      profileImageInput.value = '';
    });
  }

  document.getElementById('removeProfileImg')?.addEventListener('click', () => {
    portfolioData.profile.profileImage = '';
    updateProfileImagePreview('');
    scheduleAutoSave();
    triggerPreviewUpdate();
  });

  // ── Skills tags input ──────────────────────────────────────
  const skillInput = document.getElementById('skillInput');
  if (skillInput) {
    skillInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = skillInput.value.trim();
        if (val && !portfolioData.skills.includes(val)) {
          portfolioData.skills.push(val);
          renderSkillTag(val);
          scheduleAutoSave();
          triggerPreviewUpdate();
        }
        skillInput.value = '';
      }
      if (e.key === 'Backspace' && skillInput.value === '' && portfolioData.skills.length > 0) {
        const last = portfolioData.skills[portfolioData.skills.length - 1];
        removeSkill(last);
      }
    });
  }

  // ── Social links ───────────────────────────────────────────
  document.getElementById('addSocialLink')?.addEventListener('click', () => {
    portfolioData.socialLinks.push({ platform: 'Instagram', url: '' });
    renderSocialLinks();
    scheduleAutoSave();
  });

  // ── Project management ──────────────────────────────────────
  document.getElementById('addProjectBtn')?.addEventListener('click', () => {
    const newProject = {
      id: PortfoliaStorage.generateId(),
      title: 'New Project',
      description: '',
      category: 'Illustration',
      tools: [],
      year: new Date().getFullYear().toString(),
      image: ''
    };
    portfolioData.projects.unshift(newProject);
    renderProjects();
    // Auto-expand the new project
    const firstCard = document.querySelector('.project-card-editor');
    if (firstCard) {
      firstCard.querySelector('.project-card-body')?.classList.add('open');
      firstCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    scheduleAutoSave();
    triggerPreviewUpdate();
  });

  // ── Theme controls ──────────────────────────────────────────

  // Template selection
  document.querySelectorAll('.template-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.template-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      portfolioData.settings.template = opt.dataset.template;
      scheduleAutoSave();
      triggerPreviewUpdate();
    });
  });

  // Accent color picker
  const accentPicker = document.getElementById('accentColorPicker');
  const accentHex = document.getElementById('accentColorHex');
  const accentPreview = document.getElementById('accentColorPreview');

  if (accentPicker) {
    accentPicker.addEventListener('input', e => {
      const color = e.target.value;
      syncColorInputs('accent', color);
      portfolioData.settings.accentColor = color;
      scheduleAutoSave();
      triggerPreviewUpdate();
    });
  }
  if (accentHex) {
    accentHex.addEventListener('input', e => {
      const val = e.target.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        portfolioData.settings.accentColor = val;
        accentPicker.value = val;
        accentPreview.style.background = val;
        scheduleAutoSave();
        triggerPreviewUpdate();
      }
    });
  }
  document.querySelectorAll('.color-preset[data-color]').forEach(preset => {
    preset.addEventListener('click', () => {
      const section = preset.closest('.form-group');
      const isAccent = section?.contains(accentPicker);
      const color = preset.dataset.color;
      if (isAccent) {
        portfolioData.settings.accentColor = color;
        syncColorInputs('accent', color);
        section.querySelectorAll('.color-preset').forEach(p => p.classList.toggle('active', p === preset));
      } else {
        portfolioData.settings.backgroundColor = color;
        syncColorInputs('bg', color);
        section.querySelectorAll('.color-preset').forEach(p => p.classList.toggle('active', p === preset));
      }
      scheduleAutoSave();
      triggerPreviewUpdate();
    });
  });

  // Background color
  const bgPicker = document.getElementById('bgColorPicker');
  const bgHex = document.getElementById('bgColorHex');
  const bgPreview = document.getElementById('bgColorPreview');

  if (bgPicker) {
    bgPicker.addEventListener('input', e => {
      const color = e.target.value;
      syncColorInputs('bg', color);
      portfolioData.settings.backgroundColor = color;
      scheduleAutoSave();
      triggerPreviewUpdate();
    });
  }
  if (bgHex) {
    bgHex.addEventListener('input', e => {
      const val = e.target.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        portfolioData.settings.backgroundColor = val;
        bgPicker.value = val;
        bgPreview.style.background = val;
        scheduleAutoSave();
        triggerPreviewUpdate();
      }
    });
  }

  // Typography
  document.getElementById('typographySelect')?.addEventListener('change', e => {
    portfolioData.settings.typographyStyle = e.target.value;
    scheduleAutoSave();
    triggerPreviewUpdate();
  });

  // Grid layout
  document.querySelectorAll('.grid-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.grid-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      portfolioData.settings.gridLayout = opt.dataset.grid;
      scheduleAutoSave();
      triggerPreviewUpdate();
    });
  });

  // Section visibility toggles
  ['About', 'Skills', 'Projects', 'Contact'].forEach(section => {
    const toggle = document.getElementById('toggle' + section);
    toggle?.addEventListener('change', () => {
      portfolioData.settings.sections[section.toLowerCase()] = toggle.checked;
      scheduleAutoSave();
      triggerPreviewUpdate();
    });
  });

  // ── Top bar buttons ────────────────────────────────────────
  document.getElementById('resetBtn')?.addEventListener('click', () => {
    document.getElementById('resetModal').classList.add('open');
  });
  document.getElementById('resetCancelBtn')?.addEventListener('click', () => {
    document.getElementById('resetModal').classList.remove('open');
  });
  document.getElementById('resetConfirmBtn')?.addEventListener('click', () => {
    portfolioData = PortfoliaStorage.reset();
    populateForm();
    renderProjects();
    renderSocialLinks();
    document.getElementById('resetModal').classList.remove('open');
    triggerPreviewUpdate();
    updateSaveStatus(false);
    showToast('Portfolio reset to sample data.', 'info');
  });

  document.getElementById('exportBtn')?.addEventListener('click', () => {
    PortfoliaStorage.save(portfolioData);
    if (window.PortfoliaExport) {
      window.PortfoliaExport.exportHTML(portfolioData);
    }
  });

  document.getElementById('previewFullscreenBtn')?.addEventListener('click', () => {
    window.open('preview.html', '_blank');
  });

  // ── Close modal on backdrop click ─────────────────────────
  document.getElementById('resetModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
  });

  // ═══════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════

  // Populate all form fields from portfolioData
  function populateForm() {
    const p = portfolioData.profile;
    setVal('profileName', p.name);
    setVal('profileTitle', p.title);
    setVal('profileBio', p.bio);
    setVal('profileLocation', p.location);
    setVal('profileEmail', p.email);
    setVal('profileWebsite', p.website);
    setVal('aboutText', portfolioData.about);

    if (bioCount) bioCount.textContent = (p.bio || '').length;

    updateProfileImagePreview(p.profileImage);

    // Skills
    const container = document.getElementById('skillsContainer');
    if (container) {
      // Remove existing tags but keep input
      container.querySelectorAll('.skill-tag').forEach(t => t.remove());
      portfolioData.skills.forEach(skill => renderSkillTag(skill));
    }

    // Settings
    const s = portfolioData.settings;
    syncColorInputs('accent', s.accentColor || '#B7A5D6');
    syncColorInputs('bg', s.backgroundColor || '#F7F5F0');

    // Template selection
    document.querySelectorAll('.template-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.template === s.template);
    });

    // Typography
    const typoSel = document.getElementById('typographySelect');
    if (typoSel) typoSel.value = s.typographyStyle || 'serif';

    // Grid layout
    document.querySelectorAll('.grid-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.grid === (s.gridLayout || 'masonry'));
    });

    // Section toggles
    if (s.sections) {
      ['about', 'skills', 'projects', 'contact'].forEach(sec => {
        const t = document.getElementById('toggle' + sec.charAt(0).toUpperCase() + sec.slice(1));
        if (t) t.checked = s.sections[sec] !== false;
      });
    }
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }

  function syncColorInputs(type, color) {
    if (type === 'accent') {
      const picker = document.getElementById('accentColorPicker');
      const hex = document.getElementById('accentColorHex');
      const prev = document.getElementById('accentColorPreview');
      if (picker) picker.value = color;
      if (hex) hex.value = color;
      if (prev) prev.style.background = color;
    } else {
      const picker = document.getElementById('bgColorPicker');
      const hex = document.getElementById('bgColorHex');
      const prev = document.getElementById('bgColorPreview');
      if (picker) picker.value = color;
      if (hex) hex.value = color;
      if (prev) prev.style.background = color;
    }
  }

  function updateProfileImagePreview(dataUrl) {
    const wrap = document.getElementById('profileImgWrap');
    const removeBtn = document.getElementById('removeProfileImg');
    if (!wrap) return;
    if (dataUrl) {
      wrap.innerHTML = `<img src="${dataUrl}" alt="Profile" />`;
      if (removeBtn) removeBtn.style.display = '';
    } else {
      wrap.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
      if (removeBtn) removeBtn.style.display = 'none';
    }
  }

  // ── Skills ────────────────────────────────────────────────
  function renderSkillTag(skill) {
    const container = document.getElementById('skillsContainer');
    const input = document.getElementById('skillInput');
    if (!container || !input) return;
    const tag = document.createElement('div');
    tag.className = 'skill-tag';
    tag.innerHTML = `<span>${escapeHtml(skill)}</span><button type="button" aria-label="Remove ${escapeHtml(skill)}">×</button>`;
    tag.querySelector('button').addEventListener('click', () => removeSkill(skill));
    container.insertBefore(tag, input);
  }

  function removeSkill(skill) {
    portfolioData.skills = portfolioData.skills.filter(s => s !== skill);
    const container = document.getElementById('skillsContainer');
    container?.querySelectorAll('.skill-tag').forEach(tag => {
      if (tag.querySelector('span')?.textContent === skill) tag.remove();
    });
    scheduleAutoSave();
    triggerPreviewUpdate();
  }

  // ── Social Links ──────────────────────────────────────────
  function renderSocialLinks() {
    const list = document.getElementById('socialLinksList');
    if (!list) return;
    list.innerHTML = '';
    portfolioData.socialLinks.forEach((link, idx) => {
      const row = document.createElement('div');
      row.className = 'social-link-item';
      row.innerHTML = `
        <select class="form-select" data-idx="${idx}" data-field="platform">
          ${['Instagram','Behance','LinkedIn','Twitter/X','Dribbble','GitHub','YouTube','TikTok','Pinterest','Website'].map(p =>
            `<option value="${p}" ${link.platform === p ? 'selected' : ''}>${p}</option>`
          ).join('')}
        </select>
        <input type="url" class="form-input" data-idx="${idx}" data-field="url" value="${escapeHtml(link.url)}" placeholder="https://" />
        <button class="social-link-remove" data-idx="${idx}" aria-label="Remove link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      `;
      list.appendChild(row);
    });

    // Bind events
    list.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('change', updateSocialLink);
      el.addEventListener('input', updateSocialLink);
    });
    list.querySelectorAll('.social-link-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        portfolioData.socialLinks.splice(idx, 1);
        renderSocialLinks();
        scheduleAutoSave();
        triggerPreviewUpdate();
      });
    });
  }

  function updateSocialLink(e) {
    const idx = parseInt(e.target.dataset.idx);
    const field = e.target.dataset.field;
    portfolioData.socialLinks[idx][field] = e.target.value;
    scheduleAutoSave();
    triggerPreviewUpdate();
  }

  // ── Projects ──────────────────────────────────────────────
  function renderProjects() {
    const list = document.getElementById('projectList');
    if (!list) return;
    list.innerHTML = '';

    if (portfolioData.projects.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎨</div>
          <p>No projects yet. Add your first creative project!</p>
        </div>`;
      return;
    }

    portfolioData.projects.forEach((project, idx) => {
      const card = document.createElement('div');
      card.className = 'project-card-editor';
      card.dataset.id = project.id;

      const thumbContent = project.image
        ? `<img src="${project.image}" alt="${escapeHtml(project.title)}" />`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`;

      card.innerHTML = `
        <div class="project-card-header">
          <div class="project-card-thumb">${thumbContent}</div>
          <div class="project-card-info">
            <div class="project-card-title">${escapeHtml(project.title)}</div>
            <div class="project-card-meta">${escapeHtml(project.category)} · ${escapeHtml(project.year)}</div>
          </div>
          <div class="project-card-actions">
            <button class="project-action-btn" data-action="toggle">Edit</button>
            <button class="project-action-btn delete" data-action="delete">Delete</button>
          </div>
        </div>
        <div class="project-card-body">
          <div class="form-group" style="margin-top:0.75rem;">
            <label class="form-label">Project Title</label>
            <input type="text" class="form-input proj-input" data-field="title" value="${escapeHtml(project.title)}" maxlength="80" />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea proj-input" data-field="description" rows="3" maxlength="500">${escapeHtml(project.description)}</textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-select proj-input" data-field="category">
                ${['Illustration','Graphic Design','UI/UX Design','Branding','Photography','Other'].map(c =>
                  `<option value="${c}" ${project.category === c ? 'selected' : ''}>${c}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Year</label>
              <input type="text" class="form-input proj-input" data-field="year" value="${escapeHtml(project.year)}" maxlength="4" placeholder="${new Date().getFullYear()}" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tools Used <span style="font-weight:400;color:var(--text-muted);">(comma separated)</span></label>
            <input type="text" class="form-input proj-input" data-field="tools" value="${escapeHtml((project.tools || []).join(', '))}" placeholder="Figma, Illustrator..." maxlength="200" />
          </div>
          <div class="form-group">
            <label class="form-label">Project Image</label>
            <div class="image-upload-area" data-project-id="${project.id}">
              <input type="file" accept="image/*" class="proj-image-input" data-project-id="${project.id}" />
              ${project.image
                ? `<img src="${project.image}" class="image-upload-preview visible" alt="preview" />`
                : `<div class="image-upload-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>`
              }
              <div class="image-upload-text"><strong>Click to upload</strong> or drag &amp; drop</div>
              <div class="image-upload-meta">JPG, PNG, WebP · Max 2MB</div>
            </div>
            ${project.image ? `<button class="btn btn-sm" style="margin-top:0.4rem;color:var(--coral);border:1px solid var(--border);" data-action="remove-img" data-project-id="${project.id}">Remove Image</button>` : ''}
          </div>
          <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
            <button class="project-action-btn" style="flex:1;justify-content:center;" data-action="move-up" ${idx === 0 ? 'disabled' : ''}>▲ Move Up</button>
            <button class="project-action-btn" style="flex:1;justify-content:center;" data-action="move-down" ${idx === portfolioData.projects.length - 1 ? 'disabled' : ''}>▼ Move Down</button>
          </div>
        </div>
      `;

      // Bind project card events
      card.querySelector('[data-action="toggle"]').addEventListener('click', () => {
        card.querySelector('.project-card-body').classList.toggle('open');
      });

      card.querySelector('[data-action="delete"]').addEventListener('click', () => {
        if (confirm(`Delete "${project.title}"? This cannot be undone.`)) {
          portfolioData.projects.splice(idx, 1);
          renderProjects();
          scheduleAutoSave();
          triggerPreviewUpdate();
          showToast('Project deleted.', 'info');
        }
      });

      card.querySelector('[data-action="move-up"]')?.addEventListener('click', () => {
        if (idx > 0) {
          [portfolioData.projects[idx-1], portfolioData.projects[idx]] = [portfolioData.projects[idx], portfolioData.projects[idx-1]];
          renderProjects();
          scheduleAutoSave();
          triggerPreviewUpdate();
        }
      });

      card.querySelector('[data-action="move-down"]')?.addEventListener('click', () => {
        if (idx < portfolioData.projects.length - 1) {
          [portfolioData.projects[idx], portfolioData.projects[idx+1]] = [portfolioData.projects[idx+1], portfolioData.projects[idx]];
          renderProjects();
          scheduleAutoSave();
          triggerPreviewUpdate();
        }
      });

      // Remove image button
      card.querySelector('[data-action="remove-img"]')?.addEventListener('click', () => {
        portfolioData.projects[idx].image = '';
        renderProjects();
        scheduleAutoSave();
        triggerPreviewUpdate();
      });

      // Field inputs
      card.querySelectorAll('.proj-input').forEach(input => {
        input.addEventListener('input', e => {
          const field = e.target.dataset.field;
          let val = e.target.value;
          if (field === 'tools') {
            portfolioData.projects[idx][field] = val.split(',').map(t => t.trim()).filter(Boolean);
          } else {
            portfolioData.projects[idx][field] = val;
          }
          // Update title in card header live
          if (field === 'title') {
            card.querySelector('.project-card-title').textContent = val || 'Untitled';
          }
          if (field === 'category' || field === 'year') {
            card.querySelector('.project-card-meta').textContent =
              `${portfolioData.projects[idx].category} · ${portfolioData.projects[idx].year}`;
          }
          scheduleAutoSave();
          triggerPreviewUpdate();
        });
        // Also handle select change
        if (input.tagName === 'SELECT') {
          input.addEventListener('change', e => {
            portfolioData.projects[idx][e.target.dataset.field] = e.target.value;
            card.querySelector('.project-card-meta').textContent =
              `${portfolioData.projects[idx].category} · ${portfolioData.projects[idx].year}`;
            scheduleAutoSave();
            triggerPreviewUpdate();
          });
        }
      });

      // Image upload
      const imgInput = card.querySelector('.proj-image-input');
      if (imgInput) {
        imgInput.addEventListener('change', async e => {
          const file = e.target.files[0];
          if (!file) return;
          const validation = PortfoliaStorage.validateImageFile(file);
          if (!validation.valid) {
            showToast(validation.error, 'error');
            return;
          }
          try {
            const dataUrl = await PortfoliaStorage.readFileAsDataURL(file);
            portfolioData.projects[idx].image = dataUrl;
            renderProjects();
            scheduleAutoSave();
            triggerPreviewUpdate();
            // Re-expand the card
            const updatedCard = document.querySelector(`[data-id="${project.id}"] .project-card-body`);
            if (updatedCard) updatedCard.classList.add('open');
            showToast('Project image uploaded!', 'success');
          } catch {
            showToast('Failed to read image file.', 'error');
          }
          e.target.value = '';
        });

        // Drag and drop
        const uploadArea = card.querySelector('.image-upload-area');
        if (uploadArea) {
          uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
          uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
          uploadArea.addEventListener('drop', async e => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer?.files[0];
            if (!file) return;
            const validation = PortfoliaStorage.validateImageFile(file);
            if (!validation.valid) { showToast(validation.error, 'error'); return; }
            try {
              const dataUrl = await PortfoliaStorage.readFileAsDataURL(file);
              portfolioData.projects[idx].image = dataUrl;
              renderProjects();
              scheduleAutoSave();
              triggerPreviewUpdate();
            } catch { showToast('Failed to read image file.', 'error'); }
          });
        }
      }

      list.appendChild(card);
    });
  }

  // ── Autosave logic ────────────────────────────────────────
  function scheduleAutoSave() {
    isDirty = true;
    updateSaveStatus(true);
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      const success = PortfoliaStorage.save(portfolioData);
      if (success) {
        isDirty = false;
        updateSaveStatus(false);
      }
    }, 800);
  }

  function updateSaveStatus(unsaved) {
    const dot = document.getElementById('saveStatusDot');
    const text = document.getElementById('saveStatusText');
    if (dot) dot.classList.toggle('unsaved', unsaved);
    if (text) text.textContent = unsaved ? 'Unsaved changes...' : 'All changes saved';
  }

  // ── Preview update trigger ─────────────────────────────────
  function triggerPreviewUpdate() {
    if (window.PortfoliaPreview) {
      window.PortfoliaPreview.render(portfolioData);
    }
  }

  // ── Utility ───────────────────────────────────────────────
  function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]]) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
  }

});
