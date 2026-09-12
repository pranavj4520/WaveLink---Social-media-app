import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  MoreHorizontal,
  Trash2,
  BadgeCheck,
  Send,
  Lock,
  Globe,
  Check
} from 'lucide-react';
import { Post } from '../types';
import { useSocial } from '../context/SocialContext';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    currentUser,
    users,
    toggleLike,
    toggleBookmark,
    toggleRepost,
    addComment,
    toggleCommentLike,
    deletePost,
    viewProfile,
    setSelectedTag,
    setActiveTab,
  } = useSocial();

  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);

  const author = users.find((u) => u.id === post.authorId);
  if (!author) return null;

  const isLiked = post.likedBy.includes(currentUser.id);
  const isBookmarked = post.bookmarkedBy.includes(currentUser.id);
  const isReposted = post.repostedBy.includes(currentUser.id);
  const isAuthor = currentUser.id === post.authorId;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setActiveTab('feed');
  };

  // Render text and highlight hashtags
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        const rawTag = part.slice(1);
        return (
          <button
            key={i}
            onClick={() => handleTagClick(rawTag)}
            className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium inline-block"
          >
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <article
      id={`post-card-${post.id}`}
      className="border-b border-zinc-200/80 bg-white hover:bg-zinc-50/40 transition-colors p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        {/* Author Avatar */}
        <button
          id={`btn-author-avatar-${post.id}`}
          onClick={() => viewProfile(author.id)}
          className="flex-shrink-0 group"
        >
          <img
            src={author.avatar}
            alt={author.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200 group-hover:opacity-90 transition-opacity"
          />
        </button>

        {/* Post Container */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                id={`btn-author-name-${post.id}`}
                onClick={() => viewProfile(author.id)}
                className="font-semibold text-zinc-900 text-sm hover:underline flex items-center gap-1"
              >
                <span>{author.name}</span>
                {author.verified && (
                  <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/10" />
                )}
              </button>
              <span className="text-zinc-500 text-xs">@{author.handle}</span>
              <span className="text-zinc-400 text-xs">•</span>
              <span className="text-zinc-400 text-xs">{post.createdAt}</span>

              {post.audience === 'followers' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded font-medium ml-1">
                  <Lock className="w-2.5 h-2.5" /> Followers only
                </span>
              )}
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                id={`btn-post-menu-${post.id}`}
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-6 z-30 w-36 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 text-xs text-zinc-700">
                  <button
                    onClick={handleShare}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center gap-2"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Copy link
                  </button>
                  {isAuthor && (
                    <button
                      onClick={() => {
                        deletePost(post.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete post
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Post Content */}
          <p className="mt-2 text-zinc-800 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words">
            {renderFormattedContent(post.content)}
          </p>

          {/* Attached Media */}
          {post.mediaUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 max-h-96">
              <img
                src={post.mediaUrl}
                alt="Post attachment"
                onClick={() => setIsPhotoExpanded(true)}
                className="w-full h-full max-h-96 object-cover hover:opacity-95 transition-opacity cursor-zoom-in"
              />
            </div>
          )}

          {/* Post Tags Chips */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="text-[11px] font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded-md transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between mt-3.5 pt-2 text-zinc-500 text-xs">
            {/* Comment */}
            <button
              id={`btn-toggle-comments-${post.id}`}
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 hover:text-indigo-600 group transition-colors ${
                showComments ? 'text-indigo-600' : ''
              }`}
            >
              <div className="p-1.5 rounded-full group-hover:bg-indigo-50 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="font-medium tabular-nums">{post.comments.length}</span>
            </button>

            {/* Repost */}
            <button
              id={`btn-repost-${post.id}`}
              onClick={() => toggleRepost(post.id)}
              className={`flex items-center gap-1.5 hover:text-emerald-600 group transition-colors ${
                isReposted ? 'text-emerald-600' : ''
              }`}
            >
              <div className="p-1.5 rounded-full group-hover:bg-emerald-50 transition-colors">
                <Repeat2 className="w-4 h-4" />
              </div>
              <span className="font-medium tabular-nums">{post.repostsCount}</span>
            </button>

            {/* Like */}
            <button
              id={`btn-like-${post.id}`}
              onClick={() => toggleLike(post.id)}
              className={`flex items-center gap-1.5 hover:text-rose-600 group transition-colors ${
                isLiked ? 'text-rose-600' : ''
              }`}
            >
              <div className="p-1.5 rounded-full group-hover:bg-rose-50 transition-colors">
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="font-medium tabular-nums">{post.likesCount}</span>
            </button>

            {/* Bookmark */}
            <button
              id={`btn-bookmark-${post.id}`}
              onClick={() => toggleBookmark(post.id)}
              className={`flex items-center gap-1.5 hover:text-indigo-600 group transition-colors ${
                isBookmarked ? 'text-indigo-600' : ''
              }`}
            >
              <div className="p-1.5 rounded-full group-hover:bg-indigo-50 transition-colors">
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </div>
            </button>

            {/* Share */}
            <button
              id={`btn-share-${post.id}`}
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-zinc-900 group transition-colors relative"
            >
              <div className="p-1.5 rounded-full group-hover:bg-zinc-100 transition-colors">
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </div>
              {copiedLink && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">
                  Copied!
                </span>
              )}
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-3 border-t border-zinc-100 space-y-3">
              {/* Existing Comments List */}
              {post.comments.length > 0 ? (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {post.comments.map((comment) => {
                    const commentAuthor = users.find((u) => u.id === comment.authorId);
                    if (!commentAuthor) return null;
                    const isCommentLiked = comment.likedBy.includes(currentUser.id);

                    return (
                      <div
                        key={comment.id}
                        id={`comment-${comment.id}`}
                        className="flex items-start gap-2.5 text-xs group"
                      >
                        <button
                          onClick={() => viewProfile(commentAuthor.id)}
                          className="flex-shrink-0 mt-0.5"
                        >
                          <img
                            src={commentAuthor.avatar}
                            alt={commentAuthor.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        </button>
                        <div className="flex-1 bg-zinc-50 rounded-xl p-2.5 border border-zinc-100">
                          <div className="flex items-center justify-between mb-1">
                            <button
                              onClick={() => viewProfile(commentAuthor.id)}
                              className="font-semibold text-zinc-900 hover:underline"
                            >
                              {commentAuthor.name}
                            </button>
                            <span className="text-[10px] text-zinc-400">{comment.createdAt}</span>
                          </div>
                          <p className="text-zinc-700 leading-normal">{comment.content}</p>
                          <div className="mt-1.5 flex items-center gap-3">
                            <button
                              onClick={() => toggleCommentLike(post.id, comment.id)}
                              className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                                isCommentLiked ? 'text-rose-600' : 'text-zinc-500 hover:text-zinc-800'
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${isCommentLiked ? 'fill-current' : ''}`} />
                              <span>{comment.likesCount > 0 ? comment.likesCount : 'Like'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 py-1 italic">
                  No replies yet. Be the first to join the conversation!
                </p>
              )}

              {/* Add Comment Input */}
              <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
                <input
                  type="text"
                  placeholder="Post your reply..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-full focus:outline-hidden focus:bg-white focus:border-zinc-900 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold disabled:opacity-30 transition-opacity flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  Reply
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Expanded Photo modal */}
      {isPhotoExpanded && post.mediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsPhotoExpanded(false)}
        >
          <img
            src={post.mediaUrl}
            alt="Expanded view"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </article>
  );
};
