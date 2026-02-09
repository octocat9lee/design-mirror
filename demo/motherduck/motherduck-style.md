# MotherDuck Design System Style Guide

**Project:** motherfuck (MotherDuck Homepage Replica)
**Source URL:** https://motherduck.com/
**Extraction Date:** 2026-02-08

---

## Overview

MotherDuck's design system features a distinctive retro-tech aesthetic with:
- Warm beige backgrounds creating a friendly, approachable feel
- Bold uppercase typography using a monospace font (Aeonik Mono)
- Playful duck illustrations and geometric decorations
- High-contrast buttons with hover "lift" effects
- Yellow and light blue accent colors that evoke ducks and data/cloud themes

### Visual Signatures
1. **Brutalist button style** - 2px borders, tiny border-radius, box-shadow hover effect
2. **Marquee/ticker sections** - Scrolling text banners in yellow and neutral backgrounds
3. **Illustrated ducks** - Cartoon duck mascots in various professional roles
4. **Geometric decorations** - Clouds, diamonds, cylinders as floating elements

---

## CSS Variables

```css
:root {
  /* Colors - Primary */
  --color-primary: rgb(111, 194, 255);       /* Light blue - CTAs, highlights */
  --color-secondary: rgb(255, 222, 0);       /* Yellow - subscribe, badges */
  --color-accent-teal: rgb(83, 219, 201);    /* Teal - decorative */
  --color-accent-coral: rgb(255, 113, 105);  /* Coral - alerts, badges */

  /* Colors - Text */
  --color-text-primary: rgb(56, 56, 56);     /* Main body text */
  --color-text-secondary: rgb(161, 161, 161); /* Muted/placeholder text */
  --color-text-white: rgb(255, 255, 255);
  --color-text-black: rgb(0, 0, 0);

  /* Colors - Backgrounds */
  --color-bg-body: rgb(244, 239, 234);       /* Warm beige - main background */
  --color-bg-white: rgb(248, 248, 247);      /* Off-white - inputs, cards */
  --color-bg-dark: rgb(56, 56, 56);          /* Dark gray - footer */
  --color-bg-blue-light: rgb(111, 194, 255); /* Blue sections */

  /* Typography */
  --font-mono: "Aeonik Mono", monospace;
  --font-sans: Inter, Arial, sans-serif;

  --font-size-xs: 14px;
  --font-size-sm: 16px;
  --font-size-md: 18px;
  --font-size-lg: 24px;
  --font-size-xl: 32px;
  --font-size-2xl: 48px;
  --font-size-hero: 72px;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 600;

  --line-height-tight: 1.2;
  --line-height-normal: 1.6;

  --letter-spacing-wide: 0.32px;
  --letter-spacing-wider: 1.44px;

  /* Spacing */
  --space-xs: 8px;
  --space-sm: 16px;
  --space-md: 24px;
  --space-lg: 40px;
  --space-xl: 60px;
  --space-2xl: 90px;

  /* Layout */
  --max-width: 1320px;
  --header-height: 90px;

  /* Border */
  --border-width: 1.9px;
  --border-radius: 2px;
  --border-color: rgb(56, 56, 56);

  /* Motion */
  --transition-fast: 0.12s ease-in-out;
  --transition-normal: 0.2s ease-in-out;
}
```

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `rgb(111, 194, 255)` | Primary CTAs, blue sections, highlights |
| `--color-secondary` | `rgb(255, 222, 0)` | Subscribe section, badges, marquee |
| `--color-accent-teal` | `rgb(83, 219, 201)` | Decorative elements (cylinder) |
| `--color-accent-coral` | `rgb(255, 113, 105)` | Subscribe badge, alerts |
| `--color-text-primary` | `rgb(56, 56, 56)` | Headings, body text, borders |
| `--color-text-secondary` | `rgb(161, 161, 161)` | Placeholder text, disabled states |
| `--color-bg-body` | `rgb(244, 239, 234)` | Page background (warm beige) |
| `--color-bg-dark` | `rgb(56, 56, 56)` | Footer background |

---

## Typography

### Font Families

1. **Aeonik Mono** - Primary brand font (headings, buttons, labels)
   - Note: Premium font, use system monospace as fallback
   - Fallback stack: `"Aeonik Mono", "SF Mono", Menlo, Monaco, Consolas, monospace`

2. **Inter** - Body text, paragraphs, form inputs
   - Google Fonts: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600`

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Transform |
|---------|------|--------|-------------|----------------|-----------|
| H1 (Hero) | 72px | 400 | 1.2 | 1.44px | uppercase |
| H2 | 32px | 400 | 1.2 | 0.32px | uppercase |
| H3 | 24px | 400 | 1.2 | 0.32px | uppercase |
| Body | 16px | 400 | 1.6 | normal | none |
| Button | 16px | 400 | 1.0 | 0.32px | uppercase |
| Small | 14px | 400 | 1.6 | normal | none |

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 8px | Tight gaps, icon margins |
| `--space-sm` | 16px | Component padding, small gaps |
| `--space-md` | 24px | Section padding (small) |
| `--space-lg` | 40px | Container padding, card gaps |
| `--space-xl` | 60px | Section spacing |
| `--space-2xl` | 90px | Large section padding |

---

## Component Styles

### Buttons

**Primary Button (CTA)**
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11.5px 18px;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.32px;
  color: rgb(56, 56, 56);
  background-color: rgb(111, 194, 255);
  border: 1.9px solid rgb(56, 56, 56);
  border-radius: 2px;
  cursor: pointer;
  transition: box-shadow 0.12s ease-in-out, transform 0.12s ease-in-out;
}

.btn-primary:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 rgb(56, 56, 56);
}
```

