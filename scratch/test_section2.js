const { chromium } = require('c:/Users/User/Desktop/Saracota_v2/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  
  // 1. Desktop Test (1920x1080)
  const contextDesk = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const pageDesk = await contextDesk.newPage();
  await pageDesk.goto('http://localhost:8000', { waitUntil: 'networkidle' });
  await pageDesk.waitForTimeout(1000);

  const deskData = await pageDesk.evaluate(() => {
    const sec = document.getElementById('categorias');
    const rect = sec.getBoundingClientRect();
    const deckContainer = document.getElementById('styles-deck-container');
    const deckRect = deckContainer ? deckContainer.getBoundingClientRect() : null;
    
    // Check cards
    const cards = Array.from(document.querySelectorAll('.style-card')).map(c => {
      const img = c.querySelector('.style-card__img');
      const hasContent = !!c.querySelector('.style-card__content');
      const hasAction = !!c.querySelector('.style-card__action');
      const hasBlackOverlay = !!c.querySelector('.style-card__overlay');
      const r = c.getBoundingClientRect();
      const style = window.getComputedStyle(c);
      return {
        index: c.dataset.index,
        stackPos: c.dataset.stack,
        ariaLabel: c.getAttribute('aria-label'),
        imgSrc: img?.getAttribute('src'),
        imgLoaded: img?.complete && img?.naturalWidth > 0,
        hasOverlayContent: hasContent,
        hasInnerArrow: hasAction,
        hasBlackOverlay: hasBlackOverlay,
        isActive: c.classList.contains('is-active'),
        renderedWidth: Math.round(r.width),
        renderedHeight: Math.round(r.height),
        transform: style.transform,
        opacity: style.opacity
      };
    });

    const progressBars = Array.from(document.querySelectorAll('.styles-progress__bar')).map(b => ({
      index: b.dataset.index,
      ariaLabel: b.getAttribute('aria-label'),
      isActive: b.classList.contains('is-active')
    }));

    return {
      sectionHeight: Math.round(rect.height),
      deckWidth: deckRect ? Math.round(deckRect.width) : 0,
      deckHeight: deckRect ? Math.round(deckRect.height) : 0,
      totalCards: cards.length,
      cards,
      progressBars
    };
  });

  console.log('--- DESKTOP RESULTS (DECK STACK) ---');
  console.log('Section 2 Total Height (Desktop):', deskData.sectionHeight, 'px');
  console.log('Deck Container:', deskData.deckWidth, 'x', deskData.deckHeight, 'px');
  console.log('Total Cards in Deck:', deskData.totalCards);
  console.log('Cards Details:', JSON.stringify(deskData.cards, null, 2));
  console.log('Progress Bars (5 bars):', JSON.stringify(deskData.progressBars, null, 2));

  // Screenshot section 2 on desktop
  const secElement = pageDesk.locator('#categorias');
  fs.mkdirSync('scratch/output', { recursive: true });
  await secElement.screenshot({ path: 'scratch/output/verify_deck_desktop.png' });

  // 2. Test Transition: Next button
  console.log('\n--- TESTING DECK TRANSITION ---');
  await pageDesk.click('#styles-next');
  await pageDesk.waitForTimeout(200);

  const duringAnim = await pageDesk.evaluate(() => {
    return Array.from(document.querySelectorAll('.style-card')).map(c => ({
      index: c.dataset.index,
      willChange: c.style.willChange,
      classes: c.className
    }));
  });
  console.log('During animation will-change & classes:', JSON.stringify(duringAnim, null, 2));

  await pageDesk.waitForTimeout(600);
  const afterAnim = await pageDesk.evaluate(() => {
    const active = document.querySelector('.style-card.is-active');
    const willChanges = Array.from(document.querySelectorAll('.style-card')).map(c => c.style.willChange);
    return {
      activeCardIndex: active?.dataset.index,
      activeAriaLabel: active?.getAttribute('aria-label'),
      willChanges
    };
  });
  console.log('After transition Active Card:', afterAnim.activeAriaLabel, '(index ' + afterAnim.activeCardIndex + ')');
  console.log('will-change after transition (should be auto):', afterAnim.willChanges);

  // 3. Mobile Test (390x844)
  const contextMob = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const pageMob = await contextMob.newPage();
  await pageMob.goto('http://localhost:8000', { waitUntil: 'networkidle' });
  await pageMob.waitForTimeout(1000);

  const mobData = await pageMob.evaluate(() => {
    const sec = document.getElementById('categorias');
    const rect = sec.getBoundingClientRect();
    const activeCard = document.querySelector('.style-card[data-stack="0"]');
    const activeRect = activeCard ? activeCard.getBoundingClientRect() : null;
    return {
      sectionHeight: Math.round(rect.height),
      activeCardWidth: activeRect ? Math.round(activeRect.width) : 0,
      activeCardHeight: activeRect ? Math.round(activeRect.height) : 0,
      percentOfScreenWidth: activeRect ? Math.round((activeRect.width / window.innerWidth) * 100) : 0
    };
  });

  console.log('\n--- MOBILE RESULTS ---');
  console.log('Section 2 Height (Mobile):', mobData.sectionHeight, 'px');
  console.log('Active Card (Mobile):', mobData.activeCardWidth, 'x', mobData.activeCardHeight, 'px (' + mobData.percentOfScreenWidth + '% of screen width)');

  const secMobElement = pageMob.locator('#categorias');
  await secMobElement.screenshot({ path: 'scratch/output/verify_deck_mobile.png' });

  // 4. Test Mobile Swipe
  console.log('\n--- TESTING MOBILE SWIPE ---');
  const deckBox = await pageMob.locator('#styles-deck-container').boundingBox();
  if (deckBox) {
    const startX = deckBox.x + deckBox.width * 0.7;
    const startY = deckBox.y + deckBox.height * 0.5;
    const endX = deckBox.x + deckBox.width * 0.2;

    await pageMob.touchscreen.tap(startX, startY);
    await pageMob.mouse.move(startX, startY);
    await pageMob.mouse.down();
    await pageMob.mouse.move(endX, startY, { steps: 10 });
    await pageMob.mouse.up();
    await pageMob.waitForTimeout(800);

    const activeAfterSwipe = await pageMob.evaluate(() => {
      const active = document.querySelector('.style-card.is-active');
      return active?.getAttribute('aria-label');
    });
    console.log('Active card on mobile after swipe:', activeAfterSwipe);
  }

  // 5. Test prefers-reduced-motion
  console.log('\n--- TESTING PREFERS-REDUCED-MOTION ---');
  const contextReduced = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    reducedMotion: 'reduce'
  });
  const pageReduced = await contextReduced.newPage();
  await pageReduced.goto('http://localhost:8000', { waitUntil: 'networkidle' });
  await pageReduced.waitForTimeout(1000);

  const reducedMotionData = await pageReduced.evaluate(() => {
    const card = document.querySelector('.style-card');
    const comp = window.getComputedStyle(card);
    return {
      transitionProperty: comp.transitionProperty
    };
  });
  console.log('Reduced motion transition property:', reducedMotionData.transitionProperty);

  await browser.close();
  console.log('\nVerification complete!');
})();
