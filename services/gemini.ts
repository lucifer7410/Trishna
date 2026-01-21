
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CropRecommendation, WeatherData, VideoResult, CropDetails, UserProfile, MarketRate } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Robust error checker for Quota/Rate Limits
const isQuotaError = (error: any): boolean => {
  const errBody = error?.error || error;
  const statusCode = error?.status || error?.response?.status || errBody?.code || errBody?.status;
  const message = error?.message || errBody?.message || JSON.stringify(error);
  
  return statusCode === 429 || 
         statusCode === 503 ||
         (typeof message === 'string' && (
           message.includes('429') || 
           message.includes('quota') || 
           message.includes('RESOURCE_EXHAUSTED') ||
           message.includes('overloaded')
         ));
};

// Helper for exponential backoff retry with jitter
const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0 && isQuotaError(error)) {
      const jitter = Math.random() * 500;
      const waitTime = delay + jitter;
      console.warn(`Gemini API busy (Retrying in ${Math.round(waitTime)}ms)...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Helper to extract grounding chunks
const extractGroundingUrls = (response: GenerateContentResponse): { title: string; uri: string }[] => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return chunks
    .filter((chunk: any) => chunk.web?.uri)
    .map((chunk: any) => ({
      title: safeString(chunk.web?.title, 'Source'),
      uri: chunk.web?.uri,
    }));
};

// Helper to safely convert any value to string for UI
const safeString = (val: any, fallback: string = ""): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') {
      if (val.trim() === '[object Object]') return fallback;
      if (val.includes('[object Object]')) return fallback;
      return val.trim();
  }
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return '';
  if (typeof val === 'object') {
    // Try common keys if AI returned an object instead of string
    if (val.value && typeof val.value === 'string') return val.value;
    if (val.text && typeof val.text === 'string') return val.text;
    if (val.name && typeof val.name === 'string') return val.name;
    if (val.description && typeof val.description === 'string') return val.description;
    
    // If it's an unhandled object, return fallback to prevent [object Object]
    return fallback;
  }
  return String(val);
};

// --- MOCK DATA GENERATORS (For Fallbacks) ---

const getMockWeather = (location: string): WeatherData => ({
  temperature: "28°C",
  minTemp: "22°C",
  maxTemp: "32°C",
  condition: "Partly Cloudy",
  humidity: "65%",
  rainfall: "10%",
  wind: "15 km/h",
  sunshine: "Moderate",
  alerts: [],
  location: location,
  forecast: Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      maxTemp: `${30 + (i % 3)}°C`,
      minTemp: `${22 + (i % 2)}°C`,
      condition: i % 3 === 0 ? "Sunny" : "Cloudy",
      chanceOfRain: i % 3 === 0 ? "0%" : "20%"
    };
  })
});

const getMockCrops = (): CropRecommendation[] => [
  {
    cropName: "Tomato",
    riskLevel: "Safe",
    reasoning: "Great for both gardens and farms in this season.",
    tags: ["Vegetable", "Garden Friendly"],
    fertilizer: {
      summary: "Organic Compost + Balanced NPK",
      tips: ["Add crushed eggshells for calcium", "Avoid high nitrogen to ensure fruiting"],
      schedule: "Apply compost at sowing, liquid seaweed every 2 weeks"
    }
  },
  {
    cropName: "Marigold",
    riskLevel: "Safe",
    reasoning: "Excellent for companion planting and pest control.",
    tags: ["Flower", "Low Maintenance"],
    fertilizer: {
      summary: "Low Fertilizer Need",
      tips: ["Too much fertilizer grows leaves, not flowers", "Use pinch of DAP if growth stunts"],
      schedule: "One dose of vermicompost at planting is usually enough"
    }
  },
  {
    cropName: "Spinach",
    riskLevel: "Safe",
    reasoning: "Short duration leafy vegetable, perfect for pots or fields.",
    tags: ["Leafy", "Quick Harvest"],
    fertilizer: {
      summary: "Nitrogen Rich",
      tips: ["Use Cow Manure or Tea waste water", "Ensure soil stays moist for nutrient uptake"],
      schedule: "Apply nitrogen-rich fertilizer after 20 days of germination"
    }
  }
];

const getMockVideos = (): VideoResult[] => [
  {
    title: "Container Gardening for Beginners",
    url: "https://www.youtube.com/results?search_query=container+gardening+for+beginners",
    channel: "Garden Up"
  },
  {
    title: "Organic Fertilizer at Home",
    url: "https://www.youtube.com/results?search_query=how+to+make+organic+fertilizer+at+home",
    channel: "Green Thumb"
  },
  {
    title: "Rice Farming Techniques",
    url: "https://www.youtube.com/results?search_query=modern+rice+farming+techniques",
    channel: "AgriTech"
  }
];

const getMockMarketRates = (): MarketRate[] => [
    { commodity: "Tomato", price: "₹25", unit: "kg", trend: "up" },
    { commodity: "Onion", price: "₹30", unit: "kg", trend: "stable" },
    { commodity: "Potato", price: "₹18", unit: "kg", trend: "down" },
    { commodity: "Wheat", price: "₹2200", unit: "quintal", trend: "stable" },
    { commodity: "Rice", price: "₹2800", unit: "quintal", trend: "up" },
    { commodity: "Banana", price: "₹40", unit: "doz", trend: "stable" },
    { commodity: "Green Chilli", price: "₹60", unit: "kg", trend: "down" },
    { commodity: "Mustard", price: "₹5400", unit: "quintal", trend: "up" }
];

// --- API FUNCTIONS ---

export const fetchWeatherAndAlerts = async (location: string, language: string): Promise<WeatherData> => {
  if (!apiKey) return getMockWeather(location);

  const prompt = `
    Act as an agricultural meteorologist.
    Get the current weather and 7-day forecast for: ${location}.
    If the location is provided as coordinates, resolve it to a specific place name including the Area/Neighborhood, City, and State.
    Example resolution: "Jadavpur, Kolkata, West Bengal".
    
    CRITICAL: Include wind speed and sunlight intensity/duration context.
    
    Response format (JSON):
    {
      "temperature": "current temp (e.g. 32°C)",
      "min_temp": "today's low (e.g. 24°C)",
      "max_temp": "today's high (e.g. 36°C)",
      "condition": "short summary (e.g. Sunny, Heavy Rain)",
      "humidity": "humidity %",
      "rainfall": "chance of rain % or amount",
      "wind": "wind speed (e.g. 12 km/h)",
      "sunshine": "Sunlight context (e.g. High UV, Moderate, Low)",
      "alerts": ["alert 1", "alert 2"] (empty if none),
      "location": "resolved specific location name",
      "forecast": [
        {
          "day": "Day name (e.g. Mon, Tue)",
          "date": "Short date (e.g. 15 Jan)",
          "max_temp": "High temp",
          "min_temp": "Low temp",
          "condition": "Short condition",
          "rain_chance": "Chance of rain %"
        }
      ] (7 items)
    }
    Translate the content to ${language} but keep keys in English.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
      },
    }));

    const text = response.text || "{}";
    try {
      const data = JSON.parse(text);
      
      let loc = data.location;
      if (typeof loc !== 'string') loc = location; 

      return {
        temperature: safeString(data.temperature, "--"),
        minTemp: safeString(data.min_temp || data.minTemp),
        maxTemp: safeString(data.max_temp || data.maxTemp),
        condition: safeString(data.condition, "Unknown"),
        humidity: safeString(data.humidity, "--"),
        rainfall: safeString(data.rainfall, "--"),
        wind: safeString(data.wind, "--"),
        sunshine: safeString(data.sunshine, "--"),
        alerts: Array.isArray(data.alerts) ? data.alerts.map((a: any) => safeString(a)) : [],
        location: safeString(loc),
        forecast: Array.isArray(data.forecast) ? data.forecast.map((f: any) => ({
            day: safeString(f.day),
            date: safeString(f.date),
            maxTemp: safeString(f.max_temp || f.maxTemp),
            minTemp: safeString(f.min_temp || f.minTemp),
            condition: safeString(f.condition),
            chanceOfRain: safeString(f.rain_chance || f.chanceOfRain)
        })) : []
      };
    } catch (e) {
      return getMockWeather(location);
    }
  } catch (error) {
    if (isQuotaError(error)) {
        console.warn("Weather API Quota Exceeded. Using fallback.");
        return getMockWeather(location);
    }
    console.error("Gemini Weather Error:", error);
    return getMockWeather(location);
  }
};

