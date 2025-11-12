import { useState } from 'react';
import { MessageSquare, User } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <MessageSquare className="login-icon" />
          <h1 className="login-title">Multi-Client Chat</h1>
          <p className="login-subtitle">Connect with users worldwide in real-time</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <User className="input-icon" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="username-input"
              autoFocus
              maxLength={20}
            />
          </div>
          <button type="submit" className="login-button" disabled={!username.trim()}>
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
