import { useEffect, useState, useCallback } from 'react';
import { supabase, Message, ActiveUser } from '../lib/supabase';

export function useChatRoom(roomId: string, username: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionId] = useState(() => crypto.randomUUID());

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  }, [roomId]);

  const loadActiveUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('active_users')
      .select('*')
      .eq('room_id', roomId);

    if (error) {
      console.error('Error loading active users:', error);
      return;
    }

    setActiveUsers(data || []);
  }, [roomId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Create optimistic message for immediate UI update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      room_id: roomId,
      username,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage]);

    // Send to database
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          room_id: roomId,
          username,
          content: content.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      // Show error to user (you can add a toast notification here if needed)
      alert(`Failed to send message: ${error.message}`);
      return;
    }

    // Replace optimistic message with real message from database
    if (data) {
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === optimisticMessage.id ? (data as Message) : msg
        )
      );
    }
  }, [roomId, username]);

  const updatePresence = useCallback(async () => {
    const { error } = await supabase
      .from('active_users')
      .upsert(
        {
          connection_id: connectionId,
          room_id: roomId,
          username,
          last_seen: new Date().toISOString(),
        },
        { onConflict: 'connection_id' }
      );

    if (error) {
      console.error('Error updating presence:', error);
    }
  }, [roomId, username, connectionId]);

  const removePresence = useCallback(async () => {
    await supabase
      .from('active_users')
      .delete()
      .eq('connection_id', connectionId);
  }, [connectionId]);

  useEffect(() => {
    setIsLoading(true);
    // Run all initial data loads in parallel for faster rendering
    Promise.all([
      loadMessages(),
      loadActiveUsers(),
      updatePresence(),
    ]).finally(() => {
      setIsLoading(false);
    });

    const presenceInterval = setInterval(updatePresence, 5000);

    const messagesChannel = supabase
      .channel(`messages:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Only add if message doesn't already exist (avoid duplicates from optimistic updates)
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) {
              // Update existing message (in case optimistic message needs to be replaced)
              return prev.map((msg) => 
                msg.id === newMessage.id ? newMessage : msg
              );
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    const usersChannel = supabase
      .channel(`active_users:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_users',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadActiveUsers();
        }
      )
      .subscribe();

    const cleanupInterval = setInterval(async () => {
      const fiveSecondsAgo = new Date(Date.now() - 10000).toISOString();
      await supabase
        .from('active_users')
        .delete()
        .lt('last_seen', fiveSecondsAgo);
    }, 10000);

    return () => {
      clearInterval(presenceInterval);
      clearInterval(cleanupInterval);
      removePresence();
      messagesChannel.unsubscribe();
      usersChannel.unsubscribe();
    };
  }, [roomId, username, connectionId, loadMessages, loadActiveUsers, updatePresence, removePresence]);

  return {
    messages,
    activeUsers,
    sendMessage,
    isLoading,
  };
}
