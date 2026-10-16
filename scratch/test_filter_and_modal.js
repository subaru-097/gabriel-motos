const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');
const path = require('path');
const fs = require('fs');

async function testFilterAndModal() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const outputDir = path.resolve('c:/Users/User/Desktop/gabriel motos/scratch/output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Navigating to http://localhost:8000 ...');
  await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded' });

  // Dismiss loader if present
  await page.evaluate(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('is-hidden');
    localStorage.clear();
  });
  await page.waitForTimeout(400);

  console.log('\n--- 1. TESTING MODAL ADJUSTMENTS ---');
  // Click on Card 1 in Session 2 to open modal
  await page.evaluate(() => {
    const c1 = document.querySelector('.style-card[data-index="1"]');
    if (c1) c1.click();
  });
  await page.waitForTimeout(400);

  const modalChecks = await page.evaluate(() => {
    const modal = document.getElementById('moto-modal');
    const badgeLogo = document.querySelector('.moto-modal__badge-logo');
    const categoryHeader = document.querySelector('.moto-modal__category');
    const favBtn = document.getElementById('modal-btn-favorite');
    const waBtn = document.getElementById('modal-btn-whatsapp');
    const media = document.getElementById('modal-media-trigger');
    const brand = document.getElementById('modal-marca');
    const price = document.getElementById('modal-preco');

    return {
      isOpen: modal && !document.getElementById('moto-modal-backdrop').classList.contains('is-hidden'),
      hasBadgeLogo: !!badgeLogo,
      hasCategoryHeader: !!categoryHeader,
      favBtnText: favBtn ? favBtn.textContent.trim() : null,
      waBtnText: waBtn ? waBtn.textContent.trim() : null,
      favBtnColor: favBtn ? window.getComputedStyle(favBtn).color : null,
      waBtnBg: waBtn ? window.getComputedStyle(waBtn).backgroundColor : null,
      mediaTopPadding: modal ? window.getComputedStyle(modal).paddingTop : null,
      brandText: brand ? brand.textContent : null,
      priceText: price ? price.textContent : null,
      waHref: waBtn ? waBtn.getAttribute('href') : null
    };
  });

  console.log('Modal checks:', modalChecks);

  // Take screenshot of updated modal
  await page.screenshot({
    path: path.join(outputDir, 'modal_updated_desktop.png')
  });

  // Verify close
  await page.click('#moto-modal-close');
  await page.waitForTimeout(300);
  const isClosed = await page.evaluate(() => document.getElementById('moto-modal-backdrop').classList.contains('is-hidden'));
  console.log('Modal closed via (X):', isClosed);

  console.log('\n--- 2. TESTING SECTION 3: ÁREA DE FILTRO ---');
  // Check title
  const sectionTitle = await page.textContent('#filter-section-title');
  console.log('Section 3 Title:', sectionTitle);

  // Check tabs
  const tabs = await page.$$eval('.filter-tab', els => els.map(e => ({ text: e.textContent.trim(), filter: e.dataset.filter, active: e.classList.contains('is-active') })));
  console.log('Tabs:', tabs);

  // Check cards in "Todas"
  let cardsTodas = await page.$$eval('#filter-deck .filter-card', els => els.map(e => ({
    label: e.getAttribute('aria-label'),
    isAll: e.dataset.isAll,
    motoId: e.dataset.motoId
  })));
  console.log(`Cards in "Todas" (${cardsTodas.length} items):`, cardsTodas.map(c => c.label));

  // Click on "Todas as Categorias" card in filter (MUST NOT open modal)
  console.log('Clicking "Todas as Categorias" card...');
  await page.evaluate(() => {
    const cardAll = document.querySelector('#filter-deck .filter-card[data-is-all="true"]');
    if (cardAll) cardAll.click();
  });
  await page.waitForTimeout(400);
  const modalOpenedOnAll = await page.evaluate(() => !document.getElementById('moto-modal-backdrop').classList.contains('is-hidden'));
  console.log('Modal opened on "Todas as Categorias" (should be false):', modalOpenedOnAll);

  // Test Filter: "Urbana"
  console.log('\nTesting tab "Urbana"...');
  await page.click('.filter-tab[data-filter="Urbana"]');
  await page.waitForTimeout(400);
  let cardsUrbana = await page.$$eval('#filter-deck .filter-card', els => els.map(e => e.getAttribute('aria-label')));
  console.log('Cards in "Urbana":', cardsUrbana);

  // Click on first Urbana card in filter (should open modal)
  console.log('Clicking Urbana card in filter...');
  await page.evaluate(() => {
    const c = document.querySelector('#filter-deck .filter-card.is-active');
    if (c) c.click();
  });
  await page.waitForTimeout(400);

  const modalUrbanaInfo = await page.evaluate(() => ({
    isOpen: !document.getElementById('moto-modal-backdrop').classList.contains('is-hidden'),
    modelo: document.getElementById('modal-modelo-title')?.textContent,
    preco: document.getElementById('modal-preco')?.textContent
  }));
  console.log('Modal opened from Urbana filter card:', modalUrbanaInfo);

  // Close modal via Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Test Filter: "Alta Performance"
  console.log('\nTesting tab "Alta Performance"...');
  await page.click('.filter-tab[data-filter="Alta Performance"]');
  await page.waitForTimeout(400);
  let cardsAlta = await page.$$eval('#filter-deck .filter-card', els => els.map(e => e.getAttribute('aria-label')));
  console.log('Cards in "Alta Performance":', cardsAlta);

  // Test Filter: "Aventura"
  console.log('\nTesting tab "Aventura"...');
  await page.click('.filter-tab[data-filter="Aventura"]');
  await page.waitForTimeout(400);
  let cardsAventura = await page.$$eval('#filter-deck .filter-card', els => els.map(e => e.getAttribute('aria-label')));
  console.log('Cards in "Aventura":', cardsAventura);

  // Test Filter: "Dia a dia"
  console.log('\nTesting tab "Dia a dia"...');
  await page.click('.filter-tab[data-filter="Dia a dia"]');
  await page.waitForTimeout(400);
  let cardsDia = await page.$$eval('#filter-deck .filter-card', els => els.map(e => e.getAttribute('aria-label')));
  console.log('Cards in "Dia a dia":', cardsDia);

  // Return to "Todas"
  await page.click('.filter-tab[data-filter="Todas"]');
  await page.waitForTimeout(400);

  // Scroll to filter section and capture screenshot
  await page.locator('#filtro-motos').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(outputDir, 'section3_filter_desktop.png')
  });

  // Mobile viewport test
  console.log('\n--- 3. TESTING MOBILE LAYOUT ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);

  await page.screenshot({
    path: path.join(outputDir, 'section3_filter_mobile.png')
  });

  // Open modal on mobile
  await page.evaluate(() => {
    const card = document.querySelector('#filter-deck .filter-card[data-is-all="false"]');
    if (card) card.click();
  });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(outputDir, 'modal_updated_mobile.png')
  });

  console.log('\nAll filter and modal tests completed successfully!');
  await browser.close();
}

testFilterAndModal().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
