---
name: design-mirror
description: Mirror web UI designs with precision — extract styles, layout, motion, and generate replica pages for verification.
---

# Design Mirror

Mirror any web UI with precision. This skill extracts complete design systems from websites — colors, typography, spacing, layout, components, and motion — then generates documentation and standalone replica pages for visual verification.

**Strategy**: Structured data first, screenshots as optional supplement.

## MCP Requirements

| MCP | Purpose | Required |
|-----|---------|----------|
| `chrome-devtools` | Browser interaction: navigation, script injection, screenshots, state triggers | ✅ Required |

**MCP Tools Used**:
- `navigate_page` — Navigate to target URL
- `evaluate_script` — Inject and execute extraction scripts
- `take_screenshot` — Capture page/element screenshots
- `click` / `hover` — Trigger interaction states
- `take_snapshot` — Capture page DOM snapshot

## Output location (REQUIRED)

- Save all generated deliverables under: `./style/`
- Create the `style/` directory if it does not exist
- Never write generated outputs under the skill folder (`.codex/skills/...`)

Recommended structure:
```
style/
├── <project>-style.md              # Style guide document (for reading)
├── <project>-evidence/             # Extraction evidence (JSON/CSS/JS)
└── <project>-replica/              # Replica page (for verification)
    ├── index.html
    ├── styles.css
    └── scripts.js
```

## Reference

- `references/complete-examples/motherduck-design-system-style.md` — Complete Style Guide example, demonstrating:
  - CSS Variables definition format
  - Font Requirements (Web Font loading)
  - Component Internals (internal structure)
  - Image Dimensions (placeholder sizing)
  - Replica Validation (verification checklist)

---

## Available Scripts

| Script | Namespace | Purpose |
|--------|-----------|---------|
| `scripts/dom-snapshot.js` | `window.__dmDom` | Complete styles + DOM structure + pseudo elements |
| `scripts/layout-tools.js` | `window.__dmLayout` | Flex/grid layout + container dimensions |
| `scripts/css-vars-extractor.js` | `window.__dmCssVars` | CSS variable definitions + usage |
| `scripts/asset-manifest.js` | `window.__dmAssets` | Fonts / icons / third-party libraries |
| `scripts/state-differ.js` | `window.__dmState` | State trigger + style diff (hover/focus/active) |
| `scripts/motion-tools.js` | `window.__dmMotion` | Animation capture + quickAudit |
| `scripts/library-detect.js` | (returns object) | Third-party library detection |
| `scripts/extract-keyframes.py` | CLI | Offline @keyframes extraction from CSS |
| `scripts/screenshot-optimizer.py` | CLI | Compress/resize screenshots |

---

## Workflow

> **Workflow Overview**:
> - Phase 0: Define inputs and output type
> - Phase 1: Structured data extraction (bulk extraction)
> - Phase 1.5: Screenshots (optional supplement)
> - Phase 2: Semantic token generation
> - Phase 2.5: Font loading preparation
> - Phase 3: Write Style Guide documentation
> - Phase 4: Generate Replica page
> - **Phase 4.5: Component-level style validation (CRITICAL for accuracy)** ⬅️ Most commonly skipped step

### Phase 0 — Inputs

1) Project name + style/variant name
2) Sources: URL / web repo / both
3) Motion importance: if meaningful motion exists, motion capture is required
4) **Output type** (IMPORTANT - determines replica structure):
   - `layout-replica` (**DEFAULT**): Replicate original page layout structure for validating extraction accuracy
   - `component-showcase`: Generate component showcase page, grouped by type (for design system documentation)

**Intent Detection Rules**:
| User Expression | Output Type |
|-----------------|-------------|
| "replicate", "mirror", "clone", "copy page" | `layout-replica` |
| "component library", "design system", "showcase", "component gallery" | `component-showcase` |
| Not specified | `layout-replica` (default) |

### Phase 1 — Structured Data Extraction (PRIMARY)

> **Core principle**: Extract structured JSON data that can be directly used for replication, rather than relying on screenshots that require visual interpretation.

#### Step 1: Inject Tool Scripts

Navigate to target page, then inject scripts via `evaluate_script`:

```javascript
// Inject in this order:
// 1. dom-snapshot.js
// 2. layout-tools.js
// 3. css-vars-extractor.js
// 4. asset-manifest.js
// 5. state-differ.js
// 6. motion-tools.js
```

#### Step 2: Extract Core Data

Run these extractions in order:

```javascript
// 1. CSS Variables (tokens that are already defined)
const cssVars = __dmCssVars.extractAll();

// 2. Page skeleton (layout structure) - CRITICAL for layout-replica
const skeleton = __dmLayout.skeleton();

// 3. Asset manifest (fonts, icons, libraries)
const assets = __dmAssets.scan();

// 4. Interactive elements with full styles
const interactive = __dmDom.captureInteractive();

// 5. State differences (hover/focus/active)
const states = await __dmState.auditInteractive();

// 6. Motion audit (transitions + animations)
const motion = __dmMotion.quickAudit();
```

#### Step 3: Deep Component Extraction

For key components, extract detailed information:

```javascript
// Navigation
__dmDom.capture('.navbar', { children: true });
__dmLayout.inspect('.navbar');

// Primary button
__dmDom.capture('.btn-primary');
await __dmState.diff('.btn-primary');

// Cards
__dmDom.capture('.card');
__dmLayout.inspect('.card-container');

// Forms
__dmDom.captureMany(['input', 'textarea', 'select']);
```

#### Step 3.5: Component Internal Structure Extraction (CRITICAL)

> **This step ensures icons, thumbnails, and decorative elements within components are not lost**

For each key component, extract its **internal child element structure**:

