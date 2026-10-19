const ffprobe = require('ffprobe-static');
const { execSync } = require('child_process');

function getInfo(file) {
  const out = execSync(`"${ffprobe.path}" -v quiet -print_format json -show_streams -show_format "${file}"`).toString();
  const data = JSON.parse(out);
  const stream = data.streams[0];
  return {
    file,
    width: stream.width,
    height: stream.height,
    duration: data.format ? data.format.duration : stream.duration,
    r_frame_rate: stream.r_frame_rate
  };
}

console.log(getInfo('poster.jpg'));
console.log(getInfo('s1000rr-intro.mp4'));
console.log(getInfo('s1000rr-lop-2.mp4'));