**Secondary Button (Ghost)**
```css
.btn-secondary {
  padding: 11.5px 18px;
  font-family: var(--font-mono);
  font-size: 16px;
  text-transform: uppercase;
  color: rgb(56, 56, 56);
  background-color: transparent;
  border: 1.9px solid rgb(56, 56, 56);
  border-radius: 2px;
}

.btn-secondary:hover {
  background-color: rgb(248, 248, 247);
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 rgb(56, 56, 56);
}
```

**Disabled Button**
```css
.btn-disabled {
  color: rgb(161, 161, 161);
  background-color: rgb(248, 248, 247);
  border-color: rgb(161, 161, 161);
  cursor: not-allowed;
}
```

### Navigation Links

```css
.nav-link {
  display: flex;
  align-items: center;
  padding: 4px 12px;
  font-family: var(--font-mono);
  font-size: 16px;
  letter-spacing: 0.32px;
  color: rgb(56, 56, 56);
  border: 1px solid transparent;
  border-radius: 2px;
  text-transform: uppercase;
}

.nav-link:hover {
  border-color: rgb(56, 56, 56);
}
```

### Form Inputs

```css
.form-input {
  width: 100%;
  padding: 16px 20px;
  font-family: Inter, sans-serif;
  font-size: 16px;
  color: rgb(0, 0, 0);
  background: rgba(248, 248, 247, 0.7);
  border: 1.9px solid rgb(56, 56, 56);
  border-radius: 2px;
  transition: 0.2s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: rgb(111, 194, 255);
  background: white;
}

.form-input::placeholder {
  color: rgb(161, 161, 161);
}
```

### Cards

**Feature Card (Data Warehouse + AI Section)**
```css
.feature-card {
  display: flex;
  gap: 24px;
  padding: 40px;
  background: white;
  border: 1.9px solid rgb(56, 56, 56);
  border-radius: 2px;
}
```

**Testimonial Card**
```css
.testimonial-card {
  padding: 40px;
  background: white;
  border: 1.9px solid rgb(56, 56, 56);
  border-radius: 2px;
  margin-bottom: 24px;
}
```

**Community Card (Social Proof)**
```css
.community-card {
  padding: 24px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: 0.3s ease;
}

.community-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}
```

---

## State Matrix

| Component | Default | Hover | Active | Focus | Disabled |
|-----------|---------|-------|--------|-------|----------|
| **Primary Button** | Blue bg, dark border | Lift effect, shadow | Pressed down | Blue outline | Gray bg, gray text |
| **Secondary Button** | Transparent bg | Off-white bg, lift | Pressed | Blue outline | Gray text |
| **Nav Link** | Transparent border | Dark border | - | Blue outline | - |
| **Form Input** | Semi-transparent bg | - | - | Blue border, white bg | - |
| **Card** | White bg | Subtle lift | - | - | - |

---

## Animation Checklist

### Transitions

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Buttons | box-shadow, transform | 0.12s | ease-in-out |
| Form inputs | all, padding | 0.2s | ease-in-out |
| Cards | transform, box-shadow | 0.3s | ease |
| Nav links | all | instant | - |

### Keyframe Animations

**Marquee Scroll**
```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-track {
  animation: marquee 30s linear infinite;
}
```

**Fade In Up (Scroll Reveal)**
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
```

---

## Layout Patterns

### Page Structure
```
Header (sticky)
├── Logo
├── Main Navigation
└── Actions (Login, Start Free)

Main Content
├── Hero Section
│   ├── Headline
│   ├── Subtitle
│   ├── CTA Buttons
│   └── Demo Preview
├── Book Promo
├── Yellow Marquee ("DATA WAREHOUSE + AI")
├── Feature Cards Section (blue bg)
├── Who Is It For (3-column grid)
├── Use Cases Marquee
├── Use Cases Content
├── How We Scale
│   ├── Duckling Sizes (horizontal scroll)
│   └── Diagrams
├── Ecosystem Grid
├── Testimonials
├── Community Grid
├── Join The Flock
└── Subscribe Section (yellow bg)

Footer (dark bg)
├── Logo + Social
├── Link Columns (5)
└── Legal + Badges
```

### Container
```css
.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 40px;
}
```

### Grid Layouts

**3-Column (Who Is It For)**
```css
.who-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}
```

**2-Column (Feature Cards)**
```css
.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}
```

**Auto-fill Grid (Ecosystem)**
```css
.ecosystem-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
```

---

## Asset Dependencies

### Fonts
- **Aeonik Mono** - Premium font (fallback to system monospace)
- **Inter** - Google Fonts

### Icons
- Inline SVG icons (no icon library)
- Custom duck illustrations

### Third-party Libraries
- None detected (vanilla JavaScript)

---

## Accessibility Styles

### Focus States
```css
*:focus-visible {
  outline: 2px solid rgb(43, 165, 255);
  outline-offset: 2px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Replica Files

```
style/motherfuck-replica/
├── index.html      # Complete page structure
├── styles.css      # All styles with CSS variables
└── scripts.js      # Interactions and animations
```

### Verification Checklist

- [x] Header navigation layout matches
- [x] Hero section typography and spacing
- [x] Button styles with hover effects
- [x] Marquee scrolling animation
- [x] Blue feature section background
- [x] Card component styles
- [x] Form input styling
- [x] Footer layout and colors
- [x] Responsive breakpoints
- [ ] Duck illustrations (placeholders used)
- [ ] Exact font match (Aeonik Mono requires license)
