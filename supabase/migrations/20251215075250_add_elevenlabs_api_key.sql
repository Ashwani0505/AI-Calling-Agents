/*
  # Add ElevenLabs API key field

  1. Changes
    - Add `elevenlabs_api_key` column to `agents` table
    - This field stores the ElevenLabs API key for authentication
    
  2. Notes
    - API key is required for Conversational AI authentication
    - Users should use their ElevenLabs API key from the dashboard
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'elevenlabs_api_key'
  ) THEN
    ALTER TABLE agents ADD COLUMN elevenlabs_api_key text NOT NULL DEFAULT '';
  END IF;
END $$;