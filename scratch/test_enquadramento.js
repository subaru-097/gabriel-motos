const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');
const fs = require('fs');

async function testEnquadramento() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Test different combinations for a 420px wide modal
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; background: #111; color: white; font-family: sans-serif; display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; }
        .box { width: 420px; height: 700px; border-radius: 20px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.2); }
        .bg-escolha { background: url('http://127.0.0.1:8000/escolha-vendedor.jpg') no-repeat; background-size: cover; }
        .bg-poster { background: url('http://127.0.0.1:8000/poster.jpg') no-repeat; background-size: cover; }
        .pos-left { background-position: left center; }
        .pos-20 { background-position: 20% center; }
        .pos-30 { background-position: 30% center; }
        .pos-center { background-position: center center; }
        .pos-left-top { background-position: left top; }
        .pos-25-top { background-position: 25% top; }
        .label { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.8); padding: 4px 8px; font-size: 12px; z-index: 10; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="box bg-escolha pos-left"><div class="label">escolha-vendedor / left center</div></div>
      <div class="box bg-escolha pos-20"><div class="label">escolha-vendedor / 20% center</div></div>
      <div class="box bg-escolha pos-30"><div class="label">escolha-vendedor / 30% center</div></div>
      <div class="box bg-escolha pos-center"><div class="label">escolha-vendedor / center center</div></div>
      <div class="box bg-poster pos-left"><div class="label">poster.jpg / left center</div></div>
      <div class="box bg-poster pos-20"><div class="label">poster.jpg / 20% center</div></div>
    </body>
    </html>
  `);

  await page.setViewportSize({ width: 1400, height: 1600 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scratch/output/test_enquadramento.png' });
  console.log('Saved scratch/output/test_enquadramento.png');
  await browser.close();
}

testEnquadramento().catch(console.error);
