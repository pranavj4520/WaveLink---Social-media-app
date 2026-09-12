import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Radio,
  Sparkles,
  Waves,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { LiveAudioPlayer, pcmFloat32ToBase64 } from '../utils/audioUtils';

export const LiveVoiceModal: React.FC = () => {
  const { isLiveVoiceOpen, setIsLiveVoiceOpen } = useSocial();

  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'error' | 'ended'
  >('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to start Live voice chat');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // References
  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<LiveAudioPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isMutedRef = useRef<boolean>(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Cleanup on unmount or modal close
  useEffect(() => {
    if (!isLiveVoiceOpen) {
      stopSession();
    }
  }, [isLiveVoiceOpen]);

  const startSession = async () => {
    setConnectionStatus('connecting');
    setStatusMessage('Connecting to gemini-3.1-flash-live-preview...');
    setIsModelSpeaking(false);

    try {
      // 1. Initialize audio player (24kHz for Live API output)
      playerRef.current = new LiveAudioPlayer(24000);

      // 2. Request mic access (16kHz for Live API input)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // 3. Connect to server WebSocket at /live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        setStatusMessage('Connected. Speak naturally with Gemini in real time.');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'status') {
            setStatusMessage(data.message || 'Status updated');
          } else if (data.type === 'audio' && data.audio) {
            setIsModelSpeaking(true);
            playerRef.current?.playChunk(data.audio);
          } else if (data.type === 'interrupted') {
            playerRef.current?.stopAll();
            setIsModelSpeaking(false);
          } else if (data.type === 'turnComplete') {
            setIsModelSpeaking(false);
          } else if (data.type === 'error') {
            setConnectionStatus('error');
            setStatusMessage(data.error || 'Live API error occurred');
          }
        } catch (e) {
          console.error('Error handling WS message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setConnectionStatus('error');
        setStatusMessage('WebSocket connection error. Make sure your server is running.');
      };

      ws.onclose = () => {
        if (connectionStatus !== 'error') {
          setConnectionStatus('ended');
          setStatusMessage('Voice session closed');
        }
      };

      // 4. Stream microphone audio to WebSocket
      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;

        const inputChannel = e.inputBuffer.getChannelData(0);

        // Simple volume calculation for visualizer
        let sum = 0;
        for (let i = 0; i < inputChannel.length; i++) {
          sum += inputChannel[i] * inputChannel[i];
        }
        const rms = Math.sqrt(sum / inputChannel.length);
        setAudioLevel(Math.min(1, rms * 5));

        // Convert Float32 to 16-bit PCM base64
        const base64Pcm = pcmFloat32ToBase64(inputChannel);
        ws.send(JSON.stringify({ audio: base64Pcm }));
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err: any) {
      console.error('Live voice initialization error:', err);
      setConnectionStatus('error');
      setStatusMessage(
        err?.message || 'Failed to access microphone or start Live voice conversation.'
      );
    }
  };

  const stopSession = () => {
    // Stop recording and mic stream
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    // Stop player
    if (playerRef.current) {
      playerRef.current.close();
      playerRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionStatus('idle');
    setIsModelSpeaking(false);
    setAudioLevel(0);
  };

  if (!isLiveVoiceOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 text-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-800 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        {/* Background ambient glow */}
        <div
          className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
            isModelSpeaking
              ? 'bg-indigo-500/30'
              : connectionStatus === 'connected'
              ? 'bg-emerald-500/20'
              : 'bg-zinc-700/20'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={() => {
            stopSession();
            setIsLiveVoiceOpen(false);
          }}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Live Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs font-semibold">
          <span
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-emerald-400 animate-pulse'
                : connectionStatus === 'connecting'
                ? 'bg-amber-400 animate-ping'
                : 'bg-zinc-500'
            }`}
          />
          <span className="text-zinc-300">Live Voice API</span>
          <span className="font-mono text-[10px] text-indigo-400">gemini-3.1-flash-live</span>
        </div>

        {/* Dynamic Voice Orb Visualizer */}
        <div className="relative my-4 flex items-center justify-center w-40 h-40">
          {/* Animated rings */}
          {connectionStatus === 'connected' && (
            <>
              <div
                className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping"
                style={{ animationDuration: '3s' }}
              />
              <div
                className="absolute -inset-4 rounded-full border border-indigo-400/20 animate-pulse"
                style={{
                  transform: `scale(${1 + audioLevel * 0.4})`,
                  transition: 'transform 0.1s ease-out'
                }}
              />
            </>
          )}

          {/* Central Orb */}
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isModelSpeaking
                ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 scale-110 shadow-indigo-500/50'
                : connectionStatus === 'connected'
                ? 'bg-gradient-to-tr from-zinc-800 to-zinc-700 ring-2 ring-emerald-500/50'
                : 'bg-zinc-800 ring-1 ring-zinc-700'
            }`}
          >
            {isModelSpeaking ? (
              <Waves className="w-12 h-12 text-white animate-pulse" />
            ) : connectionStatus === 'connected' ? (
              <Radio className="w-10 h-10 text-emerald-400 animate-pulse" />
            ) : (
              <Sparkles className="w-10 h-10 text-zinc-500" />
            )}
          </div>
        </div>

        {/* State Information */}
        <div className="space-y-1 max-w-xs">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {isModelSpeaking
              ? 'Gemini is speaking...'
              : connectionStatus === 'connected'
              ? 'Listening to you...'
              : connectionStatus === 'connecting'
              ? 'Establishing Connection'
              : 'Wavelink Voice Conversation'}
          </h2>
          <p className="text-xs text-zinc-400">{statusMessage}</p>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {connectionStatus === 'idle' || connectionStatus === 'ended' || connectionStatus === 'error' ? (
            <button
              onClick={startSession}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Start Live Conversation</span>
            </button>
          ) : (
            <>
              {/* Mute Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-all ${
                  isMuted
                    ? 'bg-rose-600/20 text-rose-400 ring-1 ring-rose-500/30'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* End Call Button */}
              <button
                onClick={stopSession}
                className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-lg shadow-rose-600/30"
                title="End Conversation"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Instruction Micro-copy */}
        <p className="text-[11px] text-zinc-500 max-w-xs">
          Speaks and listens continuously via Gemini Live API WebSocket. You can speak anytime to interrupt.
        </p>
      </div>
    </div>
  );
};
