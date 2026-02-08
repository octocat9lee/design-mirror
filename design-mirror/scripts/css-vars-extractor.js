// Design Mirror: CSS Variables Extractor (paste into evaluate_script)
//
// Exposes:
// - window.__dmCssVars.extractAll(): extracts all CSS variable definitions
// - window.__dmCssVars.analyzeUsage(): analyzes where variables are used
// - window.__dmCssVars.detectVendorVars(): detects third-party library variables
//
// This file is intentionally framework-agnostic and safe to paste as an IIFE.

(() => {
  if (window.__dmCssVars?.installed) return;

  // === Category Detection ===

  const CATEGORY_PATTERNS = {
    colors: [
      /color/i, /bg/i, /background/i, /border/i, /shadow/i, /fill/i, /stroke/i,
      /primary/i, /secondary/i, /accent/i, /success/i, /warning/i, /error/i, /info/i,
      /text/i, /foreground/i, /surface/i, /overlay/i
    ],
    spacing: [
      /space/i, /spacing/i, /gap/i, /margin/i, /padding/i, /gutter/i, /offset/i
    ],
    typography: [
      /font/i, /text/i, /line-height/i, /letter/i, /size/i, /weight/i, /family/i
    ],
    motion: [
      /duration/i, /delay/i, /timing/i, /ease/i, /transition/i, /animation/i, /motion/i
    ],
    layout: [
      /width/i, /height/i, /max/i, /min/i, /container/i, /breakpoint/i, /grid/i, /column/i
    ],
    radius: [
      /radius/i, /rounded/i, /corner/i
    ],
    zindex: [
      /z-index/i, /z-/i, /layer/i, /elevation/i
    ]
  };

  const VENDOR_PREFIXES = {
    swiper: '--swiper-',
    toastify: '--toastify-',
    tailwind: '--tw-',
    bootstrap: '--bs-',
    chakra: '--chakra-',
    mui: '--mui-',
    antd: '--ant-'
  };

  function categorizeVariable(name) {
    const lowerName = name.toLowerCase();

    // Check vendor prefixes first
    for (const [vendor, prefix] of Object.entries(VENDOR_PREFIXES)) {
      if (lowerName.startsWith(prefix)) {
        return { category: 'vendor', vendor };
      }
    }

    // Check category patterns
    for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(name)) {
          return { category, vendor: null };
        }
      }
    }

    return { category: 'misc', vendor: null };
  }

  // === CSS Variable Extraction ===

  function extractFromStylesheet(stylesheet) {
    const variables = {};

    try {
      const rules = stylesheet.cssRules || stylesheet.rules;
      if (!rules) return variables;

      for (const rule of rules) {
        if (rule.type === CSSRule.STYLE_RULE) {
          const style = rule.style;
          for (let i = 0; i < style.length; i++) {
            const prop = style[i];
            if (prop.startsWith('--')) {
              const value = style.getPropertyValue(prop).trim();
              const selector = rule.selectorText;

              if (!variables[prop]) {
                variables[prop] = {
                  name: prop,
                  value,
                  source: selector,
                  scope: selector === ':root' || selector === 'html' ? 'global' : 'local',
                  ...categorizeVariable(prop)
                };
              }
            }
          }
        } else if (rule.type === CSSRule.MEDIA_RULE) {
          // Recursively handle media queries
          const nested = extractFromStylesheet(rule);
          Object.assign(variables, nested);
        }
      }
    } catch (e) {
      // Cross-origin stylesheets will throw
    }

    return variables;
  }

  function extractFromComputedStyles() {
    const variables = {};
    const root = document.documentElement;
    const rootStyle = getComputedStyle(root);

    // Try to get all custom properties from :root
    // Note: This only gets properties that are actively used
    const allProps = [];

    // Scan stylesheets for variable names
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;

        for (const rule of rules) {
          if (rule.type === CSSRule.STYLE_RULE && rule.selectorText === ':root') {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--')) {
                allProps.push(prop);
              }
            }
          }
        }
      } catch (e) {
        // Cross-origin
      }
    }

    // Get computed values
    for (const prop of allProps) {
      const value = rootStyle.getPropertyValue(prop).trim();
      if (value) {
        variables[prop] = {
          name: prop,
          value,
          source: ':root',
          scope: 'global',
          ...categorizeVariable(prop)
        };
      }
    }

    return variables;
  }

  function extractAll() {
    const allVariables = {};

    // Extract from all stylesheets
    for (const sheet of document.styleSheets) {
      const vars = extractFromStylesheet(sheet);
      Object.assign(allVariables, vars);
    }

    // Supplement with computed styles
    const computedVars = extractFromComputedStyles();
    for (const [name, info] of Object.entries(computedVars)) {
      if (!allVariables[name]) {
        allVariables[name] = info;
      }
    }

    // Categorize
    const categorized = {
      colors: [],
      spacing: [],
      typography: [],
      motion: [],
      layout: [],
      radius: [],
      zindex: [],
      vendor: {},
      misc: []
    };

    for (const [name, info] of Object.entries(allVariables)) {
      if (info.vendor) {
        if (!categorized.vendor[info.vendor]) {
          categorized.vendor[info.vendor] = [];
        }
        categorized.vendor[info.vendor].push(name);
      } else {
        const cat = info.category;
        if (categorized[cat]) {
          categorized[cat].push(name);
        } else {
          categorized.misc.push(name);
        }
      }
    }

    return {
      definitions: allVariables,
      categorized,
      summary: {
        total: Object.keys(allVariables).length,
        global: Object.values(allVariables).filter(v => v.scope === 'global').length,
        local: Object.values(allVariables).filter(v => v.scope === 'local').length,
        byCategory: Object.fromEntries(
          Object.entries(categorized).map(([k, v]) =>
            [k, Array.isArray(v) ? v.length : Object.keys(v).reduce((sum, key) => sum + v[key].length, 0)]
          )
        )
      }
    };
  }

  // === Usage Analysis ===

  function analyzeUsage() {
    const usage = {};

    try {
      for (const sheet of document.styleSheets) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (!rules) continue;

          for (const rule of rules) {
            if (rule.type === CSSRule.STYLE_RULE) {
              const style = rule.style;
              const selector = rule.selectorText;

              for (let i = 0; i < style.length; i++) {
                const prop = style[i];
                const value = style.getPropertyValue(prop);

                // Check if value contains var()
                const varMatches = value.match(/var\(--[^)]+\)/g);
                if (varMatches) {
                  for (const match of varMatches) {
                    const varName = match.match(/var\((--[^,)]+)/)?.[1];
                    if (varName) {
                      if (!usage[varName]) {
                        usage[varName] = {
                          usedIn: [],
                          properties: new Set()
                        };
                      }
                      if (!usage[varName].usedIn.includes(selector)) {
                        usage[varName].usedIn.push(selector);
                      }
                      usage[varName].properties.add(prop);
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
          // Cross-origin
        }
      }
    } catch (e) {
      // Error scanning stylesheets
    }

    // Convert Sets to Arrays
    for (const info of Object.values(usage)) {
      info.properties = Array.from(info.properties);
      info.usedIn = info.usedIn.slice(0, 20); // Limit to 20 selectors
    }

    return usage;
  }

  // === Vendor Variable Detection ===

  function detectVendorVars() {
    const result = {};

    const allVars = extractAll();

    for (const [vendor, prefix] of Object.entries(VENDOR_PREFIXES)) {
      const vendorVars = Object.keys(allVars.definitions).filter(name =>
        name.toLowerCase().startsWith(prefix)
      );

      if (vendorVars.length > 0) {
        result[vendor] = {
          count: vendorVars.length,
          variables: vendorVars.slice(0, 20), // Limit to 20
          sample: vendorVars.slice(0, 5).map(name => ({
            name,
            value: allVars.definitions[name]?.value
          }))
        };
      }
    }

    return result;
  }

  // === Semantic Token Suggestions ===

  function suggestSemanticTokens() {
    const allVars = extractAll();
    const suggestions = {
      colors: {},
      spacing: {},
      motion: {}
    };

    // Analyze color variables for semantic naming
    const colorVars = allVars.categorized.colors.map(name => ({
      name,
      value: allVars.definitions[name]?.value
    }));

    // Group similar colors
    const colorGroups = {};
    for (const { name, value } of colorVars) {
      if (!value) continue;

      // Extract base color name if exists
      const baseName = name.replace(/^--/, '').split('-')[0];
      if (!colorGroups[baseName]) {
        colorGroups[baseName] = [];
      }
      colorGroups[baseName].push({ name, value });
    }

    suggestions.colors = colorGroups;

    return suggestions;
  }

  // === Expose API ===

  window.__dmCssVars = {
    installed: true,
    version: '1.0.0',

    // Core methods
    extractAll,
    analyzeUsage,
    detectVendorVars,

    // Additional methods
    suggestSemanticTokens,

    // Utility
    utils: {
      categorizeVariable,
      VENDOR_PREFIXES,
      CATEGORY_PATTERNS
    }
  };
})();
