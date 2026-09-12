import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Tag,
  Globe,
  Users,
  X,
  Sparkles,
  Paperclip,
  CheckCircle2,
  Mic,
  Square,
  AlertCircle
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { blobToBase64 } from '../utils/audioUtils';

const SUGGESTED_TAGS = ['Design', 'Minimalism', 'Architecture', 'Tech', 'Sound', 'Outdoors'];

const SAMPLE_POST_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&h=720&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1080&h=720&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1080&h=720&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1080&h=720&q=80',
];

export const CreatePostBox: React.FC = () => {
  const { currentUser, addPost, transcribedDraft, setTranscribedDraft } = useSocial();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [audience, setAudience] = useState<'public' | 'followers'>('public');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postedToast, setPostedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio dictation using gemini-3.5-transcribe
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (transcribedDraft) {
      setContent((prev) => (prev ? `${prev} ${transcribedDraft}` : transcribedDraft));
      setTranscribedDraft('');
    }
  }, [transcribedDraft, setTranscribedDraft]);

  const startVoiceDictation = async () => {
    setAudioError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm'
        });
        stream.getTracks().forEach((track) => track.stop());

        setIsTranscribing(true);
        try {
          const audioBase64 = await blobToBase64(audioBlob);
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64,
              mimeType: audioBlob.type || 'audio/webm',
              prompt: 'Transcribe this spoken post draft cleanly and concisely with appropriate punctuation.'
            })
          });

          const data = await res.json();
          if (data.text) {
            setContent((prev) => (prev ? `${prev} ${data.text}` : data.text));
          } else if (data.error) {
            setAudioError(data.error);
          }
        } catch (err: any) {
          setAudioError(err?.message || 'Voice transcription failed');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (e: any) {
      setAudioError('Microphone permission required for voice input.');
    }
  };

  const stopVoiceDictation = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const charLimit = 320;
  const remainingChars = charLimit - content.length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setMediaUrl(reader.result);
          setShowImagePicker(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      setMediaUrl(customUrlInput.trim());
      setCustomUrlInput('');
      setShowImagePicker(false);
    }
  };

  const handleTagClick = (tag: string) => {
    const tagText = `#${tag} `;
    if (!content.includes(tagText)) {
      setContent((prev) => (prev ? `${prev.trim()} ${tagText}` : tagText));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;

    setIsPosting(true);
    setTimeout(() => {
      addPost(content.trim(), mediaUrl, [], audience);
      setContent('');
      setMediaUrl('');
      setShowImagePicker(false);
      setShowTagPicker(false);
      setIsPosting(false);
      setPostedToast(true);
      setTimeout(() => setPostedToast(false), 2400);
    }, 250);
  };

  return (
    <div
      id="create-post-container"
      className="border-b border-zinc-200/80 bg-white p-4 sm:p-5 transition-shadow"
    >
      <div className="flex items-start gap-3.5">
        {/* User Avatar */}
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit}>
            {/* Textarea */}
            <textarea
              id="input-create-post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
              maxLength={charLimit}
              rows={content.length > 80 ? 3 : 2}
              className="w-full text-zinc-900 placeholder-zinc-400 text-base resize-none border-0 focus:outline-hidden focus:ring-0 p-0 leading-relaxed bg-transparent"
            />

            {/* Media Preview if attached */}
            {mediaUrl && (
              <div className="relative mt-3 mb-3 rounded-xl overflow-hidden border border-zinc-200 max-h-72 group">
                <img
                  src={mediaUrl}
                  alt="Post attachment"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  id="btn-remove-media-attachment"
                  onClick={() => setMediaUrl('')}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Image Picker Drawer */}
            {showImagePicker && (
              <div className="mt-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Attach Photo
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(false)}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Preset cards */}
                <div>
                  <span className="text-xs text-zinc-500 block mb-1.5 font-medium">
                    Select curated photography
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {SAMPLE_POST_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setMediaUrl(img);
                          setShowImagePicker(false);
                        }}
                        className="h-16 rounded-lg overflow-hidden border border-zinc-200 hover:border-zinc-800 transition-all hover:scale-102"
                      >
                        <img src={img} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct link or Upload */}
                <div className="pt-2 border-t border-zinc-200 flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex-1 flex gap-1.5 w-full">
                    <input
                      type="url"
                      placeholder="Paste image link..."
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-md focus:outline-hidden focus:border-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      disabled={!customUrlInput.trim()}
                      className="px-3 py-1.5 text-xs font-medium bg-zinc-800 text-white rounded-md disabled:opacity-40"
                    >
                      Use Link
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 w-full sm:w-auto justify-end">
                    <span>or</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md hover:bg-zinc-100"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      Upload File
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tag Picker Drawer */}
            {showTagPicker && (
              <div className="mt-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Add Tags
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTagPicker(false)}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTagClick(t)}
                      className="text-xs font-medium bg-white hover:bg-zinc-200 text-zinc-700 px-2.5 py-1 rounded-full border border-zinc-200 transition-colors"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-2">
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Media Button */}
                <button
                  id="btn-open-image-picker"
                  type="button"
                  onClick={() => {
                    setShowImagePicker(!showImagePicker);
                    setShowTagPicker(false);
                  }}
                  className={`p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors ${
                    showImagePicker || mediaUrl ? 'text-indigo-600 bg-indigo-50' : ''
                  }`}
                  title="Add photo"
                >
                  <ImageIcon className="w-4.5 h-4.5" />
                </button>

                {/* Tag Button */}
                <button
                  id="btn-open-tag-picker"
                  type="button"
                  onClick={() => {
                    setShowTagPicker(!showTagPicker);
                    setShowImagePicker(false);
                  }}
                  className={`p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors ${
                    showTagPicker ? 'text-indigo-600 bg-indigo-50' : ''
                  }`}
                  title="Add hashtag"
                >
                  <Tag className="w-4.5 h-4.5" />
                </button>

                {/* Voice Dictation Button (gemini-3.5-transcribe) */}
                <button
                  id="btn-voice-dictate-post"
                  type="button"
                  onClick={isRecording ? stopVoiceDictation : startVoiceDictation}
                  disabled={isTranscribing}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                    isRecording
                      ? 'bg-rose-50 text-rose-600 animate-pulse ring-1 ring-rose-200'
                      : isTranscribing
                      ? 'bg-zinc-100 text-zinc-400'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                  title={
                    isRecording
                      ? 'Click to stop and transcribe'
                      : 'Dictate post with microphone (gemini-3.5-transcribe)'
                  }
                >
                  {isRecording ? (
                    <>
                      <Square className="w-4 h-4 fill-current text-rose-600" />
                      <span className="text-[11px] text-rose-600">{recordingSeconds}s</span>
                    </>
                  ) : (
                    <Mic className="w-4.5 h-4.5" />
                  )}
                </button>

                {isTranscribing && (
                  <span className="text-[11px] text-zinc-500 animate-pulse font-medium">
                    Transcribing with gemini-3.5-transcribe...
                  </span>
                )}

                {/* Audience Dropdown */}
                <div className="relative inline-flex items-center">
                  <select
                    id="select-post-audience"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as 'public' | 'followers')}
                    className="text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200/80 px-2.5 py-1.5 rounded-lg border-0 focus:outline-hidden cursor-pointer flex items-center gap-1"
                  >
                    <option value="public">🌐 Public</option>
                    <option value="followers">👥 Followers</option>
                  </select>
                </div>
              </div>

              {/* Right Side: Char count & Publish button */}
              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <span
                    className={`text-xs tabular-nums font-medium ${
                      remainingChars < 30 ? 'text-amber-600 font-semibold' : 'text-zinc-400'
                    }`}
                  >
                    {remainingChars}
                  </span>
                )}

                <button
                  id="btn-submit-post"
                  type="submit"
                  disabled={(!content.trim() && !mediaUrl) || isPosting}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white disabled:opacity-40 disabled:hover:bg-zinc-900 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Success Toast */}
      {postedToast && (
        <div className="mt-3 py-1.5 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Post published to your feed!</span>
        </div>
      )}
    </div>
  );
};
