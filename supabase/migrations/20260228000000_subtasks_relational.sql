-- Add column (no constraint yet, so data migration can insert rows freely)
ALTER TABLE "public"."Todos"
  ADD COLUMN parent_id bigint;

-- Migrate existing JSONB subtasks to real rows
DO $$
DECLARE
  parent_row "public"."Todos"%ROWTYPE;
  subtask    jsonb;
BEGIN
  FOR parent_row IN
    SELECT * FROM "public"."Todos"
    WHERE subtasks IS NOT NULL AND jsonb_array_length(subtasks) > 0
  LOOP
    FOR subtask IN SELECT * FROM jsonb_array_elements(parent_row.subtasks)
    LOOP
      INSERT INTO "public"."Todos" (user_id, list_id, name, status, parent_id, color, created_at, updated_at)
      VALUES (
        parent_row.user_id,
        parent_row.list_id,
        subtask->>'name',
        CASE WHEN subtask->>'status' = 'done' THEN 'Closed' ELSE 'Open' END,
        parent_row.id,
        '#87909e',
        NOW(), NOW()
      );
    END LOOP;
  END LOOP;
END;
$$;

-- Add FK constraint
ALTER TABLE "public"."Todos"
  ADD CONSTRAINT Todos_parent_id_fkey
  FOREIGN KEY (parent_id) REFERENCES "public"."Todos"(id) ON DELETE CASCADE;

-- Prevent subtasks-of-subtasks via trigger (CHECK constraints cannot use subqueries)
CREATE OR REPLACE FUNCTION check_no_nested_subtasks()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM "public"."Todos" WHERE id = NEW.parent_id AND parent_id IS NOT NULL) THEN
      RAISE EXCEPTION 'Cannot create subtask of a subtask';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_nested_subtasks
  BEFORE INSERT OR UPDATE ON "public"."Todos"
  FOR EACH ROW EXECUTE FUNCTION check_no_nested_subtasks();

-- Index for efficient subtask lookups
CREATE INDEX idx_todos_parent_id ON "public"."Todos" (parent_id) WHERE parent_id IS NOT NULL;

-- Drop old column
ALTER TABLE "public"."Todos" DROP COLUMN subtasks;
