const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');
const path = require('path');
const fs = require('fs');

async function captureFinal() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop 1920x1080
  const page1080 = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page1080.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
  await page1080.waitForTimeout(6500); // Wait for title and intro video
  
  const heroBox1080 = await page1080.locator('.hero').boundingBox();
  console.log('1920x1080 Hero Box:', heroBox1080);
  
  const screenshotPath1080 = 'scratch/output/final_desktop_1920x1080.png';
  await page1080.screenshot({ path: screenshotPath1080 });
  
  // Also copy to artifact directory
  const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\a39c3696-4df2-419f-bda7-b89492fcf58d';
  fs.copyFileSync(screenshotPath1080, path.join(artifactDir, 'final_desktop_1920x1080.png'));
  await page1080.close();

  // 2. Desktop 1366x768
  const page768 = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await page768.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
  await page768.waitForTimeout(6500);
  const heroBox768 = await page768.locator('.hero').boundingBox();
  console.log('1366x768 Hero Box:', heroBox768);
  await page768.screenshot({ path: 'scratch/output/final_desktop_1366x768.png' });
  await page768.close();

  // 3. Mobile 390x844
  const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMobile.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(6500);
  const heroBoxMobile = await pageMobile.locator('.hero').boundingBox();
  console.log('390x844 Mobile Hero Box:', heroBoxMobile);
  await pageMobile.screenshot({ path: 'scratch/output/final_mobile_390x844.png' });
  await pageMobile.close();

  await browser.close();
}

captureFinal().catch(console.error);
