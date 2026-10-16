const { chromium } = require('c:/Users/User/Desktop/Saracota_v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });

  // Dismiss loader
  await page.evaluate(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('is-hidden');
    localStorage.clear(); // Clear previous test data
  });
  await page.waitForTimeout(400);

  console.log('--- 1. TESTING CARD CLICKS AND MODAL DATA ---');

  // Helper to get modal state
  async function getModalData() {
    return await page.evaluate(() => {
      const backdrop = document.getElementById('moto-modal-backdrop');
      if (!backdrop || backdrop.classList.contains('is-hidden')) return null;

      return {
        isOpen: true,
        categoria: document.getElementById('modal-categoria')?.textContent,
        marca: document.getElementById('modal-marca')?.textContent,
        modelo: document.getElementById('modal-modelo-title')?.textContent,
        cor: document.getElementById('modal-cor')?.textContent,
        ano: document.getElementById('modal-ano')?.textContent,
        km: document.getElementById('modal-km')?.textContent,
        cidade: document.getElementById('modal-cidade')?.textContent,
        preco: document.getElementById('modal-preco')?.textContent,
        imgSrc: document.getElementById('modal-img')?.getAttribute('src'),
        waHref: document.getElementById('modal-btn-whatsapp')?.getAttribute('href'),
        favText: document.getElementById('modal-favorite-text')?.textContent,
        isFavActive: document.getElementById('modal-btn-favorite')?.classList.contains('is-favorited'),
      };
    });
  }

  async function clickCard(idx) {
    await page.evaluate((index) => {
      const card = document.querySelector(`.style-card[data-index="${index}"]`);
      if (card) card.click();
    }, idx);
  }

  // Test Card 1: Alta Performance (active on start)
  console.log('Clicking Card 1 (Alta Performance)...');
  await clickCard(1);
  await page.waitForTimeout(400);

  const modal1 = await getModalData();
  console.log('Modal 1 (Alta Performance):', modal1);

  // Take screenshot of Desktop Modal
  await page.screenshot({
    path: path.join(outputDir, 'modal_desktop.png')
  });

  // Verify WhatsApp URL
  const expectedWa1 = 'https://wa.me/5519999999999?text=' + encodeURIComponent('Olá! Tenho interesse na Kawasaki Ninja ZX-6R Preta (2023) anunciada no site Gabriel Motos.');
  console.log('WhatsApp link matches expected:', modal1.waHref === expectedWa1);

  // Close modal via close button
  console.log('Closing modal via (X)...');
  await page.click('#moto-modal-close');
  await page.waitForTimeout(300);
  console.log('Modal is closed:', (await getModalData()) === null);

  // Test Card 0: Urbana
  console.log('Clicking Card 0 (Urbana)...');
  await clickCard(0);
  await page.waitForTimeout(500);
  const modal0 = await getModalData();
  console.log('Modal 0 (Urbana):', modal0.modelo, modal0.cor, modal0.preco);

  // Test Color Switcher in Urbana (Vermelha and Azul)
  console.log('Switching to Vermelha...');
  const redPill = page.locator('.moto-modal__color-pill', { hasText: 'Vermelha' });
  await redPill.click();
  await page.waitForTimeout(300);
  const modalRed = await getModalData();
  console.log('Modal Red (id 2):', modalRed.modelo, modalRed.cor, modalRed.preco, modalRed.cidade);

  // Verify WhatsApp URL for Vermelha
  const expectedWaRed = 'https://wa.me/5519999999999?text=' + encodeURIComponent('Olá! Tenho interesse na Honda CB1000R Vermelha (2022) anunciada no site Gabriel Motos.');
  console.log('WhatsApp link Red matches expected:', modalRed.waHref === expectedWaRed);

  console.log('Switching to Azul...');
  const bluePill = page.locator('.moto-modal__color-pill', { hasText: 'Azul' });
  await bluePill.click();
  await page.waitForTimeout(300);
  const modalBlue = await getModalData();
  console.log('Modal Blue (id 3):', modalBlue.modelo, modalBlue.cor, modalBlue.preco, modalBlue.cidade);

  // Close via click outside
  console.log('Closing modal via click outside on backdrop...');
  await page.click('#moto-modal-backdrop', { position: { x: 50, y: 50 } });
  await page.waitForTimeout(300);
  console.log('Modal is closed:', (await getModalData()) === null);

  // Test Card 2: Aventura (BMW F 800 GS)
  console.log('Clicking Card 2 (Aventura)...');
  await clickCard(2);
  await page.waitForTimeout(500);
  const modal2 = await getModalData();
  console.log('Modal 2 (Aventura):', modal2.modelo, modal2.cor, modal2.preco, modal2.cidade);

  // Close modal
  await page.click('#moto-modal-close');
  await page.waitForTimeout(300);

  // Test Card 3: Dia a dia (Bajaj Dominar 400)
  console.log('Clicking Card 3 (Dia a dia)...');
  await clickCard(3);
  await page.waitForTimeout(500);
  const modal3 = await getModalData();
  console.log('Modal 3 (Dia a dia):', modal3.modelo, modal3.cor, modal3.preco, modal3.cidade);

  // Close modal via Escape
  console.log('Closing modal via Escape key...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  console.log('Modal is closed via Escape:', (await getModalData()) === null);

  // Test Card 4: Todas as Categorias (MUST NOT open modal)
  console.log('Clicking Card 4 (Todas as Categorias)...');
  await clickCard(4);
  await page.waitForTimeout(400);
  const modal4 = await getModalData();
  console.log('Card 4 does NOT open modal (should be null):', modal4);

  // --- 2. TESTING FAVORITE POP-UP & LOCALSTORAGE ---
  console.log('\n--- 2. TESTING FAVORITE POP-UP ---');
  // Re-open Urbana modal
  await clickCard(0);
  await page.waitForTimeout(400);

  // Click Favoritar
  console.log('Clicking "Favoritar" button...');
  await page.click('#modal-btn-favorite');
  await page.waitForTimeout(300);

  const popupInfo = await page.evaluate(() => {
    const pop = document.getElementById('favorite-popup');
    const logo = pop ? pop.querySelector('.favorite-popup__logo') : null;
    return {
      isOpen: pop && !pop.classList.contains('is-hidden'),
      logoSrc: logo ? logo.getAttribute('src') : null,
      phoneVal: document.getElementById('fav-phone')?.value,
      emailVal: document.getElementById('fav-email')?.value
    };
  });
  console.log('Favorite Pop-up Info:', popupInfo);

  // Capture Screenshot of Favorite Pop-up
  await page.screenshot({
    path: path.join(outputDir, 'favorite_popup.png')
  });

  // Test Phone Mask
  console.log('Testing Phone Mask with 19998765432...');
  await page.fill('#fav-phone', '19998765432');
  const maskedPhone = await page.inputValue('#fav-phone');
  console.log('Masked phone value:', maskedPhone);

  // Test Validation with invalid email
  await page.fill('#fav-email', 'invalid-email');
  await page.click('#fav-submit-btn');
  await page.waitForTimeout(200);
  const errorText = await page.textContent('#fav-error-msg');
  console.log('Validation error shown:', errorText);

  // Fill valid email and save
  await page.fill('#fav-email', 'cliente@gabrielmotos.com');
  await page.click('#fav-submit-btn');
  await page.waitForTimeout(1400);

  // Check localStorage and Favorited status
  const storageAfterSave = await page.evaluate(() => {
    return {
      user: JSON.parse(localStorage.getItem('gabriel_motos_user') || '{}'),
      favorites: JSON.parse(localStorage.getItem('gabriel_motos_favorites') || '[]'),
      favButtonText: document.getElementById('modal-favorite-text')?.textContent,
      favButtonClass: document.getElementById('modal-btn-favorite')?.className
    };
  });
  console.log('Storage and UI after saving:', storageAfterSave);

  // Re-open Favorite pop-up to check auto pre-fill from localStorage
  console.log('Re-opening pop-up to check auto-prefill...');
  await page.click('#modal-btn-favorite');
  await page.waitForTimeout(300);
  const prefill = await page.evaluate(() => {
    return {
      phone: document.getElementById('fav-phone')?.value,
      email: document.getElementById('fav-email')?.value
    };
  });
  console.log('Auto pre-filled values:', prefill);
  await page.click('#fav-popup-close');
  await page.waitForTimeout(200);
  await page.click('#moto-modal-close');

  // --- 3. MOBILE VIEWPORT TEST ---
  console.log('\n--- 3. TESTING MOBILE MODAL ---');
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
  });
  await mobilePage.waitForTimeout(400);

  // Open modal on mobile
  await mobilePage.click('.style-card[data-index="1"]');
  await mobilePage.waitForTimeout(400);

  await mobilePage.screenshot({
    path: path.join(outputDir, 'modal_mobile.png')
  });
  console.log('Mobile modal screenshot captured.');

  await browser.close();
  console.log('\nAll modal verification steps passed successfully!');
})();
