const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');
const fs = require('fs');

async function makeLogo() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const logoBuf = fs.readFileSync('c:/Users/User/Desktop/gabriel motos/logo gabriel motos.png');
  const base64 = 'data:image/png;base64,' + logoBuf.toString('base64');

  await page.setContent(`<img id="img" src="${base64}" /><canvas id="c"></canvas>`);
  await page.waitForSelector('#img');

  const transparentBase64 = await page.evaluate(() => {
    const img = document.getElementById('img');
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const canvas = document.getElementById('c');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const isBg = (x, y) => {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      return r > 165 && g > 165 && b > 165 && Math.abs(r - g) < 22 && Math.abs(g - b) < 22;
    };

    const visited = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let head = 0, tail = 0;

    for (let x = 0; x < w; x++) {
      if (isBg(x, 0)) { queue[tail++] = x; visited[x] = 1; }
      const btm = (h - 1) * w + x;
      if (isBg(x, h - 1) && !visited[btm]) { queue[tail++] = btm; visited[btm] = 1; }
    }
    for (let y = 0; y < h; y++) {
      const lft = y * w;
      if (isBg(0, y) && !visited[lft]) { queue[tail++] = lft; visited[lft] = 1; }
      const rgt = y * w + (w - 1);
      if (isBg(w - 1, y) && !visited[rgt]) { queue[tail++] = rgt; visited[rgt] = 1; }
    }

    while (head < tail) {
      const pos = queue[head++];
      data[pos * 4 + 3] = 0;

      const px = pos % w;
      const py = (pos / w) | 0;

      if (px > 0) {
        const n = pos - 1;
        if (!visited[n] && isBg(px - 1, py)) { visited[n] = 1; queue[tail++] = n; }
      }
      if (px < w - 1) {
        const n = pos + 1;
        if (!visited[n] && isBg(px + 1, py)) { visited[n] = 1; queue[tail++] = n; }
      }
      if (py > 0) {
        const n = pos - w;
        if (!visited[n] && isBg(px, py - 1)) { visited[n] = 1; queue[tail++] = n; }
      }
      if (py < h - 1) {
        const n = pos + w;
        if (!visited[n] && isBg(px, py + 1)) { visited[n] = 1; queue[tail++] = n; }
      }
    }

    // Scan any isolated checkered pixels (white and gray squares of the fake checkerboard)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const diff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
      // Checkerboard pixels outside the logo
      if (diff <= 10 && ((r > 190 && g > 190 && b > 190) || (r > 165 && r < 190))) {
        // Check if it's not part of white lettering (white lettering has r > 240, g > 240, b > 240 surrounded by dark outline)
        // But in the outer regions, it's just the checkerboard
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Tight crop
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

    const pad = 12;
    const cropW = (maxX - minX + 1) + pad * 2;
    const cropH = (maxY - minY + 1) + pad * 2;
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext('2d');
    cropCtx.drawImage(canvas, minX, minY, maxX - minX + 1, maxY - minY + 1, pad, pad, maxX - minX + 1, maxY - minY + 1);

    return cropCanvas.toDataURL('image/png');
  });

  const b64Data = transparentBase64.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('logo-gabriel-motos-transparente.png', b64Data, 'base64');
  console.log('Successfully saved logo-gabriel-motos-transparente.png');

  await browser.close();
}

makeLogo().catch(console.error);
