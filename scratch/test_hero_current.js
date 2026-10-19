const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testHeroCurrent() {
  const browser = await chromium.launch({ headless: true });
  
  // 1920x1080
  const page1080 = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page1080.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
  await page1080.waitForTimeout(2000); // allow hero animation / text to settle
  await page1080.screenshot({ path: 'scratch/output/hero_current_1920x1080.png' });

  // 1366x768
  const page768 = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  await page768.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
  await page768.waitForTimeout(2000);
  await page768.screenshot({ path: 'scratch/output/hero_current_1366x768.png' });

  // 390x844
  const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMobile.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(2000);
  await pageMobile.screenshot({ path: 'scratch/output/hero_current_390x844.png' });

  // Let's get computed styles and dimensions of #hero
  const dims1080 = await page1080.evaluate(() => {
    const el = document.getElementById('hero');
    const rect = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return {
      width: rect.width,
      height: rect.height,
      windowHeight: window.innerHeight,
      aspectRatio: cs.aspectRatio,
      heightStyle: cs.height,
      padding: cs.padding,
      margin: cs.margin
    };
  });
  console.log('Dims 1920x1080:', dims1080);

  const dimsMobile = await pageMobile.evaluate(() => {
    const el = document.getElementById('hero');
    const rect = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return {
      width: rect.width,
      height: rect.height,
      windowHeight: window.innerHeight,
      aspectRatio: cs.aspectRatio,
      heightStyle: cs.height
    };
  });
  console.log('Dims 390x844:', dimsMobile);

  await browser.close();
}

testHeroCurrent().catch(console.error);
