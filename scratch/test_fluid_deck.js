const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function testFluidDeck() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://127.0.0.1:8000/#categorias', { waitUntil: 'networkidle' });

  // Inject the improved fluid deck logic
  await page.evaluate(() => {
    const styleCards = Array.from(document.querySelectorAll('.style-card'));
    const styleProgressBars = Array.from(document.querySelectorAll('.styles-progress__bar'));
    const total = styleCards.length;

    // Apply fluid transition styles
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .style-card {
        transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
                    opacity 500ms cubic-bezier(0.22, 1, 0.36, 1),
                    filter 500ms cubic-bezier(0.22, 1, 0.36, 1),
                    box-shadow 500ms cubic-bezier(0.22, 1, 0.36, 1),
                    border-color 500ms cubic-bezier(0.22, 1, 0.36, 1) !important;
        will-change: transform, opacity;
      }
      .style-card[data-pos="0"],
      .style-card.is-active {
        transform: translate3d(0, 0, 0) scale(1.02) !important;
        box-shadow: 0 26px 56px rgba(0, 0, 0, 0.95), 0 0 32px rgba(212, 255, 0, 0.20) !important;
      }
    `;
    document.head.appendChild(styleEl);

    let curIdx = 1;

    window.fluidSetActiveStyle = function(index) {
      const targetIndex = ((index % total) + total) % total;
      if (targetIndex === curIdx) return;
      curIdx = targetIndex;

      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      styleCards.forEach((card, idx) => {
        let pos = (idx - targetIndex) % total;
        if (pos > total / 2) pos -= total;
        if (pos < -total / 2) pos += total;

        const oldPos = parseInt(card.dataset.pos, 10);
        const isWrapping = (oldPos === -2 && pos === 2) || (oldPos === 2 && pos === -2) || (Math.abs(pos - oldPos) > 2);

        if (isWrapping && !isReduced) {
          card.style.transition = 'none';
          card.style.opacity = '0';
          card.dataset.pos = pos;
          card.dataset.stack = pos;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = '';
              card.style.opacity = '';
            });
          });
        } else {
          card.style.transition = '';
          card.dataset.pos = pos;
          card.dataset.stack = pos;
        }

        if (pos === 0) {
          card.classList.add('is-active');
          card.setAttribute('aria-selected', 'true');
        } else {
          card.classList.remove('is-active');
          card.setAttribute('aria-selected', 'false');
        }
      });

      styleProgressBars.forEach((bar, idx) => {
        bar.classList.toggle('is-active', idx === targetIndex);
      });

      if (window.syncGridWithActiveStyle) {
        window.syncGridWithActiveStyle(targetIndex);
      }
    };

    // Replace click listeners on next and prev buttons
    const btnNext = document.getElementById('styles-next');
    const newNext = btnNext.cloneNode(true);
    btnNext.parentNode.replaceChild(newNext, btnNext);
    newNext.addEventListener('click', () => {
      window.fluidSetActiveStyle(curIdx + 1);
    });

    const btnPrev = document.getElementById('styles-prev');
    const newPrev = btnPrev.cloneNode(true);
    btnPrev.parentNode.replaceChild(newPrev, btnPrev);
    newPrev.addEventListener('click', () => {
      window.fluidSetActiveStyle(curIdx - 1);
    });
  });

  // Test rapid clicking: 3 clicks separated by 120ms
  console.log('Testing rapid clicking with fluid deck...');
  const btnNext = page.locator('#styles-next');
  await btnNext.click();
  console.log('Click 1');
  await page.waitForTimeout(120);
  await btnNext.click();
  console.log('Click 2');
  await page.waitForTimeout(120);
  await btnNext.click();
  console.log('Click 3');

  await page.waitForTimeout(600);
  const activeIndex = await page.$eval('.style-card.is-active', el => el.dataset.index);
  console.log('Final active card after 3 rapid clicks:', activeIndex);

  await page.screenshot({ path: 'scratch/output/fluid_deck_result.png' });
  await browser.close();
}

testFluidDeck().catch(console.error);
