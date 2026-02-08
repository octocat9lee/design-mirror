// Design Mirror: Motion tools (paste into evaluate_script when extracting dynamic UIs)
//
// Exposes:
// - window.__dmMotion.install(): installs helpers (idempotent)
// - window.__dmMotion.capture(label): captures document.getAnimations() snapshot
// - window.__dmMotion.sample(el, opts): samples computed styles per rAF for JS-driven motion
// - window.__dmMotion.quickAudit(): one-click audit of all CSS animations, transitions, and WAPI animations
//
// This file is intentionally framework-agnostic and safe to paste as an IIFE.

(() => {
  if (window.__dmMotion?.installed) return;

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

  function summarizeKeyProps(kfs) {
    if (!Array.isArray(kfs) || kfs.length === 0) return null;
    const omit = new Set(['offset', 'easing', 'composite', 'computedOffset']);
    const props = new Set();
    for (const kf of kfs) for (const p of Object.keys(kf)) if (!omit.has(p)) props.add(p);
    const out = {};
    for (const p of props) {
      let first = null;
      let last = null;
      let firstOffset = null;
      let lastOffset = null;
      for (const kf of kfs) {
        if (kf[p] == null) continue;
        if (first == null) {
          first = kf[p];
          firstOffset = kf.offset ?? kf.computedOffset ?? null;
        }
        last = kf[p];
        lastOffset = kf.offset ?? kf.computedOffset ?? null;
      }
      out[p] = { from: first, to: last, fromOffset: firstOffset, toOffset: lastOffset };
    }
    return out;
  }

  function describeTarget(el) {
    if (!el || el.nodeType !== 1) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      className: el.className ? String(el.className).slice(0, 200) : null,
      text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80) || null,
      path: cssPath(el),
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      computed: {
        opacity: s.opacity,
        transform: s.transform,
        filter: s.filter,
        clipPath: s.clipPath,
        willChange: s.willChange
      }
    };
  }

  function capture(label) {
    const anims = document.getAnimations({ subtree: true });
    return {
      label,
      at: Date.now(),
      url: location.href,
      scrollY: Math.round(scrollY),
      animationCount: anims.length,
      animations: anims.map(a => {
        const effect = a.effect;
        const timing = effect?.getTiming?.() ?? null;
        const target = (() => { try { return effect?.target ?? null; } catch { return null; } })();
        const keyframes = (() => { try { return effect?.getKeyframes?.() ?? null; } catch { return null; } })();
        return {
          type: a.constructor?.name ?? null,
          playState: a.playState,
          currentTime: a.currentTime ?? null,
          animationName: a.animationName ?? null,
          timing,
          keyProps: summarizeKeyProps(keyframes),
          target: describeTarget(target)
        };
      })
    };
  }

  async function sample(el, opts) {
    const target = typeof el === 'string' ? document.querySelector(el) : el;
    if (!target) return { ok: false, reason: 'target not found' };

    const ms = Math.max(100, opts?.durationMs ?? 800);
    const include = opts?.include ?? ['transform', 'opacity'];
    const out = [];
    const start = performance.now();

    await new Promise(resolve => {
      function step() {
        const t = performance.now();
        const s = getComputedStyle(target);
        const row = { t: Math.round(t - start) };
        for (const k of include) row[k] = s[k];
        out.push(row);
        if (t - start >= ms) return resolve();
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });

    return {
      ok: true,
      target: describeTarget(target),
      durationMs: ms,
      samples: out
    };
  }

  window.__dmMotion = {
    installed: true,
    version: '2.0.0',
    install: () => true,
    capture,
    sample,
    quickAudit
  };

  // === Quick Audit Function ===

  function quickAudit() {
    const result = {
      cssAnimations: [],
      cssTransitions: [],
      wapiAnimations: [],
      jsLibraries: {
        detected: [],
        warnings: []
      },
      summary: {
        totalAnimations: 0,
        totalTransitions: 0,
        avgDuration: null,
        commonEasings: []
      }
    };

    // 1. Scan stylesheets for @keyframes
    const keyframesMap = new Map();
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;

        for (const rule of rules) {
          if (rule.type === CSSRule.KEYFRAMES_RULE) {
            const name = rule.name;
            const keyframes = [];

            for (let i = 0; i < rule.cssRules.length; i++) {
              const kf = rule.cssRules[i];
              if (kf.type === CSSRule.KEYFRAME_RULE) {
                const props = {};
                for (let j = 0; j < kf.style.length; j++) {
                  const prop = kf.style[j];
                  props[prop] = kf.style.getPropertyValue(prop);
                }
                keyframes.push({
                  offset: kf.keyText,
                  properties: props
                });
              }
            }

            keyframesMap.set(name, {
              name,
              keyframes,
              source: sheet.href || 'inline'
            });
          }
        }
      } catch (e) {
        // Cross-origin stylesheet
      }
    }

    result.cssAnimations = Array.from(keyframesMap.values());

    // 2. Scan elements for transitions
    const transitionMap = new Map();
    const allElements = document.querySelectorAll('*');

    for (const el of allElements) {
      try {
        const s = getComputedStyle(el);
        const transition = s.transition;

        if (transition && transition !== 'all 0s ease 0s' && transition !== 'none') {
          const key = transition;
          if (!transitionMap.has(key)) {
            transitionMap.set(key, {
              transition,
              property: s.transitionProperty,
              duration: s.transitionDuration,
              timing: s.transitionTimingFunction,
              delay: s.transitionDelay,
              selectors: []
            });
          }
          const selector = cssPath(el);
          if (selector && transitionMap.get(key).selectors.length < 5) {
            transitionMap.get(key).selectors.push(selector);
          }
        }
      } catch (e) {}
    }

    result.cssTransitions = Array.from(transitionMap.values());

    // 3. Capture Web Animations API animations
    const wapiAnims = document.getAnimations({ subtree: true });
    result.wapiAnimations = wapiAnims.map(a => {
      const effect = a.effect;
      const timing = effect?.getTiming?.() ?? null;
      const target = (() => { try { return effect?.target ?? null; } catch { return null; } })();
      const keyframes = (() => { try { return effect?.getKeyframes?.() ?? null; } catch { return null; } })();

      return {
        type: a.constructor?.name ?? null,
        playState: a.playState,
        currentTime: a.currentTime ?? null,
        animationName: a.animationName ?? null,
        timing: timing ? {
          duration: timing.duration,
          delay: timing.delay,
          easing: timing.easing,
          iterations: timing.iterations,
          fill: timing.fill
        } : null,
        keyProps: summarizeKeyProps(keyframes),
        target: target ? {
          tag: target.tagName?.toLowerCase(),
          path: cssPath(target),
          className: target.className ? String(target.className).slice(0, 100) : null
        } : null
      };
    });

    // 4. Detect JS animation libraries
    const jsLibChecks = [
      { name: 'swiper', check: () => typeof window.Swiper !== 'undefined' },
      { name: 'gsap', check: () => typeof window.gsap !== 'undefined' },
      { name: 'anime', check: () => typeof window.anime !== 'undefined' },
      { name: 'lottie', check: () => typeof window.lottie !== 'undefined' },
      { name: 'three', check: () => typeof window.THREE !== 'undefined' }
    ];

    for (const { name, check } of jsLibChecks) {
      try {
        if (check()) {
          result.jsLibraries.detected.push(name);
          result.jsLibraries.warnings.push(`${name} motion may not be captured by WAPI - use sample() for rAF tracking`);
        }
      } catch (e) {}
    }

    // 5. Calculate summary
    result.summary.totalAnimations = result.cssAnimations.length + result.wapiAnimations.length;
    result.summary.totalTransitions = result.cssTransitions.length;

    // Calculate average duration
    const durations = [];
    for (const t of result.cssTransitions) {
      const match = t.duration?.match(/(\d+\.?\d*)s/);
      if (match) durations.push(parseFloat(match[1]) * 1000);
    }
    for (const a of result.wapiAnimations) {
      if (a.timing?.duration) durations.push(a.timing.duration);
    }
    if (durations.length > 0) {
      result.summary.avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) + 'ms';
    }

    // Find common easings
    const easingCounts = new Map();
    for (const t of result.cssTransitions) {
      const easing = t.timing;
      if (easing) easingCounts.set(easing, (easingCounts.get(easing) || 0) + 1);
    }
    result.summary.commonEasings = Array.from(easingCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([easing, count]) => ({ easing, count }));

    return result;
  }
})();

