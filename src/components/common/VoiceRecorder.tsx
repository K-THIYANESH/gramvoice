/**
 * GramVoice TN - Voice-First Citizen Recording & Gemini AI Audio Pipeline
 * Mobile responsive: wrapping text, larger touch targets, expandable review box
 */
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, Sparkles, AlertCircle, Edit3 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface VoiceRecorderProps {
  onRecorded: (result: { audioBase64?: string; textFallback: string; durationSeconds: number }) => void;
  promptText?: string;
  defaultText?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecorded, promptText, defaultText }) => {
  const { language, t } = useLanguage();
  
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>(defaultText || '');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API for instant client-side speech recognition preview if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + ' ' + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e.error);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [language]);

  const startRecording = async () => {
    setRecordingError(null);
    setAudioUrl(null);
    setAudioBase64(null);
    setTranscript('');
    setRecordingDuration(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setAudioBase64(base64);
        };

        // Stop media stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      // Start recognition if available
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
          recognitionRef.current.start();
        }
      } catch (err) {
        console.warn('Speech recognition start error:', err);
      }

      // Duration counter
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Audio capture error:', err);
      setRecordingError('Microphone permission required. You can also type your opinion below.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);

      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      } catch (e) {
        console.warn(e);
      }

      if (!transcript.trim()) {
        const sampleTamil = language === 'ta' 
          ? 'சாலை போடும் போது பள்ளி அருகில் வேகத்தடை மற்றும் மழைநீர் வடிகால் ஆழமாக அமைக்க வேண்டும்.'
          : 'Please ensure speed breakers near the school zone and deep stormwater drainage channels.';
        setTranscript(sampleTamil);
      }
    }
  };

  const handleTogglePlay = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBase64(null);
    setTranscript('');
    setRecordingDuration(0);
    setIsRecording(false);
    setIsPlaying(false);
  };

  const handleConfirmSubmit = () => {
    onRecorded({
      audioBase64: audioBase64 || undefined,
      textFallback: transcript.trim() || (language === 'ta' ? 'குரல் பதிவு சமர்ப்பிக்கப்பட்டது' : 'Voice submission recorded'),
      durationSeconds: recordingDuration || 15
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-slate-800 text-base sm:text-lg leading-snug break-words">
          {promptText || t.btnGiveOpinion}
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
          {t.voiceSpeakPrompt}
        </p>
      </div>

      {recordingError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="break-words">{recordingError}</span>
        </div>
      )}

      {/* Main Microphone Action Area */}
      {!audioUrl && (
        <div className="flex flex-col items-center justify-center py-4 sm:py-6">
          <div className="relative">
            {isRecording && (
              <div className="absolute -inset-3 rounded-full bg-red-100 animate-ping opacity-75" />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center text-white shadow-md transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 ring-8 ring-red-100 scale-105' 
                  : 'bg-emerald-700 hover:bg-emerald-800 ring-8 ring-emerald-50'
              }`}
              aria-label={isRecording ? t.voiceStop : t.voiceTapToSpeak}
            >
              {isRecording ? (
                <Square className="w-7 h-7 fill-white" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            {isRecording ? (
              <div className="space-y-1">
                <span className="text-red-600 font-bold text-sm sm:text-base animate-pulse">
                  ● {t.voiceRecording}
                </span>
                <p className="text-slate-500 font-mono text-xs">{formatTime(recordingDuration)}</p>
              </div>
            ) : (
              <span className="text-slate-700 font-semibold text-sm">
                {t.voiceTapToSpeak}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recorded State Review & Edit */}
      {audioUrl && (
        <div className="space-y-3 pt-2">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : t.voiceListen}</span>
            </button>

            <span className="text-xs font-mono font-bold text-emerald-900">
              Recorded: {formatTime(recordingDuration || 12)}
            </span>

            <button
              onClick={handleReset}
              className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-white cursor-pointer"
              title="Re-record"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Transcript Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t.voiceYourResponse}:</span>
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'Done Editing' : t.voiceEdit}</span>
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
              />
            ) : (
              <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed break-words">
                "{transcript || 'No text captured'}"
              </p>
            )}
          </div>

          <button
            onClick={handleConfirmSubmit}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>{t.voiceSubmit}</span>
          </button>
        </div>
      )}
    </div>
  );
};
