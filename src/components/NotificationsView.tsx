import React, { useState } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Repeat2,
  CheckCheck,
  Filter,
  Cpu
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    users,
    currentUser,
    markNotificationsRead,
    viewProfile,
    toggleFollow,
    isFollowing,
  } = useSocial();

  const [filter, setFilter] = useState<'all' | 'unread' | 'likes' | 'comments'>('all');

  const myNotifications = notifications.filter((n) => n.recipientId === currentUser.id);

  const filteredNotifs = myNotifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'likes') return n.type === 'like';
    if (filter === 'comments') return n.type === 'comment';
    return true;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-sky-600" />;
      case 'repost':
        return <Repeat2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'system':
        return <Cpu className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-zinc-600" />;
    }
  };

  return (
    <div id="notifications-view-container" className="min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-900">Notifications</h2>
            {myNotifications.some((n) => !n.read) && (
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </div>
          <button
            id="btn-mark-all-read"
            onClick={markNotificationsRead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-3">
          {(['all', 'unread', 'likes', 'comments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                filter === tab
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-zinc-100">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif) => {
            const actor = users.find((u) => u.id === notif.actorId);
            if (!actor) return null;
            const followed = isFollowing(actor.id);

            return (
              <div
                key={notif.id}
                id={`notif-item-${notif.id}`}
                className={`p-4 flex items-start gap-3 transition-colors ${
                  !notif.read ? 'bg-indigo-50/30' : 'bg-white hover:bg-zinc-50/60'
                }`}
              >
                {/* Icon */}
                <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200/60">
                  {getNotifIcon(notif.type)}
                </div>

                {/* Actor Avatar */}
                <button
                  onClick={() => viewProfile(actor.id)}
                  className="flex-shrink-0 relative group"
                >
                  <img
                    src={actor.avatar}
                    alt={actor.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200"
                  />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-800 leading-relaxed">
                    <button
                      onClick={() => viewProfile(actor.id)}
                      className="font-bold text-zinc-900 hover:underline inline"
                    >
                      {actor.name}
                    </button>{' '}
                    <span className="text-zinc-600">{notif.contentSnippet}</span>
                  </p>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    {notif.createdAt}
                  </span>
                </div>

                {/* Right context action (e.g. Follow back) */}
                {notif.type === 'follow' && (
                  <button
                    onClick={() => toggleFollow(actor.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                      followed
                        ? 'border border-zinc-300 text-zinc-700 hover:bg-rose-50 hover:text-rose-600'
                        : 'bg-zinc-900 text-white hover:bg-zinc-800'
                    }`}
                  >
                    {followed ? 'Following' : 'Follow back'}
                  </button>
                )}

                {/* Unread dot */}
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-zinc-500">
            <Bell className="w-8 h-8 text-zinc-300 mx-auto mb-2 stroke-1" />
            <p className="text-base font-semibold text-zinc-800 mb-1">All caught up!</p>
            <p className="text-xs text-zinc-400">
              No notifications matching your selected filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
