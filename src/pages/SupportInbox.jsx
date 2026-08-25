import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../constants';
import { Users, MessageSquare, Wifi, WifiOff, Clock, AlertCircle, Send, RefreshCw, CheckCircle } from 'lucide-react';
import io from 'socket.io-client';

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const QueuePanel = ({ queue }) => (
  <div style={styles.panel}>
    <div style={styles.panelHeader}>
      <Clock size={16} />
      <span>Queue ({queue.length} waiting)</span>
    </div>
    <div style={styles.panelBody}>
      {queue.length === 0 ? (
        <p style={styles.emptyText}>No users waiting</p>
      ) : (
        queue.map((entry, i) => (
          <div key={entry.entryId} style={styles.queueItem}>
            <span style={styles.queueBadge}>#{i + 1}</span>
            <div>
              <div style={styles.queueName}>{entry.phone || entry.userId}</div>
              <div style={styles.queueTime}>
                {new Date(entry.enqueuedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const SessionList = ({ sessions, selectedId, onSelect }) => (
  <div style={styles.panel}>
    <div style={styles.panelHeader}>
      <MessageSquare size={16} />
      <span>Active Sessions ({sessions.length})</span>
    </div>
    <div style={styles.panelBody}>
      {sessions.length === 0 ? (
        <p style={styles.emptyText}>No active sessions</p>
      ) : (
        sessions.map(s => (
          <div
            key={s.id}
            style={{
              ...styles.sessionItem,
              ...(selectedId === s.id ? styles.sessionItemActive : {})
            }}
            onClick={() => onSelect(s)}
          >
            <div style={styles.sessionTop}>
              <span style={styles.sessionName}>
                {s.userName || s.phone || s.userId?.slice(0, 8)}
              </span>
              {s.type === 'dispute' && (
                <span style={styles.disputeBadge}>🔴 DISPUTE</span>
              )}
            </div>
            <p style={styles.sessionPreview}>{s.lastMessage || '—'}</p>
          </div>
        ))
      )}
    </div>
  </div>
);

const ChatPanel = ({ session, messages, onSendMessage, onCloseSession, onSettleDispute, token }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await onSendMessage(text.trim());
    setText('');
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!session) {
    return (
      <div style={{ ...styles.panel, flex: 1, justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MessageSquare size={48} style={{ opacity: 0.2 }} />
        <p style={styles.emptyText}>Select a session to start chatting</p>
      </div>
    );
  }

  return (
    <div style={{ ...styles.panel, flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <div style={styles.chatHeader}>
        <div>
          <div style={{ fontWeight: 600 }}>
            {session.type === 'dispute' ? '🔴 Dispute' : '💬 Support'} — {session.userName || session.phone || session.userId?.slice(0, 8)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {session.type === 'dispute' ? 'Buyer + Seller + You (Admin)' : 'User + You (Admin)'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {session.type === 'dispute' ? (
            <button style={styles.dangerBtn} onClick={() => onSettleDispute(session)}>
              <CheckCircle size={14} /> Settle Dispute
            </button>
          ) : (
            <button style={styles.closeBtn} onClick={() => onCloseSession(session)}>
              Close Session
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messagesArea}>
        {messages.length === 0 && (
          <p style={{ ...styles.emptyText, textAlign: 'center', paddingTop: 40 }}>No messages yet</p>
        )}
        {messages.map((m, i) => {
          const isAdmin = m.senderType === 'admin' || m.senderId === user?.adminId;
          return (
            <div key={m.messageId || i} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
              <div style={isAdmin ? styles.bubbleAdmin : styles.bubbleUser}>
                {!isAdmin && (
                  <div style={styles.senderName}>{m.senderName || m.senderId?.slice(0, 8)}</div>
                )}
                {m.image && <img src={m.image} alt="attachment" style={{ maxWidth: 200, borderRadius: 8, marginBottom: 4 }} />}
                {m.message && <div>{m.message}</div>}
                <div style={styles.timestamp}>{new Date(m.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          style={styles.textarea}
          rows={2}
          disabled={session.status === 'closed'}
        />
        <button style={styles.sendBtn} onClick={handleSend} disabled={!text.trim() || sending || session.status === 'closed'}>
          {sending ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main SupportInbox Page
// ─────────────────────────────────────────────

const SupportInbox = () => {
  const { token, user } = useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(false);
  const [queue, setQueue] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const socketRef = useRef(null);

  // ── Fetch initial data ──────────────────────────
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/support/queue`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setQueue(await res.json());
    } catch (e) { console.error(e); }
  }, [token]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/support/sessions`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setSessions(await res.json());
    } catch (e) { console.error(e); }
  }, [token]);

  const fetchMessages = useCallback(async (sessionId) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/support/sessions/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) { console.error(e); }
    setLoadingMessages(false);
  }, [token]);

  // ── Socket.IO ───────────────────────────────────
  useEffect(() => {
    const socket = io(BASE_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => console.log('Admin socket connected'));

    // New dispute notification from escrow
    socket.on('new_dispute_session', () => {
      fetchSessions();
    });

    // New support session from queue engine
    socket.on('new_support_session', () => {
      fetchSessions();
      fetchQueue();
    });

    // Live messages in selected session
    socket.on('new_message', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m.messageId === msg.messageId)) return prev;
        return [...prev, msg];
      });
      // Update session list preview
      setSessions(prev => prev.map(s =>
        s.id === msg.conversationId ? { ...s, lastMessage: msg.message || '📷 Image' } : s
      ));
    });

    return () => socket.disconnect();
  }, [token, fetchSessions, fetchQueue]);

  // Initial data load
  useEffect(() => {
    fetchQueue();
    fetchSessions();
    // Poll queue every 30s
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue, fetchSessions]);

  // ── Session selection ───────────────────────────
  const handleSelectSession = async (session) => {
    setSelectedSession(session);
    await fetchMessages(session.id);

    // Join socket room
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', { conversationId: session.id });
      socketRef.current.emit('join_support', { sessionId: session.id });
    }
  };

  // ── Agent status toggle ─────────────────────────
  const toggleOnlineStatus = async () => {
    const next = !isOnline;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/support/agent/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: next })
      });
      if (res.ok) setIsOnline(next);
    } catch (e) { console.error(e); }
  };

  // ── Send message ────────────────────────────────
  const handleSendMessage = async (text) => {
    if (!selectedSession) return;
    try {
      await fetch(`${BASE_URL}/api/admin/support/sessions/${selectedSession.id}/reply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
    } catch (e) { console.error(e); }
  };

  // ── Close session ───────────────────────────────
  const handleCloseSession = async (session) => {
    if (!window.confirm('Close this support session?')) return;
    try {
      await fetch(`${BASE_URL}/api/admin/support/sessions/${session.id}/close`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedSession(null);
      setMessages([]);
      fetchSessions();
      fetchQueue();
    } catch (e) { console.error(e); }
  };

  // ── Settle dispute ──────────────────────────────
  const handleSettleDispute = async (session) => {
    if (!window.confirm('Settle and resolve this dispute? This will lock the chat permanently.')) return;
    try {
      // We settle by updating the escrow status via the standard escrow route
      await fetch(`${BASE_URL}/escrows/${session.escrowId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      });
      setSelectedSession(null);
      setMessages([]);
      fetchSessions();
    } catch (e) { console.error(e); }
  };

  // ── Handle beforeunload ─────────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isOnline) {
        navigator.sendBeacon(
          `${BASE_URL}/api/admin/support/agent/status`,
          JSON.stringify({ isOnline: false })
        );
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOnline]);

  // ─────────────────────────────────────────────
  return (
    <div>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Support Inbox</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage live support chats and escrow disputes
          </p>
        </div>
        <button
          id="agent-status-toggle"
          onClick={toggleOnlineStatus}
          style={isOnline ? styles.onlineBtn : styles.offlineBtn}
        >
          {isOnline ? <><Wifi size={16} /> Go Offline</> : <><WifiOff size={16} /> Go Online</>}
        </button>
      </div>

      {!isOnline && (
        <div style={styles.offlineBanner}>
          <AlertCircle size={16} />
          <span>You are <strong>offline</strong>. Toggle "Go Online" to start receiving support sessions from the queue.</span>
        </div>
      )}

      {/* 3-Panel Layout */}
      <div style={styles.inboxLayout}>
        <QueuePanel queue={queue} />
        <SessionList
          sessions={sessions}
          selectedId={selectedSession?.id}
          onSelect={handleSelectSession}
        />
        <ChatPanel
          session={selectedSession}
          messages={messages}
          onSendMessage={handleSendMessage}
          onCloseSession={handleCloseSession}
          onSettleDispute={handleSettleDispute}
          token={token}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  onlineBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: '#ef4444', color: '#fff', fontWeight: 600, fontSize: '0.875rem',
  },
  offlineBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: '#22c55e', color: '#fff', fontWeight: 600, fontSize: '0.875rem',
  },
  offlineBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
    color: '#f59e0b', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: '0.875rem',
  },
  inboxLayout: {
    display: 'grid',
    gridTemplateColumns: '220px 260px 1fr',
    gap: 12,
    height: 'calc(100vh - 220px)',
    minHeight: 500,
  },
  panel: {
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    fontWeight: 600, fontSize: '0.875rem',
    background: 'var(--sidebar-bg)',
  },
  panelBody: {
    flex: 1, overflowY: 'auto', padding: '8px 0',
  },
  emptyText: {
    color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', padding: '24px 16px',
  },
  queueItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px',
    borderBottom: '1px solid var(--border-color)',
  },
  queueBadge: {
    background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
    fontWeight: 700, fontSize: '0.75rem', borderRadius: 6, padding: '2px 7px',
    flexShrink: 0,
  },
  queueName: { fontWeight: 500, fontSize: '0.82rem' },
  queueTime: { fontSize: '0.72rem', color: 'var(--text-secondary)' },
  sessionItem: {
    padding: '12px 14px',
    borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  sessionItemActive: {
    background: 'rgba(99,102,241,0.12)',
    borderLeft: '3px solid #6366f1',
  },
  sessionTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sessionName: { fontWeight: 600, fontSize: '0.875rem' },
  disputeBadge: { fontSize: '0.7rem', fontWeight: 700, color: '#ef4444' },
  sessionPreview: { fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 },
  chatHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
    background: 'var(--sidebar-bg)',
  },
  dangerBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#22c55e', color: '#fff', border: 'none',
    borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
  },
  closeBtn: {
    background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
  },
  messagesArea: {
    flex: 1, overflowY: 'auto', padding: '16px',
    display: 'flex', flexDirection: 'column',
  },
  senderName: { fontSize: '0.7rem', fontWeight: 600, marginBottom: 3, opacity: 0.7 },
  bubbleUser: {
    background: 'var(--sidebar-bg)', border: '1px solid var(--border-color)',
    borderRadius: '4px 12px 12px 12px',
    padding: '8px 12px', maxWidth: '70%', fontSize: '0.875rem',
  },
  bubbleAdmin: {
    background: '#6366f1', color: '#fff',
    borderRadius: '12px 4px 12px 12px',
    padding: '8px 12px', maxWidth: '70%', fontSize: '0.875rem',
  },
  timestamp: { fontSize: '0.68rem', opacity: 0.6, marginTop: 4, textAlign: 'right' },
  inputArea: {
    display: 'flex', gap: 8, padding: '12px 16px',
    borderTop: '1px solid var(--border-color)',
  },
  textarea: {
    flex: 1, resize: 'none',
    background: 'var(--sidebar-bg)', color: 'var(--text-primary)',
    border: '1px solid var(--border-color)', borderRadius: 8,
    padding: '8px 12px', fontSize: '0.875rem', fontFamily: 'inherit',
  },
  sendBtn: {
    background: '#6366f1', color: '#fff', border: 'none',
    borderRadius: 8, padding: '0 16px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
};

export default SupportInbox;
