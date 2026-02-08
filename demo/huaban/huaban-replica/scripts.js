/**
 * 花瓣网 Materials 页面 - 交互脚本
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initSearchBar();
  initSidebar();
  initCalendarCards();
  initCategoryTabs();
  initScrollAnimations();
  initCardHoverEffects();
  initSmoothScroll();
});

/**
 * Search Bar Functionality
 */
function initSearchBar() {
  const searchInput = document.querySelector('.search-bar__input');
  const searchBtn = document.querySelector('.search-bar__btn');
  const searchBar = document.querySelector('.search-bar');

  if (!searchInput || !searchBtn) return;

  // Placeholder rotation
  const placeholders = [
    '大家都在搜：马年🐎',
    '大家都在搜：主图🖼️',
    '大家都在搜：马IP',
    '大家都在搜：背景 🟥',
    '大家都在搜：箭头⬆',
    '大家都在搜：灯笼🏮',
    '大家都在搜：雪花❄',
    '大家都在搜：红包🧧'
  ];

  let currentPlaceholder = 0;

  function rotatePlaceholder() {
    searchInput.setAttribute('placeholder', placeholders[currentPlaceholder]);
    currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
  }

  // Initial placeholder
  rotatePlaceholder();

  // Rotate every 3 seconds
  setInterval(rotatePlaceholder, 3000);

  // Search functionality
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      console.log('Searching for:', query);
      // In production: window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  });

  // Enter key search
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  // Focus effects
  searchInput.addEventListener('focus', () => {
    searchBar.classList.add('search-bar--focused');
  });

  searchInput.addEventListener('blur', () => {
    searchBar.classList.remove('search-bar--focused');
  });
}

/**
 * Sidebar Navigation
 */
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const collapseBtn = document.querySelector('.sidebar__collapse-btn');
  const navItems = document.querySelectorAll('.sidebar__nav-item');

  if (!sidebar) return;

  // Collapse button functionality
  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('sidebar--collapsed');
    });
  }

  // Nav item hover tooltips
  navItems.forEach(item => {
    const tooltip = item.getAttribute('data-tooltip');
    if (tooltip) {
      item.addEventListener('mouseenter', () => {
        showTooltip(item, tooltip);
      });

      item.addEventListener('mouseleave', () => {
        hideTooltip();
      });
    }
  });
}

/**
 * Tooltip system
 */
let tooltipElement = null;

function showTooltip(target, text) {
  if (!tooltipElement) {
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'tooltip';
    tooltipElement.style.cssText = `
      position: fixed;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 1000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
    `;
    document.body.appendChild(tooltipElement);
  }

  const rect = target.getBoundingClientRect();
  tooltipElement.textContent = text;
  tooltipElement.style.left = `${rect.right + 10}px`;
  tooltipElement.style.top = `${rect.top + (rect.height / 2)}px`;
  tooltipElement.style.transform = 'translateY(-50%)';
  tooltipElement.style.opacity = '1';
}

function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.style.opacity = '0';
  }
}

/**
 * Calendar Cards Interaction
 */
function initCalendarCards() {
  const calendarCards = document.querySelectorAll('.calendar-card');

  calendarCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove active from all
      calendarCards.forEach(c => c.classList.remove('calendar-card--active'));
      // Add active to clicked
      card.classList.add('calendar-card--active');
    });
  });
}

/**
 * Category Tabs
 */
function initCategoryTabs() {
  const tabContainers = document.querySelectorAll('.category-tabs');

  tabContainers.forEach(container => {
    const tabs = container.querySelectorAll('.category-tab');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active from siblings
        tabs.forEach(t => t.classList.remove('category-tab--active'));
        // Add active to clicked
        tab.classList.add('category-tab--active');
      });
    });
  });
}

/**
 * Scroll-triggered Animations
 */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe sections
  const sections = document.querySelectorAll('.calendar-section, .trend-section, .category-section, .vip-promo-section');
  sections.forEach(section => {
    section.style.opacity = '0';
    observer.observe(section);
  });

  // Observe cards with stagger
  const cardContainers = document.querySelectorAll('.calendar-cards, .trend-cards, .category-cards, .element-cards, .video-cards');
  cardContainers.forEach(container => {
    const cards = container.children;
    Array.from(cards).forEach((card, index) => {
      card.style.opacity = '0';
      card.style.animationDelay = `${index * 0.05}s`;

      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            cardObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);

      cardObserver.observe(card);
    });
  });
}

/**
 * Card Hover Effects
 */
function initCardHoverEffects() {
  // Topic cards
  const topicCards = document.querySelectorAll('.topic-card');
  topicCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.02)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
    });
  });

  // Category cards
  const categoryCards = document.querySelectorAll('.category-card, .trend-card, .video-card');
  categoryCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
      card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    });
  });
}

/**
 * Smooth Scroll
 */
function initSmoothScroll() {
  // Add smooth scroll to anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Horizontal Scroll with Mouse Wheel
 */
function initHorizontalScroll() {
  const scrollContainers = document.querySelectorAll('.calendar-cards, .trend-cards, .category-cards, .element-cards, .video-cards, .category-tabs');

  scrollContainers.forEach(container => {
    container.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  });
}

// Initialize horizontal scroll
initHorizontalScroll();

/**
 * Lazy Load Images
 */
function initLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });

  images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy load
initLazyLoad();

/**
 * Login Button Handler
 */
const loginBtn = document.querySelector('.login-prompt__btn');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    console.log('Login clicked');
    // In production: open login modal or redirect
  });
}

/**
 * VIP Button Handler
 */
const vipBtns = document.querySelectorAll('.vip-card__btn, .vip-promo-card__btn');
vipBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('VIP button clicked');
    // In production: navigate to VIP page
  });
});

/**
 * Floating Panel Actions
 */
const floatingBtns = document.querySelectorAll('.floating-panel__btn');
floatingBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    switch(index) {
      case 0:
        console.log('Customer service clicked');
        break;
      case 1:
        console.log('Feedback clicked');
        break;
      default:
        break;
    }
  });
});

/**
 * Back to Top
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Add back to top functionality
const backToTopBtn = document.querySelector('.floating-panel__btn--top');
if (backToTopBtn) {
  backToTopBtn.addEventListener('click', scrollToTop);
}

// Show/hide back to top based on scroll
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const floatingPanel = document.querySelector('.floating-panel');

  if (floatingPanel) {
    if (scrollY > 500) {
      floatingPanel.classList.add('floating-panel--visible');
    } else {
      floatingPanel.classList.remove('floating-panel--visible');
    }
  }
});
