---
name: cinematic-design-system
description: Guidelines and design system for high-quality, cinematic motorcycle dealership UI. Covers visual direction, concrete/light-gray balanced palette, typography hierarchy, spacing scale, reusable UI patterns, and subtle restrained micro-animations.
---

# Cinematic Design System Skill

This skill governs the visual direction, design tokens, and aesthetic execution for the **Gabriel Motos** motorcycle dealership web experience.

## 1. Visual Direction & Aesthetic Philosophy

- **Balanced Concrete & Light-Gray Palette**: Avoid harsh pitch-black backgrounds and washed-out pure whites. The visual atmosphere uses calibrated neutral grays inspired by polished concrete, brushed titanium, and high-performance asphalt.
- **High Optical Contrast**: Text, calls-to-action, and badges maintain crisp contrast against surface layers, exceeding WCAG AAA standards for legibility.
- **Cinematic Framing**: Generous whitespace, razor-thin subtle borders (`1px solid rgba(0,0,0,0.08)` or `rgba(255,255,255,0.12)` depending on surface), and architectural card layouts.
- **Restrained Motion**: Animation must feel mechanical, precise, and understated—reminiscent of automotive instrumentation—never distracting or bouncy.

---

## 2. Token Architecture & Surface Palette

For exact CSS custom properties and token definitions, refer to [references/design-tokens.md](references/design-tokens.md).

### Surface Layers
- **Background Root (`--surface-ground`)**: Soft architectural concrete light gray (`#F3F4F6` to `#E5E7EB`).
- **Surface Elevation 1 (`--surface-card`)**: Crisp elevated neutral card (`#FFFFFF` with subtle outline).
- **Surface Elevation 2 (`--surface-elevated`)**: Hover or active state surface.
- **Dark Surface Accent (`--surface-dark`)**: Deep graphite/charcoal (`#111827`) reserved for high-impact contrast zones (e.g., hero overlays, sticky nav accents, spec callouts).

### Brand & Accents
- **Primary Text (`--text-primary`)**: High-contrast near-black (`#0F172A`).
- **Secondary Text (`--text-secondary`)**: Neutral muted slate (`#475569`).
- **Brand Accent (`--accent-orange` or `--accent-racing`)**: Curated motorsport tone for badges, CTAs, and active states.
- **Success / Availability (`--status-available`)**: Emerald green for "In Stock" / "Pronta Entrega".

---

## 3. Typography Hierarchy

- **Font Family**: Modern, geometric, automotive-grade sans-serif (e.g., `Outfit`, `Inter`, or `Cabinet Grotesk`).
- **Headings**: Tight tracking (`letter-spacing: -0.02em` to `-0.03em`), bold weights (600–800) for commanding titles.
- **Numbers & Metrics**: Tabular figures (`font-variant-numeric: tabular-nums`) for engine displacement (cc), horsepower (cv), torque (kgfm), and pricing (R$).
- **Fluid Type**: Use `clamp()` for fluid headings between mobile and desktop without sudden layout jumps.

---

## 4. Subtle Motion & Micro-Interactions

### Timing & Curves
- **Standard Transition**: `200ms cubic-bezier(0.16, 1, 0.3, 1)` for hover states, button backgrounds, and borders.
- **Elevated Transition**: `300ms cubic-bezier(0.16, 1, 0.3, 1)` for modal entries and card elevations.

### Rules of Motion
1. **Never animate layout properties**: Never transition `width`, `height`, `margin`, or `padding`. Always use `transform` (`translateY`, `scale`) and `opacity`.
2. **Subtle Elevation**: Hover lift should be minimal: `transform: translateY(-2px)` or `transform: translateY(-4px)` with softened shadow.
3. **Accessibility (Reduced Motion)**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
