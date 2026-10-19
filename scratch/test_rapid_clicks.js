const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testCurrentAnimation() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://127.0.0.1:8000/#categorias', { waitUntil: 'networkidle' });

  // Wait a bit
  await page.waitForTimeout(1000);

  // Scroll to section 2
  await page.locator('#categorias').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'scratch/output/s2_initial.png' });

  // Click next button 3 times fast (e.g. 100ms apart)
  console.log('Testing rapid clicks:');
  const btnNext = page.locator('#styles-next');
  await btnNext.click();
  console.log('Click 1');
  await page.waitForTimeout(100);
  await btnNext.click();
  console.log('Click 2');
  await page.waitForTimeout(100);
  await btnNext.click();
  console.log('Click 3');

  await page.waitForTimeout(1000);
  const activeIndex = await page.$eval('.style-card.is-active', el => el.dataset.index);
  console.log('Active index after 3 fast clicks with current code:', activeIndex);

  await browser.close();
}

testCurrentAnimation().catch(console.error);
