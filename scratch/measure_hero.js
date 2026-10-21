const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function measureHero() {
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: '1920x1080', width: 1920, height: 1080 },
    { name: '1366x768', width: 1366, height: 768 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://127.0.0.1:8000/#hero', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const measurements = await page.evaluate(() => {
      const hero = document.getElementById('hero');
      const heroRect = hero.getBoundingClientRect();
      const heroComputed = window.getComputedStyle(hero);

      const video = document.getElementById('hero-video-intro') || document.querySelector('.hero__video');
      const videoRect = video ? video.getBoundingClientRect() : null;
      const videoComputed = video ? window.getComputedStyle(video) : null;

      const nextSection = document.getElementById('categorias');
      const nextRect = nextSection ? nextSection.getBoundingClientRect() : null;
      const distanceToNext = nextRect ? (nextRect.top - heroRect.bottom) : 0;

      // Aspect ratio calculation
      const ratioVal = heroRect.width / heroRect.height;
      function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
      }
      const wInt = Math.round(heroRect.width);
      const hInt = Math.round(heroRect.height);
      const d = gcd(wInt, hInt);
      const simplifiedRatio = `${wInt / d}:${hInt / d}`;

      return {
        hero: {
          width: heroRect.width,
          height: heroRect.height,
          computedWidth: heroComputed.width,
          computedHeight: heroComputed.height,
          padding: `${heroComputed.paddingTop} ${heroComputed.paddingRight} ${heroComputed.paddingBottom} ${heroComputed.paddingLeft}`,
          margin: `${heroComputed.marginTop} ${heroComputed.marginRight} ${heroComputed.marginBottom} ${heroComputed.marginLeft}`,
          minHeight: heroComputed.minHeight,
          maxHeight: heroComputed.maxHeight,
          aspectRatio: heroComputed.aspectRatio
        },
        video: video ? {
          width: videoRect.width,
          height: videoRect.height,
          computedWidth: videoComputed.width,
          computedHeight: videoComputed.height,
          objectFit: videoComputed.objectFit,
          objectPosition: videoComputed.objectPosition,
          transform: videoComputed.transform
        } : null,
        ratio: {
          decimal: ratioVal,
          simplified: simplifiedRatio
        },
        distanceToNext
      };
    });

    console.log(`=== Measurements for ${vp.name} ===`);
    console.log(JSON.stringify(measurements, null, 2));
    await page.close();
  }

  await browser.close();
}

measureHero().catch(console.error);
