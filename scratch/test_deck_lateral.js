const { chromium } = require('c:/Users/User/Desktop/Saracota_v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // --- 1. DESKTOP TEST ---
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await desktopContext.newPage();
  await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });

  // Dismiss loader if still visible
  await page.evaluate(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('is-hidden');
    const heroText = document.getElementById('heroText');
    if (heroText) heroText.classList.add('is-visible');
  });
  await page.waitForTimeout(600);

  // Scroll Section 2 into view
  const section2 = page.locator('#categorias');
  await section2.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const desktopInfo = await page.evaluate(() => {
    const sec = document.getElementById('categorias');
    const deck = document.getElementById('styles-deck');
    const container = document.getElementById('styles-deck-container');
    const cards = Array.from(document.querySelectorAll('.style-card'));

    const activeRect = cards.find(c => c.dataset.pos === '0').getBoundingClientRect();
    const right1Card = cards.find(c => c.dataset.pos === '1');
    const right2Card = cards.find(c => c.dataset.pos === '2');
    const r1Rect = right1Card ? right1Card.getBoundingClientRect() : null;
    const r2Rect = right2Card ? right2Card.getBoundingClientRect() : null;

    // Overlap and visible width calculations:
    // Right 1 is covered by Center card on its left:
    const r1CoveredPx = r1Rect ? Math.max(0, activeRect.right - r1Rect.left) : 0;
    const r1VisiblePx = r1Rect ? r1Rect.width - r1CoveredPx : 0;
    const r1CoveredPct = r1Rect ? (r1CoveredPx / r1Rect.width * 100).toFixed(1) + '%' : '0%';
    const r1VisiblePct = r1Rect ? (r1VisiblePx / r1Rect.width * 100).toFixed(1) + '%' : '0%';

    // Right 2 is covered by Right 1 on its left:
    const r2CoveredPx = (r2Rect && r1Rect) ? Math.max(0, r1Rect.right - r2Rect.left) : 0;
    const r2VisiblePx = r2Rect ? r2Rect.width - r2CoveredPx : 0;
    const r2VisiblePct = r2Rect ? (r2VisiblePx / r2Rect.width * 100).toFixed(1) + '%' : '0%';

    return {
      sectionHeight: sec.getBoundingClientRect().height,
      containerWidth: container.getBoundingClientRect().width,
      containerHeight: container.getBoundingClientRect().height,
      activeCardSize: `${Math.round(activeRect.width)} x ${Math.round(activeRect.height)} px`,
      card1Coverage: {
        coveredPx: Math.round(r1CoveredPx),
        visiblePx: Math.round(r1VisiblePx),
        coveredPct: r1CoveredPct,
        visiblePct: r1VisiblePct
      },
      card2Coverage: {
        visibleStripPx: Math.round(r2VisiblePx),
        visiblePct: r2VisiblePct
      },
      cards: cards.map((c, i) => {
        const rect = c.getBoundingClientRect();
        const style = window.getComputedStyle(c);
        return {
          index: c.dataset.index,
          pos: c.dataset.pos,
          label: c.getAttribute('aria-label'),
          isActive: c.classList.contains('is-active'),
          renderedWidth: Math.round(rect.width),
          renderedHeight: Math.round(rect.height),
          transform: style.transform,
          opacity: style.opacity,
          zIndex: style.zIndex,
        };
      })
    };
  });

  console.log('--- DESKTOP METRICS ---');
  console.log('Section 2 Total Height:', desktopInfo.sectionHeight, 'px');
  console.log('Deck Container:', desktopInfo.containerWidth, 'x', desktopInfo.containerHeight, 'px');
  console.log('Cards count:', desktopInfo.cards.length);
  console.log(JSON.stringify(desktopInfo.cards, null, 2));

  // Screenshot Desktop Section 2
  await section2.screenshot({
    path: path.join(outputDir, 'lateral_stack_desktop.png')
  });

  // Test Next Arrow Transition
  console.log('\n--- TESTING DECK TRANSITION ---');
  const btnNext = page.locator('#styles-next');
  await btnNext.click();
  await page.waitForTimeout(200);

  const duringAnim = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.style-card')).map(c => ({
      index: c.dataset.index,
      pos: c.dataset.pos,
      willChange: c.style.willChange,
      classes: c.className
    }));
  });
  console.log('During animation state:', duringAnim);

  await page.waitForTimeout(650);

  const afterAnim = await page.evaluate(() => {
    const active = document.querySelector('.style-card.is-active');
    const cards = Array.from(document.querySelectorAll('.style-card'));
    return {
      activeLabel: active ? active.getAttribute('aria-label') : null,
      activePos: active ? active.dataset.pos : null,
      willChange: cards.map(c => c.style.willChange)
    };
  });
  console.log('After transition active card:', afterAnim.activeLabel, '(pos:', afterAnim.activePos, ')');
  console.log('will-change reset:', afterAnim.willChange);

  // Return to initial card (Alta Performance)
  const btnPrev = page.locator('#styles-prev');
  await btnPrev.click();
  await page.waitForTimeout(800);

  // --- 2. MOBILE TEST ---
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:8000', { waitUntil: 'networkidle' });

  await mobilePage.evaluate(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('is-hidden');
    const heroText = document.getElementById('heroText');
    if (heroText) heroText.classList.add('is-visible');
  });
  await mobilePage.waitForTimeout(600);

  const mobileSection = mobilePage.locator('#categorias');
  await mobileSection.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(400);

  const mobileMetrics = await mobilePage.evaluate(() => {
    const active = document.querySelector('.style-card.is-active');
    const sec = document.getElementById('categorias');
    const rect = active.getBoundingClientRect();
    return {
      activeWidth: Math.round(rect.width),
      activeHeight: Math.round(rect.height),
      screenWidthPct: ((rect.width / window.innerWidth) * 100).toFixed(1) + '%',
      sectionHeight: sec.getBoundingClientRect().height
    };
  });

  console.log('\n--- MOBILE METRICS ---');
  console.log('Mobile Active Card Size:', mobileMetrics.activeWidth, 'x', mobileMetrics.activeHeight, 'px');
  console.log('Screen width percentage:', mobileMetrics.screenWidthPct);
  console.log('Mobile Section 2 Height:', mobileMetrics.sectionHeight, 'px');

  await mobileSection.screenshot({
    path: path.join(outputDir, 'lateral_stack_mobile.png')
  });

  // Test Mobile Swipe
  console.log('\n--- TESTING MOBILE SWIPE ---');
  const deckEl = mobilePage.locator('#styles-deck-container');
  const box = await deckEl.boundingBox();

  await mobilePage.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5);
  await mobilePage.mouse.down();
  await mobilePage.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5, { steps: 8 });
  await mobilePage.mouse.up();
  await mobilePage.waitForTimeout(800);

  const afterSwipeActive = await mobilePage.evaluate(() => {
    const active = document.querySelector('.style-card.is-active');
    return active ? active.getAttribute('aria-label') : null;
  });
  console.log('Active card on mobile after swipe:', afterSwipeActive);

  // --- 3. REDUCED MOTION TEST ---
  const reducedContext = await browser.newContext({
    reducedMotion: 'reduce'
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto('http://localhost:8000', { waitUntil: 'networkidle' });
  const reducedTransition = await reducedPage.evaluate(() => {
    const card = document.querySelector('.style-card');
    return window.getComputedStyle(card).transitionProperty;
  });
  console.log('\n--- REDUCED MOTION ---');
  console.log('Transition property under reduced motion:', reducedTransition);

  await browser.close();
  console.log('\nAll tests completed successfully!');
})();
