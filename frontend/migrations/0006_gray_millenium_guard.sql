ALTER TABLE bloglikes
ALTER COLUMN blog_id TYPE integer USING blog_id::integer;