```javascript
// Extract component internal structure
function extractComponentInternals(selector) {
  const component = document.querySelector(selector);
  if (!component) return null;

  const children = Array.from(component.children);
  return {
    selector: selector,
    childCount: children.length,
    children: children.map((child, index) => {
      const style = getComputedStyle(child);
      const rect = child.getBoundingClientRect();

      return {
        index: index,
        tag: child.tagName.toLowerCase(),
        className: child.className,
        // Critical dimension info
        dimensions: {
          width: rect.width + 'px',
          height: rect.height + 'px',
          aspectRatio: rect.width / rect.height
        },
        // Background info (image/gradient/color)
        background: {
          color: style.backgroundColor,
          image: style.backgroundImage,
          size: style.backgroundSize,
          position: style.backgroundPosition
        },
        // Whether it's an image element
        isImage: child.tagName === 'IMG',
        imageSrc: child.tagName === 'IMG' ? child.src : null,
        // Whether it's an SVG icon
        isSvg: child.tagName === 'SVG' || child.querySelector('svg') !== null,
        // Border and radius
        borderRadius: style.borderRadius,
        border: style.border
      };
    })
  };
}

// Execute for all key components
const components = [
  '.calendar-card',
  '.vip-card',
  '.tag-card',
  '.image-card',
  '.nav-item'
];

const componentInternals = {};
components.forEach(selector => {
  componentInternals[selector] = extractComponentInternals(selector);
});

console.log('Component Internals:', componentInternals);
```

**Save this data to the `componentInternals` field in `extracted-data.json`.**

#### Step 3.6: Image/Icon Dimensions Extraction (CRITICAL)

> **Ensure all image and icon dimensions are recorded for generating correctly-sized placeholders**

```javascript
// Extract all image dimensions
function extractImageDimensions() {
  const images = document.querySelectorAll('img');
  return Array.from(images).map(img => {
    const rect = img.getBoundingClientRect();
    const style = getComputedStyle(img);
    return {
      src: img.src,
      alt: img.alt,
      // Actual rendered dimensions (for placeholders)
      renderedWidth: rect.width,
      renderedHeight: rect.height,
      aspectRatio: rect.width / rect.height,
      // CSS dimension settings
      cssWidth: style.width,
      cssHeight: style.height,
      objectFit: style.objectFit,
      // Parent container info
      parentClass: img.parentElement?.className || '',
      parentDimensions: {
        width: img.parentElement?.getBoundingClientRect().width,
        height: img.parentElement?.getBoundingClientRect().height
      }
    };
  });
}

// Extract all SVG icon dimensions
function extractSvgDimensions() {
  const svgs = document.querySelectorAll('svg');
  return Array.from(svgs).map(svg => {
    const rect = svg.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      viewBox: svg.getAttribute('viewBox'),
      parentClass: svg.parentElement?.className || ''
    };
  });
}

const imageDimensions = extractImageDimensions();
const svgDimensions = extractSvgDimensions();
```

**Save output to the `imageDimensions` and `svgDimensions` fields in `extracted-data.json`.**

#### Step 4: Layout Pattern Extraction

```javascript
// Find all flex/grid containers
const containers = __dmLayout.auditContainers();

// Inspect specific layouts
__dmLayout.inspect('.hero-section');
__dmLayout.inspect('.card-grid');
__dmLayout.inspect('.footer');
```

#### Step 5: Section-Level Layout Extraction (CRITICAL for Layout Replica)

> **This step is critical for preventing layout detail omissions**

For each major section on the page, extract its internal layout structure:

```javascript
// Iterate all major sections, extract layout patterns
const sections = document.querySelectorAll('section, [class*="section"], [class*="block"], main > div');

sections.forEach((section, index) => {
  const sectionData = {
    index: index,
    className: section.className,

    // 1. Section overall layout
    layout: {
      display: getComputedStyle(section).display,
      flexDirection: getComputedStyle(section).flexDirection,
      gridTemplateColumns: getComputedStyle(section).gridTemplateColumns,
      gap: getComputedStyle(section).gap,
      alignItems: getComputedStyle(section).alignItems,
      justifyContent: getComputedStyle(section).justifyContent
    },

    // 2. Section header layout (commonly missed!)
    header: extractSectionHeader(section),

    // 3. Child container layouts
    childContainers: extractChildContainers(section)
  };

  console.log(`Section ${index}:`, sectionData);
});

// Extract section header layout pattern
function extractSectionHeader(section) {
  const header = section.querySelector('[class*="header"], [class*="title"], h2, h3');
  if (!header) return null;

  const parent = header.parentElement;
  const siblings = Array.from(parent.children);

  return {
    element: header.className || header.tagName,
    parentLayout: {
      display: getComputedStyle(parent).display,
      flexDirection: getComputedStyle(parent).flexDirection,
      justifyContent: getComputedStyle(parent).justifyContent,
      alignItems: getComputedStyle(parent).alignItems
    },
    siblingCount: siblings.length,
    // Detect horizontal sibling elements (e.g., title + category tabs)
    hasHorizontalSiblings: getComputedStyle(parent).display === 'flex' &&
                           getComputedStyle(parent).flexDirection === 'row'
  };
}

// Extract child container layouts
function extractChildContainers(section) {
  const containers = section.querySelectorAll('[class*="grid"], [class*="list"], [class*="cards"], [class*="tabs"]');
  return Array.from(containers).map(c => ({
    className: c.className,
    display: getComputedStyle(c).display,
    flexWrap: getComputedStyle(c).flexWrap,
    gap: getComputedStyle(c).gap
  }));
}
```

**Save output to the `sectionLayouts` field in `extracted-data.json`.**

The purpose of this step is to:
1. **Systematic traversal** rather than relying on manual observation
2. Auto-detect each section's **header layout pattern** (horizontal/vertical)
3. Record **child container flex/grid configurations**
4. Generate a reviewable layout manifest for reference when generating replica

### Phase 1.5 — Screenshots (OPTIONAL SUPPLEMENT)

> Screenshots are now **optional**, only needed for:
> - Complex gradients/textures that can't be fully described in CSS
> - Visual composition verification
> - States that are hard to capture programmatically

