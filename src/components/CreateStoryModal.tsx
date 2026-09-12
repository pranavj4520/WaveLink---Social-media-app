import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import { useSocial } from '../context/SocialContext';

const PRESET_STORY_IMAGES = [
  {
    label: 'Tokyo Sunset',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&h=1200&q=80',
  },
  {
    label: 'Alpine Heights',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&h=1200&q=80',
  },
  {
    label: 'Synthesizer Studio',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&h=1200&q=80',
  },
  {
    label: 'Creative Architecture',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&h=1200&q=80',
  },
  {
    label: 'Minimalist Workspace',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&h=1200&q=80',
  },
];

export const CreateStoryModal: React.FC = () => {
  const { isCreateStoryOpen, setIsCreateStoryOpen, addStory } = useSocial();
  const [selectedUrl, setSelectedUrl] = useState(PRESET_STORY_IMAGES[0].url);
  const [customUrl, setCustomUrl] = useState('');
  const [caption, setCaption] = useState('');

  if (!isCreateStoryOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = customUrl.trim() || selectedUrl;
    if (!finalUrl) return;
    addStory(finalUrl, caption.trim() || undefined);
    setIsCreateStoryOpen(false);
    setCaption('');
    setCustomUrl('');
  };

  return (
    <div
      id="create-story-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => setIsCreateStoryOpen(false)}
    >
      <div
        id="create-story-modal-content"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-zinc-900 text-base">Add to Your Story</h3>
          </div>
          <button
            id="btn-close-create-story"
            onClick={() => setIsCreateStoryOpen(false)}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePublish} className="p-6 space-y-5">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="relative w-40 aspect-[9/16] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm flex items-center justify-center">
              <img
                src={customUrl.trim() || selectedUrl}
                alt="Story preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_STORY_IMAGES[0].url;
                }}
              />
              {caption && (
                <div className="absolute inset-x-2 bottom-3 bg-black/60 backdrop-blur-xs text-white text-xs p-1.5 rounded-md text-center">
                  {caption}
                </div>
              )}
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              Select Background Visual
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_STORY_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedUrl(preset.url);
                    setCustomUrl('');
                  }}
                  className={`relative aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all ${
                    selectedUrl === preset.url && !customUrl
                      ? 'border-indigo-600 scale-102 ring-2 ring-indigo-200'
                      : 'border-transparent hover:opacity-80'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Upload or Custom URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-600 font-medium">
              <span>Or use your own image</span>
              <label className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 cursor-pointer font-semibold">
                <Upload className="w-3.5 h-3.5" />
                Upload file
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="url"
                placeholder="Paste image URL (https://...)"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-zinc-50"
              />
            </div>
          </div>

          {/* Caption text */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Caption / Overlay (optional)
            </label>
            <input
              id="input-story-caption"
              type="text"
              placeholder="What's happening right now?"
              value={caption}
              maxLength={80}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-zinc-50"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateStoryOpen(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-publish-story"
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors"
            >
              Share to Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
