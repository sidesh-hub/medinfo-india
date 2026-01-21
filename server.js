
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load .env manually
let GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY && existsSync('.env')) {
    const envConfig = readFileSync('.env', 'utf8');
    const match = envConfig.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
        GEMINI_API_KEY = match[1].trim();
    }
}

// Keeping PORT 3003
const PORT = 3003;

// Using "gemini-flash-latest" alias which appeared in your available models list
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const server = createServer(async (req, res) => {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/medicine-lookup' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const parsedBody = JSON.parse(body);
                const { medicineName } = parsedBody;

                if (!medicineName) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Medicine name is required' }));
                    return;
                }

                console.log(`Processing request for: ${medicineName}`);

                if (!GEMINI_API_KEY) {
                    console.error('API Key missing');
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Server config error: Missing GEMINI_API_KEY' }));
                    return;
                }

                const systemPrompt = `You are a pharmaceutical information assistant. When given a medicine name, provide accurate, detailed information in JSON format.
IMPORTANT: Respond ONLY with valid JSON, no markdown.
The JSON must have this exact structure:
{
  "found": true or false,
  "medicine": {
    "id": "unique-id",
    "name": "Full medicine name with strength",
    "genericName": "Generic/chemical name",
    "manufacturer": "Manufacturer name",
    "category": "Medicine category",
    "schedule": "Schedule H or OTC",
    "composition": ["Active ingredient 1"],
    "uses": ["Primary use 1"],
    "sideEffects": ["Side effect 1"],
    "warnings": ["Warning 1"],
    "dosage": {
      "adults": "Adult dosage",
      "children": "Children dosage",
      "elderly": "Elderly dosage"
    },
    "storage": "Storage instructions",
    "interactions": ["Interaction 1"],
    "contraindications": ["Contraindication 1"],
    "price": {
      "amount": 100,
      "currency": "INR",
      "unit": "strip"
    },
    "availability": "Available",
    "dosageForms": ["Tablet"],
    "imageUrl": null
  },
  "disclaimer": "Consult a doctor."
}
If not found, return found: false with suggestion.`;

                console.log(`Connecting to Gemini: ${GEMINI_URL}`);

                const geminiResponse = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: systemPrompt }, { text: `Provide info for: ${medicineName}` }]
                        }]
                    })
                });

                if (!geminiResponse.ok) {
                    const errorText = await geminiResponse.text();
                    console.error('Gemini API Error:', geminiResponse.status, errorText);
                    throw new Error(`Gemini API Error (${geminiResponse.status}): ${errorText}`);
                }

                const data = await geminiResponse.json();
                const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!generatedText) throw new Error('No content from Gemini');

                // Extract JSON
                const cleanJson = generatedText.replace(/```json\n|\n```/g, '').trim();
                const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
                const finalData = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse JSON' };

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(finalData));

            } catch (error) {
                console.error(error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });

    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Local API Server running at http://localhost:${PORT}`);
});
