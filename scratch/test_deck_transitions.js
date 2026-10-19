const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testDeckTransitions() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://127.0.0.1:8000/#categorias', { waitUntil: 'networkidle' });

  // Test custom setActiveStyle in page
  await page.evaluate(() => {
    // Override transition timing in CSS
    const style = document.createElement('style');
    style.innerHTML = `
      .style-card {
        transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
                    opacity 480ms cubic-bezier(0.22, 1, 0.36, 1),
                    filter 480ms cubic-bezier(0.22, 1, 0.36, 1),
                    box-shadow 480ms cubic-bezier(0.22, 1, 0.36, 1),
                    border-color 480ms cubic-bezier(0.22, 1, 0.36, 1) !important;
        will-change: transform, opacity;
      }
      .style-card.is-wrapping {
        transition: opacity 250ms ease !important;
      }
    `;
    document.head.appendChild(style);
  });

  // Let's test rapid clicking
  const btnNext = page.locator('#styles-next');
  for (let i = 0; i < 5; i++) {
    await btnNext.click();
    await page.waitForTimeout(200);
  }

  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/output/test_deck_after_rapid.png' });
  console.log('Saved rapid click screenshot');
  await browser.close();
}

testDeckTransitions().catch(console.error);
