import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const IMAGE_URL = 'https://api.openai.com/v1/images/generations';

serve(async (req) => {
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

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI is not configured', found: false, medicine: null }),
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
    "dosageForms": ["Tablet", "Capsule", etc.]
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

Be accurate and provide real pharmaceutical information. Include common brand names if the generic name is given, and vice versa.`;

    // Step 1: Get medicine information
    const infoResponse = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Provide detailed information about this medicine: ${medicineName}` },
        ],
      }),
    });

    if (!infoResponse.ok) {
      const errorText = await infoResponse.text();
      console.error('AI gateway error (info)', { status: infoResponse.status, body: errorText?.slice?.(0, 1000) });
      throw new Error(`AI API error: ${infoResponse.status}`);
    }

    const infoData = await infoResponse.json();
    console.log('Medicine info received');

    const aiContent = infoData.choices[0].message.content;
    
    // Parse the JSON from AI response
    let medicineData;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        medicineData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Failed to parse medicine information');
    }

    // Step 2: Generate medicine image if medicine was found
    if (medicineData.found && medicineData.medicine) {
      try {
        console.log('Generating medicine image...');
        
        const medicine = medicineData.medicine;
        const imagePrompt = `Generate a professional, clean product image of a medicine package/box. The medicine is "${medicine.name}" (${medicine.genericName}) made by ${medicine.manufacturer}. Show a realistic pharmaceutical packaging with the medicine name clearly visible. The packaging should look professional and medical. White or light background for product photography. Dosage form: ${medicine.dosageForms?.[0] || 'tablet'}. Style: commercial product photography, clean, professional, pharmaceutical.`;

        const imageResponse = await fetch(IMAGE_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: imagePrompt,
            n: 1,
            size: '1024x1024',
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const generatedImage = imageData.data?.[0]?.url;
          
          if (generatedImage) {
            medicineData.medicine.imageUrl = generatedImage;
            console.log('Medicine image generated successfully');
          } else {
            console.log('No image in response');
          }
        } else {
          const errorText = await imageResponse.text();
          console.error('Image generation failed:', imageResponse.status, errorText?.slice?.(0, 500));
        }
      } catch (imageError) {
        console.error('Error generating image:', imageError);
        // Continue without image - don't fail the whole request
      }
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
});
