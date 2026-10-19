const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testTransitionFrames() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://127.0.0.1:8000/#categorias', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Take initial
  await page.screenshot({ path: 'scratch/output/frame_00.png' });

  // Click next
  await page.click('#styles-next');

  // Capture frames every 50ms for 600ms
  for (let i = 1; i <= 10; i++) {
    await page.waitForTimeout(50);
    const num = String(i).padStart(2, '0');
    await page.screenshot({ path: `scratch/output/frame_${num}.png` });
  }

  await browser.close();
  console.log('Frames captured.');
}

testTransitionFrames().catch(console.error);
