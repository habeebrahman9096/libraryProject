// Client-side interactions for Islamic Library System
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      siteNav.classList.toggle('open');
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !siteNav.contains(e.target)) {
        siteNav.classList.remove('open');
      }
    });
  }

  // Auto-dismiss Flash Alerts after 6 seconds
  const alerts = document.querySelectorAll('.alert');
  if (alerts.length > 0) {
    setTimeout(() => {
      alerts.forEach((alert) => {
        alert.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-10px)';
        setTimeout(() => alert.remove(), 400);
      });
    }, 6000);
  }

  // Quick keyboard shortcut: '/' key focuses the search input on the home page
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    document.addEventListener('keydown', (e) => {
      // Ignore if user is already typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }
});
