import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import OpenAI, { toFile } from 'openai';
import multer from 'multer';

const app = express();
const port = 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

const corsOptions = {
	origin: (origin, callback) => {
		if (allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));

const upload = multer(); 

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

app.post('/images/generate', async (req, res) => {
	try {
		const { prompt } = req.body;
		if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
 
		const response = await openai.images.generate({
			model: 'gpt-image-1',
			prompt: `
				Generate a professional 3D render of a custom exhibition booth for a trade show.
				Company / theme: ${prompt}
				Booth size: 20x20 feet (standard expo booth)
				Style: Modern and eye-catching, designed to attract visitors
				Colors: Use professional color combinations matching the company’s branding theme
				Features: Back wall with the company logo and graphics, reception counter, product display area,
				LED screens for presentations, seating for meetings, and overhead signage with the brand name
				Lighting: Bright and professional, suitable for an expo hall
				Background: Realistic expo environment with people around
				Angle: Perspective front view
				Make the design look photo-realistic, clean, and professional.
			`,
			n: 2,
			size: '1024x1024',
			output_format: 'webp',
			output_compression: 100,
			quality: 'low',
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
