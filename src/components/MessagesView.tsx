import React, { useState, useRef } from 'react';
import {
  Send,
  Search,
  CheckCheck,
  Circle,
  MessageSquare,
  ArrowLeft,
  UserCheck,
  Mic,
  Square
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { blobToBase64 } from '../utils/audioUtils';

export const MessagesView: React.FC = () => {
  const {
    currentUser,
    users,
    messages,
    sendMessage,
    activeConversationUserId,
    setActiveConversationUserId,
    viewProfile,
  } = useSocial();

  const [messageText, setMessageText] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startVoiceDictation = async () => {
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
        stream.getTracks().forEach((t) => t.stop());

        setIsTranscribing(true);
        try {
          const audioBase64 = await blobToBase64(audioBlob);
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64,
              mimeType: audioBlob.type || 'audio/webm',
              prompt: 'Transcribe this spoken direct chat message.'
            })
          });
          const data = await res.json();
          if (data.text) {
            setMessageText((prev) => (prev ? `${prev} ${data.text}` : data.text));
          }
        } catch (err) {
          console.error('Failed to transcribe voice in chat:', err);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error('Mic access error:', e);
    }
  };

  const stopVoiceDictation = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Find all distinct users who have exchanged messages with currentUser
  const partnerUserIds = Array.from(
    new Set(
      messages
        .filter((m) => m.senderId === currentUser.id || m.recipientId === currentUser.id)
        .map((m) => (m.senderId === currentUser.id ? m.recipientId : m.senderId))
    )
  );

  // If active user is not in list yet, ensure it's selectable
  const otherUsers = users.filter((u) => u.id !== currentUser.id);

  const activePartnerId =
    activeConversationUserId ||
    (partnerUserIds.length > 0 ? partnerUserIds[0] : otherUsers[0]?.id || null);

  const activePartner = users.find((u) => u.id === activePartnerId);

  // Messages between currentUser and activePartner
  const currentThread = messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.recipientId === activePartnerId) ||
      (m.senderId === activePartnerId && m.recipientId === currentUser.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activePartnerId) return;
    sendMessage(activePartnerId, messageText.trim());
    setMessageText('');
  };

  const selectConversation = (userId: string) => {
    setActiveConversationUserId(userId);
    setMobileShowThread(true);
  };

  const filteredPartners = otherUsers.filter((u) => {
    if (!searchUserQuery.trim()) return true;
    const q = searchUserQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q);
  });

  return (
    <div
      id="messages-view-container"
      className="min-h-screen flex flex-col md:flex-row bg-white border-r border-zinc-200/80"
    >
      {/* Left Column: Conversations List */}
      <div
        className={`w-full md:w-80 md:border-r border-zinc-200 flex-shrink-0 flex flex-col h-[calc(100vh-60px)] md:h-screen sticky top-0 bg-white ${
          mobileShowThread ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-zinc-200/80">
          <h2 className="text-lg font-bold text-zinc-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-100 rounded-lg border-0 focus:outline-hidden focus:bg-zinc-200/60"
            />
          </div>
        </div>

        {/* List of Contacts */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
          {filteredPartners.map((user) => {
            const isSelected = user.id === activePartnerId;
            const lastMsg = [...messages]
              .reverse()
              .find(
                (m) =>
                  (m.senderId === currentUser.id && m.recipientId === user.id) ||
                  (m.senderId === user.id && m.recipientId === currentUser.id)
              );

            return (
              <div
                key={user.id}
                id={`conversation-item-${user.id}`}
                onClick={() => selectConversation(user.id)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-zinc-100' : 'hover:bg-zinc-50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-xs text-zinc-900 truncate">{user.name}</p>
                    {lastMsg && (
                      <span className="text-[10px] text-zinc-400">{lastMsg.createdAt}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {lastMsg ? lastMsg.text : `@${user.handle}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Thread */}
      <div
        className={`flex-1 flex flex-col h-[calc(100vh-60px)] md:h-screen sticky top-0 bg-zinc-50/50 ${
          !mobileShowThread ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activePartner ? (
          <>
            {/* Thread Header */}
            <div className="p-3.5 px-4 bg-white/90 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileShowThread(false)}
                  className="md:hidden p-1 text-zinc-500 hover:text-zinc-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={activePartner.avatar}
                  alt={activePartner.name}
                  className="w-9 h-9 rounded-full object-cover cursor-pointer"
                  onClick={() => viewProfile(activePartner.id)}
                />
                <div>
                  <button
                    onClick={() => viewProfile(activePartner.id)}
                    className="font-bold text-xs text-zinc-900 hover:underline flex items-center gap-1"
                  >
                    {activePartner.name}
                  </button>
                  <span className="text-[10px] text-emerald-600 font-medium">Online now</span>
                </div>
              </div>

              <button
                onClick={() => viewProfile(activePartner.id)}
                className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                View Profile
              </button>
            </div>

            {/* Chat Bubble Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/30">
              {currentThread.length > 0 ? (
                currentThread.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-zinc-900 text-white rounded-br-xs'
                            : 'bg-white text-zinc-900 border border-zinc-200/80 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 px-1">
                        {msg.createdAt}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400">
                  <MessageSquare className="w-8 h-8 stroke-1 mb-2 text-zinc-300" />
                  <p className="text-xs font-medium text-zinc-600">No messages here yet</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Say hello to start the conversation!
                  </p>
                </div>
              )}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2">
              <button
                type="button"
                onClick={isRecording ? stopVoiceDictation : startVoiceDictation}
                disabled={isTranscribing}
                className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : isTranscribing
                    ? 'bg-zinc-100 text-zinc-400'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                title="Dictate message with voice (gemini-3.5-transcribe)"
              >
                {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                id="input-send-message"
                type="text"
                placeholder={
                  isRecording
                    ? 'Listening to microphone...'
                    : isTranscribing
                    ? 'Transcribing audio...'
                    : `Message ${activePartner.name.split(' ')[0]}...`
                }
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-2 text-xs bg-zinc-100 border border-zinc-200 rounded-full focus:outline-hidden focus:bg-white focus:border-zinc-900"
              />
              <button
                id="btn-send-message"
                type="submit"
                disabled={!messageText.trim()}
                className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center disabled:opacity-30 hover:bg-zinc-800 transition-colors"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-400 text-xs">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};
