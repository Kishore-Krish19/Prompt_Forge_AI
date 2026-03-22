import { useCallback, useEffect, useRef, useState } from 'react';

export default function useSpeechRecognition({ lang = 'en-IN' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  // Safely get the browser's speech recognition constructor
  const getSupportedRecognition = () => {
    if (typeof window !== 'undefined') {
      return window.SpeechRecognition || window.webkitSpeechRecognition || null;
    }
    return null;
  };

  const isSupported = Boolean(getSupportedRecognition());

  // Perfect memory cleanup for silence timeouts
  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimeout();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors if already stopped or aborting
      }
    }
    setIsListening(false);
  }, [clearSilenceTimeout]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) return;

    // Reset state before starting
    setError('');
    setInterimTranscript('');
    setFinalTranscript('');

    const SpeechRecognition = getSupportedRecognition();
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      clearSilenceTimeout(); // Reset the silence timer on every speech event

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setFinalTranscript((prev) => prev + final);
      }

      // Re-trigger the silence timeout
      silenceTimeoutRef.current = setTimeout(() => {
        stopListening();
      }, 5000);
    };

    recognition.onerror = (event) => {
      clearSilenceTimeout();
      if (event.error !== 'no-speech') {
        const errorMsg = event.error === 'not-allowed' ? 'Microphone permission denied.' : 'Voice input error.';
        setError(errorMsg);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      clearSilenceTimeout();
      setIsListening(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);

      // Trigger initial silence timeout in case they start mic but don't speak
      silenceTimeoutRef.current = setTimeout(() => {
        stopListening();
      }, 5000);
    } catch (err) {
      setError('Voice input could not start.');
      setIsListening(false);
    }
  }, [isSupported, lang, isListening, stopListening, clearSilenceTimeout]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      clearSilenceTimeout();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort(); // Immediately hard abort to prevent ghost listeners
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [clearSilenceTimeout]);

  const clearError = useCallback(() => setError(''), []);

  return {
    isSupported,
    isListening,
    interimTranscript,
    finalTranscript,
    error,
    startListening,
    stopListening,
    clearError,
  };
}
