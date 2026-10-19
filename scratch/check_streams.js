const ffprobe = require('ffprobe-static');
const { execSync } = require('child_process');

const out = JSON.parse(execSync(`"${ffprobe.path}" -v quiet -print_format json -show_streams s1000rr-intro.mp4`));
console.log('Streams in intro:', out.streams.map(s => ({ type: s.codec_type, codec: s.codec_name })));
