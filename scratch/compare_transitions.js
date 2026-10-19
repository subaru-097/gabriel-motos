const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');

async function compareTransitions() {
  const browser = await chromium.launch({ headless: true });

  // Test 1: Pure CSS transition on all cards
  const p1 = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await p1.goto('http://127.0.0.1:8000/#categorias', { waitUntil: 'networkidle' });

  await p1.evaluate(() => {
    // Replace setActiveStyle with fluid non-blocking implementation
    window.customSetActiveStyle = function(index, dir = 0) {
      const cards = Array.from(document.querySelectorAll('.style-card'));
      const bars = Array.from(document.querySelectorAll('.styles-progress__bar'));
      const total = cards.length;
      const targetIndex = ((index % total) + total) % total;

      cards.forEach((c) => {
        c.classList.remove('slide-exit-next', 'slide-exit-prev');
        c.style.willChange = 'transform, opacity';
      });

      window.currentStyleIndex = targetIndex;

      // Update positions
      cards.forEach((card, idx) => {
        let pos = (idx - targetIndex) % total;
        if (pos > total / 2) pos -= total;
        if (pos < -total / 2) pos += total;

        const oldPos = parseInt(card.dataset.pos || '0', 10);
        const isWrapping = Math.abs(pos - oldPos) > 2;

        if (isWrapping) {
          // Card jumping from one side to the other: fade out, teleport, fade in
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

      bars.forEach((bar, idx) => {
        bar.classList.toggle('is-active', idx === targetIndex);
      });

      if (window.syncGridWithActiveStyle) {
        window.syncGridWithActiveStyle(targetIndex);
      }
    };

    // Override style
    const style = document.createElement('style');
    style.innerHTML = `
      .style-card {
        transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
                    opacity 480ms cubic-bezier(0.22, 1, 0.36, 1),
                    filter 480ms cubic-bezier(0.22, 1, 0.36, 1),
                    box-shadow 480ms cubic-bezier(0.22, 1, 0.36, 1),
                    border-color 480ms cubic-bezier(0.22, 1, 0.36, 1) !important;
        will-change: transform, opacity;
      }
    `;
    document.head.appendChild(style);

    // Override event listeners on next/prev buttons
    const nextBtn = document.getElementById('styles-next');
    const newNext = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);
    newNext.addEventListener('click', () => {
      window.customSetActiveStyle(window.currentStyleIndex + 1, 1);
    });

    const prevBtn = document.getElementById('styles-prev');
    const newPrev = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);
    newPrev.addEventListener('click', () => {
      window.customSetActiveStyle(window.currentStyleIndex - 1, -1);
    });
  });

  // Let's capture a sequence of frames during a click
  await p1.click('#styles-next');
  for (let i = 0; i < 10; i++) {
    await p1.waitForTimeout(50);
    await p1.screenshot({ path: `scratch/output/fluid_frame_${i}.png` });
  }

  // Now test 3 rapid clicks!
  console.log('Testing 3 rapid clicks with fluid handler:');
  await p1.click('#styles-next');
  await p1.waitForTimeout(100);
  await p1.click('#styles-next');
  await p1.waitForTimeout(100);
  await p1.click('#styles-next');

  await p1.waitForTimeout(600);
  const activeIdx = await p1.$eval('.style-card.is-active', el => el.dataset.index);
  console.log('Active index after 3 rapid clicks:', activeIdx);
  await p1.screenshot({ path: 'scratch/output/after_3_rapid_clicks.png' });

  await p1.close();
  await browser.close();
}

compareTransitions().catch(console.error);