**If screenshots are needed:**

#### Step 1: Take Screenshot (MCP)

```javascript
// Use take_screenshot tool
// Prefer webp format (best compression ratio)
mcp__chrome-devtools__take_screenshot({
  format: "webp",        // Prefer webp, fallback to jpeg
  quality: 80,           // Compression quality
  fullPage: false        // Prefer viewport screenshots over full page
});
```

#### Step 2: Validate & Compress (MANDATORY)

> ⚠️ **Each screenshot MUST be validated for size and compressed immediately after saving**

```bash
# Check file sizes
ls -lh evidence/*.png evidence/*.webp evidence/*.jpg 2>/dev/null

# If exceeds 2MB, use optimization script
python scripts/screenshot-optimizer.py evidence/fullpage.png --max-size 2MB --out evidence/fullpage.jpg
```

**Screenshot Specifications:**

| Rule | Requirement |
|------|-------------|
| **Format** | WebP (preferred) > JPEG > PNG (prohibited for large images) |
| **Single file size** | < 2MB |
| **Total count** | Maximum 5-6 screenshots |
| **Priority** | Element-level > Viewport > Full page screenshots |
| **Compression** | Must validate and compress immediately after saving |

**Automatic Compression Workflow:**

```python
# Run immediately after taking screenshot
import subprocess
from pathlib import Path

def ensure_screenshot_size(filepath: str, max_mb: float = 2.0):
    """Ensure screenshot does not exceed specified size"""
    path = Path(filepath)
    size_mb = path.stat().st_size / (1024 * 1024)

    if size_mb > max_mb:
        print(f"⚠️ {path.name} is {size_mb:.1f}MB, compressing...")
        output = path.with_suffix('.jpg')
        subprocess.run([
            'python', 'scripts/screenshot-optimizer.py',
            str(path),
            '--out', str(output),
            '--max-size', f'{max_mb}MB'
        ])
        # Delete original PNG
        if output.exists() and path.suffix == '.png':
            path.unlink()
            print(f"✓ Compressed to {output.name}")
    else:
        print(f"✓ {path.name} is {size_mb:.1f}MB (OK)")
```

### Phase 2 — Semantic Tokenization (REQUIRED)

Convert extracted data into semantic tokens:

1. **From CSS Variables**: Use existing `--var-name` definitions from `__dmCssVars.extractAll()`
2. **From Computed Styles**: Cluster repeated values from `__dmDom.captureInteractive()`
3. **From State Diffs**: Extract transition patterns from `__dmState.auditInteractive()`
4. **From Layout**: Extract spacing/sizing patterns from `__dmLayout.skeleton()`
5. **From Motion**: Extract timing tokens from `__dmMotion.quickAudit()`
6. **From Component Internals**: Extract child element dimensions from Step 3.5
7. **From Image Dimensions**: Extract placeholder sizes from Step 3.6

Token naming convention:
```css
--color-[purpose]: #value;      /* accent, text, surface, border */
--space-[size]: Npx;            /* 4, 8, 12, 16, 24, 32 */
--motion-[duration]: Nms;       /* 100, 200, 300, 600 */
--ease-[type]: function;        /* default, inout, emphasis */
--radius-[size]: Npx;           /* sm, md, lg */
```

### Phase 2.5 — Font Loading Preparation (REQUIRED)

> **Ensure replica page correctly loads and displays fonts**

Based on `__dmAssets.scanFonts()` results, identify Web Fonts that need loading:

```javascript
// Analyze font loading requirements
function analyzeFontRequirements(fonts) {
  const results = {
    webFonts: [],      // Fonts to load from CDN
    systemFonts: [],   // System fonts (no loading required)
    fontFaceRules: []  // @font-face rules to generate
  };

  // Common system font list
  const systemFontList = [
    '-apple-system', 'BlinkMacSystemFont', 'Segoe UI',
    'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB',
    'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif',
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'
  ];

  fonts.loaded.forEach(font => {
    const isSystem = systemFontList.some(sys =>
      font.family.toLowerCase().includes(sys.toLowerCase())
    );

    if (!isSystem) {
      results.webFonts.push({
        family: font.family,
        weight: font.weight,
        style: font.style
      });
    } else {
      results.systemFonts.push(font.family);
    }
  });

  return results;
}
```

**Common Web Font Loading Solutions:**

| Font | Loading Method |
|------|----------------|
| Alibaba Sans | `<link href="//at.alicdn.com/t/webfont_xxx.css">` or Google Fonts |
| Noto Sans SC | `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC">` |
| Source Han Sans | Adobe Fonts or local @font-face |
| Custom fonts | Download font files and generate @font-face |

**Save output to `fontRequirements` field in `extracted-data.json`.**

### Phase 3 — Write the Style Guide

#### Required Sections (minimum)

1. **Overview** — project summary, visual signatures
2. **Design Philosophy** — principles, constraints
3. **CSS Variables** — extracted + proposed semantic tokens
4. **Color Palette** — with usage mapping
5. **Typography** — families, scale, weights
6. **Spacing System** — scale + usage
7. **Layout Patterns** — page skeleton + component layouts + responsive breakpoints
8. **Component Styles** — key components with full styles
9. **State Matrix** — hover/focus/active/disabled for interactive elements
10. **Animation Checklist** — transitions + keyframes + delay chains
11. **Asset Dependencies** — fonts, icons, third-party libraries
12. **Accessibility Styles** — focus-visible, reduced-motion, color-scheme
13. **Copy-Paste Examples** — 5+ ready-to-use code snippets

#### Section Templates

See `references/section-templates.md` for standard formats.

### Phase 4 — Replica Page Generation

Generate a standalone HTML page for visual verification. **Output type determines structure.**

#### Output Structure