export const getWeatherFactorsExplanation = async (language: string): Promise<Record<string, string>> => {
    const prompt = `
      Translate and explain the following 5 agricultural weather factors to ${language}.
      Keep explanations short (1 sentence), simple, and relevant to a farmer or gardener.
      
      Factors to explain:
      1. Temperature: range for germination/growth.
      2. Rainfall / Soil Moisture: water availability vs root rot.
      3. Sunlight: photosynthesis vs leaf burn.
      4. Humidity: disease risk vs drying out.
      5. Wind: stem strength vs physical damage.
      
      Response Format (JSON):
      {
         "Temperature": "Translated Explanation...",
         "Rainfall": "Translated Explanation...",
         "Sunlight": "Translated Explanation...",
         "Humidity": "Translated Explanation...",
         "Wind": "Translated Explanation..."
      }
    `;
    
    try {
        const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        }));
        
        try {
            return JSON.parse(response.text || "{}");
        } catch (e) {
            console.error("Failed to parse definitions", e);
            return {};
        }
    } catch (e) {
        console.error("Failed to fetch definitions", e);
        return {};
    }
};

export const getSmartCropRecommendations = async (
  userProfile: UserProfile,
  season: string,
  language: string
): Promise<CropRecommendation[]> => {
  const prompt = `
    Act as an expert agronomist and horticulturist.
    Context: Offering advice to a ${userProfile.role}.
    User Profile:
    - Location: ${userProfile.location}
    - Land/Space: ${userProfile.landSize}
    - Soil Type: ${userProfile.soilType}
    - Water Source: ${userProfile.waterSource}
    - Current Season: ${season}
    
    If 'User Role' is 'Gardener' or 'Land Size' implies pots/small space, suggest suitable garden plants (vegetables, flowers, herbs).
    If 'User Role' is 'Farmer', suggest commercial crops suitable for the soil and water source.
    
    Recommend 3-5 suitable options.
    
    **CRITICAL: Include sustainable fertilizer guidance.**
    - Focus on Organic/Balanced approach.
    - Advise against overuse of urea/chemicals.
    - Provide a simple schedule (e.g. "Basal dose at planting, Top dress at flowering").
    
    Response format (JSON Array): 
    [{
      "cropName": "", 
      "riskLevel": "Safe"|"Moderate"|"High", 
      "reasoning": "Brief explanation", 
      "tags": ["Tag1", "Tag2"],
      "fertilizer": {
         "summary": "Short approach (e.g. 'Organic Focus' or 'Balanced NPK')",
         "tips": ["Tip 1 (e.g. Use vermicompost)", "Tip 2 (e.g. Avoid urea overuse)"],
         "schedule": "Simple timing advice (e.g. 'Feed every 2 weeks')"
      }
    }]
    Translate content to ${language}.
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
      },
    }));

    try {
      const parsed = JSON.parse(response.text || "[]");
      return Array.isArray(parsed) ? parsed.map((item: any) => {
        const riskLevelInput = safeString(item.riskLevel, "Moderate");
        const riskLevel: 'Safe' | 'Moderate' | 'High' = 
            (riskLevelInput === 'Safe' || riskLevelInput === 'Moderate' || riskLevelInput === 'High') 
            ? riskLevelInput 
            : 'Moderate';
        
        const fert = item.fertilizer || {};

        return {
          cropName: safeString(item.cropName),
          riskLevel: riskLevel,
          reasoning: safeString(item.reasoning),
          tags: Array.isArray(item.tags) ? item.tags.map((t: any) => safeString(t)) : [],
          fertilizer: {
              summary: safeString(fert.summary, "Sustainable Approach"),
              tips: Array.isArray(fert.tips) ? fert.tips.map((t: any) => safeString(t)) : [],
              schedule: safeString(fert.schedule, "Regular organic feeding")
          }
        };
      }) : getMockCrops();
    } catch (e) {
      return getMockCrops();
    }
  } catch (error) {
    if (isQuotaError(error)) {
        console.warn("Crop API Quota Exceeded. Using fallback.");
        return getMockCrops();
    }
    console.error("Crop Recommendation Error:", error);
    return getMockCrops();
  }
};

export const getCropDetails = async (cropName: string, language: string): Promise<CropDetails | null> => {
  const prompt = `
    Provide a detailed summary for the plant/crop: "${cropName}".
    Find a valid, public, hotlinkable image URL for this crop.
    Response format (JSON): {"scientificName": "Latin Name", "sowingSeason": "", "duration": "", "waterRequirement": "", "yield": "", "description": "", "imageUrl": ""}
    Translate values to ${language} (except URL and scientificName).
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
      },
    }));

    try {
      const data = JSON.parse(response.text || "{}");
      return {
        scientificName: safeString(data.scientificName),
        sowingSeason: safeString(data.sowingSeason),
        duration: safeString(data.duration),
        waterRequirement: safeString(data.waterRequirement),
        yield: safeString(data.yield),
        description: safeString(data.description),
        imageUrl: data.imageUrl ? safeString(data.imageUrl) : undefined
      };
    } catch (e) {
      return null;
    }
  } catch (error) {
    console.error("Crop Details Error:", error);
    return null;
  }
};

