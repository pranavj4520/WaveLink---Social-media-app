/**
 * Audio processing utilities for Wavelink Live API and Audio Transcription
 */

// Convert a Blob (e.g. MediaRecorder WebM / WAV) to Base64 string (stripped of data URL header)
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Convert Float32Array from Web Audio API into 16-bit PCM little-endian Int16Array, then base64
export function pcmFloat32ToBase64(inputData: Float32Array): string {
  const pcm16 = new Int16Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    // Clamp to [-1, 1] then convert to 16-bit signed integer
    const s = Math.max(-1, Math.min(1, inputData[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert raw base64 24kHz 16-bit PCM into AudioBuffer and schedule gapless playback
export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  constructor(sampleRate: number = 24000) {
    // Browser AudioContext initialization
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.audioCtx = new AudioContextClass({ sampleRate });
    }
  }

  public async playChunk(base64Pcm: string) {
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    try {
      const binary = atob(base64Pcm);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // 16-bit PCM little-endian
      const pcm16 = new Int16Array(bytes.buffer);
      const numSamples = pcm16.length;
      const audioBuffer = this.audioCtx.createBuffer(1, numSamples, 24000);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < numSamples; i++) {
        channelData[i] = pcm16[i] / 32768.0;
      }

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioCtx.destination);

      const currentTime = this.audioCtx.currentTime;
      const startTime = Math.max(this.nextStartTime, currentTime);
      source.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        this.activeSources = this.activeSources.filter((s) => s !== source);
      };
    } catch (err) {
      console.error('Failed to play live audio chunk:', err);
    }
  }

  public stopAll() {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
  }

  public close() {
    this.stopAll();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
