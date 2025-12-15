/*
  # Voice Agents Management Schema

  1. New Tables
    - `agents`
      - `id` (uuid, primary key) - Unique identifier for each agent
      - `name` (text) - User-defined name for the agent
      - `embedding_code` (text) - ElevenLabs embedding code
      - `created_at` (timestamptz) - Timestamp when agent was created
      - `updated_at` (timestamptz) - Timestamp when agent was last updated
    
    - `conversations`
      - `id` (uuid, primary key) - Unique identifier for each conversation
      - `agent_id` (uuid, foreign key) - Reference to the agent
      - `started_at` (timestamptz) - When conversation started
      - `ended_at` (timestamptz, nullable) - When conversation ended
      - `sentiment` (text, nullable) - Overall sentiment (positive/negative/neutral)
      - `summary` (text, nullable) - Key information summary
      - `status` (text) - Conversation status (active/completed)
    
    - `messages`
      - `id` (uuid, primary key) - Unique identifier for each message
      - `conversation_id` (uuid, foreign key) - Reference to the conversation
      - `role` (text) - Who sent the message (user/agent)
      - `content` (text) - Message content
      - `timestamp` (timestamptz) - When message was sent

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since no auth is mentioned)
*/

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  embedding_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  sentiment text,
  summary text,
  status text DEFAULT 'active' NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Public can view agents"
  ON agents FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert agents"
  ON agents FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update agents"
  ON agents FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete agents"
  ON agents FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can view conversations"
  ON conversations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert conversations"
  ON conversations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update conversations"
  ON conversations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete conversations"
  ON conversations FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can view messages"
  ON messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert messages"
  ON messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update messages"
  ON messages FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete messages"
  ON messages FOR DELETE
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);