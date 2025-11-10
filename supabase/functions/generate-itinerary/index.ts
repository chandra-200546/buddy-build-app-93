import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, startDate, endDate, travelers, budget } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating itinerary for:", { destination, startDate, endDate, travelers, budget });

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const systemPrompt = `You are an expert travel planner for India. Create detailed, realistic, and exciting day-by-day itineraries. 
Include specific places, timings, activities, local cuisine recommendations, cultural tips, and approximate costs in INR.
Make the itinerary practical and consider travel time between locations.`;

    const userPrompt = `Create a ${days}-day itinerary for ${destination} for ${travelers} traveler(s) with a ${budget} budget.
Travel dates: ${startDate} to ${endDate}.

For each day, provide:
- Day number and date
- Morning, afternoon, and evening activities with specific locations
- Recommended restaurants with local dishes
- Cultural tips or festival information if applicable
- Approximate daily cost in INR
- Travel tips between locations

Format it as a structured JSON with this exact schema:
{
  "title": "Trip title",
  "overview": "Brief overview of the trip",
  "totalEstimatedCost": "Total cost in INR",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Day title",
      "activities": [
        {
          "time": "Morning/Afternoon/Evening",
          "title": "Activity name",
          "description": "Detailed description",
          "location": "Specific place",
          "cost": "Approximate cost in INR"
        }
      ],
      "meals": [
        {
          "type": "Breakfast/Lunch/Dinner",
          "restaurant": "Restaurant name",
          "dish": "Recommended dish",
          "cost": "Approximate cost"
        }
      ],
      "culturalTips": "Tips for the day",
      "estimatedCost": "Total cost for the day"
    }
  ],
  "generalTips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    console.log("AI response received");
    
    const itinerary = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ itinerary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-itinerary:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
