const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testRapidClicksLogged() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://127.0.0.1:8000/#categorias', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Monitor calls
  await page.evaluate(() => {
    window.clicks = [];
    const btn = document.getElementById('styles-next');
    btn.addEventListener('click', () => {
      window.clicks.push({ time: performance.now(), activeIndex: document.querySelector('.style-card.is-active').dataset.index });
    });
  });

  const btnNext = page.locator('#styles-next');
  await btnNext.click({ force: true });
  await page.waitForTimeout(150);
  await btnNext.click({ force: true });
  await page.waitForTimeout(150);
  await btnNext.click({ force: true });

  await page.waitForTimeout(1000);

  const clicks = await page.evaluate(() => window.clicks);
  const finalActive = await page.$eval('.style-card.is-active', el => el.dataset.index);
  console.log('Clicks recorded:', clicks);
  console.log('Final active card:', finalActive);

  await browser.close();
}

testRapidClicksLogged().catch(console.error);
