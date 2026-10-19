const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testFraming() {
  const browser = await chromium.launch({ headless: true });

  const variations = [
    { name: 'pos_top_0', css: 'object-position: 50% 0% !important;' },
    { name: 'pos_top_10', css: 'object-position: 50% 10% !important;' },
    { name: 'pos_top_15', css: 'object-position: 50% 15% !important;' },
    { name: 'pos_top_20', css: 'object-position: 50% 20% !important;' },
    { name: 'pos_top_0_scale_098', css: 'object-position: 50% 0% !important; transform: scale(0.98); transform-origin: center center;' },
    { name: 'pos_top_15_scale_098', css: 'object-position: 50% 15% !important; transform: scale(0.98); transform-origin: center center;' },
  ];

  for (const v of variations) {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
    
    await page.addStyleTag({
      content: `
        @media (min-width: 769px) {
          .hero__video {
            ${v.css}
          }
          .hero, .hero__video-wrapper {
            background-position: 50% 0% !important;
          }
        }
      `
    });

    await page.waitForTimeout(6500); // wait for hero animation
    await page.screenshot({ path: `scratch/output/framing_${v.name}.png` });
    console.log('Saved:', v.name);
    await page.close();
  }

  await browser.close();
}

testFraming().catch(console.error);
