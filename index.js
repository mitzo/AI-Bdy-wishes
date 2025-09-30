const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/api/generate-video', upload.array('photos'), (req, res) => {
const { name, occasion } = req.body;
const photos = req.files;

// Generate a video using FFmpeg
const outputVideo = `output-${Date.now()}.mp4`;
const inputImages = photos.map((photo) => `file '${photo.path}'`).join('\n');
const textOverlay = `drawtext=text='${occasion}, ${name}':fontcolor=white:fontsize=24:x=w/2:y=h/2`;

const fileList = 'file-list.txt';
fs.writeFileSync(fileList, inputImages);

const command = `ffmpeg -f concat -safe 0 -i ${fileList} -vf "${textOverlay}" ${outputVideo}`;
exec(command, (error) => {
if (error) {
console.error(error);
res.status(500).json({ success: false, message: 'Error generating video.' });
} else {
res.json({ success: true, videoUrl: `/${outputVideo}` });
}

// Cleanup
fs.unlinkSync(fileList);
photos.forEach((photo) => fs.unlinkSync(photo.path));
});
});

app.use(express.static('public'));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
