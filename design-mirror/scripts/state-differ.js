// Design Mirror: State Differ (paste into evaluate_script)
//
// Exposes:
// - window.__dmState.diff(selector): captures style differences across states (hover, focus, active, disabled)
// - window.__dmState.auditInteractive(): audits all interactive elements for state differences
// - window.__dmState.trigger(selector, state): manually triggers a state
// - window.__dmState.release(selector, state): releases a triggered state
//
// This file is intentionally framework-agnostic and safe to paste as an IIFE.

(() => {
  if (window.__dmState?.installed) return;

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

  // === Style Comparison Properties ===

  const DIFF_PROPERTIES = [
    // Visual
    'color', 'backgroundColor', 'backgroundImage', 'borderColor',
    'boxShadow', 'textShadow', 'opacity',
    // Transform
    'transform', 'scale', 'rotate', 'translate',
    // Text
    'textDecoration', 'fontWeight',
    // Border
    'borderWidth', 'borderStyle', 'borderRadius',
    // Outline (accessibility)
    'outline', 'outlineColor', 'outlineWidth', 'outlineOffset',
    // Cursor
    'cursor', 'pointerEvents'
  ];

  function extractStateStyles(el) {
    if (!el || el.nodeType !== 1) return null;
    const s = getComputedStyle(el);
    const styles = {};

    for (const prop of DIFF_PROPERTIES) {
      try {
        styles[prop] = s[prop] || s.getPropertyValue(prop);
      } catch (e) {}
    }

    // Also get transition info
    styles._transition = s.transition || s.getPropertyValue('transition');

    return styles;
  }

  function computeDiff(baseStyles, stateStyles) {
    const diff = {};
    let hasDiff = false;

    for (const prop of DIFF_PROPERTIES) {
      const base = baseStyles[prop];
      const state = stateStyles[prop];

      if (base !== state && state) {
        diff[prop] = [base, state];
        hasDiff = true;
      }
    }

    return hasDiff ? diff : null;
  }

  // === State Triggering ===

  // Store for cleanup
  const triggeredStates = new Map();

  function triggerHover(el) {
    // Dispatch mouseenter event
    el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));

    // Force :hover pseudo-class via CSS injection
    const id = `__dmState_hover_${Date.now()}`;
    const selector = cssPath(el);
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `${selector} { /* hover triggered */ }`;
    document.head.appendChild(style);

    // Add hover class as fallback
    el.classList.add('__dm-hover');

    return { id, cleanup: () => {
      el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true, cancelable: true }));
      el.classList.remove('__dm-hover');
      style.remove();
    }};
  }

  function triggerFocus(el) {
    el.focus();
    el.dispatchEvent(new FocusEvent('focus', { bubbles: true, cancelable: true }));

    return { cleanup: () => {
      el.blur();
    }};
  }

  function triggerActive(el) {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    el.classList.add('__dm-active');

    return { cleanup: () => {
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      el.classList.remove('__dm-active');
    }};
  }

  function trigger(selector, state) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return { ok: false, reason: 'Element not found' };

    let result;
    switch (state) {
      case 'hover':
        result = triggerHover(el);
        break;
      case 'focus':
        result = triggerFocus(el);
        break;
      case 'active':
        result = triggerActive(el);
        break;
      default:
        return { ok: false, reason: `Unknown state: ${state}` };
    }

    const key = `${cssPath(el)}_${state}`;
    triggeredStates.set(key, result);

    return { ok: true, state, element: cssPath(el) };
  }

  function release(selector, state) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return { ok: false, reason: 'Element not found' };

    const key = `${cssPath(el)}_${state}`;
    const triggered = triggeredStates.get(key);

    if (triggered?.cleanup) {
      triggered.cleanup();
      triggeredStates.delete(key);
    }

    return { ok: true };
  }

  // === Main Diff Function ===

  async function diff(selector) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return { ok: false, reason: 'Element not found', selector };

    const result = {
      ok: true,
      element: {
        selector: cssPath(el),
        tag: el.tagName.toLowerCase(),
        text: (el.innerText || '').trim().slice(0, 50)
      },
      states: {
        default: null,
        hover: null,
        focus: null,
        focusVisible: null,
        active: null,
        disabled: null
      }
    };

    // Capture default state
    const defaultStyles = extractStateStyles(el);
    result.states.default = defaultStyles;

    // Check if disabled
    const isDisabled = el.disabled || el.getAttribute('aria-disabled') === 'true';
    if (isDisabled) {
      result.states.disabled = { isDisabled: true };
    }

    // Capture hover state
    try {
      const hoverTrigger = triggerHover(el);
      await new Promise(r => requestAnimationFrame(r)); // Wait for style application
      await new Promise(r => setTimeout(r, 50)); // Extra delay for transitions

      const hoverStyles = extractStateStyles(el);
      const hoverDiff = computeDiff(defaultStyles, hoverStyles);

      if (hoverDiff) {
        result.states.hover = {
          diff: hoverDiff,
          transition: hoverStyles._transition
        };
      }

      hoverTrigger.cleanup();
      await new Promise(r => setTimeout(r, 50)); // Wait for cleanup
    } catch (e) {
      result.states.hover = { error: e.message };
    }

    // Capture focus state
    try {
      el.focus();
      await new Promise(r => requestAnimationFrame(r));

      const focusStyles = extractStateStyles(el);
      const focusDiff = computeDiff(defaultStyles, focusStyles);

      if (focusDiff) {
        result.states.focus = {
          diff: focusDiff,
          transition: focusStyles._transition
        };
      }

      // Check focus-visible specifically (keyboard focus)
      if (el.matches(':focus-visible')) {
        result.states.focusVisible = {
          diff: focusDiff,
          note: 'Element supports :focus-visible'
        };
      }

      el.blur();
      await new Promise(r => setTimeout(r, 50));
    } catch (e) {
      result.states.focus = { error: e.message };
    }

    // Capture active state
    try {
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      el.classList.add('__dm-active');
      await new Promise(r => requestAnimationFrame(r));

      const activeStyles = extractStateStyles(el);
      const activeDiff = computeDiff(defaultStyles, activeStyles);

      if (activeDiff) {
        result.states.active = {
          diff: activeDiff,
          transition: activeStyles._transition
        };
      }

      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      el.classList.remove('__dm-active');
    } catch (e) {
      result.states.active = { error: e.message };
    }

    // Clean up null states
    for (const [state, value] of Object.entries(result.states)) {
      if (value === null) {
        delete result.states[state];
      }
    }

    return result;
  }

  // === Audit All Interactive Elements ===

  async function auditInteractive(opts = {}) {
    const limit = opts.limit || 10;
    const results = {
      buttons: [],
      links: [],
      inputs: [],
      summary: {
        total: 0,
        withHoverEffect: 0,
        withFocusEffect: 0,
        withActiveEffect: 0
      }
    };

    // Audit buttons
    const buttons = Array.from(document.querySelectorAll('button, [role="button"]')).slice(0, limit);
    for (const btn of buttons) {
      const d = await diff(btn);
      if (d.ok) {
        results.buttons.push(d);
        results.summary.total++;
        if (d.states.hover?.diff) results.summary.withHoverEffect++;
        if (d.states.focus?.diff || d.states.focusVisible?.diff) results.summary.withFocusEffect++;
        if (d.states.active?.diff) results.summary.withActiveEffect++;
      }
    }

    // Audit links
    const links = Array.from(document.querySelectorAll('a[href]')).slice(0, limit);
    for (const link of links) {
      const d = await diff(link);
      if (d.ok) {
        results.links.push(d);
        results.summary.total++;
        if (d.states.hover?.diff) results.summary.withHoverEffect++;
        if (d.states.focus?.diff) results.summary.withFocusEffect++;
      }
    }

    // Audit inputs
    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea')).slice(0, limit);
    for (const input of inputs) {
      const d = await diff(input);
      if (d.ok) {
        results.inputs.push(d);
        results.summary.total++;
        if (d.states.focus?.diff) results.summary.withFocusEffect++;
      }
    }

    return results;
  }

  // === Expose API ===

  window.__dmState = {
    installed: true,
    version: '1.0.0',

    // Core methods
    diff,
    auditInteractive,

    // Manual state control
    trigger,
    release,

    // Utility
    utils: {
      cssPath,
      extractStateStyles,
      computeDiff,
      DIFF_PROPERTIES
    }
  };
})();
