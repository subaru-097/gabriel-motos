const { execSync } = require('child_process');
const path = require('path');
const ffprobe = path.resolve('node_modules/ffprobe-static/bin/win32/x64/ffprobe.exe');

function probe(file) {
  try {
    const cmd = `"${ffprobe}" -i "${file}" -show_streams -show_format -print_format json -v quiet`;
    const out = execSync(cmd).toString();
    const data = JSON.parse(out);
    const videoStream = data.streams.find(s => s.codec_type === 'video');
    return {
      file,
      format: data.format.format_name,
      duration: parseFloat(data.format.duration),
      size: data.format.size,
      width: videoStream ? videoStream.width : null,
      height: videoStream ? videoStream.height : null,
      fps: videoStream ? eval(videoStream.r_frame_rate) : null,
      codec: videoStream ? videoStream.codec_name : null
    };
  } catch (e) {
    return { file, error: e.message };
  }
}

console.log('hero.1.mp4:', probe('hero.1.mp4'));
console.log('hero.2.mp4:', probe('hero.2.mp4'));