```
style/
├── <project>-style.md                    # Style guide document
├── <project>-evidence/                   # Extraction evidence
└── <project>-replica/                    # Replica page
    ├── index.html                        # Main page
    ├── styles.css                        # All styles (tokens + components + states + animations)
    └── scripts.js                        # Interactions + animations
```

---

## Replica Type A: Layout Replica (DEFAULT)

> **Use case**: When user requests "replicate", "mirror", or "clone" a page
> **Core objective**: Generate a replica page matching the original page's layout structure

### Layout Replica Requirements

**0. Layout Structure (CRITICAL)**
- ⚠️ **Strictly follow** the page structure extracted by `__dmLayout.skeleton()`
- Section order must exactly match the original page
- Internal section layouts (flex/grid direction, gap, alignment) must match
- **Prohibited**: Reorganizing content into "showcase" or "component gallery" format
- Fixed-position elements (sidebar, header, floating buttons) must maintain original positioning

**0.5. Web Font Loading (CRITICAL)**

> **Ensure fonts display correctly, not falling back to system fonts**

Based on `fontRequirements` data, add font loading in `<head>`:

```html
<head>
  <!-- Web Font Loading - Add based on extracted font requirements -->

  <!-- Option A: Google Fonts (Recommended) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Option B: Alibaba Font CDN -->
  <link href="//at.alicdn.com/t/webfont_exMpJIuQ.css" rel="stylesheet">

  <!-- Option C: @font-face (requires font files) -->
  <style>
    @font-face {
      font-family: 'CustomFont';
      src: url('./fonts/custom-font.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
  </style>
</head>
```

**Font Loading Verification**:
- Check in browser DevTools: `document.fonts.check('16px "FontName"')` should return `true`
- Ensure CSS `font-family` variables use the extracted font names

**1. Page Skeleton Fidelity**
- Sidebar, header, main content area, and footer positioning must be correct
- Elements using CSS `position: fixed` must remain fixed
- Spacing between sections must match the original page

**2. Section Order**
- Generate content in the original page's section order
- Example: Hero → Calendar → Trends → Categories → Footer
- **Do not** reorganize by component type (e.g., Buttons → Cards → Forms)

**3. Component Context**
- Components must be displayed in their original context
- VIP cards should be on the right side of Hero section, not in a separate "Cards" block
- Calendar cards should be in the calendar section, not in a generic "Calendar Components" block

**4. Section Header Layout (Pay attention to section header layouts)**
- Carefully observe each section's header layout in the original page
- **Common Pattern A**: Title and subtitle vertically stacked, category tabs on next row
- **Common Pattern B**: Title + subtitle on left, category tabs on right (horizontal on same row)
- Must select the correct pattern based on the original page's actual layout
- Example: If the "Cutout Elements" section title and category tabs are on the same row in original, replica must match

**5. Visual & Interactive Fidelity**
- All CSS variables correctly applied
- All interaction states (hover/focus/active) working properly
- All animations and transitions playing correctly

**6. Placeholder Requirements (CRITICAL)**

> **Placeholders must exactly match original element dimensions**

Generate placeholders based on `imageDimensions` and `componentInternals` data:

```html
<!-- Image placeholder - must use exact dimensions from extraction -->
<div class="image-placeholder"
     style="width: 196px; height: 64px; /* from imageDimensions */
            background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
            border-radius: 12px; /* from componentInternals */
            display: flex;
            align-items: center;
            justify-content: center;">
  <span style="color: #999; font-size: 12px;">196×64</span>
</div>

<!-- Icon placeholder - must use exact dimensions from extraction -->
<div class="icon-placeholder"
     style="width: 24px; height: 24px; /* from svgDimensions */
            background: #e0e0e0;
            border-radius: 4px;">
</div>
```

**Placeholder Generation Rules:**

| Element Type | Dimension Source | Style Requirements |
|--------------|-----------------|-------------------|
| Image `<img>` | `imageDimensions.renderedWidth/Height` | Maintain `aspectRatio`, use gradient background |
| SVG icons | `svgDimensions.width/height` | Use gray background, match original border-radius |
| Background images | `componentInternals.background.size` | Use gradient with similar color tone |
| Thumbnails | `componentInternals.children[n].dimensions` | Exact match dimensions and border-radius |

**⚠️ Prohibited:**
- Using fixed generic dimensions (e.g., 100x100)
- Ignoring `aspectRatio`
- Omitting icon/thumbnail placeholders inside components

**7. Background Style Fidelity (CRITICAL)**

> **Ensure background styles (color, gradient, image) match the original**

Apply background styles based on `componentInternals.background` data:

```css
/* From componentInternals in extracted-data.json */
.calendar-card {
  /* Use extracted background color */
  background-color: rgb(247, 249, 250);

  /* If gradient exists */
  background-image: linear-gradient(...);

  /* For background images, use placeholder gradient */
  /* Original: background-image: url(xxx.jpg) */
  /* Replacement: background-image: linear-gradient(135deg, #toneA, #toneB) */
}

.calendar-card.active {
  /* Active state background must differ */
  background-color: #FCF2F6;
  border-color: #FFE6EE;
}
```

**Background Handling Strategy:**

| Original Background Type | Replica Strategy |
|-------------------------|-----------------|
| Solid `background-color` | Use extracted color value directly |
| Gradient `linear-gradient` | Use extracted gradient value directly |
| Image `url(xxx.jpg)` | Replace with gradient of similar color tone |
| Image + overlay | Gradient + `rgba` overlay layer |

