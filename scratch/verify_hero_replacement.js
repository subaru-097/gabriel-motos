const { chromium } = require('c:/Users/User/Desktop/Saracota_v2/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  console.log('--- TEST 1: DESKTOP (1920x1080) ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto('http://127.0.0.1:8000', { waitUntil: 'domcontentloaded' });

  // 1. Wait for loader to disappear and intro video to play
  await page.waitForFunction(() => {
    const loader = document.getElementById('hero-loader');
    const v1 = document.getElementById('hero-video-intro');
    return loader && loader.classList.contains('is-hidden') && v1 && !v1.paused;
  }, { timeout: 5000 });

  console.log('Loader dismissed, introVideo playing.');
  await page.screenshot({ path: path.join(outputDir, 'desktop_t2_intro.png') });

  // 2. Wait until currentTime >= 6.0s (text entry)
  await page.waitForFunction(() => {
    const v1 = document.getElementById('hero-video-intro');
    return v1 && v1.currentTime >= 6.0;
  }, { timeout: 10000 });

  const textVisibleAt6 = await page.evaluate(() => {
    const text = document.getElementById('heroText');
    const v1 = document.getElementById('hero-video-intro');
    return {
      textHasShow: text ? text.classList.contains('show') : false,
      currentTime: v1 ? v1.currentTime : 0
    };
  });
  console.log('At >=6.0s:', textVisibleAt6);
  await page.screenshot({ path: path.join(outputDir, 'desktop_t6_text_revealed.png') });

  // 3. Wait until handover to loop (v1 ends at 8.0s)
  await page.waitForFunction(() => {
    const v2 = document.getElementById('hero-video-loop');
    return v2 && v2.classList.contains('is-active');
  }, { timeout: 6000 });

  const handoverState = await page.evaluate(() => {
    const v1 = document.getElementById('hero-video-intro');
    const v2 = document.getElementById('hero-video-loop');
    const text = document.getElementById('heroText');
    return {
      v1Ended: v1 ? v1.ended : false,
      v1Faded: v1 ? v1.classList.contains('is-faded') : false,
      v2Active: v2 ? v2.classList.contains('is-active') : false,
      v2Paused: v2 ? v2.paused : true,
      v2CurrentTime: v2 ? v2.currentTime : 0,
      v2Loop: v2 ? v2.loop : false,
      textStillShown: text ? text.classList.contains('show') : false
    };
  });
  console.log('Handover state:', handoverState);
  await page.screenshot({ path: path.join(outputDir, 'desktop_t8_loop_active.png') });

  // 4. Wait a bit more into the loop video
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outputDir, 'desktop_t10_loop_playing.png') });

  console.log('\n--- TEST 2: MOBILE (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://127.0.0.1:8000', { waitUntil: 'domcontentloaded' });

  await mobilePage.waitForFunction(() => {
    const loader = document.getElementById('hero-loader');
    return loader && loader.classList.contains('is-hidden');
  }, { timeout: 5000 });

  const mobileHeroBox = await mobilePage.evaluate(() => {
    const hero = document.getElementById('hero');
    const v1 = document.getElementById('hero-video-intro');
    const rect = hero.getBoundingClientRect();
    const vRect = v1.getBoundingClientRect();
    const computed = window.getComputedStyle(v1);
    return {
      heroWidth: rect.width,
      heroHeight: rect.height,
      vWidth: vRect.width,
      vHeight: vRect.height,
      objectFit: computed.objectFit
    };
  });
  console.log('Mobile Hero Box:', mobileHeroBox);
  await mobilePage.screenshot({ path: path.join(outputDir, 'mobile_hero.png') });

  // Check network/console errors for video files
  console.log('\n--- CHECK ERRORS & OLD REFERENCES ---');
  const oldReferences = consoleLogs.filter(l => l.includes('s1000rr'));
  console.log('Old video references in logs:', oldReferences.length);
  console.log('Console errors:', consoleErrors);

  await browser.close();
  console.log('\nALL VERIFICATIONS COMPLETE!');
})();
