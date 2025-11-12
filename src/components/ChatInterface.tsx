import { useState, useEffect, useRef } from 'react';
import { Send, Users, Wifi, Globe, LogOut } from 'lucide-react';
import { useChatRoom } from '../hooks/useChatRoom';

interface ChatInterfaceProps {
  username: string;
  roomId: string;
  roomName: string;
  onLogout?: () => void;
}

export function ChatInterface({ username, roomId, roomName, onLogout }: ChatInterfaceProps) {
  const [messageInput, setMessageInput] = useState('');
  const { messages, activeUsers, sendMessage, isLoading } = useChatRoom(roomId, username);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageToSend = messageInput.trim();
    if (messageToSend) {
      setMessageInput(''); // Clear input immediately for better UX
      await sendMessage(messageToSend);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-info">
          <Globe className="header-icon" />
          <div>
            <h1 className="room-name">{roomName}</h1>
            <p className="connection-status">
              <Wifi className="status-icon" />
              Connected as <span className="username-highlight">{username}</span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="active-users-badge">
            <Users className="users-icon" />
            <span>{activeUsers.length} online</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '0.75rem 1.25rem',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} />
              Logout
            </button>
          )}
        </div>
      </div>

      <div className="chat-grid">
        <div className="messages-panel">
          <div className="messages-container">
            {isLoading && messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p>Loading messages...</p>
              </div>
            ) : (
              messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.username === username ? 'message-own' : 'message-other'}`}
              >
                <div className="message-header">
                  <span className="message-username">{message.username}</span>
                  <span className="message-time">{formatTime(message.created_at)}</span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="message-input-form">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
            />
            <button type="submit" className="send-button" disabled={!messageInput.trim()}>
              <Send className="send-icon" />
            </button>
          </form>
        </div>

        <div className="sidebar">
          <div className="sidebar-header">
            <Users className="sidebar-icon" />
            <h2>Active Users</h2>
          </div>
          <div className="users-list">
            {activeUsers.map((user) => (
              <div key={user.id} className="user-item">
                <div className="user-status-indicator"></div>
                <span className={user.username === username ? 'user-name-own' : 'user-name'}>
                  {user.username}
                  {user.username === username && ' (you)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
