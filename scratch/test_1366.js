const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function test1366() {
  const browser = await chromium.launch({ headless: true });
  for (const h of ['90vh', '88vh']) {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
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
    await page.waitForTimeout(6500);
    await page.screenshot({ path: `scratch/output/desktop_1366_${h}.png` });
    console.log('1366 done', h);
    await page.close();
  }
  await browser.close();
}
test1366().catch(console.error);
