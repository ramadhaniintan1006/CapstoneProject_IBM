/**
 * Portfolia — app.js
 * Landing page interactions, navigation, animations
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky nav scroll effect ──────────────────────────────
  const nav = document.getElementById('siteNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // ── Mobile menu ───────────────────────────────────────────
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileMenuClose');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
    mobileClose?.addEventListener('click', () => mobileMenu.classList.remove('open'));

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  // ── Smooth scroll for anchor links ───────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Intersection Observer for fade-up animations ──────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ── Stagger animation for grid children ──────────────────
  document.querySelectorAll('.features-grid, .templates-grid, .steps-grid').forEach(grid => {
    const children = grid.querySelectorAll('.feature-card, .template-preview-card, .step-item');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.07}s`;
    });
  });

});

// ── Toast notification system (shared) ──────────────────────
window.showToast = function(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-size:1rem;">${icons[type] || icons.info}</span> ${escapeHtml(message)}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => toast.remove(), 320);
  }, duration);
};

// ── Shared HTML escaping utility ──────────────────────────────
window.escapeHtml = function(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// ── Validate URL utility ──────────────────────────────────────
window.safeUrl = function(url) {
  if (!url) return '#';
  try {
    const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
    if (['http:', 'https:'].includes(parsed.protocol)) return parsed.href;
  } catch (_) {}
  return '#';
};
