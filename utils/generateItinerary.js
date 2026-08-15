const { GoogleGenerativeAI } = require("@google/generative-ai");
const ExpressError = require("./ExpressError");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateItinerary = async (destination, tripLength, groupSize, budgetTier, interests) => {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const promptTemplate = `You are a travel itinerary planner. Generate a detailed day-by-day trip itinerary as STRICT JSON matching this exact schema. Do not include markdown formatting, code fences, or any explanatory text outside the JSON.

Trip details:
- Destination: ${destination}
- Trip length: ${tripLength} days
- Group size: ${groupSize} people
- Budget tier: ${budgetTier}
- Interests: ${interests.join(", ")}

Return JSON in exactly this shape:
{
  "days": [
    {
      "dayNumber": 1,
      "theme": "short theme for the day",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "short activity name",
          "description": "1-2 sentence description",
          "estimatedCost": 500,
          "category": "food" | "activity" | "travel" | "accommodation"
        }
      ]
    }
  ]
}

Rules:
- Include 4-6 activities per day, covering morning, afternoon, and evening.
- estimatedCost should be a realistic number in INR for the given budget tier.
- Bias activity choices toward the listed interests.
- Return ONLY the JSON object, nothing else.`;

    const attemptGeneration = async (promptText) => {
        const result = await model.generateContent(promptText);
        const response = await result.response;
        let text = response.text();
        
        // Defensive parsing
        text = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
        
        return JSON.parse(text);
    };

    try {
        let itineraryData;
        try {
            itineraryData = await attemptGeneration(promptTemplate);
        } catch (e) {
            console.log("First Gemini parse failed, retrying...");
            const retryPrompt = promptTemplate + "\n\nYour previous response was not valid JSON. Return ONLY valid JSON, no markdown, no explanation.";
            itineraryData = await attemptGeneration(retryPrompt);
        }

        // Validate shape
        if (!itineraryData || !Array.isArray(itineraryData.days) || itineraryData.days.length !== tripLength) {
            throw new Error("Invalid itinerary shape or incorrect number of days.");
        }
        
        for (let day of itineraryData.days) {
            if (!day.activities || !Array.isArray(day.activities) || day.activities.length === 0) {
                throw new Error(`Day ${day.dayNumber} has invalid or empty activities.`);
            }
        }

        return itineraryData;
    } catch (e) {
        console.error("Gemini Itinerary Generation Error:", e);
        throw new ExpressError(500, "Failed to generate itinerary. Please try again later.");
    }
};

module.exports = generateItinerary;