### Layout Replica Template

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Project] - Layout Replica</title>

  <!-- Web Font Loading (REQUIRED) -->
  <!-- Select loading method based on fontRequirements data -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <!-- Example: If Noto Sans SC is needed -->
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap" rel="stylesheet">
  <!-- Example: If Alibaba Sans is needed (use Alibaba CDN) -->
  <!-- <link href="//at.alicdn.com/t/webfont_xxx.css" rel="stylesheet"> -->

  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="page-wrapper">
    <!-- Organized by original page structure, not by component type -->

    <!-- Top banner (if present) -->
    <div class="banner">...</div>

    <!-- Sidebar navigation (if present, use fixed positioning) -->
    <aside class="sidebar">
      <div class="sidebar-logo">...</div>
      <nav class="sidebar-nav">...</nav>
      <div class="sidebar-footer">...</div>
    </aside>

    <!-- Header/search bar (if present, use fixed positioning) -->
    <header class="header">
      <div class="header-content">
        <div class="search-box">...</div>
        <div class="user-actions">...</div>
      </div>
    </header>

    <!-- Main content area (in original page section order) -->
    <main class="main-content">
      <div class="content-wrapper">

        <!-- Section 1: Hero Section -->
        <section class="hero-section">
          <div class="hero-left">
            <h1>...</h1>
            <div class="tabs">...</div>
            <div class="topic-cards">
              <!-- Image placeholder example - use dimensions from imageDimensions -->
              <div class="topic-card-placeholder"
                   style="width: 280px; height: 177px;
                          background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
                          border-radius: 12px;
                          display: flex; align-items: center; justify-content: center;">
                <span style="color: #999; font-size: 12px;">280×177</span>
              </div>
            </div>
          </div>
          <div class="hero-right">
            <div class="vip-cards">...</div>
          </div>
        </section>

        <!-- Section 2: Calendar Section -->
        <section class="calendar-section">
          <div class="section-header">...</div>
          <div class="calendar-cards">
            <!-- Component placeholder example - includes internal child elements -->
            <div class="calendar-card"
                 style="width: 196px; height: 64px;">
              <!-- Left icon placeholder - use dimensions from componentInternals -->
              <div class="calendar-icon-placeholder"
                   style="width: 40px; height: 40px;
                          background: linear-gradient(135deg, #FFE4E1, #FFC0CB);
                          border-radius: 8px;">
              </div>
              <div class="calendar-info">
                <span class="calendar-title">Holiday Name</span>
                <span class="calendar-date">MM.DD</span>
              </div>
            </div>
          </div>
          <div class="calendar-tags">...</div>
        </section>

        <!-- Section 3: Trends Section -->
        <section class="trends-section">
          <h2>...</h2>
          <div class="trends-grid">...</div>
        </section>

        <!-- Section N: Continue in original page order -->
        ...

      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">...</footer>

    <!-- Floating elements -->
    <div class="floating-panel">...</div>

  </div>

  <script src="scripts.js"></script>
</body>
</html>
```

### Layout Replica CSS Structure

```css
/* ========== CSS Variables (Tokens) ========== */
:root {
  /* Variables extracted from original page */
  --color-primary: ...;
  --sidebar-width: 84px;
  --header-height: 80px;
  /* ... */
}

/* ========== Base / Reset ========== */
*, *::before, *::after { box-sizing: border-box; }

/* ========== Page Skeleton (CRITICAL) ========== */
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 60px; /* banner height */
  width: var(--sidebar-width);
  height: calc(100vh - 60px);
  /* Must match original page positioning */
}

.header {
  position: fixed;
  top: 60px;
  left: var(--sidebar-width);
  right: 0;
  height: var(--header-height);
  /* Must match original page positioning */
}

.main-content {
  margin-top: calc(60px + var(--header-height));
  margin-left: var(--sidebar-width);
  /* Leave space for fixed elements */
}

/* ========== Section Layouts (following original page structure) ========== */
.hero-section {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  /* Must match original page flex layout */
}

.calendar-section { ... }
.trends-section { ... }

/* ========== Components ========== */
.btn-primary { ... }
.calendar-card { ... }
.vip-card { ... }

/* ========== States ========== */
/* ... */

/* ========== Animations ========== */
/* ... */
```

---

## Replica Type B: Component Showcase

> **Use case**: When user requests "component library", "design system documentation", or "showcase"
> **Core objective**: Group and display components by type for design system reference

### Component Showcase Requirements

**1. Organization by Component Type**
- Group by component type: Buttons → Cards → Forms → Navigation → etc.
- Display all variants and states for each component
- Suitable for use as design system documentation

**2. State Demonstration**
- Display all interaction states for each component
- Provide state toggle buttons for testing

**3. Code Reference**
- Optional: Display code snippets next to each component

### Component Showcase Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Project] - Component Showcase</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Simplified page skeleton -->
  <header class="showcase-header">
    <h1>[Project] Design System</h1>
  </header>

  <main class="showcase-main">
    <!-- Grouped by component type -->
    <section class="showcase" data-section="buttons">
      <h2>Buttons</h2>
      <div class="showcase-grid">
        <div class="showcase-item">
          <span class="showcase-label">Primary - Default</span>
          <button class="btn-primary">Primary Button</button>
        </div>
        <div class="showcase-item">
          <span class="showcase-label">Primary - Hover</span>
          <button class="btn-primary is-hover">Hover State</button>
        </div>
        <div class="showcase-item">
          <span class="showcase-label">Primary - Disabled</span>
          <button class="btn-primary" disabled>Disabled</button>
        </div>
      </div>
    </section>

    <section class="showcase" data-section="cards">
      <h2>Cards</h2>
      <div class="showcase-grid">
        <!-- All card variants -->
      </div>
    </section>

    <section class="showcase" data-section="forms">
      <h2>Form Elements</h2>
      <div class="showcase-grid">
        <!-- All form elements -->
      </div>
    </section>

    <section class="showcase" data-section="colors">
      <h2>Color Palette</h2>
      <div class="color-swatches">
        <!-- Color display -->
      </div>
    </section>

    <section class="showcase" data-section="typography">
      <h2>Typography</h2>
      <!-- Typography hierarchy display -->
    </section>

    <section class="showcase" data-section="spacing">
      <h2>Spacing Scale</h2>
      <!-- Spacing display -->
    </section>

    <section class="showcase" data-section="animations">
      <h2>Animations</h2>
      <!-- Animation demos -->
    </section>
  </main>

  <script src="scripts.js"></script>
</body>
</html>
```

