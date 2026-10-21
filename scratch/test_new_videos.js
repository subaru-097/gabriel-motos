const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testNewVideos() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="http://127.0.0.1:8000/style.css">
        <style>
          .test-container {
            width: 1920px;
            height: 972px;
            position: relative;
            overflow: hidden;
            background: #000;
          }
          video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        </style>
      </head>
      <body style="margin:0; padding:0; background:#111;">
        <div class="test-container" id="c1">
          <video id="v1" autoplay muted playsinline preload="metadata">
            <source src="http://127.0.0.1:8000/hero.1.mp4" type="video/mp4">
          </video>
        </div>
      </body>
    </html>
  `);

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scratch/output/test_hero1_render.png' });

  // Now test hero.2
  await page.evaluate(() => {
    const v = document.getElementById('v1');
    v.src = 'http://127.0.0.1:8000/hero.2.mp4';
    v.play();
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scratch/output/test_hero2_render.png' });

  await browser.close();
  console.log('Render screenshots saved.');
}

testNewVideos().catch(console.error);
