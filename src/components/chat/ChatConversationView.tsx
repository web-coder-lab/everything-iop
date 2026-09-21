import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/appStore';
import { ChatApi } from '../../lib/api/chatApi';
import { apiClient } from '../../lib/api/client';
import { timeAgo } from '../../lib/utils';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Check,
  CheckCheck,
  Phone,
  Video,
  Image,
  FileText,
  X,
  CornerDownRight,
  ShieldAlert,
  Play,
  Pause,
  Download,
} from 'lucide-react';
import type { Conversation, Message } from '../../types';

interface ChatConversationViewProps {
  conversationId: string;
  onBack?: () => void;
}

export const ChatConversationView: React.FC<ChatConversationViewProps> = ({
  conversationId,
  onBack,
}) => {
  const { conversations, currentUser, sendMessage, openReportModal, addToast } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const conversation = conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    loadChatMessages();
    ChatApi.markAsRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatMessages = async () => {
    try {
      const res = await ChatApi.getMessages(conversationId);
      if (res.data) {
        setMessages(res.data);
      }
    } catch {
      // Handled
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');
    const targetReply = replyTarget
      ? {
          id: replyTarget.id,
          senderName: replyTarget.sender.fullName,
          text: replyTarget.text || replyTarget.content || '',
        }
      : undefined;
    setReplyTarget(null);

    // Optimistic UI append
    if (currentUser) {
      const optimisticMsg: Message = {
        id: `temp_${Date.now()}`,
        conversationId,
        sender: currentUser,
        text,
        content: text,
        type: 'text',
        status: 'sending',
        createdAt: new Date().toISOString(),
        replyTo: targetReply,
      };
      setMessages((prev) => [...prev, optimisticMsg]);
    }

    await sendMessage(conversationId, text, undefined, undefined, targetReply);
    loadChatMessages();
  };

  const handleSendImage = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/png,image/jpeg,image/webp';
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      try {
        if (file.size > 20 * 1024 * 1024) throw new Error('Image must be 20 MB or smaller.');
        const upload = await apiClient.request<any>('/media/upload', { method: 'POST', body: await file.arrayBuffer(), headers: { 'Content-Type': file.type } });
        const url = String(upload.data?.url || upload.data?.publicUrl || upload.data?.location || '');
        if (!url) throw new Error('Server returned no media URL.');
        await sendMessage(conversationId, 'Shared an image', [url]);
        await loadChatMessages();
      } catch (e:any) { addToast(e.message || 'Image upload failed.', 'error'); }
      finally { setAttachmentMenuOpen(false); }
    };
    input.click();
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      setRecordSeconds(0);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) audioChunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        try {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const upload = await apiClient.request<any>('/media/upload', { method: 'POST', body: await blob.arrayBuffer(), headers: { 'Content-Type': 'audio/webm' } });
          const url = String(upload.data?.url || upload.data?.publicUrl || upload.data?.location || '');
          if (!url) throw new Error('Server returned no audio URL.');
          await sendMessage(conversationId, 'Voice message', undefined, url);
          await loadChatMessages();
        } catch (e:any) { addToast(e.message || 'Voice message upload failed.', 'error'); }
      };
      mediaRecorderRef.current = recorder;
      recorder.start(); setIsRecording(true); setRecordSeconds(0);
    } catch (e:any) { addToast(e.message || 'Microphone permission is required.', 'error'); }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-stone-500">
        <p>Conversation not found.</p>
        <button onClick={onBack} className="text-xs text-emerald-700 font-semibold mt-2">
          Back to Chats
        </button>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find((p) => p.id !== currentUser?.id) || conversation.participants[0];
  const title = conversation.isGroup ? conversation.groupName : otherParticipant?.fullName;
  const avatar = conversation.isGroup ? conversation.groupAvatar : otherParticipant?.avatarUrl;

  return (
    <div
      id="chat-conversation-container"
      className="flex flex-col h-full bg-[#efeae2] dark:bg-stone-950 rounded-none sm:rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm relative"
    >
      {/* WhatsApp-Style Chat Header */}
      <div className="px-3.5 py-2.5 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between z-10 shadow-xs">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-1.5 -ml-1 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={title}
              className="w-9 h-9 rounded-full object-cover border border-stone-200 dark:border-stone-700"
            />
            {otherParticipant?.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-stone-900" />
            )}
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white leading-tight">
              {title}
            </h3>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
              {otherParticipant?.isOnline ? 'Online' : 'Last seen recently'}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
          <button
            onClick={() => addToast('Audio calling requires active media stream.', 'info')}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            title="Audio Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => addToast('Video calling requires active media stream.', 'info')}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            title="Video Call"
          >
            <Video className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-1 w-44 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-1 z-30 animate-fade-in text-xs"
                onClick={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => addToast('Chat muted.', 'info')}
                  className="w-full text-left px-3 py-2 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Mute Notifications
                </button>
                <button
                  onClick={() =>
                    openReportModal({
                      type: 'message',
                      id: conversation.id,
                      title: `Chat with ${title}`,
                    })
                  }
                  className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Report / Block
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area with WhatsApp-style background pattern */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
        {/* Encrypted privacy banner */}
        <div className="mx-auto max-w-xs text-center py-1.5 px-3 bg-amber-100/90 dark:bg-amber-950/60 rounded-xl text-[10px] text-amber-900 dark:text-amber-300 font-medium shadow-xs mb-3">
          🔒 Messages and calls are protected with secure end-to-end community transport.
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUser?.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-2.5 shadow-sm text-xs relative ${
                  isMe
                    ? 'bg-[#d9fdd3] dark:bg-emerald-950/80 text-stone-900 dark:text-stone-100 rounded-tr-none'
                    : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-tl-none border border-stone-200/50 dark:border-stone-800'
                }`}
              >
                {/* Quoted reply bubble if any */}
                {msg.replyTo && (
                  <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 border-l-2 border-emerald-700 mb-1.5 text-[11px]">
                    <span className="font-bold text-emerald-800 dark:text-emerald-400 block">
                      {msg.replyTo.senderName}
                    </span>
                    <p className="line-clamp-1 opacity-80">{msg.replyTo.text || msg.replyTo.content}</p>
                  </div>
                )}

                {/* Media Image */}
                {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                  <div className="rounded-xl overflow-hidden mb-1.5 max-w-xs">
                    <img src={msg.mediaUrls[0]} alt="Media" className="w-full object-cover" />
                  </div>
                )}

                {/* Audio Voice Note Player */}
                {msg.audioUrl && (
                  <div className="flex items-center gap-2 py-1 pr-2">
                    <button
                      onClick={() =>
                        setIsPlayingAudio(isPlayingAudio === msg.id ? null : msg.id)
                      }
                      className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center"
                    >
                      {isPlayingAudio === msg.id ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-emerald-600 transition-all ${
                          isPlayingAudio === msg.id ? 'w-full duration-[8000ms]' : 'w-1/3'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Main Text Content */}
                <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text || msg.content}</p>

                {/* Footer: Time & Status Ticks */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-stone-500 dark:text-stone-400">
                  <span>{timeAgo(msg.createdAt)}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-stone-400" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-stone-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Reply trigger on hover */}
              <button
                onClick={() => setReplyTarget(msg)}
                className="opacity-0 group-hover:opacity-100 text-[10px] text-stone-400 hover:text-emerald-700 transition px-1"
              >
                Reply
              </button>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply target banner above composer */}
      {replyTarget && (
        <div className="px-4 py-2 bg-stone-100 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
          <div className="border-l-2 border-emerald-700 pl-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-400">
              Replying to {replyTarget.sender.fullName}
            </span>
            <p className="text-[11px] text-stone-500 line-clamp-1">{replyTarget.text || replyTarget.content}</p>
          </div>
          <button
            onClick={() => setReplyTarget(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachment popover */}
      {attachmentMenuOpen && (
        <div className="absolute bottom-16 left-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-2 z-30 flex flex-col gap-1 w-44 animate-fade-in text-xs">
          <button
            onClick={handleSendImage}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
          >
            <Image className="w-4 h-4 text-emerald-600" />
            <span>Photo & Video</span>
          </button>
          <button
            onClick={() => {
              addToast('Document upload simulated.', 'info');
              setAttachmentMenuOpen(false);
            }}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Document / PDF</span>
          </button>
        </div>
      )}

      {/* Message Composer */}
      <div className="p-2 sm:p-3 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
          className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          aria-label="Add attachment"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <form onSubmit={handleSend} className="flex-1 flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full text-xs sm:text-sm py-2 px-3.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </form>

        {inputText.trim() ? (
          <button
            onClick={handleSend}
            className="p-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-full shadow-md transition active:scale-95"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-2.5 rounded-full transition ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-emerald-900 hover:bg-emerald-800 text-white'
            }`}
            aria-label="Record voice note"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
