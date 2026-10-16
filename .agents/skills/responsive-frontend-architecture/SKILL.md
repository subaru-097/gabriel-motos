---
name: responsive-frontend-architecture
description: Architecture patterns, layout strategies, and component design for a responsive, mobile-first motorcycle dealership website. Use when planning and structuring frontend components, layout grids, mobile touch ergonomics, and fluid responsive views.
---

# Responsive Frontend Architecture Skill

This skill governs component architecture, layout construction, and mobile-first responsiveness for the **Gabriel Motos** dealership web application.

## 1. Architectural Principles

- **Mobile-First Layout**: Build every section from the mobile viewport outward (`375px` default, scaling up to `1440px+`).
- **Semantic HTML Structure**: Maintain clean landmark hierarchy (`<header>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`) without "div-soup".
- **Zero Heavy Framework Lock-in**: Implement modular, standards-based components using semantic HTML, structured CSS, and modern vanilla JavaScript for high runtime performance and instant rendering.
- **Strict Separation of Concerns**: Keep layout scaffolding distinct from theme styling and dynamic logic.

---

## 2. Component Blueprint

The website architecture breaks down into dedicated modular sections:

1. **Header & Navigation**:
   - Desktop: Glassmorphic sticky bar with intact Gabriel Motos logo, navigation links, inventory counter, and direct WhatsApp/Phone CTA.
   - Mobile: High-contrast header with compact logo, accessible hamburger menu toggle (`aria-expanded`, `aria-controls`), and thumb-friendly quick call/chat button.
2. **Hero Section (Cinematic Showcase)**:
   - Full-bleed or framed container featuring background video showcase (S1000RR webm).
   - High-contrast text overlay with clear dealership value proposition ("Seminovas e Novas de Alta Cilindrada").
   - Action cluster: "Ver Estoque" (smooth scroll to catalog) and "Falar com Consultor".
3. **Showroom / Inventory Catalog**:
   - Filter bar: Category pills (Sport, Naked, Custom, Trail/Adventure, Touring), sorting, and search.
   - Motorcycle Cards: Clean image presentation, model name, year, mileage (km), engine displacement (cc), price tag, and "Tenho Interesse" trigger.
4. **Quick Specs Drawer / Modal**:
   - Accessible modal (`role="dialog"`, `aria-modal="true"`, focus trap) displaying full technical specifications (potência, torque, peso, freios ABS, modos de pilotagem).
5. **Trade-in / Financing Calculator Section**:
   - Interactive financing simulation or direct trade-in evaluation form.
6. **Dealership Credibility & Location**:
   - Physical address, Google Maps link, opening hours, showroom photo gallery, customer reviews.
7. **Footer**:
   - Legal notice, copyright, social links, CNPJ/address disclosure, back-to-top button.

For complete component checklist and implementation criteria, see [references/component-checklist.md](references/component-checklist.md).

---

## 3. Responsive Breakpoint & Layout Strategy

### Breakpoints
- **Mobile compact**: `360px – 480px` (Single column, full-width cards, 16px horizontal margins)
- **Tablet / Phablet**: `481px – 768px` (2-column inventory grid, collapsed navigation)
- **Desktop**: `769px – 1024px` (Expanded navigation, 2 to 3-column inventory grid)
- **Wide Display**: `1025px – 1440px+` (Max-width container `1280px` or `1400px`, 3 to 4-column inventory grid)

### Touch Ergonomics (Mobile)
- All interactive targets (buttons, links, inputs, carousel arrows) must be at least **48x48px** bounding box.
- Key actions (WhatsApp, Financiamento, Ligar) positioned within comfortable one-handed thumb reach on mobile screens.
- Avoid hover-dependent content; all information must be accessible via tap/click.
