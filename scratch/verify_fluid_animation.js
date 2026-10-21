const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');
const path = require('path');
const fs = require('fs');

async function verify() {
  const browser = await chromium.launch({ headless: true });
  const artDir = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\a39c3696-4df2-419f-bda7-b89492fcf58d';

  // 1. Desktop Test
  console.log('--- 1. Testing Desktop (1920x1080) ---');
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://127.0.0.1:8000/#categorias', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Initial active card (should be index 1: Alta Performance)
  let activeIndex = await page.$eval('.style-card.is-active', el => el.dataset.index);
  console.log('Initial desktop active index:', activeIndex);

  // Capture frame sequence during transition between card 1 and card 2
  const nextBtn = page.locator('#styles-next');
  await nextBtn.click();
  console.log('Clicked next once (1 -> 2). Capturing transition frames...');

  // Capture 4 distinct frames during the 480ms transition
  const framePaths = [];
  const delays = [80, 140, 200, 280];
  for (let i = 0; i < delays.length; i++) {
    await page.waitForTimeout(delays[i]);
    const p = path.join(artDir, `transition_frame_${i + 1}.png`);
    await page.screenshot({ path: p });
    framePaths.push(p);
  }

  await page.waitForTimeout(300);
  activeIndex = await page.$eval('.style-card.is-active', el => el.dataset.index);
  console.log('Active index after 1st transition:', activeIndex);

  // Capture completed state of card 2
  const finalCard2Path = path.join(artDir, 'transition_card_active_2.png');
  await page.screenshot({ path: finalCard2Path });

  // Test Rapid Clicks on Desktop (3 fast clicks 100ms apart: 2 -> 3 -> 4 -> 0)
  console.log('Testing 3 rapid clicks on Desktop (100ms interval)...');
  await nextBtn.click();
  await page.waitForTimeout(100);
  await nextBtn.click();
  await page.waitForTimeout(100);
  await nextBtn.click();

  await page.waitForTimeout(600);
  activeIndex = await page.$eval('.style-card.is-active', el => el.dataset.index);
  console.log('Active index after 3 rapid clicks (expected 0: Urbana):', activeIndex);

  // Check stock grid synchronization
  const visibleCardsCount = await page.$$eval('#webmotors-grid .motorcycle-card:not(.is-hidden)', els => els.length);
  console.log('Stock grid visible cards for Urbana:', visibleCardsCount);

  await page.close();

  // 2. Mobile Test (390x844)
  console.log('--- 2. Testing Mobile (390x844) ---');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:8000/#categorias', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(500);

  let mobileActiveIndex = await mobilePage.$eval('.style-card.is-active', el => el.dataset.index);
  console.log('Initial mobile active index:', mobileActiveIndex);

  const mobileNextBtn = mobilePage.locator('#styles-next');

  // Test rapid clicking on Mobile
  console.log('Testing 2 rapid clicks on mobile (1 -> 2 -> 3)...');
  await mobileNextBtn.click();
  await mobilePage.waitForTimeout(120);
  await mobileNextBtn.click();

  await mobilePage.waitForTimeout(600);
  mobileActiveIndex = await mobilePage.$eval('.style-card.is-active', el => el.dataset.index);
  console.log('Mobile active index after 2 rapid clicks (expected 3: Dia a dia):', mobileActiveIndex);

  const mobileCardPath = path.join(artDir, 'mobile_section2_card_active_3.png');
  await mobilePage.screenshot({ path: mobileCardPath });

  await mobilePage.close();
  await browser.close();

  console.log('Verification completed successfully!');
}

verify().catch(console.error);
