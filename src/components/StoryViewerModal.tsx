import React, { useEffect, useState } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { useSocial } from '../context/SocialContext';

export const StoryViewerModal: React.FC = () => {
  const { viewingStory, setViewingStory, stories, users, currentUser, markStoryViewed, sendMessage } =
    useSocial();
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!viewingStory) return;
    markStoryViewed(viewingStory.id);
    setProgress(0);
    setIsLiked(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story if available, else close
          const currentIndex = stories.findIndex((s) => s.id === viewingStory.id);
          if (currentIndex < stories.length - 1) {
            setViewingStory(stories[currentIndex + 1]);
          } else {
            setViewingStory(null);
          }
          return 0;
        }
        return prev + 2; // ~5 seconds total
      });
    }, 100);

    return () => clearInterval(interval);
  }, [viewingStory?.id]);

  if (!viewingStory) return null;

  const author = users.find((u) => u.id === viewingStory.authorId);
  if (!author) return null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendMessage(author.id, `Replied to your story: "${replyText.trim()}"`);
    setReplyText('');
    setViewingStory(null);
  };

  const handleNext = () => {
    const currentIndex = stories.findIndex((s) => s.id === viewingStory.id);
    if (currentIndex < stories.length - 1) {
      setViewingStory(stories[currentIndex + 1]);
    } else {
      setViewingStory(null);
    }
  };

  const handlePrev = () => {
    const currentIndex = stories.findIndex((s) => s.id === viewingStory.id);
    if (currentIndex > 0) {
      setViewingStory(stories[currentIndex - 1]);
    }
  };

  return (
    <div
      id="story-viewer-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={() => setViewingStory(null)}
    >
      <div
        id="story-viewer-content"
        className="relative w-full max-w-sm aspect-[9/16] bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="absolute top-3 inset-x-3 z-20 flex gap-1.5">
          <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Top Header */}
        <div className="relative z-20 pt-6 px-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-9 h-9 rounded-full object-cover border border-white/50"
            />
            <div>
              <p className="text-sm font-semibold leading-tight">{author.name}</p>
              <p className="text-[11px] text-zinc-300">{viewingStory.createdAt}</p>
            </div>
          </div>
          <button
            id="btn-close-story"
            onClick={() => setViewingStory(null)}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Media Background */}
        <img
          src={viewingStory.mediaUrl}
          alt="Story content"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

        {/* Tap areas for next/prev */}
        <div className="absolute inset-y-16 left-0 w-1/3 z-10 cursor-pointer" onClick={handlePrev} />
        <div className="absolute inset-y-16 right-0 w-1/3 z-10 cursor-pointer" onClick={handleNext} />

        {/* Text Overlay if present */}
        {viewingStory.textOverlay && (
          <div className="relative z-20 px-6 my-auto text-center">
            <div className="inline-block bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white font-medium text-base shadow-lg">
              {viewingStory.textOverlay}
            </div>
          </div>
        )}

        {/* Bottom Interaction Bar */}
        <div className="relative z-20 pb-4 px-4">
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              id="input-story-reply"
              type="text"
              placeholder={`Reply to ${author.name.split(' ')[0]}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-white/20 hover:bg-white/30 focus:bg-white/30 text-white placeholder-zinc-300 text-sm px-4 py-2.5 rounded-full border border-white/20 focus:outline-hidden backdrop-blur-sm transition-all"
            />
            <button
              id="btn-like-story"
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                isLiked ? 'text-rose-500 bg-white/20' : 'text-white bg-white/10 hover:bg-white/20'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              id="btn-submit-story-reply"
              type="submit"
              disabled={!replyText.trim()}
              className="w-10 h-10 rounded-full bg-white text-zinc-900 flex items-center justify-center disabled:opacity-40 hover:bg-zinc-200 transition-colors"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
