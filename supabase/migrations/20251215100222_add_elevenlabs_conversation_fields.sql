/*
  # Add ElevenLabs conversation analysis fields

  1. Changes to `conversations` table
    - Add `elevenlabs_conversation_id` field to store the ElevenLabs conversation ID
    - Add `call_successful` field for success evaluation
    - Add `call_summary_title` field for call title
    - Add `evaluation_criteria_results` field for performance metrics (JSONB)
    - Add `data_collection_results` field for extracted data (JSONB)
    - Add `analysis_fetched_at` timestamp to track when analysis was last fetched

  2. Notes
    - These fields allow us to fetch and store detailed call analysis from ElevenLabs
    - JSONB fields provide flexibility for storing complex nested data
*/

DO $$
BEGIN
  -- Add elevenlabs_conversation_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'elevenlabs_conversation_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN elevenlabs_conversation_id text;
  END IF;

  -- Add call_successful if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'call_successful'
  ) THEN
    ALTER TABLE conversations ADD COLUMN call_successful text;
  END IF;

  -- Add call_summary_title if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'call_summary_title'
  ) THEN
    ALTER TABLE conversations ADD COLUMN call_summary_title text;
  END IF;

  -- Add evaluation_criteria_results if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'evaluation_criteria_results'
  ) THEN
    ALTER TABLE conversations ADD COLUMN evaluation_criteria_results jsonb;
  END IF;

  -- Add data_collection_results if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'data_collection_results'
  ) THEN
    ALTER TABLE conversations ADD COLUMN data_collection_results jsonb;
  END IF;

  -- Add analysis_fetched_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'analysis_fetched_at'
  ) THEN
    ALTER TABLE conversations ADD COLUMN analysis_fetched_at timestamptz;
  END IF;
END $$;