// Client-side interactions for Islamic Library System
// Supports Light/Dark Theme, English/Arabic Bilingual Switch, and Mobile Navigation

const translations = {
  en: {
    brand_title: 'Islamic Library',
    brand_subtitle: 'Shelf Locator & Catalogue',
    nav_find_books: 'Find Books',
    nav_logout: 'Logout',
    nav_admin_login: 'Admin Login',
    theme_text: 'Theme',
    
    // Admin Sub-Navigation
    admin_nav_dashboard: 'Dashboard',
    admin_nav_add_book: 'Add Book',
    admin_nav_import_csv: 'Import CSV',
    admin_nav_demo_csv: 'Demo CSV',
    admin_nav_settings: 'Credentials & Settings',
    admin_dashboard_title: 'Library Administration Dashboard',
    admin_dashboard_subtitle: 'Manage inventory, catalog records, and physical shelf assignments.',

    // Public Home
    hero_badge: 'Islamic Library Catalogue',
    hero_title: 'Find Books & Locate Exact Shelves',
    hero_desc: 'Quickly discover literature by book title, author, category, or library code. All search criteria are completely optional.',
    search_placeholder: 'Search by book name, author, category, library code, or shelf number...',
    placeholder_author: 'Author name...',
    btn_search: 'Search',
    filter_category: 'Category',
    filter_shelf: 'Exact Shelf',
    filter_author: 'Author',
    filter_sort: 'Sort By',
    opt_all_categories: 'All Categories (Optional)',
    opt_all_shelves: 'All Shelves (Optional)',
    sort_newest: 'Recently Added',
    sort_title_asc: 'Book Title (A-Z)',
    sort_author_asc: 'Author (A-Z)',
    sort_shelf_asc: 'Shelf Number'
  },
  ar: {
    brand_title: 'المكتبة الإسلامية',
    brand_subtitle: 'دليل الرفوف وفهرس الكتب',
    nav_find_books: 'البحث عن كتاب',
    nav_logout: 'تسجيل الخروج',
    nav_admin_login: 'دخول المشرف',
    theme_text: 'المظهر',

    // Admin Sub-Navigation
    admin_nav_dashboard: 'لوحة التحكم',
    admin_nav_add_book: 'إضافة كتاب',
    admin_nav_import_csv: 'استيراد CSV',
    admin_nav_demo_csv: 'نموذج CSV',
    admin_nav_settings: 'الإعدادات وبيانات الدخول',
    admin_dashboard_title: 'لوحة تحكم إدارة المكتبة',
    admin_dashboard_subtitle: 'إدارة المخزون وفهارس الكتب وتوزيعها على الرفوف.',

    // Public Home
    hero_badge: 'فهرس المكتبة الإسلامية',
    hero_title: 'ابحث عن الكتب وحدد مكان الرف بدقة',
    hero_desc: 'ابحث بسهولة باسم الكتاب، المؤلف، التصنيف، أو الرمز. جميع حقول البحث اختيارية.',
    search_placeholder: 'ابحث باسم الكتاب، المؤلف، التصنيف، الرمز، أو رقم الرف...',
    placeholder_author: 'اسم المؤلف...',
    btn_search: 'بحث',
    filter_category: 'التصنيف',
    filter_shelf: 'الرف المحدد',
    filter_author: 'المؤلف',
    filter_sort: 'ترتيب حسب',
    opt_all_categories: 'جميع التصنيفات (اختياري)',
    opt_all_shelves: 'جميع الرفوف (اختياري)',
    sort_newest: 'المضاف حديثاً',
    sort_title_asc: 'اسم الكتاب (أ - ي)',
    sort_author_asc: 'اسم المؤلف (أ - ي)',
    sort_shelf_asc: 'رقم الرف'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Theme Management (Light / Dark)
  // ==========================================
  const themeToggle = document.getElementById('themeToggle');
  
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('library-theme', theme);
  }

  // Get current active theme
  let currentTheme = localStorage.getItem('library-theme') || 'light';
  applyTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = (currentTheme === 'dark') ? 'light' : 'dark';
      applyTheme(currentTheme);
    });
  }

  // ==========================================
  // 2. Language Management (English / Arabic RTL)
  // ==========================================
  const langToggle = document.getElementById('langToggle');
  const langLabel = document.getElementById('langLabel');

  function applyLanguage(lang) {
    const isArabic = (lang === 'ar');
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
    localStorage.setItem('library-lang', lang);

    // Update Toggle Button Label
    if (langLabel) {
      langLabel.textContent = isArabic ? 'English' : 'العربية';
    }

    // Translate DOM elements marked with data-i18n
    const dict = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Translate Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });
  }

  let currentLang = localStorage.getItem('library-lang') || 'en';
  applyLanguage(currentLang);

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      currentLang = (currentLang === 'ar') ? 'en' : 'ar';
      applyLanguage(currentLang);
    });
  }

  // ==========================================
  // 3. Mobile Navigation Toggle
  // ==========================================
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      siteNav.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !siteNav.contains(e.target)) {
        siteNav.classList.remove('open');
      }
    });
  }

  // ==========================================
  // 4. Auto-dismiss Alerts
  // ==========================================
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

  // ==========================================
  // 5. Quick Keyboard Shortcut: '/' to Search
  // ==========================================
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    document.addEventListener('keydown', (e) => {
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