---

## Common Requirements (Both Types)

### CSS Structure

```css
/* ========== CSS Variables (Tokens) ========== */
:root {
  /* Colors */
  --color-primary: ...;
  --color-text: ...;

  /* Spacing */
  --space-4: 4px;
  --space-8: 8px;

  /* Motion */
  --motion-fast: 100ms;
  --ease-default: ease-in-out;

  /* Radius */
  --radius-sm: 4px;
}

/* ========== Base / Reset ========== */
*, *::before, *::after { box-sizing: border-box; }

/* ========== Typography ========== */
body { font-family: ...; }

/* ========== Components ========== */
.btn-primary { ... }
.card { ... }
.input { ... }

/* ========== State Styles ========== */
.btn-primary:hover { ... }
.btn-primary:active { ... }
.btn-primary:focus-visible { ... }
.btn-primary:disabled { ... }

/* ========== Animations ========== */
@keyframes fadeInUp { ... }
@keyframes pulse { ... }

.animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }

/* ========== Responsive ========== */
@media (max-width: 768px) { ... }

/* ========== Accessibility ========== */
@media (prefers-reduced-motion: reduce) { ... }
```

### JavaScript Structure

```javascript
// ========== Entrance Animations ==========
document.addEventListener('DOMContentLoaded', () => {
  // Trigger staggered entrance animations
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, i) => {
    card.style.animationDelay = `${i * 100}ms`;
    card.classList.add('animate-fade-in-up');
  });
});

// ========== Interactive Demos ==========
// State toggle buttons for demonstration
// Form validation demos
// Animation replay buttons

// ========== Scroll Animations (if applicable) ==========
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
});
```

### Verification Workflow

After generating the replica page:

1. **Open in browser**: `file:///.../style/<project>-replica/index.html`
2. **Visual comparison**: Side-by-side with original URL
3. **Layout check** (for layout-replica): Verify section order and positioning match the original page
4. **Interaction test**: Verify all hover/focus/active states
5. **Animation test**: Check transitions and keyframe animations
6. **Responsive test**: Resize browser to test breakpoints
7. **Accessibility test**: Tab through elements, check focus styles
8. **⚠️ Component-Level Style Validation** (Phase 4.5): Verify exact style values for each component

---

## Phase 4.5 — Component-Level Style Validation (CRITICAL)

> **This is the "last mile" validation ensuring replica quality — often skipped, leading to inaccurate fonts, spacing, and colors**

### Why This Step is Necessary

Phase 1 bulk extraction captures **general patterns and variable definitions**, but cannot guarantee:
1. Which exact values each specific component actually uses
2. Precise styles for components in different states
3. Inheritance and override situations for nested elements

**Common Omission Issues:**
- `fontWeight: 600` vs `400` — Original uses semibold extensively, replica incorrectly uses normal
- `padding: 6px 14px` vs `8px 16px` — Spacing differences cause visual inconsistency
- `borderRadius: 100px` vs `24px` — Border radius affects visual style
- `color` using wrong semantic level (secondary vs tertiary)

### Validation Workflow

#### Step 1: Identify Key Component Types

List all component types that need validation on the page:

```javascript
// Execute on original page to get key component list
const keyComponents = [
  // Navigation/Header
  { name: 'Login Button', selector: '[class*="login"], [class*="sign"]' },
  { name: 'Search Box', selector: 'input[type="text"], input[placeholder*="search"]' },

  // Section Titles
  { name: 'Section Title', selector: '[class*="section-title"], [class*="block-title"], h2' },
  { name: 'Section Subtitle', selector: '[class*="subtitle"], [class*="section"] p' },

  // Tags/Categories
  { name: 'Category Tab', selector: '[class*="tab"], [class*="tag"], [class*="category"]' },
  { name: 'Hot Tag', selector: '[class*="hot"]' },

  // Cards
  { name: 'Calendar Card Title', selector: '[class*="calendar"] [class*="title"]' },
  { name: 'Material Card Title', selector: '[class*="card"] [class*="title"]' },
  { name: 'Trend Card Title', selector: '[class*="trend"] [class*="title"]' },

  // Buttons
  { name: 'Primary Button', selector: '[class*="btn-primary"], button[class*="primary"]' },
  { name: 'Secondary Button', selector: '[class*="btn-secondary"]' }
];
```

#### Step 2: Extract Exact Styles for Each Component

For each component type, use `getComputedStyle()` to get **actual rendered computed values**:

```javascript
// Component-level style extraction function
function extractComponentStyles(name, selector) {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return null;

  // Use first matching element as representative
  const el = elements[0];
  const style = window.getComputedStyle(el);

  return {
    name: name,
    selector: selector,
    matchCount: elements.length,

    // Typography styles (critical!)
    typography: {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontFamily: style.fontFamily.slice(0, 80),
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      color: style.color
    },

    // Box model
    boxModel: {
      padding: style.padding,
      margin: style.margin,
      width: style.width,
      height: style.height
    },

    // Background and border
    background: {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage !== 'none' ? 'has-image' : 'none',
      borderRadius: style.borderRadius,
      border: style.border,
      boxShadow: style.boxShadow !== 'none' ? style.boxShadow : 'none'
    },

    // Layout
    layout: {
      display: style.display,
      flexDirection: style.flexDirection,
      alignItems: style.alignItems,
      justifyContent: style.justifyContent,
      gap: style.gap
    }
  };
}

// Batch extract styles for all key components
const componentStyleReport = keyComponents.map(c =>
  extractComponentStyles(c.name, c.selector)
).filter(Boolean);

console.log('Component Style Report:', JSON.stringify(componentStyleReport, null, 2));
```

#### Step 3: Execute Same Extraction on Replica Page

