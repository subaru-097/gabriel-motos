const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testHeroFit() {
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: '1920x1080', width: 1920, height: 1080 },
    { name: '1920x940_browser', width: 1920, height: 940 },
    { name: '1366x768', width: 1366, height: 768 },
    { name: '1366x650_browser', width: 1366, height: 650 },
    { name: '390x844_mobile', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
    
    // Test applying height: 100vh / 100svh
    await page.addStyleTag({
      content: `
        .hero {
          height: 100vh !important;
          height: 100svh !important;
          aspect-ratio: auto !important;
        }
      `
    });

    await page.waitForTimeout(500);
    await page.screenshot({ path: `scratch/output/fit_${vp.name}.png` });
    console.log(`Saved scratch/output/fit_${vp.name}.png`);
    await page.close();
  }

  await browser.close();
}

testHeroFit().catch(console.error);
