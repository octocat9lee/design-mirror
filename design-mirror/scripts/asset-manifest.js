// Design Mirror: Asset Manifest (paste into evaluate_script)
//
// Exposes:
// - window.__dmAssets.scan(): scans all assets (fonts, icons, libraries, images)
//
// This file is intentionally framework-agnostic and safe to paste as an IIFE.

(() => {
  if (window.__dmAssets?.installed) return;

  // === Font Detection ===

  function scanFonts() {
    const fonts = {
      loaded: [],
      stacks: new Set(),
      sources: []
    };

    // 1. Use document.fonts API if available
    if (document.fonts) {
      try {
        document.fonts.forEach(font => {
          fonts.loaded.push({
            family: font.family.replace(/^["']|["']$/g, ''),
            weight: font.weight,
            style: font.style,
            status: font.status
          });
        });
      } catch (e) {}
    }

    // 2. Scan @font-face rules in stylesheets
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;

        for (const rule of rules) {
          if (rule.type === CSSRule.FONT_FACE_RULE) {
            const style = rule.style;
            const src = style.getPropertyValue('src');

            // Extract URL from src
            const urlMatch = src?.match(/url\(["']?([^"')]+)["']?\)/);

            fonts.sources.push({
              family: style.getPropertyValue('font-family')?.replace(/^["']|["']$/g, ''),
              weight: style.getPropertyValue('font-weight') || '400',
              style: style.getPropertyValue('font-style') || 'normal',
              url: urlMatch ? urlMatch[1] : null,
              format: src?.match(/format\(["']?([^"')]+)["']?\)/)?.[1] || null,
              unicodeRange: style.getPropertyValue('unicode-range') || null,
              fontDisplay: style.getPropertyValue('font-display') || null
            });
          }
        }
      } catch (e) {
        // Cross-origin
      }
    }

    // 3. Collect font-family stacks from body and common elements
    const elementsToCheck = [
      document.body,
      document.querySelector('h1'),
      document.querySelector('p'),
      document.querySelector('button'),
      document.querySelector('input')
    ].filter(Boolean);

    for (const el of elementsToCheck) {
      const fontFamily = getComputedStyle(el).fontFamily;
      if (fontFamily) {
        fonts.stacks.add(fontFamily);
      }
    }

    fonts.stacks = Array.from(fonts.stacks);

    // Deduplicate loaded fonts by family
    const uniqueFamilies = new Map();
    for (const font of fonts.loaded) {
      const key = `${font.family}-${font.weight}-${font.style}`;
      if (!uniqueFamilies.has(key)) {
        uniqueFamilies.set(key, font);
      }
    }
    fonts.loaded = Array.from(uniqueFamilies.values());

    return fonts;
  }

  // === Icon Detection ===

  function scanIcons() {
    const icons = {
      type: null,
      library: null,
      count: 0,
      samples: []
    };

    // 1. Check for icon fonts (iconfont, Font Awesome, etc.)
    const iconFontClasses = [
      { pattern: /^fa[bsrl]?-/, library: 'fontawesome' },
      { pattern: /^icon-/, library: 'iconfont' },
      { pattern: /^iconfont/, library: 'iconfont' },
      { pattern: /^material-icons/, library: 'material-icons' },
      { pattern: /^bi-/, library: 'bootstrap-icons' },
      { pattern: /^feather-/, library: 'feather' }
    ];

    const iconFontElements = document.querySelectorAll('[class*="icon"], [class*="fa-"], i[class]');
    for (const el of iconFontElements) {
      for (const { pattern, library } of iconFontClasses) {
        if (pattern.test(el.className)) {
          icons.type = 'icon-font';
          icons.library = library;
          icons.count++;
          if (icons.samples.length < 10) {
            icons.samples.push({
              className: el.className,
              selector: el.id ? `#${el.id}` : `.${Array.from(el.classList).slice(0, 2).join('.')}`
            });
          }
          break;
        }
      }
    }

    // 2. Check for inline SVG icons
    const svgIcons = document.querySelectorAll('svg');
    const inlineSvgCount = Array.from(svgIcons).filter(svg => {
      const rect = svg.getBoundingClientRect();
      // Icon-like SVGs are usually small and square-ish
      return rect.width > 10 && rect.width < 100 && rect.height > 10 && rect.height < 100;
    }).length;

    if (inlineSvgCount > icons.count) {
      icons.type = 'inline-svg';
      icons.count = inlineSvgCount;
      icons.library = 'custom';

      // Sample some SVGs
      icons.samples = Array.from(svgIcons).slice(0, 10).map(svg => {
        const parent = svg.parentElement;
        return {
          viewBox: svg.getAttribute('viewBox'),
          width: svg.getAttribute('width'),
          height: svg.getAttribute('height'),
          parentClass: parent?.className ? String(parent.className).slice(0, 50) : null
        };
      });
    }

    // 3. Check for SVG sprite usage
    const useElements = document.querySelectorAll('use[href], use[xlink\\:href]');
    if (useElements.length > 0) {
      icons.type = 'svg-sprite';
      icons.count = useElements.length;
      icons.samples = Array.from(useElements).slice(0, 10).map(use => ({
        href: use.getAttribute('href') || use.getAttribute('xlink:href')
      }));
    }

    return icons;
  }

  // === Third-party Library Detection ===

  function scanLibraries() {
    const libraries = {
      detected: [],
      evidence: {}
    };

    // Global variable detection
    const globalChecks = [
      { name: 'swiper', check: () => typeof window.Swiper !== 'undefined' },
      { name: 'gsap', check: () => typeof window.gsap !== 'undefined' },
      { name: 'scrolltrigger', check: () => typeof window.ScrollTrigger !== 'undefined' },
      { name: 'anime', check: () => typeof window.anime !== 'undefined' },
      { name: 'three', check: () => typeof window.THREE !== 'undefined' },
      { name: 'lottie', check: () => typeof window.lottie !== 'undefined' || typeof window.bodymovin !== 'undefined' },
      { name: 'jquery', check: () => typeof window.jQuery !== 'undefined' || typeof window.$ !== 'undefined' },
      { name: 'vue', check: () => typeof window.Vue !== 'undefined' || document.querySelector('[data-v-]') },
      { name: 'react', check: () => !!document.querySelector('[data-reactroot], [data-reactid]') || typeof window.React !== 'undefined' },
      { name: 'alpine', check: () => typeof window.Alpine !== 'undefined' || document.querySelector('[x-data]') },
      { name: 'lodash', check: () => typeof window._ !== 'undefined' && typeof window._.VERSION === 'string' }
    ];

    for (const { name, check } of globalChecks) {
      try {
        if (check()) {
          libraries.detected.push(name);
          libraries.evidence[name] = { global: true };

          // Try to get version
          if (name === 'swiper' && window.Swiper?.version) {
            libraries.evidence[name].version = window.Swiper.version;
          } else if (name === 'gsap' && window.gsap?.version) {
            libraries.evidence[name].version = window.gsap.version;
          } else if (name === 'jquery' && window.jQuery?.fn?.jquery) {
            libraries.evidence[name].version = window.jQuery.fn.jquery;
          }
        }
      } catch (e) {}
    }

    // DOM signature detection
    const domChecks = [
      { name: 'swiper', selector: '.swiper, .swiper-wrapper, .swiper-slide' },
      { name: 'slick', selector: '.slick-slider, .slick-track' },
      { name: 'owl-carousel', selector: '.owl-carousel, .owl-stage' },
      { name: 'splide', selector: '.splide, .splide__track' },
      { name: 'lottie', selector: '[data-animation], .lottie, lottie-player' }
    ];

    for (const { name, selector } of domChecks) {
      if (document.querySelector(selector)) {
        if (!libraries.detected.includes(name)) {
          libraries.detected.push(name);
          libraries.evidence[name] = libraries.evidence[name] || {};
        }
        libraries.evidence[name].domSignature = selector;
      }
    }

    // CSS variable detection
    const cssVarChecks = [
      { name: 'swiper', prefix: '--swiper-' },
      { name: 'toastify', prefix: '--toastify-' },
      { name: 'tailwind', prefix: '--tw-' }
    ];

    const rootStyle = getComputedStyle(document.documentElement);
    for (const { name, prefix } of cssVarChecks) {
      // Check if any variable with this prefix exists
      try {
        for (const sheet of document.styleSheets) {
          try {
            const rules = sheet.cssRules || sheet.rules;
            if (!rules) continue;

            for (const rule of rules) {
              if (rule.selectorText === ':root' && rule.style) {
                for (let i = 0; i < rule.style.length; i++) {
                  if (rule.style[i].startsWith(prefix)) {
                    if (!libraries.detected.includes(name)) {
                      libraries.detected.push(name);
                      libraries.evidence[name] = libraries.evidence[name] || {};
                    }
                    libraries.evidence[name].cssVars = true;
                    break;
                  }
                }
              }
            }
          } catch (e) {}
        }
      } catch (e) {}
    }

    // Script URL detection
    const scriptHints = [
      { name: 'swiper', pattern: /swiper/i },
      { name: 'gsap', pattern: /gsap/i },
      { name: 'lottie', pattern: /lottie|bodymovin/i },
      { name: 'three', pattern: /three\.js|three\.min/i },
      { name: 'anime', pattern: /anime\.min|animejs/i }
    ];

    for (const script of document.scripts) {
      if (!script.src) continue;
      for (const { name, pattern } of scriptHints) {
        if (pattern.test(script.src)) {
          if (!libraries.detected.includes(name)) {
            libraries.detected.push(name);
            libraries.evidence[name] = libraries.evidence[name] || {};
          }
          libraries.evidence[name].scriptUrl = script.src;
        }
      }
    }

    return libraries;
  }

  // === Image Asset Detection ===

  function scanImages() {
    const images = {
      formats: new Set(),
      lazyLoading: false,
      cdnPatterns: new Set(),
      count: 0,
      samples: []
    };

    const imgElements = document.querySelectorAll('img');
    images.count = imgElements.length;

    for (const img of imgElements) {
      const src = img.src || img.dataset.src;
      if (!src) continue;

      // Detect format
      const formatMatch = src.match(/\.(png|jpg|jpeg|gif|webp|avif|svg)(\?|$)/i);
      if (formatMatch) {
        images.formats.add(formatMatch[1].toLowerCase());
      }

      // Detect lazy loading
      if (img.loading === 'lazy' || img.dataset.src || img.dataset.lazy) {
        images.lazyLoading = true;
      }

      // Detect CDN patterns
      try {
        const url = new URL(src);
        if (url.hostname !== location.hostname) {
          images.cdnPatterns.add(url.hostname);
        }
      } catch (e) {}

      // Sample
      if (images.samples.length < 5) {
        const rect = img.getBoundingClientRect();
        images.samples.push({
          src: src.slice(0, 100),
          alt: img.alt?.slice(0, 50),
          width: rect.width,
          height: rect.height,
          loading: img.loading
        });
      }
    }

    images.formats = Array.from(images.formats);
    images.cdnPatterns = Array.from(images.cdnPatterns);

    return images;
  }

  // === Main Scan Function ===

  function scan() {
    return {
      fonts: scanFonts(),
      icons: scanIcons(),
      libraries: scanLibraries(),
      images: scanImages(),
      meta: {
        url: location.href,
        title: document.title,
        timestamp: new Date().toISOString()
      }
    };
  }

  // === Expose API ===

  window.__dmAssets = {
    installed: true,
    version: '1.0.0',

    // Main method
    scan,

    // Individual scanners (for targeted use)
    scanFonts,
    scanIcons,
    scanLibraries,
    scanImages
  };
})();