After opening the replica page, use the same `extractComponentStyles` function to extract styles.

#### Step 4: Compare Differences and Correct

```javascript
// Style comparison function
function compareStyles(original, replica) {
  const differences = [];

  original.forEach((origComp, index) => {
    const replicaComp = replica[index];
    if (!replicaComp) {
      differences.push({ component: origComp.name, issue: 'Missing in replica' });
      return;
    }

    // Compare typography
    const typoKeys = ['fontSize', 'fontWeight', 'color', 'lineHeight'];
    typoKeys.forEach(key => {
      if (origComp.typography[key] !== replicaComp.typography[key]) {
        differences.push({
          component: origComp.name,
          property: `typography.${key}`,
          original: origComp.typography[key],
          replica: replicaComp.typography[key]
        });
      }
    });

    // Compare boxModel
    if (origComp.boxModel.padding !== replicaComp.boxModel.padding) {
      differences.push({
        component: origComp.name,
        property: 'padding',
        original: origComp.boxModel.padding,
        replica: replicaComp.boxModel.padding
      });
    }

    // Compare background
    if (origComp.background.borderRadius !== replicaComp.background.borderRadius) {
      differences.push({
        component: origComp.name,
        property: 'borderRadius',
        original: origComp.background.borderRadius,
        replica: replicaComp.background.borderRadius
      });
    }
  });

  return differences;
}
```

#### Step 5: Generate Correction Report

```markdown
## Style Difference Report

### Components Requiring Correction

| Component | Property | Original Value | Replica Value | Correction Suggestion |
|-----------|----------|----------------|---------------|----------------------|
| Section Title | fontSize | 24px | 20px | Use --font-size-2xl |
| Category Tab | fontWeight | 600 | 400 | Use --font-weight-semibold |
| Category Tab | padding | 6px 14px | 8px 16px | Match original exactly |
| Login Button | backgroundColor | rgb(30,32,35) | transparent | Add dark background |
```

### High-Frequency Omission Checklist

Based on actual replication experience, the following style properties are most error-prone:

| Property | Common Issue | Verification Method |
|----------|--------------|---------------------|
| **fontWeight** | Original uses 600, replica uses 400 | Compare `fontWeight` of all text elements |
| **fontSize** | Title hierarchy incorrect (20px vs 24px) | Check h2, h3, section titles |
| **color** | Semantic level incorrect (secondary vs tertiary) | Check subtitles, description text |
| **padding** | Spacing imprecise | Check buttons, tabs, card padding |
| **borderRadius** | Border radius mismatch | Check buttons, tabs, cards |
| **backgroundColor** | State background colors missing | Check active/hover states |
| **gap** | Flex gap mismatch | Check card lists, tab lists |

### Validation Script Quick Reference

```javascript
// Execute via evaluate_script in chrome-devtools MCP

// 1. Quick check key styles of specific element
function quickCheck(selector) {
  const el = document.querySelector(selector);
  if (!el) return 'Not found';
  const s = getComputedStyle(el);
  return {
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    color: s.color,
    backgroundColor: s.backgroundColor,
    padding: s.padding,
    borderRadius: s.borderRadius
  };
}

// Example: Check category tab
quickCheck('[class*="category-tab"]');

// 2. Batch check multiple elements
['Login Button', 'Section Title', 'Category Tab', 'Card Title'].forEach(name => {
  console.log(name + ':', quickCheck(selectorMap[name]));
});
```

### Automated Validation Workflow

Recommended automatic validation after generating replica:

1. **Navigate to original page**
2. **Execute `extractComponentStyles`** and save results to `original-styles.json`
3. **Navigate to replica page**
4. **Execute same extraction** and save results to `replica-styles.json`
5. **Run `compareStyles`** to generate difference report
6. **Correct CSS based on difference report**
7. **Repeat steps 3-6 until differences are zero**

### Layout Verification Checklist (CRITICAL)

> **After completing replica generation, must verify the following layout details item by item**

Cross-reference `sectionLayouts` data from `extracted-data.json` to verify each section:

| Verification Item | Check Content | How to Verify |
|-------------------|---------------|---------------|
| **Section Order** | Order of sections appearing on page | Compare with original page scroll order |
| **Section Header Layout** | Arrangement of title + subtitle + tabs | Check `sectionLayouts[n].header.hasHorizontalSiblings` |
| **Flex/Grid Direction** | Arrangement direction of child elements | Check `flexDirection` / `gridTemplateColumns` |
| **Spacing** | Gap between elements | Check `gap` values |
| **Alignment** | Element alignment | Check `alignItems` / `justifyContent` |
| **Fixed Positioning** | Whether sidebar/header is fixed | Check `position: fixed` |

**Verification Script (run in browser)**:

```javascript
// Run on both original page and replica page, compare results
function auditSectionLayouts() {
  const sections = document.querySelectorAll('section, [class*="section"], main > div');
  return Array.from(sections).map((s, i) => {
    const style = getComputedStyle(s);
    const firstChild = s.firstElementChild;
    const firstChildStyle = firstChild ? getComputedStyle(firstChild) : null;

    return {
      index: i,
      class: s.className.split(' ')[0],
      display: style.display,
      flexDirection: style.flexDirection,
      gap: style.gap,
      // Check first child element (usually header container)
      headerContainer: firstChildStyle ? {
        display: firstChildStyle.display,
        flexDirection: firstChildStyle.flexDirection,
        justifyContent: firstChildStyle.justifyContent
      } : null
    };
  });
}
console.table(auditSectionLayouts());
```

**If mismatch found**:
1. Locate the specific section index
2. Compare with layout properties recorded in `sectionLayouts`
3. Correct the corresponding section's CSS in replica

---

## Quality Checklist

