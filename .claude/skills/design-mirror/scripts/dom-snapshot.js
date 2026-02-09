// Design Mirror: DOM Snapshot tool (paste into evaluate_script)
//
// Exposes:
// - window.__dmDom.capture(selector, opts): captures complete element info + styles + pseudo elements
// - window.__dmDom.captureMany(selectors): captures multiple elements
// - window.__dmDom.captureInteractive(): captures all interactive elements (buttons, links, inputs)
//
// This file is intentionally framework-agnostic and safe to paste as an IIFE.

(() => {
  if (window.__dmDom?.installed) return;

  // === Utility Functions (reused from motion-tools.js pattern) ===

  function cssPath(el) {
    if (!el || el.nodeType !== 1) return null;
    if (el.id) return `#${CSS.escape(el.id)}`;
    const parts = [];
    let cur = el;
    let depth = 0;
    while (cur && cur.nodeType === 1 && depth < 6) {
      let part = cur.tagName.toLowerCase();
      if (cur.classList && cur.classList.length) {
        part += Array.from(cur.classList).slice(0, 2).map(c => `.${CSS.escape(c)}`).join('');
      }
      const parent = cur.parentElement;
      if (parent) {
        const same = Array.from(parent.children).filter(c => c.tagName === cur.tagName);
        if (same.length > 1) part += `:nth-of-type(${same.indexOf(cur) + 1})`;
      }
      parts.unshift(part);
      if (parent?.id) {
        parts.unshift(`#${CSS.escape(parent.id)}`);
        break;
      }
      cur = parent;
      depth++;
    }
    return parts.join(' > ');
  }

  function describeElement(el) {
    if (!el || el.nodeType !== 1) return null;
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      className: el.className ? String(el.className).slice(0, 200) : null,
      path: cssPath(el),
      rect: {
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height)
      },
      text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100) || null
    };
  }

  // === Style Extraction ===

  const STYLE_PROPERTIES = [
    // Colors
    'color', 'backgroundColor', 'borderColor', 'outlineColor',
    // Background
    'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat',
    'backdropFilter',
    // Border
    'borderWidth', 'borderStyle', 'borderRadius',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',
    // Typography
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
    'letterSpacing', 'wordSpacing', 'textAlign', 'textDecoration', 'textTransform',
    'fontFeatureSettings', 'fontVariantNumeric',
    '-webkit-font-smoothing', '-moz-osx-font-smoothing',
    // Layout (basic)
    'display', 'position', 'overflow', 'visibility',
    // Effects
    'opacity', 'transform', 'filter', 'boxShadow', 'textShadow',
    // Transitions & Animations
    'transition', 'transitionProperty', 'transitionDuration', 'transitionTimingFunction', 'transitionDelay',
    'animation', 'animationName', 'animationDuration', 'animationTimingFunction',
    // Cursor & Interaction
    'cursor', 'pointerEvents', 'userSelect',
    // Accessibility
    'outline', 'outlineWidth', 'outlineStyle', 'outlineOffset'
  ];

  function extractStyles(el) {
    if (!el || el.nodeType !== 1) return null;
    const s = getComputedStyle(el);
    const styles = {};

    for (const prop of STYLE_PROPERTIES) {
      try {
        const value = s.getPropertyValue(prop) || s[prop];
        if (value && value !== 'none' && value !== 'normal' && value !== 'auto' && value !== '0px' && value !== 'rgba(0, 0, 0, 0)') {
          styles[prop] = value;
        }
      } catch (e) {
        // Some properties may not be accessible
      }
    }

    // Parse gradient from backgroundImage
    if (styles.backgroundImage && styles.backgroundImage.includes('gradient')) {
      styles.backgroundGradient = styles.backgroundImage;
    }

    return styles;
  }

  // === Pseudo Element Extraction ===

  const PSEUDO_STYLE_PROPERTIES = [
    'content', 'display', 'position',
    'color', 'backgroundColor', 'backgroundImage',
    'width', 'height', 'top', 'right', 'bottom', 'left',
    'borderWidth', 'borderStyle', 'borderColor', 'borderRadius',
    'opacity', 'transform', 'transition', 'animation'
  ];

  function extractPseudoStyles(el, pseudo) {
    if (!el || el.nodeType !== 1) return null;
    try {
      const s = getComputedStyle(el, pseudo);
      const content = s.content;

      // Skip if no content or content is 'none'
      if (!content || content === 'none' || content === 'normal') {
        // Check if it has visual presence via other means
        const display = s.display;
        const width = parseFloat(s.width);
        const height = parseFloat(s.height);
        if (display === 'none' || (width === 0 && height === 0)) {
          return null;
        }
      }

      const styles = {};
      for (const prop of PSEUDO_STYLE_PROPERTIES) {
        try {
          const value = s.getPropertyValue(prop) || s[prop];
          if (value && value !== 'none' && value !== 'normal' && value !== 'auto') {
            styles[prop] = value;
          }
        } catch (e) {}
      }

      return Object.keys(styles).length > 0 ? styles : null;
    } catch (e) {
      return null;
    }
  }

  function extractAllPseudo(el) {
    return {
      before: extractPseudoStyles(el, '::before'),
      after: extractPseudoStyles(el, '::after'),
      placeholder: el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea'
        ? extractPseudoStyles(el, '::placeholder')
        : null,
      selection: extractPseudoStyles(el, '::selection')
    };
  }

  // === Main Capture Functions ===

  function capture(selector, opts = {}) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return { ok: false, reason: 'Element not found', selector };

    const result = {
      ok: true,
      element: describeElement(el),
      styles: extractStyles(el),
      pseudo: extractAllPseudo(el)
    };

    // Optionally capture children
    if (opts.children) {
      const maxChildren = opts.maxChildren || 10;
      const children = Array.from(el.children).slice(0, maxChildren);
      result.children = children.map(child => ({
        element: describeElement(child),
        styles: extractStyles(child)
      }));
    }

    return result;
  }

  function captureMany(selectors) {
    return selectors.map(sel => capture(sel));
  }

  function captureInteractive() {
    const result = {
      buttons: [],
      links: [],
      inputs: [],
      selects: [],
      textareas: []
    };

    // Capture buttons (including button-like elements)
    const buttons = document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]');
    result.buttons = Array.from(buttons).slice(0, 20).map(el => ({
      element: describeElement(el),
      styles: extractStyles(el),
      pseudo: extractAllPseudo(el)
    }));

    // Capture links
    const links = document.querySelectorAll('a[href]');
    result.links = Array.from(links).slice(0, 20).map(el => ({
      element: describeElement(el),
      styles: extractStyles(el)
    }));

    // Capture inputs
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"])');
    result.inputs = Array.from(inputs).slice(0, 20).map(el => ({
      element: describeElement(el),
      styles: extractStyles(el),
      pseudo: extractAllPseudo(el),
      type: el.type || 'text'
    }));

    // Capture selects
    const selects = document.querySelectorAll('select');
    result.selects = Array.from(selects).slice(0, 10).map(el => ({
      element: describeElement(el),
      styles: extractStyles(el)
    }));

    // Capture textareas
    const textareas = document.querySelectorAll('textarea');
    result.textareas = Array.from(textareas).slice(0, 10).map(el => ({
      element: describeElement(el),
      styles: extractStyles(el),
      pseudo: extractAllPseudo(el)
    }));

    // Summary
    result.summary = {
      totalButtons: buttons.length,
      totalLinks: links.length,
      totalInputs: inputs.length,
      totalSelects: selects.length,
      totalTextareas: textareas.length,
      capturedButtons: result.buttons.length,
      capturedLinks: result.links.length,
      capturedInputs: result.inputs.length
    };

    return result;
  }

  // === Expose API ===

  window.__dmDom = {
    installed: true,
    version: '1.0.0',

    // Core methods
    capture,
    captureMany,
    captureInteractive,

    // Utility methods (exposed for reuse by other scripts)
    utils: {
      cssPath,
      describeElement,
      extractStyles,
      extractPseudoStyles,
      STYLE_PROPERTIES
    }
  };
})();
