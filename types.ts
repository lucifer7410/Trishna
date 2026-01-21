
export interface ForecastDay {
  day: string;
  date: string;
  maxTemp: string;
  minTemp: string;
  condition: string;
  chanceOfRain?: string;
}

export interface WeatherData {
  temperature: string;
  minTemp?: string;
  maxTemp?: string;
  condition: string;
  humidity: string;
  rainfall: string;
  wind: string;
  sunshine: string;
  alerts: string[];
  location: string;
  forecast?: ForecastDay[];
}

export interface CropRecommendation {
  cropName: string;
  riskLevel: 'Safe' | 'Moderate' | 'High';
  reasoning: string;
  tags: string[];
  fertilizer?: {
    summary: string;
    tips: string[];
    schedule: string;
  };
}

export interface CropDetails {
  scientificName: string;
  sowingSeason: string;
  duration: string;
  waterRequirement: string;
  yield: string;
  description: string;
  imageUrl?: string;
}

export interface VideoResult {
  title: string;
  url: string;
  thumbnail?: string;
  channel?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  groundingUrls?: { title: string; uri: string }[];
}

export interface MarketRate {
  commodity: string;
  price: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export enum AppSection {
  HOME = 'home',
  CROPS = 'crops',
  DOCTOR = 'doctor',
  LEARN = 'learn',
  SETTINGS = 'settings',
}

export type UserRole = 'Farmer' | 'Gardener';

export interface UserProfile {
  name: string;
  role: UserRole;
  location: string;
  landSize: string; // e.g. "2 Acres" or "10 Pots"
  soilType: string;
  waterSource: string; // e.g. "Borewell" or "Tap Water"
  profileImage?: string; // Base64 string of the uploaded image
  crops: string[]; // List of crops/plants the user is growing
}

export interface FeedbackSubmission {
  type: 'bug' | 'feature' | 'general';
  message: string;
  rating: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'water' | 'fertilizer' | 'alert' | 'general' | 'harvest';
}

export const SUPPORTED_LANGUAGES = [
  // International
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  
  // Indian
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'bho', name: 'Bhojpuri', native: 'भोजपुरी' },
];
