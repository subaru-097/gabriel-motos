const { chromium } = require('c:\\Users\\User\\Desktop\\Saracota_v2\\node_modules\\playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function createTransitionMedia() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:8000/#categorias', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Scroll into view
  const section = page.locator('#categorias');
  await section.scrollIntoViewIfNeeded();

  const framesDir = path.join(__dirname, 'anim_frames');
  if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);

  const artDir = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\a39c3696-4df2-419f-bda7-b89492fcf58d';
  const ffmpegPath = path.resolve('node_modules/ffmpeg-static/ffmpeg.exe');

  console.log('Capturing high-speed frames of transition...');
  
  // Initial frame
  await page.screenshot({ path: path.join(framesDir, 'frame_000.png') });

  // Trigger transition: Card 1 -> Card 2
  await page.click('#styles-next');

  // Capture frames every 35ms during the 480ms transition
  for (let i = 1; i <= 15; i++) {
    await page.waitForTimeout(32);
    const filename = `frame_${String(i).padStart(3, '0')}.png`;
    await page.screenshot({ path: path.join(framesDir, filename) });
  }

  await browser.close();

  // Create animated GIF using ffmpeg
  const gifOutput = path.join(artDir, 'section2_card_transition.gif');
  console.log('Generating animated GIF with ffmpeg...');
  try {
    execSync(`"${ffmpegPath}" -y -framerate 16 -i "${framesDir}/frame_%03d.png" -vf "fps=16,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${gifOutput}"`);
    console.log('GIF generated successfully at:', gifOutput);
  } catch (err) {
    console.error('Error generating GIF:', err.message);
  }

  // Also select 4 key progression screenshots to show as sequence
  const keyFrames = ['frame_000.png', 'frame_004.png', 'frame_008.png', 'frame_014.png'];
  const labels = ['passo_1_repouso', 'passo_2_deslize_inicial', 'passo_3_cruzamento', 'passo_4_encaixe_ativo'];
  keyFrames.forEach((kf, idx) => {
    fs.copyFileSync(path.join(framesDir, kf), path.join(artDir, `sequencia_${labels[idx]}.png`));
  });

  console.log('Key frames saved.');
}

createTransitionMedia().catch(console.error);
