

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export default async function handler(req: Request) {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { medicineName } = await req.json();

        if (!medicineName || medicineName.trim() === '') {
            return new Response(
                JSON.stringify({ error: 'Medicine name is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`Looking up medicine: ${medicineName}`);

        const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
        if (!geminiApiKey) {
            console.error('GEMINI_API_KEY is not configured');
            return new Response(
                JSON.stringify({ error: 'Server configuration error: Missing Gemini API Key' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
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

        const response = await fetch(`${GEMINI_URL}?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt }, { text: `Provide detailed information about this medicine: ${medicineName}` }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error', { status: response.status, body: errorText?.slice?.(0, 1000) });
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('No content received from Gemini');
        }

        // Parse the JSON from AI response
        let medicineData;
        try {
            // Clean up markdown code blocks if Gemini returns them
            const cleanJson = generatedText.replace(/```json\n|\n```/g, '').trim();
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                medicineData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', generatedText);
            throw new Error('Failed to parse medicine information');
        }

        return new Response(JSON.stringify(medicineData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error in medicine-lookup function:', errorMessage);
        return new Response(
            JSON.stringify({
                error: errorMessage,
                found: false,
                medicine: null
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
}
