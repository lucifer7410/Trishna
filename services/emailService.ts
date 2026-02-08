
import emailjs from '@emailjs/browser';
import { UserProfile } from '../types';

const SERVICE_ID: string = 'service_ofpax9c'; 
const LOGIN_TEMPLATE_ID: string = 'template_veedh7d'; 
const FEEDBACK_TEMPLATE_ID: string = 'template_vcy8frm'; 
const PUBLIC_KEY: string = 'oMQ_wNa6hZe7gqwxC'; 

// Initialize EmailJS
if (PUBLIC_KEY && !PUBLIC_KEY.includes('YOUR_')) {
  emailjs.init(PUBLIC_KEY);
}

interface EmailParams extends Record<string, unknown> {
  // Exact Template Matches from Screenshot
  name: string;
  email: string;
  type: string;
  rating?: number | string;
  message: string;
  location: string;
  country: string;
  ip: string;
  date: string;
  
  // Extra Context / Common Defaults
  user_name?: string;
  user_email?: string;
  reply_to?: string;
  subject?: string;
  device?: string;
}

const getIPAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'Unknown IP';
  } catch (e) {
    return 'IP Unavailable';
  }
};

const getDetailedDeviceInfo = (): string => {
  const ua = navigator.userAgent;
  let os = "Device";
  if (ua.indexOf("Win") !== -1) os = "Windows";
  else if (ua.indexOf("Mac") !== -1) os = "MacOS";
  else if (ua.indexOf("Linux") !== -1) os = "Linux";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";

  let browser = "Browser";
  if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
  else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
  else if (ua.indexOf("Safari") !== -1) browser = "Safari";
  else if (ua.indexOf("Edge") !== -1) browser = "Edge";

  return `${os} (${browser})`;
};

const sendEmail = async (templateId: string, params: EmailParams) => {
  const isPlaceholder = (str: string) => !str || str.includes('YOUR_') || str.trim() === '';

  if (isPlaceholder(SERVICE_ID) || isPlaceholder(PUBLIC_KEY) || isPlaceholder(templateId)) {
    console.groupCollapsed(`📧 [Mock Email Service] - Template: ${templateId}`);
    console.table(params);
    console.groupEnd();
    await new Promise(resolve => setTimeout(resolve, 800));
    return;
  }

  try {
    const result = await emailjs.send(SERVICE_ID, templateId, params, PUBLIC_KEY);
    console.log(`✅ EmailJS Success (${templateId}):`, result.status, result.text);
  } catch (error: any) {
    console.error(`❌ EmailJS Error (${templateId}):`, error.text || error.message || error);
    console.log("Parameters sent during failure:", params);
  }
};

export const notifyLogin = async (email: string, profile?: UserProfile) => {
  const ip = await getIPAddress();
  const device = getDetailedDeviceInfo();
  const time = new Date().toLocaleString();
  
  const name = profile?.name || localStorage.getItem('trishna_temp_name') || 'Registered User';
  const loc = profile?.location || 'Awaiting Onboarding';

  // Construct message content
  const messageContent = profile 
      ? `Profile Details:\nRole: ${profile.role}\nLand: ${profile.landSize}\nSoil: ${profile.soilType}\nCrops: ${profile.crops.join(', ') || 'None'}`
      : `User logged in but has not yet finished the profile.`;

  await sendEmail(LOGIN_TEMPLATE_ID, {
    // Template matching keys
    name: name,
    email: email,
    type: profile ? 'Active Profile Session' : 'Social Identity Verified',
    message: messageContent,
    location: loc,
    country: 'India', // Defaulting for context
    ip: ip,
    date: time,

    // Redundancy
    user_name: name,
    user_email: email,
    reply_to: email,
    device: device,
    subject: `Login Alert: ${name}`
  });
};

export const notifyLogout = async (email: string, name: string) => {
  const ip = await getIPAddress();
  const time = new Date().toLocaleString();

  await sendEmail(LOGIN_TEMPLATE_ID, {
    name: name,
    email: email,
    type: 'Session Terminated',
    message: `User ${name} has manually logged out.`,
    location: 'N/A',
    country: 'N/A',
    ip: ip,
    date: time,

    user_name: name,
    user_email: email,
    reply_to: email,
    device: getDetailedDeviceInfo(),
    subject: `Logout Alert: ${name}`
  });
};

export const sendFeedbackEmail = async (
  email: string, 
  name: string, 
  feedbackType: string, 
  message: string, 
  rating: number
) => {
  const ip = await getIPAddress();
  const time = new Date().toLocaleString();
  
  await sendEmail(FEEDBACK_TEMPLATE_ID, {
    // Exact keys matching the provided screenshot
    name: name,
    email: email,
    type: feedbackType.toUpperCase(),
    rating: rating,
    message: message,
    location: 'In-App Dashboard',
    country: 'India', // Placeholder or infer from IP if needed
    ip: ip,
    date: time,

    // Redundancy for standard templates
    user_name: name,
    user_email: email,
    reply_to: email,
    device: getDetailedDeviceInfo(),
    subject: `Feedback (${feedbackType}) - ${name}`
  });
};
