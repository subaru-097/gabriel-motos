const { chromium } = require('c:/Users/User/Desktop/Saracota_v2/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));
  
  const startTime = Date.now();
  await page.goto('http://127.0.0.1:8000', { waitUntil: 'domcontentloaded' });
  
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => {
      const v1 = document.getElementById('hero-video-intro');
      const v2 = document.getElementById('hero-video-loop');
      const loader = document.getElementById('hero-loader');
      const text = document.getElementById('heroText');
      return {
        v1Ready: v1 ? v1.readyState : null,
        v2Ready: v2 ? v2.readyState : null,
        loaderHidden: loader ? loader.classList.contains('is-hidden') : null,
        v1CurrentTime: v1 ? v1.currentTime : null,
        v1Paused: v1 ? v1.paused : null,
        v2CurrentTime: v2 ? v2.currentTime : null,
        v2Paused: v2 ? v2.paused : null,
        v1Faded: v1 ? v1.classList.contains('is-faded') : null,
        v2Active: v2 ? v2.classList.contains('is-active') : null,
        textShow: text ? text.classList.contains('show') : null
      };
    });
    const elapsed = Date.now() - startTime;
    console.log('[' + elapsed + 'ms]', JSON.stringify(state));
    if (state.v2Active) {
      console.log('Handover to loop complete!');
      break;
    }
  }
  await browser.close();
})();
