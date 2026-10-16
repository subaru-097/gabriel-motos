---
name: dealership-seo-media-performance
description: Best practices for automotive dealership technical SEO, structured data (Schema.org), and high-performance video and image asset delivery. Use when configuring metadata, OpenGraph, JSON-LD schemas, Hero video optimization, and Core Web Vitals (LCP/CLS).
---

# Dealership SEO & Media Performance Skill

This skill provides procedures and guidelines for high-performance media delivery (specifically Hero video and inventory imagery) and technical SEO tailored for an automotive/motorcycle dealership.

## 1. Video & Media Handling Architecture

The workspace contains the motorcycle video asset (`s1000rr webm.webm`) and the brand logo (`logo gabriel motos.png`). When incorporating them in the implementation phase, follow these performance standards:

### Hero Background Video Delivery
1. **Attributes Required**:
   ```html
   <video
     autoplay
     muted
     loop
     playsinline
     preload="metadata"
     poster="assets/hero-poster.webp"
     aria-hidden="true"
     tabindex="-1"
   >
     <source src="s1000rr webm.webm" type="video/webm">
   </video>
   ```
2. **Key Rationale**:
   - `muted` and `playsinline` are required for autoplay policy compliance across iOS Safari and Android Chrome.
   - `preload="metadata"` prevents downloading the entire video stream before the initial layout renders, preserving network bandwidth for critical resources.
   - A high-quality lightweight `poster` image ensures zero blank flashes during video buffering and serves as the visual fallback if mobile battery saver or data saver prevents autoplay.
   - `aria-hidden="true"` and `tabindex="-1"` prevent the decorative background video from interfering with screen readers and keyboard focus navigation.

### Image Optimization Rules
1. **Explicit Dimensions**: Always supply `width` and `height` (or CSS `aspect-ratio`) to prevent Cumulative Layout Shift (CLS).
2. **LCP Image Prioritization**: If a hero motorcycle image is the Largest Contentful Paint candidate, add `fetchpriority="high"` and avoid `loading="lazy"` on it.
3. **Lazy Loading**: Use `loading="lazy"` and `decoding="async"` on all catalog and gallery images below the fold.

### Performance Verification Workflow
- Use the built-in `debug-optimize-lcp` skill and `chrome-devtools` to record performance traces and ensure Largest Contentful Paint (LCP) remains under 2.5s on mobile throttled emulation.

---

## 2. Basic Technical SEO for Motorcycle Dealership

### Document Header & Metadata Checklist
- **Title Tag**: Unique, localized title formatted as:
  `<title>Gabriel Motos | Concessionária de Motos Novas e Seminovas em [Cidade]</title>`
- **Meta Description**: Compelling 150–160 character description highlighting inventory, financing conditions, and trade-in.
- **Viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- **Canonical Link**: `<link rel="canonical" href="https://gabrielmotos.com.br/">`
- **OpenGraph & Twitter Cards**: Complete Open Graph metadata (`og:title`, `og:description`, `og:image`, `og:type="website"`).

### Schema.org Structured Data (JSON-LD)
Include rich snippets using Schema.org specifications for automotive dealerships (`AutoDealer` or `MotorcycleDealer` subtype of `AutomotiveBusiness`):
- Dealership business details: name, logo reference, address, telephone, opening hours, geo coordinates.
- Inventory item listings (`Product` / `Vehicle` schemas with `offers` containing price in BRL and availability).

See [references/schema-templates.md](references/schema-templates.md) for ready-to-use JSON-LD structured data templates.
