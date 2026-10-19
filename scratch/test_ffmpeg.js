const ffmpeg = require('ffmpeg-static');
const ffprobe = require('ffprobe-static');
const { execSync } = require('child_process');

console.log('ffmpeg path:', ffmpeg);
console.log('ffprobe path:', ffprobe.path);
console.log('ffmpeg version:', execSync(`"${ffmpeg}" -version`).toString().split('\n')[0]);
console.log('ffprobe version:', execSync(`"${ffprobe.path}" -version`).toString().split('\n')[0]);
