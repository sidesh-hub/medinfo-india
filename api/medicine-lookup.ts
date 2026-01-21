export const config = {
    runtime: 'edge',
};

const MODELS_TO_TRY = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-pro'
];

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    try {
        const body = await req.json();
        const { medicineName } = body || {};

        if (!medicineName || typeof medicineName !== 'string' || medicineName.trim() === '') {
            return new Response(JSON.stringify({ error: 'Medicine name is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

        console.log(`Looking up medicine: ${medicineName}`);

        // Sanitize API Key: convert to string, remove whitespace, remove wrapping quotes if present
        let geminiApiKey = process.env.GEMINI_API_KEY ? String(process.env.GEMINI_API_KEY).trim() : '';
        if (geminiApiKey.startsWith('"') && geminiApiKey.endsWith('"')) {
            geminiApiKey = geminiApiKey.slice(1, -1);
        }
        if (geminiApiKey.startsWith("'") && geminiApiKey.endsWith("'")) {
            geminiApiKey = geminiApiKey.slice(1, -1);
        }

        if (!geminiApiKey) {
            console.error('GEMINI_API_KEY is not configured');
            return new Response(JSON.stringify({ error: 'Server configuration error: Missing Gemini API Key' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

        const systemPrompt = `You are a pharmaceutical information assistant. When given a medicine name, provide accurate, detailed information in JSON format.

IMPORTANT: Respond ONLY with valid JSON, no markdown or other text.

The JSON must have this exact structure:
{
  "found": true or false,
  "medicine": {
    "id": "unique-id",
    "name": "Full medicine name with strength",
    "genericName": "Generic/chemical name",
    "manufacturer": "Manufacturer name",
    "category": "Medicine category",
    "schedule": "Schedule H" or "OTC" or "Schedule H1" or "Schedule X",
    "composition": ["Active ingredient 1 with strength", "Active ingredient 2 with strength"],
    "uses": ["Primary use 1", "Primary use 2", "Primary use 3"],
    "sideEffects": ["Common side effect 1", "Common side effect 2", "Common side effect 3"],
    "warnings": ["Warning 1", "Warning 2"],
    "dosage": {
      "adults": "Adult dosage instructions",
      "children": "Children dosage instructions or 'Not recommended for children'",
      "elderly": "Elderly dosage or 'Use with caution'"
    },
    "storage": "Storage instructions",
    "interactions": ["Drug interaction 1", "Drug interaction 2"],
    "contraindications": ["Contraindication 1", "Contraindication 2"],
    "price": {
      "amount": approximate price as number,
      "currency": "INR",
      "unit": "strip of X tablets" or appropriate unit
    },
    "availability": "Widely Available" or "Available" or "Prescription Only",
    "dosageForms": ["Tablet", "Capsule", etc.],
    "imageUrl": null
  },
  "disclaimer": "This information is for educational purposes only. Always consult a healthcare professional before taking any medication."
}

If the medicine is not recognized or doesn't exist, return:
{
  "found": false,
  "medicine": null,
  "suggestion": "Did you mean [similar medicine name]? Or please check the spelling.",
  "disclaimer": "This information is for educational purposes only."
}

Be accurate.`;

        let lastError = null;
        let successData = null;

        // Try models in sequence
        for (const model of MODELS_TO_TRY) {
            try {
                const response = await fetch(`${BASE_URL}/${model}:generateContent?key=${geminiApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: systemPrompt }, { text: `Provide detailed information about this medicine: ${medicineName}` }]
                        }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    successData = data;
                    break;
                } else {
                    const errorText = await response.text();
                    // Sanitize error text to avoid leaking full HTML if it's a 404 page, but keep enough to debug
                    const safeErrorText = errorText.slice(0, 500);
                    console.warn(`Model ${model} failed with status ${response.status}:`, safeErrorText);
                    lastError = { status: response.status, details: safeErrorText };
                }
            } catch (err) {
                console.error(`Error fetching model ${model}:`, err);
                lastError = { status: 500, details: err instanceof Error ? err.message : String(err) };
            }
        }

        if (!successData) {
            console.error('All models failed. Last error:', lastError);
            // Return validation details in the error string so user can see it in client UI
            const detailedMsg = lastError?.details ? `Details: ${lastError.details}` : '';
            return new Response(JSON.stringify({
                error: `AI API error: All models failed. Status: ${lastError?.status}. ${detailedMsg}`,
                details: lastError?.details
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

        const generatedText = successData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('No content received from Gemini');
        }

        // Parse the JSON from AI response
        let medicineData;
        try {
            const cleanJson = generatedText.replace(/```json\n|\n```/g, '').trim();
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                medicineData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', generatedText);
            return new Response(JSON.stringify({ error: 'Failed to parse medicine information' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }

        return new Response(JSON.stringify(medicineData), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error in medicine-lookup function:', errorMessage);
        return new Response(JSON.stringify({
            error: errorMessage,
            found: false,
            medicine: null
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
}
