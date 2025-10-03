import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import OpenAI, { toFile } from 'openai';

const app = express();
const port = 3000;

const allowedOrigins = [
  'https://codesandbox.io',
  'https://sns-exhibits.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      origin.includes('codesandbox.io') ||
      origin.includes('csb.app') || // Codesandbox preview domain
      origin.startsWith('https://sns-exhibits.com')
    ) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin: ' + origin));
    }
  },
};

app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '50mb' }));

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/images/generate', async (req, res) => {
	try {
		const { prompt } = req.body;
		if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
 
		const response = await openai.images.generate({
			model: 'gpt-image-1',
			prompt: `
					Create an ultra-realistic 3D render of a custom exhibition booth designed for a high-profile trade show.
					
					Brand / Theme: ${prompt}  
					Booth size: 20x20 feet (standard expo size)  
					Style: Futuristic, visually striking, and immersive — designed to turn heads  
					Color Palette: Use sleek, branded tones with contrasting accent lighting  
					Design Features:
					- Bold architectural elements (curved walls, layered textures, LED strips)
					- Dynamic back wall with embedded motion graphics and brand storytelling
					- Modular product showcases with integrated lighting
					- Interactive touchscreens and projection mapping
					- Lounge-style seating with smart lighting
					- Overhead hanging banner or structure with integrated lighting and bold logo
					
					Ambience:
					- Bright, high-contrast lighting suitable for exhibition spaces
					- Background: A bustling, realistic trade show environment with blurred figures of attendees walking by
					
					Camera angle: Cinematic front-left perspective, slightly elevated, dramatic depth of field  
					Make it: Hyper-realistic, polished, and visually powerful — like a high-end architectural concept render.

			`,
			n: 1,
			size: '1024x1024',
			output_format: 'webp',
			output_compression: 100,
			quality: 'medium',
		});

		const images = response.data.map(
			(img) => `data:image/webp;base64,${img.b64_json}`
		);

		res.json({ images });
	} catch (err) {
		console.error('❌ Image generate error:', err);
		res.status(500).json({ error: err.message });
	}
});


app.listen(port, () => {
	console.log(`🚀 Image server running at http://localhost:${port}`);
});
