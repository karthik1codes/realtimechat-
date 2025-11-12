import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { RoomSelection } from './components/RoomSelection';
import { ChatInterface } from './components/ChatInterface';

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');

  const handleLogin = (user: string) => {
    setUsername(user);
  };

  const handleRoomSelect = (id: string, name: string) => {
    setRoomId(id);
    setRoomName(name);
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
  return <ChatInterface username={username} roomId={roomId} roomName={roomName} />;
}

export default App;
