# Design System Tokens & CSS Variables Reference

Use this reference when authoring styles or verifying color/typography tokens for the Gabriel Motos interface.

## CSS Root Variables

```css
:root {
  /* Concrete & Balanced Neutral Surfaces */
  --surface-ground: #f3f4f6;       /* Neutral concrete base background */
  --surface-ground-alt: #e5e7eb;   /* Deeper concrete tone for contrast sections */
  --surface-card: #ffffff;         /* Pure clean card surface */
  --surface-card-subtle: #f8fafc;  /* Subtle offset card surface */
  --surface-dark: #111827;         /* Deep obsidian/charcoal for cinematic sections */
  --surface-dark-elevated: #1f2937;/* Elevated dark container */

  /* Text & Contrast */
  --text-primary: #0f172a;         /* High-contrast charcoal text (WCAG AAA) */
  --text-secondary: #475569;       /* Slate body text */
  --text-muted: #64748b;           /* Metadata, specs labels */
  --text-inverse: #f8fafc;         /* White text on dark surfaces */
  --text-inverse-muted: #94a3b8;   /* Muted text on dark surfaces */

  /* Automotive Accent Palette */
  --accent-primary: #ea580c;       /* Dynamic motorsport orange */
  --accent-primary-hover: #c2410c; /* Deeper hover orange */
  --accent-primary-subtle: #ffedd5;/* Subtle tinted badge background */
  --accent-cyan: #0284c7;          /* High-tech precision blue */

  /* Borders & Dividers */
  --border-light: rgba(15, 23, 42, 0.08);
  --border-medium: rgba(15, 23, 42, 0.14);
  --border-dark: rgba(255, 255, 255, 0.12);

  /* Shadows (Soft Ambient) */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
  --shadow-dark: 0 12px 30px -4px rgba(0, 0, 0, 0.4);

  /* Typography Scale */
  --font-family-sans: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 2rem;      /* 32px */
  --font-size-hero: clamp(2.25rem, 5vw + 1rem, 4.5rem);

  /* Spacing Scale (8pt grid) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */

  /* Border Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Motion & Transitions */
  --ease-precision: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-quick: 150ms;
  --duration-normal: 250ms;
  --duration-smooth: 350ms;
}
```
