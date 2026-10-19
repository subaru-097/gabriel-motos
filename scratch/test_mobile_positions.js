const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testMobilePositions() {
  const browser = await chromium.launch({ headless: true });
  const positions = ['18% 50%', '22% 50%', '26% 50%', '30% 50%'];

  for (const pos of positions) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
    
    await page.addStyleTag({
      content: `
        .hero {
          height: 100vh !important;
          height: 100dvh !important;
          height: 100svh !important;
          max-height: 100svh !important;
          aspect-ratio: auto !important;
        }
        .hero__video {
          object-position: ${pos} !important;
        }
        .hero, .hero__video-wrapper {
          background-position: ${pos} !important;
        }
      `
    });

    await page.waitForTimeout(6500);
    const safeName = pos.replace(/[% ]/g, '_');
    await page.screenshot({ path: `scratch/output/mobile_pos_${safeName}.png` });
    console.log('Saved', safeName);
    await page.close();
  }
  await browser.close();
}
testMobilePositions().catch(console.error);
