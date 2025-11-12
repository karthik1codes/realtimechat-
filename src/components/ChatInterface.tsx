import { useState, useEffect, useRef } from 'react';
import { Send, Users, Wifi, Globe, LogOut, ArrowDown } from 'lucide-react';
import { useChatRoom } from '../hooks/useChatRoom';

interface ChatInterfaceProps {
  username: string;
  roomId: string;
  roomName: string;
  onLogout?: () => void;
}

export function ChatInterface({ username, roomId, roomName, onLogout }: ChatInterfaceProps) {
  const [messageInput, setMessageInput] = useState('');
  const { messages, activeUsers, allUsers, sendMessage, isLoading } = useChatRoom(roomId, username);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const previousMessagesLength = useRef(0);
  
  // Get list of active usernames for quick lookup
  const activeUsernames = new Set(activeUsers.map(u => u.username));

  const scrollToBottom = (force = false) => {
    if (force || shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check if user is near bottom of scroll container
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 200; // pixels from bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  // Handle scroll events to detect if user scrolled up
  const handleScroll = () => {
    const nearBottom = isNearBottom();
    // Only update auto-scroll if user is actively scrolling
    // This prevents interference with manual scrolling
    setShouldAutoScroll(nearBottom);
    setShowScrollButton(!nearBottom && messages.length > 0);
  };

  useEffect(() => {
    // Only auto-scroll on initial load when messages first appear
    const isInitialLoad = previousMessagesLength.current === 0 && messages.length > 0;
    
    if (isInitialLoad) {
      // Small delay to ensure DOM is updated, then scroll to bottom
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
        setShouldAutoScroll(true);
      }, 500);
    } else {
      // For new messages, only auto-scroll if user is near bottom
      const isNewMessage = messages.length > previousMessagesLength.current;
      if (isNewMessage && shouldAutoScroll && isNearBottom()) {
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    }
    
    previousMessagesLength.current = messages.length;
  }, [messages.length, shouldAutoScroll]);

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
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
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
        <div className="messages-panel" style={{ position: 'relative' }}>
          <div 
            className="messages-container"
            ref={messagesContainerRef}
            onScroll={handleScroll}
          >
            {isLoading && messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p>Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
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
            ))}
            {messages.length > 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '0.5rem', 
                color: '#64748b', 
                fontSize: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                marginTop: '1rem'
              }}>
                {messages.length} message{messages.length !== 1 ? 's' : ''} loaded • Scroll to view all
              </div>
            )}
            </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showScrollButton && (
            <button
              onClick={() => {
                setShouldAutoScroll(true);
                scrollToBottom(true);
                setShowScrollButton(false);
              }}
              style={{
                position: 'absolute',
                bottom: '100px',
                right: '2rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }}
              title="Scroll to bottom"
            >
              <ArrowDown style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </button>
          )}

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
            <h2>Members ({Math.max(allUsers.length, 1)})</h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              {activeUsers.length} online
            </p>
          </div>
          <div className="users-list">
            {(() => {
              // Ensure current user is always in the list, even if allUsers is empty
              const displayUsers = allUsers.length > 0 
                ? allUsers 
                : [username];
              
              // Remove duplicates and ensure current user is included
              const uniqueUsers = Array.from(new Set([...displayUsers, username]));
              
              return uniqueUsers
                .sort((a, b) => {
                  // Sort: online users first, then alphabetically
                  const aOnline = activeUsernames.has(a);
                  const bOnline = activeUsernames.has(b);
                  if (aOnline && !bOnline) return -1;
                  if (!aOnline && bOnline) return 1;
                  return a.localeCompare(b);
                })
                .map((user) => {
                  const isOnline = activeUsernames.has(user);
                  const isCurrentUser = user === username;
                  return (
                    <div key={user} className="user-item">
                      <div 
                        className="user-status-indicator" 
                        style={{
                          background: isOnline ? '#10b981' : '#64748b',
                          boxShadow: isOnline ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none',
                        }}
                      ></div>
                      <span className={isCurrentUser ? 'user-name-own' : 'user-name'}>
                        {user}
                        {isCurrentUser && ' (you)'}
                        {!isOnline && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: '#64748b', 
                            marginLeft: '0.5rem',
                            fontStyle: 'italic'
                          }}>
                            offline
                          </span>
                        )}
                      </span>
                    </div>
                  );
                });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
