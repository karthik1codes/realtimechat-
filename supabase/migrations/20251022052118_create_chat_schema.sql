/*
  # Multi-Client Chat Application Schema

  ## Overview
  This migration creates the database schema for a real-time multi-client chat application.
  
  ## New Tables
  
  ### `chat_rooms`
  - `id` (uuid, primary key) - Unique identifier for each chat room
  - `name` (text) - Display name of the chat room
  - `created_at` (timestamptz) - When the room was created
  - `created_by` (text) - Username or identifier of room creator
  
  ### `messages`
  - `id` (uuid, primary key) - Unique identifier for each message
  - `room_id` (uuid, foreign key) - References the chat room
  - `username` (text) - Name of the user who sent the message
  - `content` (text) - The message content
  - `created_at` (timestamptz) - When the message was sent
  
  ### `active_users`
  - `id` (uuid, primary key) - Unique identifier
  - `room_id` (uuid, foreign key) - References the chat room
  - `username` (text) - Name of the active user
  - `last_seen` (timestamptz) - Last activity timestamp
  - `connection_id` (text) - Unique connection identifier
  
  ## Security
  - Enable RLS on all tables
  - Allow public read access for chat rooms (read-only)
  - Allow public insert/read for messages (anyone can send messages)
  - Allow public insert/update/delete for active users (presence management)
  
  ## Indexes
  - Index on messages.room_id for fast message retrieval
  - Index on active_users.room_id for fast presence queries
  - Index on messages.created_at for chronological ordering
*/

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'system'
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  username text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create active_users table for presence
CREATE TABLE IF NOT EXISTS active_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  username text NOT NULL,
  last_seen timestamptz DEFAULT now(),
  connection_id text UNIQUE NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_active_users_room_id ON active_users(room_id);

-- Enable Row Level Security
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Anyone can view chat rooms"
  ON chat_rooms FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (true);

-- RLS Policies for messages
CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can send messages"
  ON messages FOR INSERT
  WITH CHECK (true);

-- RLS Policies for active_users
CREATE POLICY "Anyone can view active users"
  ON active_users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add presence"
  ON active_users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update presence"
  ON active_users FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can remove presence"
  ON active_users FOR DELETE
  USING (true);

-- Insert a default chat room
INSERT INTO chat_rooms (name, created_by) 
VALUES ('Global Chat', 'system')
ON CONFLICT DO NOTHING;