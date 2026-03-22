import { useCallback, useEffect, useRef, useState } from 'react';

const UNSUPPORTED_BROWSER_ERROR = 'Voice input is not supported in this browser.';

const getMediaRecorderConstructor = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.MediaRecorder || null;
};

const isSpeechCaptureSupported = () => (
  typeof navigator !== 'undefined' &&
  Boolean(getMediaRecorderConstructor()) &&
  Boolean(navigator.mediaDevices?.getUserMedia)
);

const getPreferredMimeType = (MediaRecorderConstructor) => {
  if (!MediaRecorderConstructor?.isTypeSupported) {
    return '';
  }
  const MIME_TYPE_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return MIME_TYPE_CANDIDATES.find((mimeType) => MediaRecorderConstructor.isTypeSupported(mimeType)) || '';
};

const mapStartError = (error) => {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Microphone permission denied.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No microphone found.';
    default:
      return 'Voice input could not start.';
  }
};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function useSpeechRecognition({ onTranscript, getContextTail } = {}) {
  const recorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');

  const isSupported = isSpeechCaptureSupported();

  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          recorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      stopMediaStream();
    };
  }, [stopMediaStream]);

  const clearError = useCallback(() => setError(''), []);
  const discardInterim = useCallback(() => setInterimTranscript(''), []);

  const stopListening = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const translateAudio = async (blob, mimeType) => {
    setIsTranslating(true);
    try {
      const base64Audio = await blobToBase64(blob);
      
      const apiKey = import.meta.env.VITE_GEMINI_SPEECH_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found in environment.");
      }

      const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
             system_instruction: {
              parts: [
                {
                  text: "Listen to this audio. It may be in any language or a mix of languages. Transcribe and translate it entirely into English. Return ONLY the final English text, with no markdown, conversational filler, or quotes."
                }
              ]
            },
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: mimeType || 'audio/webm',
                      data: base64Audio
                    }
                  }
                ]
              }
            ]
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404 || response.status === 429) {
          throw new Error("AI processing is currently unavailable.");
        }
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanText = text.trim();
      
      if (cleanText && onTranscript) {
        onTranscript(cleanText);
      }
    } catch (err) {
      if (err.message.includes("404") || err.message.includes("429") || err.message.includes("unavailable")) {
        setError("AI processing is currently unavailable.");
      } else {
        setError(err.message || 'Failed to translate audio.');
      }
    } finally {
      setIsTranslating(false);
      setIsListening(false);
    }
  };

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError(UNSUPPORTED_BROWSER_ERROR);
      return;
    }

    if (isListening || isTranslating) {
      return;
    }

    const MediaRecorderConstructor = getMediaRecorderConstructor();
    if (!MediaRecorderConstructor) {
      setError(UNSUPPORTED_BROWSER_ERROR);
      return;
    }

    setError('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = getPreferredMimeType(MediaRecorderConstructor);
      const recorder = mimeType
        ? new MediaRecorderConstructor(stream, { mimeType })
        : new MediaRecorderConstructor(stream);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stopMediaStream();
        setIsListening(false);
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          translateAudio(audioBlob, recorder.mimeType);
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsListening(true);
    } catch (startError) {
      stopMediaStream();
      setIsListening(false);
      setError(mapStartError(startError));
    }
  }, [isListening, isTranslating, isSupported, stopMediaStream]);

  return {
    isSupported,
    isListening,
    isTranslating,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearError,
    discardInterim,
  };
}