export const diagnosePlantOrSoil = async (
  imageBase64: string,
  textQuery: string,
  language: string,
  userProfile?: UserProfile
): Promise<{ text: string; groundingUrls: { title: string; uri: string }[] }> => {
  
  const parts: any[] = [];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
  }
  
  let context = `You are "Trish", an expert AI companion for farming and gardening.`;
  if (userProfile) {
    context += ` User Context: Role: ${userProfile.role}, Land: ${userProfile.landSize}, Soil: ${userProfile.soilType}, Location: ${userProfile.location}.`;
  }
  
  parts.push({
    text: `
      ${context}
      User Query: ${textQuery}.
      
      SPECIAL INSTRUCTION IF IMAGE IS A FERTILIZER/PESTICIDE LABEL:
      If the image appears to be a fertilizer or pesticide packet/bottle:
      1. Extract the dosage instructions (e.g. ml per liter or kg per acre). Simplify if complex.
      2. List safety precautions (e.g. wear gloves, keep away from water bodies).
      3. Mention waiting period before harvest if applicable.
      4. Advise on avoiding overuse.
      
      OTHERWISE (Plant/Soil):
      Identify the issue or answer the question. Suggest organic or chemical remedies appropriate for their role.
      
      Translate response to ${language}.
      Keep it simple, encouraging, and helpful.
    `
  });

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: parts },
      config: { tools: [{ googleSearch: {} }] }
    }));

    return {
      text: safeString(response.text, "I could not analyze that."),
      groundingUrls: extractGroundingUrls(response),
    };
  } catch (error) {
     if (isQuotaError(error)) {
         return {
            text: "I am currently experiencing high traffic. Please try again in a minute, or check our offline guides in the 'Learn' section.",
            groundingUrls: []
         };
     }
     console.error("Diagnosis Error:", error);
     throw error;
  }
};

