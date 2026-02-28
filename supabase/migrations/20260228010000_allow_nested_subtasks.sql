-- Allow nested subtasks by removing the no_nested_subtasks trigger
-- This trigger previously raised 'Cannot create subtask of a subtask'
-- whenever the parent todo itself had a parent_id.

-- Drop the trigger that enforced single-level subtasks
DROP TRIGGER IF EXISTS no_nested_subtasks ON "public"."Todos";

-- Drop the trigger function (no longer needed)
DROP FUNCTION IF EXISTS check_no_nested_subtasks();
