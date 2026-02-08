// Design Mirror: Layout Tools (paste into evaluate_script)
//
// Exposes:
// - window.__dmLayout.inspect(selector): inspects layout properties of a container
// - window.__dmLayout.skeleton(): captures page skeleton (major layout regions)
// - window.__dmLayout.auditContainers(): finds all flex/grid containers on the page
//
// This file is intentionally framework-agnostic and safe to paste as an IIFE.

(() => {
  if (window.__dmLayout?.installed) return;

  // === Utility Functions ===

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

  // === Layout Type Detection ===

  function getLayoutType(el) {
    if (!el || el.nodeType !== 1) return 'unknown';
    const s = getComputedStyle(el);
    const display = s.display;

    if (display === 'flex' || display === 'inline-flex') return 'flex';
    if (display === 'grid' || display === 'inline-grid') return 'grid';
    if (display === 'block') return 'block';
    if (display === 'inline' || display === 'inline-block') return 'inline';
    if (display === 'none') return 'none';
    return display;
  }

  // === Layout Property Extraction ===

  const FLEX_PROPERTIES = [
    'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignContent',
    'gap', 'rowGap', 'columnGap'
  ];

  const GRID_PROPERTIES = [
    'gridTemplateColumns', 'gridTemplateRows', 'gridTemplateAreas',
    'gridAutoColumns', 'gridAutoRows', 'gridAutoFlow',
    'gap', 'rowGap', 'columnGap',
    'justifyItems', 'alignItems', 'justifyContent', 'alignContent'
  ];

  const DIMENSION_PROPERTIES = [
    'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft'
  ];

  function extractContainerProps(el, layoutType) {
    if (!el || el.nodeType !== 1) return null;
    const s = getComputedStyle(el);
    const props = {};

    props.display = s.display;

    if (layoutType === 'flex') {
      for (const prop of FLEX_PROPERTIES) {
        const value = s[prop];
        if (value && value !== 'normal' && value !== 'auto') {
          props[prop] = value;
        }
      }
    } else if (layoutType === 'grid') {
      for (const prop of GRID_PROPERTIES) {
        const value = s[prop];
        if (value && value !== 'none' && value !== 'normal' && value !== 'auto') {
          props[prop] = value;
        }
      }
    }

    return props;
  }

  function extractDimensions(el) {
    if (!el || el.nodeType !== 1) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();

    const dims = {
      computed: {
        width: s.width,
        height: s.height
      },
      actual: {
        width: Math.round(r.width),
        height: Math.round(r.height)
      },
      constraints: {},
      padding: {
        top: s.paddingTop,
        right: s.paddingRight,
        bottom: s.paddingBottom,
        left: s.paddingLeft
      },
      margin: {
        top: s.marginTop,
        right: s.marginRight,
        bottom: s.marginBottom,
        left: s.marginLeft
      }
    };

    // Only include constraints if set
    if (s.minWidth !== '0px') dims.constraints.minWidth = s.minWidth;
    if (s.maxWidth !== 'none') dims.constraints.maxWidth = s.maxWidth;
    if (s.minHeight !== '0px') dims.constraints.minHeight = s.minHeight;
    if (s.maxHeight !== 'none') dims.constraints.maxHeight = s.maxHeight;

    return dims;
  }

  function extractChildInfo(el) {
    if (!el || el.nodeType !== 1) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();

    return {
      selector: cssPath(el),
      tag: el.tagName.toLowerCase(),
      className: el.className ? String(el.className).slice(0, 100) : null,
      rect: {
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height)
      },
      // Flex child properties
      flexBasis: s.flexBasis !== 'auto' ? s.flexBasis : null,
      flexGrow: s.flexGrow !== '0' ? s.flexGrow : null,
      flexShrink: s.flexShrink !== '1' ? s.flexShrink : null,
      order: s.order !== '0' ? s.order : null,
      alignSelf: s.alignSelf !== 'auto' ? s.alignSelf : null,
      // Grid child properties
      gridArea: s.gridArea !== 'auto / auto / auto / auto' ? s.gridArea : null,
      gridColumn: s.gridColumn !== 'auto / auto' ? s.gridColumn : null,
      gridRow: s.gridRow !== 'auto / auto' ? s.gridRow : null
    };
  }

  // === Main Functions ===

  function inspect(selector) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return { ok: false, reason: 'Element not found', selector };

    const layoutType = getLayoutType(el);
    const r = el.getBoundingClientRect();

    const result = {
      ok: true,
      selector: cssPath(el),
      type: layoutType,
      container: extractContainerProps(el, layoutType),
      dimensions: extractDimensions(el),
      rect: {
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height)
      }
    };

    // Extract children info for flex/grid containers
    if (layoutType === 'flex' || layoutType === 'grid') {
      const children = Array.from(el.children).slice(0, 20);
      result.children = children.map(child => extractChildInfo(child)).filter(Boolean);
      result.childCount = el.children.length;
    }

    return result;
  }

  function skeleton() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight
    };

    // Find landmark elements
    const landmarks = {
      header: document.querySelector('header, [role="banner"], .header, #header'),
      nav: document.querySelector('nav, [role="navigation"], .nav, .navbar, #nav'),
      main: document.querySelector('main, [role="main"], .main, #main, .content'),
      aside: document.querySelector('aside, [role="complementary"], .sidebar'),
      footer: document.querySelector('footer, [role="contentinfo"], .footer, #footer')
    };

    const sections = [];

    for (const [role, el] of Object.entries(landmarks)) {
      if (el) {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        sections.push({
          role,
          selector: cssPath(el),
          tag: el.tagName.toLowerCase(),
          rect: {
            x: Math.round(r.x),
            y: Math.round(r.y),
            width: Math.round(r.width),
            height: Math.round(r.height)
          },
          position: s.position,
          zIndex: s.zIndex !== 'auto' ? s.zIndex : null,
          layoutType: getLayoutType(el)
        });
      }
    }

    // Find major sections (large block elements)
    const majorSections = document.querySelectorAll('section, article, [class*="section"], [class*="container"]');
    const additionalSections = Array.from(majorSections)
      .filter(el => {
        const r = el.getBoundingClientRect();
        // Must be reasonably large
        return r.width > viewport.width * 0.5 && r.height > 100;
      })
      .slice(0, 10)
      .map(el => {
        const r = el.getBoundingClientRect();
        return {
          role: 'section',
          selector: cssPath(el),
          tag: el.tagName.toLowerCase(),
          className: el.className ? String(el.className).slice(0, 100) : null,
          rect: {
            x: Math.round(r.x),
            y: Math.round(r.y),
            width: Math.round(r.width),
            height: Math.round(r.height)
          },
          layoutType: getLayoutType(el)
        };
      });

    return {
      viewport,
      landmarks: sections,
      sections: additionalSections,
      bodyLayout: getLayoutType(document.body),
      htmlLayout: getLayoutType(document.documentElement)
    };
  }

  function auditContainers() {
    const allElements = document.querySelectorAll('*');
    const flexContainers = [];
    const gridContainers = [];

    for (const el of allElements) {
      const layoutType = getLayoutType(el);
      const r = el.getBoundingClientRect();

      // Skip tiny or invisible elements
      if (r.width < 50 || r.height < 20) continue;

      const info = {
        selector: cssPath(el),
        tag: el.tagName.toLowerCase(),
        rect: {
          width: Math.round(r.width),
          height: Math.round(r.height)
        },
        childCount: el.children.length
      };

      if (layoutType === 'flex') {
        const s = getComputedStyle(el);
        info.direction = s.flexDirection;
        info.wrap = s.flexWrap;
        info.justify = s.justifyContent;
        info.align = s.alignItems;
        info.gap = s.gap;
        flexContainers.push(info);
      } else if (layoutType === 'grid') {
        const s = getComputedStyle(el);
        info.columns = s.gridTemplateColumns;
        info.rows = s.gridTemplateRows;
        info.gap = s.gap;
        gridContainers.push(info);
      }
    }

    return {
      flex: flexContainers.slice(0, 50),
      grid: gridContainers.slice(0, 50),
      summary: {
        totalFlex: flexContainers.length,
        totalGrid: gridContainers.length
      }
    };
  }

  // === Expose API ===

  window.__dmLayout = {
    installed: true,
    version: '1.0.0',

    // Core methods
    inspect,
    skeleton,
    auditContainers,

    // Utility methods
    utils: {
      getLayoutType,
      cssPath
    }
  };
})();
