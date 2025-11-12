import { useEffect, useState, useCallback } from 'react';
import { supabase, Message, ActiveUser } from '../lib/supabase';

export function useChatRoom(roomId: string, username: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [allUsers, setAllUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [connectionId] = useState(() => crypto.randomUUID());

  const loadMessages = useCallback(async () => {
    // Load all messages without limit to show complete history
    // Supabase default limit is 1000, but we'll load in batches if needed
    let allMessages: Message[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .range(from, from + batchSize - 1);

      if (error) {
        console.error('Error loading messages:', error);
        break;
      }

      if (data && data.length > 0) {
        allMessages = [...allMessages, ...data];
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    setMessages(allMessages);
    
    // Extract all unique usernames from messages and merge with existing users
    // This ensures we don't lose users when messages refresh
    if (allMessages.length > 0) {
      setAllUsers((prev) => {
        const updated = new Set(prev);
        allMessages.forEach((msg) => {
          updated.add(msg.username);
        });
        return updated;
      });
    }
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
    
    // Also add active users to allUsers to ensure they're permanently visible
    // This captures users who joined but haven't sent messages yet
    if (data) {
      setAllUsers((prev) => {
        const updated = new Set(prev);
        data.forEach((user) => {
          updated.add(user.username);
        });
        return updated;
      });
    }
  }, [roomId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Create optimistic message for immediate UI update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}-${Math.random()}`,
      room_id: roomId,
      username,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    // Add optimistic message immediately for instant feedback
    setMessages((prev) => [...prev, optimisticMessage]);
    
    // Add user to allUsers set
    setAllUsers((prev) => {
      const updated = new Set(prev);
      updated.add(username);
      return updated;
    });

    // Send to database - real-time subscription will handle the update
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
      alert(`Failed to send message: ${error.message}`);
      return;
    }

    // Real-time subscription will add the message automatically
    // But we can also replace optimistic message immediately if real-time is slow
    if (data) {
      setMessages((prev) => {
        // Check if real-time already added it
        const realTimeAdded = prev.some((msg) => msg.id === data.id && msg.id !== optimisticMessage.id);
        if (realTimeAdded) {
          // Real-time already added it, just remove optimistic
          return prev.filter((msg) => msg.id !== optimisticMessage.id);
        }
        // Replace optimistic with real message
        return prev.map((msg) => 
          msg.id === optimisticMessage.id ? (data as Message) : msg
        );
      });
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
    // Initialize allUsers with current user to ensure they're always visible
    // This prevents the sidebar from being blank
    setAllUsers((prev) => {
      const updated = new Set(prev);
      updated.add(username);
      return updated;
    });
    
    // Run all initial data loads in parallel for faster rendering
    Promise.all([
      loadMessages(),
      loadActiveUsers(),
      updatePresence(),
    ]).finally(() => {
      setIsLoading(false);
    });
    
    // Ensure current user stays in the list even after data loads
    // This prevents the list from becoming empty during refreshes
    const ensureUserInterval = setInterval(() => {
      setAllUsers((prev) => {
        if (!prev.has(username)) {
          const updated = new Set(prev);
          updated.add(username);
          return updated;
        }
        return prev;
      });
    }, 1000); // Check every second to ensure user is always present

    // Real-time subscription handles all message updates
    // No need for periodic refresh - messages appear instantly via Supabase Realtime

    const presenceInterval = setInterval(updatePresence, 5000);

    // Set up real-time subscription for instant message updates
    const messagesChannel = supabase
      .channel(`messages:${roomId}`, {
        config: {
          broadcast: { self: true },
        },
      })
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
          console.log('Real-time message received:', newMessage);
          
          // Add message instantly via real-time (no loading needed)
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) {
              // Update existing message (in case optimistic message needs to be replaced)
              return prev.map((msg) => 
                msg.id === newMessage.id ? newMessage : msg
              );
            }
            // Add new message immediately
            return [...prev, newMessage];
          });
          
          // Add new user to allUsers set if they sent a message
          setAllUsers((prev) => {
            const updated = new Set(prev);
            updated.add(newMessage.username);
            return updated;
          });
        }
      )
      .subscribe((status) => {
        console.log('Messages channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time messages subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time messages subscription error');
        }
      });

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
      clearInterval(ensureUserInterval);
      removePresence();
      messagesChannel.unsubscribe();
      usersChannel.unsubscribe();
    };
  }, [roomId, username, connectionId, loadMessages, loadActiveUsers, updatePresence, removePresence]);

  return {
    messages,
    activeUsers,
    allUsers: Array.from(allUsers), // Convert Set to Array for easier use
    sendMessage,
    isLoading,
  };
}
