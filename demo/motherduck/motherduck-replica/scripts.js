// MotherDuck Homepage Replica - scripts.js

document.addEventListener('DOMContentLoaded', () => {
  // ========== Header Scroll Effect ==========
  const header = document.querySelector('.header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add border when scrolled
    if (currentScroll > 10) {
      header.style.borderBottomColor = 'rgba(56, 56, 56, 0.1)';
      header.style.backgroundColor = 'rgba(244, 239, 234, 0.95)';
      header.style.backdropFilter = 'blur(8px)';
    } else {
      header.style.borderBottomColor = 'transparent';
      header.style.backgroundColor = 'rgb(244, 239, 234)';
      header.style.backdropFilter = 'none';
    }

    lastScroll = currentScroll;
  });

  // ========== Button Hover Effects ==========
  const buttons = document.querySelectorAll('.btn:not(.btn-disabled)');

  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translate(-2px, -2px)';
      btn.style.boxShadow = '4px 4px 0 rgb(56, 56, 56)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.boxShadow = 'none';
    });
  });

  // ========== Demo Tabs ==========
  const demoTabs = document.querySelectorAll('.demo-tab');

  demoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs
      demoTabs.forEach(t => t.classList.remove('active'));
      // Add active to clicked tab
      tab.classList.add('active');
    });
  });

  // ========== Form Validation ==========
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (emailInput && submitBtn) {
      emailInput.addEventListener('input', () => {
        const isValid = emailInput.value.includes('@') && emailInput.value.includes('.');

        if (isValid) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('btn-disabled');
          submitBtn.classList.add('btn-primary');
        } else {
          submitBtn.disabled = true;
          submitBtn.classList.add('btn-disabled');
          submitBtn.classList.remove('btn-primary');
        }
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Form submitted! (Demo only)');
    });
  });

  // ========== Scroll Animations ==========
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.who-card, .dw-ai-card, .testimonial-card, .community-card, .duckling-card');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '0';
          entry.target.style.transform = 'translateY(20px)';

          setTimeout(() => {
            entry.target.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
  };

  animateOnScroll();

  // ========== Dropdown Menus (Nav Buttons) ==========
  const navButtons = document.querySelectorAll('.nav-button');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle dropdown (placeholder - no actual dropdown content)
      btn.classList.toggle('active');

      // Close other dropdowns
      navButtons.forEach(other => {
        if (other !== btn) {
          other.classList.remove('active');
        }
      });
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-button')) {
      navButtons.forEach(btn => btn.classList.remove('active'));
    }
  });

  // ========== Smooth Scroll for Anchor Links ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // ========== Card Hover Effects ==========
  const cards = document.querySelectorAll('.who-card, .community-card, .ecosystem-item');

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    });
  });

  // ========== Marquee Pause on Hover ==========
  const marquees = document.querySelectorAll('.marquee-track');

  marquees.forEach(marquee => {
    marquee.addEventListener('mouseenter', () => {
      marquee.style.animationPlayState = 'paused';
    });

    marquee.addEventListener('mouseleave', () => {
      marquee.style.animationPlayState = 'running';
    });
  });

  // ========== Lazy Load Images (for future use with real images) ==========
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // ========== Console Easter Egg ==========
  console.log('%c🦆 MotherDuck Replica', 'font-size: 24px; font-weight: bold; color: #6FC2FF;');
  console.log('%cBuilt with love for design systems', 'font-size: 12px; color: #666;');
});
