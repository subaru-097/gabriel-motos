const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testHeights() {
  const browser = await chromium.launch({ headless: true });
  const heights = ['85vh', '88vh', '90vh', '92vh', '95vh'];

  for (const h of heights) {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
    
    await page.addStyleTag({
      content: `
        @media (min-width: 769px) {
          .hero {
            aspect-ratio: auto !important;
            height: ${h} !important;
          }
        }
      `
    });

    await page.waitForTimeout(6500); // Wait for title animation and video
    const safeH = h.replace(/[^a-zA-Z0-9]/g, '_');
    await page.screenshot({ path: `scratch/output/desktop_${safeH}.png` });
    
    const heroBox = await page.locator('.hero').boundingBox();
    const scrollBox = await page.locator('.hero__scroll-wrapper').boundingBox();
    const titleBox = await page.locator('.hero__title-img').boundingBox();
    console.log(h, { heroBox, scrollBox, titleBox });
    await page.close();
  }

  // Also check mobile 390x844 without any overrides to verify it's identical
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(6500);
  await mobilePage.screenshot({ path: `scratch/output/mobile_original_verify.png` });
  const mobileHeroBox = await mobilePage.locator('.hero').boundingBox();
  console.log('Mobile untouched:', mobileHeroBox);
  await mobilePage.close();

  await browser.close();
}

testHeights().catch(console.error);
