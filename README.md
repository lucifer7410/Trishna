# Trishna: Climate-Smart Kisan Companion

## Elevator Pitch
Trishna is a multilingual, AI-powered super-app that bridges the gap between traditional farming and modern technology. It empowers farmers and home gardeners with hyper-local weather alerts, instant plant disease diagnosis, and personalized crop calendars—helping them navigate climate change with confidence and sustainable abundance.

## Inspiration
I grew up in a farmer's family in India, where agriculture isn't just a livelihood — it's the heartbeat sustaining over a billion lives. I watched my grandparents and parents toil endlessly, wrestling with erratic climate change, crumbling soil health, and that crushing frustration of needing answers right now — but finding none.
The high-tech solutions existed, sure. But they were built for agri-corporations, not for us — too complex, too English-heavy, too expensive. I saw smallholder farmers and home gardeners left behind while the world talked about 'AI revolution'.
That's when I felt it — **Trishna**(तृष्णा). In Hindi, it means 'Thirst' — that deep, burning desire for something better. Not just water for crops, but knowledge when you need it, in your language, for your soil, your season, your plot size.
I built Trishna to be that bridge — from our ancient farming wisdom to Generative AI's power. Not an app that spits data, but a companion that *understands* your context and chats back like a trusted friend in the field.
Because the future of farming shouldn't be a privilege. It should be a right.

## What it does
Trishna is a comprehensive, multimodal AI assistant designed for both commercial Farmers and home Gardeners. It leverages the **Google Gemini API** to provide:

1.  **Smart Weather Alerts:** Beyond simple forecasts, Trishna analyzes weather data to generate actionable agricultural advisories (e.g., "High humidity detected; watch out for fungal infections in your tomato crop").
2.  **AI Plant Doctor:** Users can snap a photo of a sick plant or a soil sample. Trishna analyzes the image to diagnose diseases, identify pests, or evaluate soil texture, offering organic and chemical remedies.
3.  **Fertilizer Label Scanner:** A safety-first feature where users upload photos of pesticide/fertilizer packets. The AI extracts dosage instructions and safety warnings, translating them into simple local language.
4.  **Context-Aware Crop Planning:** Based on the user's soil type (e.g., Red Soil), land size (e.g., 2 Acres vs. Balcony), and water source, it generates a personalized crop calendar and sustainable fertilizer schedule.
5.  **Multilingual Support:** The entire app, including complex AI analysis, works in **10+ Indian languages** (Hindi, Marathi, Tamil, etc.) and offers voice-to-text support for accessibility.
6.  **Market Intelligence:** Provides insights on current mandi (market) prices and trends for local commodities.

## How we built it
We built Trishna as a Progressive Web App (PWA) concept using a modern tech stack:

*   **Frontend:** React 19 with Vite for a blazing-fast performance.
*   **Styling:** Tailwind CSS for a responsive, mobile-first design that looks beautiful on low-end devices. We used glassmorphism and organic animations to make the UI feel alive and welcoming.
*   **AI Engine:** **Google Gemini API**. We utilized its multimodal capabilities extensively:
    *   *Text-to-JSON:* For generating structured crop plans and weather insights.
    *   *Vision-to-Text:* For the Plant Doctor and Soil Analysis features.
*   **Location:** Integrated the Browser Geolocation API with OpenStreetMap (Nominatim) for reverse geocoding to provide hyper-local data without needing complex map SDKs.
*   **Accessibility:** Integrated the Web Speech API for speech-to-text, allowing farmers to ask questions vocally.

## Built With
*   **React** - Frontend framework
*   **Vite** - Build tool and development server
*   **Tailwind CSS** - CSS framework for styling
*   **Google Gemini API** - Generative AI model
*   **TypeScript** - Programming language
*   **Lucide React** - Icon library
*   **EmailJS** - Email service
*   **OpenStreetMap (Nominatim)** - Geocoding API

## Challenges we ran into
*   **AI Hallucinations vs. JSON Structure:** Getting the LLM to consistently return valid JSON data for the UI components (like the weather widget and crop cards) was difficult. We had to refine our system prompts significantly to ensure strict schema adherence.
*   **Multilingual Nuance:** Direct translation of agricultural terms often loses meaning. We had to tune the AI to use colloquial/local agricultural terminology rather than formal dictionary definitions.
*   **Image Analysis Latency:** Uploading high-res images for analysis can be slow on rural networks. We optimized the prompt engineering to ensure the analysis focuses only on the relevant parts of the image to speed up processing.

## Accomplishments that we're proud of
*   **The "Label Scanner" Feature:** We are particularly proud of this safety feature. Misuse of pesticides is a huge health risk; having an AI that can read a label and scream "Wear Gloves!" or "Don't spray near water" in the farmer's native tongue is a potential life-saver.
*   **Dual-Persona UX:** Successfully creating a UI that adapts its advice based on whether the user is a "Farmer" (Acres, Tractors, Yield) or a "Gardener" (Pots, Aesthetics, Home Care).
*   **Visual Design:** Creating an interface that feels premium yet accessible, with dynamic weather animations that change based on the data.

## What we learned
*   **Prompt Engineering is Logic:** We learned that writing a prompt is like writing code. You need error handling, fallbacks, and strict type definitions within the natural language prompt itself.
*   **Empathy in Design:** Designing for a farmer requires different priorities than designing for a tech user. Large buttons, voice input, and visual icons are not just "nice to have," they are requirements.

## What's next for Trishna
*   **Offline Mode:** Implementing Service Workers to allow farmers to access their crop schedules and saved guides even without an internet connection.
*   **Community Grounding:** Connecting the AI insights with a "Community" tab where farmers can validate the AI's advice with peers.
*   **IoT Integration:** In the future, we want Trishna to connect directly to soil moisture sensors to trigger the "Watering Alerts" automatically.

## Testing instructions if applicable

To test the application fully, please follow these steps:

1.  **API Key Configuration:**
    *   This application requires a **Google Gemini API Key** to function.
    *   Create a `.env` file in the project root (if running locally) and add:
        ```env
        VITE_API_KEY=your_gemini_api_key_here
        ```
    *   If testing on a deployed environment (like Netlify), ensure the environment variable `VITE_API_KEY` is set in the deployment settings.

2.  **Authentication (Simulation):**
    *   The app uses a mock authentication system for demonstration purposes (no backend database required).
    *   **Sign Up:** Click "Get Started", select "Sign Up", and create an account with any name, email, and password.
    *   **Login:** Use the credentials you just created to log in.
    *   *Note: User data is persisted in your browser's Local Storage.*

3.  **Permissions:**
    *   When prompted, please **Allow** access to:
        *   **Location:** Required to fetch local weather and market rates.
        *   **Camera:** Required for the "Plant Doctor" to analyze plants/soil.
        *   **Microphone:** Required for voice-to-text features.

4.  **Key Features to Try:**
    *   **Weather:** Check the home screen for location-based weather.
    *   **Plan:** Go to the "Plan" tab to get AI-generated crop recommendations based on your profile (Farmer vs Gardener).
    *   **Doctor:** Upload an image of a plant leaf or soil to get a diagnosis.
    *   **Learn:** Search for farming videos (e.g., "Tomato grafting").