export const findEducationalVideos = async (query: string, language: string): Promise<VideoResult[]> => {
  const prompt = `
    Find 3-4 high-quality educational videos on YouTube for farmers or gardeners about: "${query}".
    Response format (JSON Array): [{"title": "", "url": "", "channel": ""}]
  `;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
      },
    }));

    try {
       const parsed = JSON.parse(response.text || "[]");
       return Array.isArray(parsed) ? parsed.map((item: any) => ({
         title: safeString(item.title),
         url: safeString(item.url, "#"),
         channel: safeString(item.channel),
         thumbnail: item.thumbnail ? safeString(item.thumbnail) : undefined
       })) : getMockVideos();
    } catch (e) {
      return getMockVideos();
    }
  } catch (error) {
    if (isQuotaError(error)) {
        return getMockVideos();
    }
    console.error("Video Search Error:", error);
    return getMockVideos();
  }
};

export const fetchMarketRates = async (location: string, language: string): Promise<MarketRate[]> => {
    const prompt = `
      Find current market prices (mandi rates) for 6-8 diverse local crops, vegetables, and fruits in: ${location}.
      Include staples (Rice, Wheat), perishables (Tomato, Onion), and seasonal fruits.
      Return valid JSON Array:
      [{"commodity": "Name", "price": "1200", "unit": "Quintal" or "kg", "trend": "up"|"down"|"stable"}]
      Estimate trend based on recent news or seasonal patterns if exact data missing.
      Translate commodity names to ${language}.
    `;
  
    try {
      const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }],
        },
      }));
  
      try {
        const parsed = JSON.parse(response.text || "[]");
        return Array.isArray(parsed) ? parsed.map((item: any) => ({
          commodity: safeString(item.commodity),
          price: safeString(item.price),
          unit: safeString(item.unit),
          trend: (['up', 'down', 'stable'].includes(item.trend) ? item.trend : 'stable') as any
        })) : getMockMarketRates();
      } catch (e) {
        return getMockMarketRates();
      }
    } catch (error) {
      // If error, return mock data silently
      return getMockMarketRates();
    }
  };
