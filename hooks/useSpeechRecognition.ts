import { useState, useRef, useEffect, useCallback } from 'react';

export const useSpeechRecognition = (onResult: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  const [hasSupport, setHasSupport] = useState(false);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSupport(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (onResultRef.current) {
            onResultRef.current(transcript);
        }
      };
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const startListening = useCallback((language: string) => {
    if (!recognitionRef.current) return;
    
    // Map App language names to BCP 47 tags
    const langMap: Record<string, string> = {
        'English': 'en-US',
        'Hindi': 'hi-IN',
        'Marathi': 'mr-IN',
        'Gujarati': 'gu-IN',
        'Tamil': 'ta-IN',
        'Telugu': 'te-IN',
        'Kannada': 'kn-IN',
        'Malayalam': 'ml-IN',
        'Punjabi': 'pa-IN',
        'Bengali': 'bn-IN',
        'Urdu': 'ur-IN',
        'Odia': 'or-IN',
        'Assamese': 'as-IN',
        'Bhojpuri': 'bho-IN'
    };

    recognitionRef.current.lang = langMap[language] || 'en-US';
    try {
        recognitionRef.current.start();
    } catch (e) {
        console.error("Failed to start recognition", e);
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isListening, startListening, stopListening, hasSupport };
};