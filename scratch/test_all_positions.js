const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');
const fs = require('fs');

async function testPositions() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const positions = [
    'center center',
    '35% center',
    '30% center',
    '25% center',
    '20% center',
    '15% center',
    'left center'
  ];

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; background: #000; color: white; font-family: sans-serif; display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; }
        .wrapper { display: flex; flex-direction: column; align-items: center; }
        .box { width: 390px; height: 780px; border-radius: 20px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.3); }
        .bg-escolha { background: url('http://127.0.0.1:8000/escolha-vendedor.jpg') no-repeat; background-size: cover; }
        .bg-direc { background: url('http://127.0.0.1:8000/direcionamento-whatssap.jpg') no-repeat; background-size: cover; }
        .label { margin-bottom: 8px; font-size: 14px; font-weight: bold; }
      </style>
    </head>
    <body>
      ${positions.map(p => `
        <div class="wrapper">
          <div class="label">Escolha: ${p}</div>
          <div class="box bg-escolha" style="background-position: ${p};"></div>
        </div>
      `).join('')}
      ${positions.map(p => `
        <div class="wrapper">
          <div class="label">Direc: ${p}</div>
          <div class="box bg-direc" style="background-position: ${p};"></div>
        </div>
      `).join('')}
    </body>
    </html>
  `);

  await page.setViewportSize({ width: 3200, height: 1800 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/output/test_all_positions.png' });
  console.log('Saved scratch/output/test_all_positions.png');
  await browser.close();
}

testPositions().catch(console.error);
