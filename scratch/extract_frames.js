const { execSync } = require('child_process');
const path = require('path');
const ffmpeg = path.resolve('node_modules/ffmpeg-static/ffmpeg.exe');

try {
  // Extract last frame of hero.1.mp4
  execSync(`"${ffmpeg}" -y -ss 00:00:07.95 -i "hero.1.mp4" -vframes 1 "scratch/last_frame_hero1.png"`);
  // Extract first frame of hero.2.mp4
  execSync(`"${ffmpeg}" -y -ss 00:00:00.00 -i "hero.2.mp4" -vframes 1 "scratch/first_frame_hero2.png"`);
  console.log('Frames extracted.');
} catch (e) {
  console.error('Error extracting frames:', e.message);
}
