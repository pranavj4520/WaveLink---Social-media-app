import React, { useState, useRef } from 'react';
import {
  Mic,
  Square,
  Upload,
  Play,
  Pause,
  Copy,
  Check,
  Share2,
  Sparkles,
  FileAudio,
  RotateCcw,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { blobToBase64 } from '../utils/audioUtils';

export const TranscribeView: React.FC = () => {
  const { addPost, setActiveTab } = useSocial();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcriptionStyle, setTranscriptionStyle] = useState<
    'verbatim' | 'post' | 'bullets'
  >('verbatim');

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [posted, setPosted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start recording microphone
  const startRecording = async () => {
    setErrorMessage(null);
    setTranscription('');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200); // 200ms slices
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMessage(
        'Unable to access your microphone. Please allow microphone permissions in your browser.'
      );
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  // Handle uploaded audio file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setTranscription('');
    if (audioUrl) URL.revokeObjectURL(audioUrl);

    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  // Trigger transcription with gemini-3.5-transcribe
  const handleTranscribe = async () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      const audioBase64 = await blobToBase64(audioBlob);

      let prompt =
        'Transcribe the spoken audio verbatim into clean, accurate text with appropriate capitalization and punctuation.';
      if (transcriptionStyle === 'post') {
        prompt =
          'Transcribe the audio and format it as a catchy, engaging social media post with relevant hashtags.';
      } else if (transcriptionStyle === 'bullets') {
        prompt =
          'Transcribe the audio and summarize key spoken thoughts into clean, organized bullet points.';
      }

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: audioBlob.type || 'audio/webm',
          prompt
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setTranscription(data.text || 'No transcription received.');
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(err?.message || 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostToFeed = () => {
    if (!transcription) return;
    addPost(transcription, undefined, ['VoiceMemo', 'Transcribed'], 'public');
    setPosted(true);
    setTimeout(() => {
      setPosted(false);
      setActiveTab('feed');
    }, 1200);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-zinc-900 tracking-tight">Audio Transcriber</h1>
            <p className="text-xs text-zinc-500">
              Powered by <span className="font-semibold text-zinc-800">gemini-3.5-transcribe</span>
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Audio Capture Card */}
      <div className="bg-zinc-50 rounded-2xl border border-zinc-200/80 p-5 space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          1. Record or Upload Audio
        </h2>

        {/* Microphone Recording Section */}
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-white rounded-xl border border-zinc-200/80 space-y-4 text-center">
          {/* Pulsing Mic Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse scale-105'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:scale-105'
            }`}
          >
            {isRecording ? <Square className="w-7 h-7 fill-current" /> : <Mic className="w-8 h-8" />}
          </button>

          <div>
            <p className="text-sm font-bold text-zinc-900">
              {isRecording ? 'Listening & Recording...' : 'Tap to Record Voice Memo'}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isRecording ? `Elapsed: ${formatTime(recordingTime)}` : 'Uses your browser microphone'}
            </p>
          </div>

          {/* Animated Waveform when recording */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1 h-8 pt-2">
              {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7, 0.9, 0.4].map((scale, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                  style={{
                    height: `${scale * 100}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Or File Upload */}
        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
          <span>Or choose an existing audio file:</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200/80 rounded-lg font-semibold text-zinc-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Audio Player Preview */}
        {audioUrl && (
          <div className="p-3 bg-white rounded-xl border border-zinc-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center flex-shrink-0">
                <FileAudio className="w-4 h-4" />
              </div>
              <div className="truncate text-xs">
                <p className="font-bold text-zinc-800 truncate">Audio Clip Ready</p>
                <p className="text-[10px] text-zinc-400">
                  {audioBlob ? `${(audioBlob.size / 1024).toFixed(1)} KB` : 'Ready to transcribe'}
                </p>
              </div>
            </div>

            <audio ref={audioElementRef} src={audioUrl} controls className="h-8 max-w-[200px]" />
          </div>
        )}
      </div>

      {/* Transcription Options & Execution */}
      {audioBlob && (
        <div className="bg-zinc-50 rounded-2xl border border-zinc-200/80 p-5 space-y-4 animate-in fade-in duration-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            2. Formatting Style
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setTranscriptionStyle('verbatim')}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                transcriptionStyle === 'verbatim'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <div className="font-bold text-zinc-900">Verbatim</div>
              <div className="text-[11px] text-zinc-500">Exact transcription</div>
            </button>

            <button
              onClick={() => setTranscriptionStyle('post')}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                transcriptionStyle === 'post'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <div className="font-bold text-zinc-900">Social Post</div>
              <div className="text-[11px] text-zinc-500">Formatted with hashtags</div>
            </button>

            <button
              onClick={() => setTranscriptionStyle('bullets')}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                transcriptionStyle === 'bullets'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <div className="font-bold text-zinc-900">Key Points</div>
              <div className="text-[11px] text-zinc-500">Structured bullet points</div>
            </button>
          </div>

          <button
            onClick={handleTranscribe}
            disabled={isTranscribing}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
              isTranscribing
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>
              {isTranscribing
                ? 'Transcribing with gemini-3.5-transcribe...'
                : 'Transcribe Audio with gemini-3.5-transcribe'}
            </span>
          </button>
        </div>
      )}

      {/* Transcription Results Card */}
      {transcription && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 space-y-4 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-xs text-zinc-900">Transcription Result</h3>
            </div>
            <span className="text-[10px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">
              gemini-3.5-transcribe
            </span>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl text-xs sm:text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap font-sans border border-zinc-200/60">
            {transcription}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePostToFeed}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              {posted ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Published to Feed!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Post to Wavelink Feed</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
