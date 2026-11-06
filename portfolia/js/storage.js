/**
 * Portfolia — storage.js
 * Local Storage data model and persistence layer
 */

const STORAGE_KEY = 'portfolia_data';
const MAX_IMAGE_SIZE_MB = 2; // Max image size in MB
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

// ── Default / sample portfolio data ──────────────────────────
const DEFAULT_DATA = {
  profile: {
    name: 'Alex Rivera',
    title: 'Digital Illustrator & Visual Designer',
    bio: 'I create vibrant illustrations and visual stories that connect brands with people. Based in San Francisco, available worldwide.',
    location: 'San Francisco, CA',
    email: 'alex@example.com',
    website: 'www.alexrivera.design',
    profileImage: ''
  },
  about: 'I am a multidisciplinary creative professional with 7 years of experience crafting visual identities, illustrations, and digital experiences. My work blends traditional artistic sensibilities with modern design thinking.',
  skills: ['Adobe Illustrator', 'Figma', 'Procreate', 'Photoshop', 'Typography', 'Branding', 'UI Design'],
  projects: [
    {
      id: 'proj_001',
      title: 'Bloom Brand Identity',
      description: 'Complete brand identity design for a sustainable wellness startup, including logo, typography system, and brand guidelines.',
      category: 'Branding',
      tools: ['Adobe Illustrator', 'Figma'],
      year: '2024',
      image: ''
    },
    {
      id: 'proj_002',
      title: 'Dreamscape Editorial',
      description: 'A series of surrealist editorial illustrations for a contemporary art magazine exploring the intersection of nature and technology.',
      category: 'Illustration',
      tools: ['Procreate', 'Photoshop'],
      year: '2024',
      image: ''
    },
    {
      id: 'proj_003',
      title: 'Aura Mobile App',
      description: 'UI/UX design for a meditation and mindfulness app, featuring a calm visual system and intuitive user flows.',
      category: 'UI/UX Design',
      tools: ['Figma', 'Principle'],
      year: '2023',
      image: ''
    }
  ],
  socialLinks: [
    { platform: 'Instagram', url: 'https://instagram.com/' },
    { platform: 'Behance', url: 'https://behance.net/' },
    { platform: 'LinkedIn', url: 'https://linkedin.com/' }
  ],
  settings: {
    template: 'editorial',
    accentColor: '#B7A5D6',
    backgroundColor: '#F7F5F0',
    typographyStyle: 'serif',
    gridLayout: 'masonry',
    sections: {
      about: true,
      skills: true,
      projects: true,
      contact: true
    }
  }
};

// ── Load portfolio data from Local Storage ────────────────────
function loadPortfolio() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepClone(DEFAULT_DATA);

    const parsed = JSON.parse(raw);
    // Merge with defaults to handle missing keys gracefully
    return deepMerge(deepClone(DEFAULT_DATA), parsed);
  } catch (err) {
    console.warn('Portfolia: Could not load saved data, using defaults.', err);
    return deepClone(DEFAULT_DATA);
  }
}

// ── Save portfolio data to Local Storage ──────────────────────
function savePortfolio(data) {
  try {
    const serialized = JSON.stringify(data);
    // Estimate size: 5MB localStorage limit
    const sizeKB = (serialized.length * 2) / 1024;
    if (sizeKB > 4500) {
      console.warn(`Portfolia: Storage nearly full (${Math.round(sizeKB)}KB). Consider removing large images.`);
      window.showToast && window.showToast('Storage is almost full. Consider using smaller images.', 'warning');
    }
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      window.showToast && window.showToast('Storage full! Remove some images to save your portfolio.', 'error', 5000);
    } else {
      window.showToast && window.showToast('Could not save portfolio. Please try again.', 'error');
    }
    console.error('Portfolia: Save failed.', err);
    return false;
  }
}

// ── Reset portfolio to defaults ───────────────────────────────
function resetPortfolio() {
  localStorage.removeItem(STORAGE_KEY);
  return deepClone(DEFAULT_DATA);
}

// ── Check if portfolio has been customized ────────────────────
function isFirstVisit() {
  return !localStorage.getItem(STORAGE_KEY);
}

// ── Generate unique project ID ────────────────────────────────
function generateId() {
  return 'proj_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Validate image file ───────────────────────────────────────
function validateImageFile(file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPG, PNG, GIF, WebP, or SVG image.' };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: `Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is ${MAX_IMAGE_SIZE_MB}MB.` };
  }
  return { valid: true };
}

// ── Read file as Base64 data URL ──────────────────────────────
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

// ── Utility: Deep clone ───────────────────────────────────────
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ── Utility: Deep merge ───────────────────────────────────────
function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// ── Export all as global ──────────────────────────────────────
window.PortfoliaStorage = {
  load: loadPortfolio,
  save: savePortfolio,
  reset: resetPortfolio,
  isFirstVisit,
  generateId,
  validateImageFile,
  readFileAsDataURL,
  MAX_IMAGE_SIZE_MB,
  DEFAULT_DATA
};
