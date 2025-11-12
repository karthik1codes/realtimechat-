import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RoomSelection } from './components/RoomSelection';
import { ChatInterface } from './components/ChatInterface';

// LocalStorage keys
const STORAGE_KEYS = {
  USERNAME: 'chat_username',
  ROOM_ID: 'chat_room_id',
  ROOM_NAME: 'chat_room_name',
};

function App() {
  // Load persisted state from localStorage on mount
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.USERNAME);
  });
  const [roomId, setRoomId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ROOM_ID) || '';
  });
  const [roomName, setRoomName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ROOM_NAME) || '';
  });

  // Persist username to localStorage
  useEffect(() => {
    if (username) {
      localStorage.setItem(STORAGE_KEYS.USERNAME, username);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USERNAME);
    }
  }, [username]);

  // Persist room selection to localStorage
  useEffect(() => {
    if (roomId && roomName) {
      localStorage.setItem(STORAGE_KEYS.ROOM_ID, roomId);
      localStorage.setItem(STORAGE_KEYS.ROOM_NAME, roomName);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
      localStorage.removeItem(STORAGE_KEYS.ROOM_NAME);
    }
  }, [roomId, roomName]);

  const handleLogin = (user: string) => {
    setUsername(user);
  };

  const handleRoomSelect = (id: string, name: string) => {
    setRoomId(id);
    setRoomName(name);
  };

  const handleLogout = () => {
    setUsername(null);
    setRoomId('');
    setRoomName('');
    localStorage.clear();
  };

  // Show login screen if no username
  if (!username) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Show room selection if no room selected
  if (!roomId) {
    return <RoomSelection username={username} onRoomSelect={handleRoomSelect} />;
  }

  // Show chat interface
  return <ChatInterface username={username} roomId={roomId} roomName={roomName} onLogout={handleLogout} />;
}

export default App;
