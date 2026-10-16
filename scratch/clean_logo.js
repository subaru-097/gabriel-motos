const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');
const fs = require('fs');
const path = require('path');

async function cleanLogo() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const logoBuffer = fs.readFileSync('c:/Users/User/Desktop/gabriel motos/logo-gabriel-motos.png');
  const base64Src = 'data:image/png;base64,' + logoBuffer.toString('base64');
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body>
        <img id="srcImg" src="${base64Src}" />
        <canvas id="c"></canvas>
      </body>
    </html>
  `);

  await page.waitForSelector('#srcImg');
  await page.evaluate(() => new Promise((resolve) => {
    const img = document.getElementById('srcImg');
    if (img.complete && img.naturalWidth > 0) resolve();
    else img.onload = resolve;
  }));

  const dataUrl = await page.evaluate(() => {
    const img = document.getElementById('srcImg');
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const canvas = document.getElementById('c');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const isChecker = (idx) => {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const diff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
      return diff <= 12 && r >= 35 && r <= 100;
    };

    // Breadth-first search / queue flood fill from all 4 borders
    const visited = new Uint8Array(w * h);
    const queue = [];

    const pushCoord = (x, y) => {
      const idx = y * w + x;
      if (!visited[idx]) {
        visited[idx] = 1;
        queue.push(idx);
      }
    };

    for (let x = 0; x < w; x++) {
      pushCoord(x, 0);
      pushCoord(x, h - 1);
    }
    for (let y = 0; y < h; y++) {
      pushCoord(0, y);
      pushCoord(w - 1, y);
    }

    let head = 0;
    while (head < queue.length) {
      const current = queue[head++];
      const cx = current % w;
      const cy = Math.floor(current / w);
      const pIdx = current * 4;

      if (isChecker(pIdx)) {
        data[pIdx + 3] = 0; // Transparent!

        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nIdx = ny * w + nx;
            if (!visited[nIdx]) {
              visited[nIdx] = 1;
              queue.push(nIdx);
            }
          }
        }
      }
    }

    // Now scan any remaining isolated checkerboard pixels throughout the image
    for (let i = 0; i < data.length; i += 4) {
      if (isChecker(i)) {
        data[i + 3] = 0;
      }
    }

    // Also crop out empty transparent margins to make the logo tight and crisp
    let minX = w, minY = h, maxX = 0, maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const a = data[(y * w + x) * 4 + 3];
        if (a > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const pad = 16;
    const cropW = Math.max(1, (maxX - minX + 1) + pad * 2);
    const cropH = Math.max(1, (maxY - minY + 1) + pad * 2);
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext('2d');
    cropCtx.drawImage(canvas, minX, minY, maxX - minX + 1, maxY - minY + 1, pad, pad, maxX - minX + 1, maxY - minY + 1);

    return cropCanvas.toDataURL('image/png');
  });

  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('logo-gabriel-motos-transparente.png', base64Data, 'base64');
  console.log('Saved clean logo-gabriel-motos-transparente.png');

  await browser.close();
}

cleanLogo().catch(console.error);
