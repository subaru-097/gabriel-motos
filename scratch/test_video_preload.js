const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testVideoPreload() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body>
        <video id="v1" autoplay muted playsinline preload="metadata">
          <source src="http://127.0.0.1:8000/hero.1.mp4" type="video/mp4">
        </video>
        <video id="v2" autoplay muted playsinline preload="metadata" loop>
          <source src="http://127.0.0.1:8000/hero.2.mp4" type="video/mp4">
        </video>
      </body>
    </html>
  `);

  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(300);
    const states = await page.evaluate(() => {
      const v1 = document.getElementById('v1');
      const v2 = document.getElementById('v2');
      return {
        v1: { readyState: v1.readyState, paused: v1.paused, currentTime: v1.currentTime },
        v2: { readyState: v2.readyState, paused: v2.paused, currentTime: v2.currentTime }
      };
    });
    console.log(`t=${i * 300}ms`, states);
  }

  await browser.close();
}

testVideoPreload().catch(console.error);
