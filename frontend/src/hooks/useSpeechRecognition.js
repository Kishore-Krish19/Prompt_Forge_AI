import { useCallback, useEffect, useRef, useState } from 'react';

const UNSUPPORTED_BROWSER_ERROR = 'Voice input is not supported in this browser.';

const getRecognitionConstructor = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const getDefaultLanguage = () => {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }

  return 'en-US';
};

const normalizeTranscript = (transcript) => transcript.trim();

const mapRecognitionError = (errorCode) => {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone permission denied.';
    case 'audio-capture':
      return 'No microphone found.';
    case 'network':
      return 'Voice input is unavailable right now.';
    case 'no-speech':
      return 'No speech detected.';
    case 'aborted':
      return 'Voice input stopped unexpectedly.';
    default:
      return 'Voice input could not start.';
  }
};

export default function useSpeechRecognition({ onTranscript, lang } = {}) {
  const recognitionRef = useRef(null);
  const transcriptHandlerRef = useRef(onTranscript);
  const isDisposedRef = useRef(false);
  const manualStopRef = useRef(false);
  const interimTranscriptRef = useRef('');
  const discardedInterimRef = useRef('');
  const lastFinalTranscriptRef = useRef('');

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');

  const isSupported = Boolean(getRecognitionConstructor());

  const updateInterimTranscript = useCallback((nextTranscript) => {
    interimTranscriptRef.current = nextTranscript;
    setInterimTranscript((currentTranscript) => (
      currentTranscript === nextTranscript ? currentTranscript : nextTranscript
    ));
  }, []);

  useEffect(() => {
    transcriptHandlerRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    isDisposedRef.current = false;

    return () => {
      isDisposedRef.current = true;
      transcriptHandlerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isSupported) {
      return undefined;
    }

    const RecognitionConstructor = getRecognitionConstructor();

    if (!RecognitionConstructor) {
      return undefined;
    }

    const recognition = new RecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = lang || getDefaultLanguage();

    recognition.onstart = () => {
      if (isDisposedRef.current) {
        return;
      }

      manualStopRef.current = false;
      lastFinalTranscriptRef.current = '';
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      if (isDisposedRef.current) {
        return;
      }

      let nextInterimTranscript = '';
      const nextFinalTranscripts = [];

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = normalizeTranscript(result[0]?.transcript || '');

        if (!transcript) {
          continue;
        }

        if (result.isFinal) {
          nextFinalTranscripts.push(transcript);
          continue;
        }

        nextInterimTranscript += `${nextInterimTranscript ? ' ' : ''}${transcript}`;
      }

      updateInterimTranscript(nextInterimTranscript);

      nextFinalTranscripts.forEach((finalTranscript) => {
        if (discardedInterimRef.current) {
          if (finalTranscript === discardedInterimRef.current) {
            discardedInterimRef.current = '';
            return;
          }

          discardedInterimRef.current = '';
        }

        if (finalTranscript === lastFinalTranscriptRef.current) {
          return;
        }

        lastFinalTranscriptRef.current = finalTranscript;
        transcriptHandlerRef.current?.(finalTranscript);
      });
    };

    recognition.onerror = (event) => {
      if (isDisposedRef.current) {
        return;
      }

      if (manualStopRef.current && event.error === 'aborted') {
        manualStopRef.current = false;
        updateInterimTranscript('');
        setIsListening(false);
        return;
      }

      updateInterimTranscript('');
      setIsListening(false);
      setError(mapRecognitionError(event.error));
    };

    recognition.onend = () => {
      if (isDisposedRef.current) {
        return;
      }

      manualStopRef.current = false;
      updateInterimTranscript('');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      manualStopRef.current = true;
      discardedInterimRef.current = '';
      lastFinalTranscriptRef.current = '';
      interimTranscriptRef.current = '';

      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;

        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup failures from browsers that have already ended recognition.
        }
      }

      recognitionRef.current = null;
    };
  }, [isSupported, lang, updateInterimTranscript]);

  const clearError = useCallback(() => {
    if (isDisposedRef.current) {
      return;
    }

    setError('');
  }, []);

  const discardInterim = useCallback(() => {
    const normalizedInterim = normalizeTranscript(interimTranscriptRef.current);

    if (normalizedInterim) {
      discardedInterimRef.current = normalizedInterim;
    }

    updateInterimTranscript('');
  }, [updateInterimTranscript]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError(UNSUPPORTED_BROWSER_ERROR);
      return;
    }

    if (!recognitionRef.current) {
      setError('Voice input could not start.');
      return;
    }

    if (isListening) {
      return;
    }

    manualStopRef.current = false;
    discardedInterimRef.current = '';
    lastFinalTranscriptRef.current = '';
    updateInterimTranscript('');
    setError('');

    try {
      recognitionRef.current.start();
    } catch {
      setError('Voice input could not start.');
      setIsListening(false);
    }
  }, [isListening, isSupported, updateInterimTranscript]);

  const stopListening = useCallback(() => {
    manualStopRef.current = true;

    if (!recognitionRef.current) {
      updateInterimTranscript('');
      setIsListening(false);
      manualStopRef.current = false;
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch {
      updateInterimTranscript('');
      setIsListening(false);
      manualStopRef.current = false;
    }
  }, [updateInterimTranscript]);

  return {
    isSupported,
    isListening,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearError,
    discardInterim,
  };
}
