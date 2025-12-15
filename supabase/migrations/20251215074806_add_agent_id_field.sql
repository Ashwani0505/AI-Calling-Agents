/*
  # Add agent_id field to agents table

  1. Changes
    - Rename `embedding_code` column to `elevenlabs_agent_id` for clarity
    - This field now stores just the ElevenLabs agent ID (not the full embedding code)
    
  2. Notes
    - Existing data will be preserved
    - Users will need to update their agents with the actual agent ID from ElevenLabs
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'embedding_code'
  ) THEN
    ALTER TABLE agents RENAME COLUMN embedding_code TO elevenlabs_agent_id;
  END IF;
END $$;