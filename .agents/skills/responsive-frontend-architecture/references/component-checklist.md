# Frontend Component Implementation Checklist

Checklist to validate each component before shipping in the Gabriel Motos web application:

## 1. Global Navigation (`<header>`)
- [ ] Preserves Gabriel Motos brand logo without stretching or modification.
- [ ] Sticky state is smooth with slight backdrop blur (`backdrop-filter: blur(12px)`).
- [ ] Mobile menu toggles with keyboard navigation (`Esc` to close, `Tab` cycle).
- [ ] Proper ARIA attributes: `aria-expanded="false"`, `aria-label="Abrir menu de navegação"`.
- [ ] Prominent primary CTA button linking directly to WhatsApp / phone.

## 2. Cinematic Hero (`<section id="hero">`)
- [ ] Viewport height fits naturally on both mobile and desktop screens without awkward overflow.
- [ ] Headline uses semantic `<h1>` with strong contrast over the video or poster background.
- [ ] High-contrast gradient or solid overlay prevents text legibility issues across varying video frames.
- [ ] Secondary CTA provides smooth scroll to the inventory catalog (`#estoque`).

## 3. Inventory Catalog & Cards (`<section id="estoque">`)
- [ ] Semantic `<article>` wrapping each motorcycle card.
- [ ] Image container has fixed aspect ratio (e.g., `16:9` or `4:3`) to eliminate layout shifts (CLS).
- [ ] Badges for year, mileage, and category clearly separated from pricing.
- [ ] Price formatted in Brazilian Real (`R$ XX.XXX,XX`) using tabular figures.
- [ ] Keyboard accessible: users can navigate cards with `Tab` and activate details with `Enter`/`Space`.

## 4. Vehicle Details Drawer/Modal (`<dialog>` or `[role="dialog"]`)
- [ ] Traps focus inside modal while open.
- [ ] Closes on `Escape` key press and backdrop click.
- [ ] Restores focus to the triggering element upon closing.
- [ ] Technical spec sheet formatted in accessible key-value description list (`<dl>`, `<dt>`, `<dd>`).

## 5. Contact & WhatsApp Integration
- [ ] WhatsApp links pre-populate motorcycle context in message (e.g., `?text=Olá,%20tenho%20interesse%20na%20BMW%20S1000RR`).
- [ ] Phone number formatted with standard `tel:+55...` URI.
- [ ] Address links to Google Maps navigation.
