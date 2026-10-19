const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');
const fs = require('fs');

async function check() {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: '1920x1080', w: 1920, h: 1080 },
    { name: '1366x768', w: 1366, h: 768 },
    { name: '390x844', w: 390, h: 844 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    await page.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
    
    // Inject test CSS
    await page.addStyleTag({
      content: `
        .hero {
          height: 100vh !important;
          height: 100dvh !important;
          height: 100svh !important;
          max-height: 100svh !important;
          aspect-ratio: auto !important;
        }
      `
    });

    await page.waitForTimeout(6500); // wait for hero text animation
    await page.screenshot({ path: `scratch/output/test_${vp.name}.png` });
    
    const heroBox = await page.locator('.hero').boundingBox();
    const scrollIndBox = await page.locator('.hero__scroll-wrapper').boundingBox();
    const titleBox = await page.locator('.hero__title-img').boundingBox();
    console.log(vp.name, { heroBox, scrollIndBox, titleBox });
    await page.close();
  }
  await browser.close();
}
check().catch(console.error);
