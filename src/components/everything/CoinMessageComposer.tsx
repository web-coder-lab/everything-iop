import React, { useEffect, useMemo, useState } from 'react';
import { Coins, Pin, Send, CheckCircle2 } from 'lucide-react';
import { PostApi } from '../../lib/api/postApi';
import { apiClient } from '../../lib/api/client';
import type { Comment } from '../../types';

type Props = {
  surfaceId: string;
  surfaceType: 'post' | 'reel' | 'video' | 'live';
  ownerId?: string;
  currentUserId?: string;
  onSent?: (message: Comment) => void;
};

const packs = [100, 250, 500, 1000];

export default function CoinMessageComposer({ surfaceId, surfaceType, ownerId, currentUserId, onSent }: Props) {
  const [text, setText] = useState('');
  const [coins, setCoins] = useState(100);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Comment[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedCurrentUserId = currentUserId;
  const isOwner = Boolean(ownerId && resolvedCurrentUserId && ownerId === resolvedCurrentUserId);
  const unread = useMemo(() => messages.filter((m) => !m.isReadByOwner).length, [messages]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      apiClient.request<{ balance: number }>('/coins/balance'),
      apiClient.request<Comment[]>(`/coins/messages?surfaceType=${encodeURIComponent(surfaceType)}&surfaceId=${encodeURIComponent(surfaceId)}`),
    ]).then(([balanceResponse, messagesResponse]) => {
      if (cancelled) return;
      setBalance(Number(balanceResponse.data?.balance || 0));
      setMessages(messagesResponse.data || []);
    }).catch(() => { if (!cancelled) { setBalance(null); setMessages([]); } }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [surfaceId, surfaceType]);

  const send = async () => {
    if (!text.trim() || sending || balance === null) return;
    if (balance < coins) {
      window.alert(`You need ${coins.toLocaleString()} Coins, but your balance is ${balance.toLocaleString()}.`);
      return;
    }
    setSending(true);
    try {
      const result = await PostApi.sendCoinComment(surfaceId, surfaceType, text.trim(), coins);
      if (!result.data) throw new Error('Coin message was not accepted by the server.');
      const next = [result.data, ...messages];
      setMessages(next);
      if (result.data.coinAmount !== undefined) setBalance((value) => value === null ? null : Math.max(0, value - coins));
      setText('');
      onSent?.(result.data);
    } catch (error: any) {
      window.alert(error?.message || 'Coin message could not be sent. No balance was changed unless the server accepted the transaction.');
    } finally {
      setSending(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await apiClient.request(`/coins/messages/${encodeURIComponent(id)}/read`, { method: 'PATCH', body: JSON.stringify({ read: true }) });
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isReadByOwner: true } : m));
    } catch {
      window.alert('Coin message could not be marked as read.');
    }
  };

  return (
    <section className="ev-coin-message-box" aria-label="Everything Coins message">
      <div className="ev-coin-message-head">
        <div>
          <b><Coins size={15} /> Coin message</b>
          <span>Pay coins with your message. It is automatically pinned/highlighted so the {surfaceType} owner can see it.</span>
        </div>
        <strong>{balance === null ? 'Loading…' : `${balance.toLocaleString()} Coins`} · {unread} unread</strong>
      </div>
      <div className="ev-coin-pack-row" role="radiogroup" aria-label="Coin amount">
        {packs.map((amount) => (
          <button key={amount} type="button" className={coins === amount ? 'active' : ''} onClick={() => setCoins(amount)} role="radio" aria-checked={coins === amount}>
            <Coins size={13} /> {amount}
          </button>
        ))}
      </div>
      <div className="ev-coin-balance-line">Available balance: <b>{balance === null ? 'Loading…' : `${balance.toLocaleString()} Coins`}</b></div>
      <div className="ev-coin-message-compose">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={240} placeholder={`Say something to the ${surfaceType} owner…`} aria-label="Coin message" />
        <button type="button" onClick={send} disabled={!text.trim() || sending} aria-label={`Send message with ${coins} coins`}>
          <Send size={15} /> {sending ? 'Sending…' : `Send · ${coins}`}
        </button>
      </div>
      <div className="ev-coin-message-list">
        {loading && <div className="ev-coin-empty">Loading coin messages from the server…</div>}
        {!loading && messages.length === 0 && <div className="ev-coin-empty">No coin messages yet. A paid message will appear here pinned for the owner.</div>}
        {isOwner && messages.map((message) => (
          <div key={message.id} className={`ev-coin-message-item ${message.isReadByOwner ? 'read' : 'unread'}`}>
            <div className="ev-coin-message-meta"><span><Pin size={12} /> Pinned coin message</span><b>{message.coinAmount} Coins</b></div>
            <p>{message.content}</p>
            <small>@{message.author.username} · {message.isReadByOwner ? 'Read' : 'Unread'}</small>
            {!message.isReadByOwner && <button type="button" onClick={() => markRead(message.id)}><CheckCircle2 size={13} /> Mark read</button>}
          </div>
        ))}
        {!isOwner && messages.length > 0 && <div className="ev-coin-owner-note"><Pin size={13} /> Your coin message is pinned/highlighted in the owner’s inbox.</div>}
      </div>
    </section>
  );
}
