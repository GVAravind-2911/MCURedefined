-- Migration: Add author_id column to blog_posts and reviews tables
-- This creates a cross-database foreign key reference to the user table in PostgreSQL

-- Add author_id column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN author_id TEXT;

-- Create index for author_id lookups
CREATE INDEX IF NOT EXISTS idx_blog_author_id ON blog_posts(author_id);

-- Add author_id column to reviews table
ALTER TABLE reviews ADD COLUMN author_id TEXT;

-- Create index for author_id lookups  
CREATE INDEX IF NOT EXISTS idx_review_author_id ON reviews(author_id);