### Structured Data Completeness
- [ ] CSS variables extracted (including vendor variables)
- [ ] Layout skeleton covers major sections (header/main/footer)
- [ ] At least 5 components have state difference records
- [ ] Font + icon + third-party library manifest complete
- [ ] **Component internals extracted (Step 3.5)** — Child element structure for each key component
- [ ] **Image/icon dimensions extracted (Step 3.6)** — Exact dimensions for all images and SVGs
- [ ] **Font requirements analyzed (Phase 2.5)** — Web Font loading requirements

### State Matrix Completeness
- [ ] Buttons: default / hover / active / focus-visible / disabled
- [ ] Links: default / hover / visited
- [ ] Inputs: default / focus / invalid / disabled
- [ ] Cards: default / hover (if interactive)

### Motion Evidence Completeness
- [ ] 3+ CSS transitions recorded with duration/easing
- [ ] All @keyframes fully extracted
- [ ] JS-driven motion has sampling or trace evidence
- [ ] Delay chains documented (if present)

### Accessibility Styles
- [ ] focus-visible styles recorded
- [ ] prefers-reduced-motion handling recorded (if exists)
- [ ] color-scheme (dark/light) support recorded (if exists)

### Layout Completeness
- [ ] Page skeleton documented
- [ ] Key component internal layouts documented
- [ ] Responsive breakpoints documented (if applicable)
- [ ] Flex/grid container properties captured
- [ ] **Section-level layouts extracted** (Step 5 complete)
- [ ] **Each section's header layout pattern identified** (horizontal vs vertical)
- [ ] **sectionLayouts data saved to extracted-data.json**

### Screenshots (if used)
- [ ] **Format is WebP or JPEG** (PNG prohibited for screenshots > 500KB)
- [ ] **Each screenshot < 2MB** (verify with `ls -lh`)
- [ ] Screenshots exceeding 2MB have been compressed using `screenshot-optimizer.py`
- [ ] Maximum 5-6 screenshots
- [ ] Prefer element-level screenshots over full page

### Replica Page - Layout Replica Type
- [ ] Page opens without errors
- [ ] **Web Fonts loaded correctly** (check DevTools > Network > Font)
- [ ] **Fonts render correctly on page** (compare with original page font styles)
- [ ] **Section order matches original page**
- [ ] **Fixed-position elements (sidebar/header) positioned correctly**
- [ ] **Internal section layouts (flex/grid) match original**
- [ ] **Each section's header layout pattern is correct** (verify against sectionLayouts)
- [ ] All CSS variables applied correctly
- [ ] Hover/focus/active states working
- [ ] Animations playing correctly
- [ ] Responsive breakpoints functional
- [ ] **Validation scripts produce matching results on original and replica pages**

### Component-Level Style Validation (Phase 4.5 - CRITICAL)

> **This is the most commonly overlooked step that most affects replica quality**

- [ ] **Section Title** — fontSize (typically 24px), fontWeight (typically 600), color match exactly
- [ ] **Section Subtitle** — color uses correct semantic level (secondary vs tertiary)
- [ ] **Category Tab** — fontWeight (600), padding, borderRadius (often 100px) match exactly
- [ ] **Login/Action Button** — complete styles (background color, text color, border-radius, padding) match
- [ ] **Calendar/Card Title** — fontSize, fontWeight, color match exactly
- [ ] **Card Text** — title and count font weights, color contrast correct
- [ ] **Link Text** — hover state color change correct
- [ ] **"Hot" and similar tags** — background color, border-radius (may be asymmetric) match exactly

**Verification Method:**
1. Use `getComputedStyle()` on original page to extract exact values for each component
2. Execute same extraction on replica page
3. Compare fontSize, fontWeight, color, padding, borderRadius item by item
4. Correct all differences until fully consistent

### Placeholder Fidelity (NEW)
- [ ] **All image placeholder dimensions match original `imageDimensions`**
- [ ] **All icon placeholder dimensions match original `svgDimensions`**
- [ ] **Component internal child element placeholders exist with correct dimensions** (verify against `componentInternals`)
- [ ] **Placeholder aspectRatio remains consistent**
- [ ] **Placeholder borderRadius matches original element**

### Background Style Fidelity (NEW)
- [ ] **Component background colors match original**
- [ ] **Gradient backgrounds replicated correctly**
- [ ] **Background images replaced with similar-toned gradients**
- [ ] **Backgrounds change correctly during state transitions** (e.g., active state)

### Replica Page - Component Showcase Type
- [ ] Page opens without errors
- [ ] All components organized by type
- [ ] All component states demonstrated
- [ ] Color palette displayed
- [ ] Typography scale shown
- [ ] Spacing scale shown

---

## Script Quick Reference

### DOM Snapshot
```javascript
__dmDom.capture('.selector')           // Single element
__dmDom.capture('.selector', { children: true })  // With children
__dmDom.captureMany(['.a', '.b'])      // Multiple elements
__dmDom.captureInteractive()            // All buttons/links/inputs
```

### Layout Tools
```javascript
__dmLayout.inspect('.container')        // Layout properties
__dmLayout.skeleton()                   // Page structure
__dmLayout.auditContainers()            // All flex/grid containers
```

### CSS Variables
```javascript
__dmCssVars.extractAll()                // All variable definitions
__dmCssVars.analyzeUsage()              // Variable usage mapping
__dmCssVars.detectVendorVars()          // Third-party variables
```

### Asset Manifest
```javascript
__dmAssets.scan()                       // Full asset scan
__dmAssets.scanFonts()                  // Fonts only
__dmAssets.scanLibraries()              // Libraries only
```

### State Differ
```javascript
await __dmState.diff('.button')         // State differences
await __dmState.auditInteractive()      // Audit all interactive
__dmState.trigger('.el', 'hover')       // Manual trigger
__dmState.release('.el', 'hover')       // Manual release
```

### Motion Tools
```javascript
__dmMotion.quickAudit()                 // One-click full audit
__dmMotion.capture('label')             // WAPI animation snapshot
__dmMotion.sample('.el', { durationMs: 800 })  // rAF sampling
```
