const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const artDir = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\a39c3696-4df2-419f-bda7-b89492fcf58d';

  // 1. Desktop 1920x1080
  const p1080 = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await p1080.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
  await p1080.waitForTimeout(6500);
  const path1080 = path.join(artDir, 'desktop_1920x1080_hero_framing.png');
  await p1080.screenshot({ path: path1080 });
  console.log('Saved 1920x1080 framing screenshot:', path1080);
  await p1080.close();

  // 2. Desktop 1366x768
  const p768 = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await p768.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
  await p768.waitForTimeout(6500);
  const path768 = path.join(artDir, 'desktop_1366x768_hero_framing.png');
  await p768.screenshot({ path: path768 });
  console.log('Saved 1366x768 framing screenshot:', path768);
  await p768.close();

  // 3. Mobile 390x844
  const pMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pMobile.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
  await pMobile.waitForTimeout(6500);
  const pathMobile = path.join(artDir, 'mobile_390x844_hero_framing.png');
  await pMobile.screenshot({ path: pathMobile });
  console.log('Saved mobile screenshot:', pathMobile);
  await pMobile.close();

  await browser.close();
}

capture().catch(console.error);
