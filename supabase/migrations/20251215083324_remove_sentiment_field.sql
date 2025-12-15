/*
  # Remove sentiment field

  1. Changes
    - Drop `sentiment` column from `conversations` table
    - This field was using basic keyword analysis and not providing accurate results
*/

ALTER TABLE conversations DROP COLUMN IF EXISTS sentiment;
