import { useState, useEffect } from 'react';
import { Plus, Hash, Users, ArrowRight, Loader2 } from 'lucide-react';
import { supabase, ChatRoom } from '../lib/supabase';

interface RoomSelectionProps {
  username: string;
  onRoomSelect: (roomId: string, roomName: string) => void;
}

export function RoomSelection({ username, onRoomSelect }: RoomSelectionProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) {
        console.error('Error loading rooms:', fetchError);
        // Don't show blocking error, just log it and show empty state
        setRooms([]);
      } else {
        setRooms(data || []);
      }
    } catch (err) {
      console.error('Unexpected error loading rooms:', err);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const { data, error: createError } = await supabase
        .from('chat_rooms')
        .insert([{ name: newRoomName.trim(), created_by: username }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating room:', createError);
        setError('Failed to create room. Please check your Supabase configuration and try again.');
        setIsCreating(false);
        return;
      }

      if (data) {
        onRoomSelect(data.id, data.name);
      }
    } catch (err) {
      console.error('Unexpected error creating room:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (room: ChatRoom) => {
    onRoomSelect(room.id, room.name);
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '600px' }}>
        <div className="login-header">
          <Hash className="login-icon" />
          <h1 className="login-title">Select a Chat Room</h1>
          <p className="login-subtitle">
            Welcome, <span style={{ color: '#3b82f6', fontWeight: 600 }}>{username}</span>! Choose a room to join or create a new one.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#ef4444',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {!showCreateForm ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                onClick={() => setShowCreateForm(true)}
                className="login-button"
                style={{ width: '100%', marginBottom: '1.5rem' }}
              >
                <Plus style={{ width: '20px', height: '20px', marginRight: '0.5rem' }} />
                Create New Room
              </button>
            </div>

            <div>
              <h3 style={{ 
                color: '#ffffff', 
                fontSize: '1rem', 
                fontWeight: 600, 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Users style={{ width: '18px', height: '18px' }} />
                Existing Rooms
              </h3>

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Loader2 className="loading-spinner" style={{ margin: '0 auto', width: '48px', height: '48px', color: '#3b82f6' }} />
                  <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Loading rooms...</p>
                </div>
              ) : rooms.length === 0 ? (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                }}>
                  <p>No rooms available. Create one to get started!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleJoinRoom(room)}
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        color: '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        alignItems: 'center',
                        gap: '1rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                          {room.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Created by {room.created_by}
                        </div>
                      </div>
                      <ArrowRight style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleCreateRoom} className="login-form">
            <div className="input-group">
              <Hash className="input-icon" />
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
                className="username-input"
                autoFocus
                maxLength={50}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewRoomName('');
                  setError(null);
                }}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="login-button"
                disabled={!newRoomName.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </form>
        )}

        <div className="login-footer">
          <p className="footer-text">
            Share your ngrok URL to let others join your chat rooms
          </p>
        </div>
      </div>
    </div>
  );
}

