# MotherDuck Design System – Style Guide

**Project**: MotherDuck
**URL**: https://motherduck.com/
**Type**: SaaS Product Website
**Extracted**: 2026-02-08

---

## 1. Overview

MotherDuck employs a clean, modern design style combined with duck-themed branding. Monospace typography conveys technical credibility while bright colors maintain approachability.

**Visual Characteristics**:
- Monospace typography (Aeonik Mono)
- High-contrast color palette + bright accent colors
- Flat design, minimal shadows
- Unified 2px border radius
- Generous whitespace

---

## 2. CSS Variables

```css
:root {
  /* === Colors === */
  --color-brand-primary: #FFDE00;
  --color-brand-secondary: #53DBC9;
  --color-brand-tertiary: #6FC2FF;

  --color-text-primary: #383838;
  --color-text-secondary: #A1A1A1;
  --color-text-inverse: #FFFFFF;

  --color-bg-base: #FFFFFF;
  --color-bg-cream: #F4EFEA;
  --color-bg-muted: #F8F8F7;

  --color-border: #E5E5E5;
  --color-border-dark: #383838;

  /* === Spacing === */
  --space-4: 4px;
  --space-8: 8px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  --space-48: 48px;
  --space-64: 64px;

  /* === Typography === */
  --font-family-primary: "Aeonik Mono", ui-monospace, monospace;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;

  /* === Motion === */
  --motion-fast: 150ms;
  --motion-normal: 300ms;
  --motion-slow: 500ms;
  --ease-default: ease;
  --ease-out: ease-out;

  /* === Radius === */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-full: 9999px;

  /* === Layout === */
  --header-height: 72px;
  --container-max-width: 1200px;
}
```

---

## 3. Font Requirements

> Extracted from `fontRequirements`

```html
<!-- Web Font Loading -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Aeonik+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

| Font | Weights | Type | Loading |
|------|---------|------|---------|
| Aeonik Mono | 400, 500, 700 | Web Font | Google Fonts |
| ui-monospace | - | System | Fallback |

---

## 4. Layout Patterns

### 4.1 Page Skeleton

```
┌─────────────────────────────────────────┐
│  Header (h: 72px, fixed, z: 100)        │
├─────────────────────────────────────────┤
│  Hero (h: 500-600px, flex center)       │
├─────────────────────────────────────────┤
│  Main Content (max-w: 1200px, mx: auto) │
│  ┌─────┐ ┌─────┐ ┌─────┐               │
│  │Card │ │Card │ │Card │  (grid 3-col) │
│  └─────┘ └─────┘ └─────┘               │
├─────────────────────────────────────────┤
│  Footer (bg: cream, py: 64px)           │
└─────────────────────────────────────────┘
```

### 4.2 Responsive Breakpoints

| Breakpoint | Width | Container | Columns |
|------------|-------|-----------|---------|
| Mobile | < 768px | 100% - 48px | 1 |
| Tablet | 768-1024px | 720px | 2 |
| Desktop | > 1024px | 1200px | 3 |

---

## 5. Component Styles

### 5.1 Primary Button

```css
.btn-primary {
  background: var(--color-brand-primary);
  color: var(--color-text-primary);
  padding: 12px 24px;
  border: 2px solid var(--color-border-dark);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--motion-fast) var(--ease-default);
}
```

### 5.2 Card

```css
.card {
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-24);
  transition: box-shadow var(--motion-normal) var(--ease-out),
              transform var(--motion-normal) var(--ease-out);
}
```

---

## 6. Component Internals

> Extracted from `componentInternals` — Ensures placeholder dimensions are correct

### 6.1 Feature Card

```javascript
{
  selector: ".feature-card",
  childCount: 3,
  children: [
    {
      index: 0,
      tag: "div",
      className: "card-icon",
      dimensions: { width: "48px", height: "48px", aspectRatio: 1 },
      background: { color: "#F4EFEA" },
      borderRadius: "8px"
    },
    {
      index: 1,
      tag: "h3",
      className: "card-title",
      dimensions: { width: "100%", height: "28px" }
    },
    {
      index: 2,
      tag: "p",
      className: "card-desc",
      dimensions: { width: "100%", height: "auto" }
    }
  ]
}
```

### 6.2 Placeholder Generation

```html
<!-- Generate placeholders based on componentInternals -->
<div class="feature-card">
  <!-- Icon placeholder: 48x48, radius 8px -->
  <div class="card-icon-placeholder"
       style="width: 48px; height: 48px;
              background: linear-gradient(135deg, #F4EFEA, #E5E5E5);
              border-radius: 8px;">
  </div>
  <h3 class="card-title">Feature Title</h3>
  <p class="card-desc">Feature description text.</p>
</div>
```

---

## 7. Image Dimensions

> Extracted from `imageDimensions` — Used for generating correctly-sized placeholders

| Element | Rendered Size | Aspect Ratio | Object Fit |
|---------|---------------|--------------|------------|
| Hero Image | 600×400 | 1.5 | cover |
| Logo | 120×32 | 3.75 | contain |
| Card Thumb | 280×180 | 1.56 | cover |
| Icon | 24×24 | 1 | - |

```html
<!-- Hero image placeholder -->
<div class="hero-image-placeholder"
     style="width: 600px; height: 400px;
            background: linear-gradient(135deg, #F4EFEA, #E5E5E5);
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;">
  <span style="color: #A1A1A1; font-size: 14px;">600×400</span>
</div>
```

---

## 8. State Matrix

### 8.1 Button States

| State | Background | Border | Transform | Transition |
|-------|------------|--------|-----------|------------|
| Default | `#FFDE00` | `#383838` | none | - |
| Hover | `#FFDE00` | `#383838` | translateY(-2px) | 150ms ease |
| Active | `#E5C700` | `#383838` | translateY(0) | 100ms |
| Focus-visible | `#FFDE00` | `#383838` + outline | none | - |
| Disabled | `#E5E5E5` | `#A1A1A1` | none | - |

### 8.2 Card States

| State | Shadow | Transform | Border |
|-------|--------|-----------|--------|
| Default | none | none | `1px solid #E5E5E5` |
| Hover | `0 4px 12px rgba(0,0,0,0.1)` | translateY(-2px) | `1px solid #E5E5E5` |

---

## 9. Animation Checklist

### 9.1 Transitions

| Component | Property | Duration | Easing |
|-----------|----------|----------|--------|
| Button | all | 150ms | ease |
| Card | box-shadow, transform | 300ms | ease-out |
| Link | color | 150ms | ease |
| Input | border-color | 150ms | ease |

### 9.2 Keyframes

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}
```

---

## 10. Accessibility Styles

```css
/* Focus visible */
:focus-visible {
  outline: 2px solid var(--color-text-primary);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Replica Validation

> Replica page validation checklist

### Font Loading
- [x] Web Font loaded in `<head>`
- [x] `document.fonts.check('16px "Aeonik Mono"')` returns `true`

### Placeholder Fidelity
- [x] Hero Image: 600×400, aspectRatio 1.5
- [x] Card Icon: 48×48, borderRadius 8px
- [x] Logo: 120×32

### Background Styles
- [x] Header: `#FFFFFF`
- [x] Hero: `#F4EFEA`
- [x] Cards: `#FFFFFF` with `#E5E5E5` border
- [x] Footer: `#F4EFEA`

### States Working
- [x] Button hover: translateY(-2px)
- [x] Card hover: shadow + translateY(-2px)
- [x] Input focus: border-color change
